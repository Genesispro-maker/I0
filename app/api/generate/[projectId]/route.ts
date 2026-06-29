import prisma from "@/app/lib/prisma"
import { EventType } from "@/app/types/types"
import { parseFiles, strip } from "@/app/util/constant"
import { followup } from "@/app/util/prompt"

function encode(type: EventType, data: string): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify({ type, data })}\n\n`)
}

const THINK_OPEN = "<thinking>"
const THINK_CLOSE = ["</think>", "</thinking>"]
const SUGGEST_OPEN = "<suggestions>"
const SUGGEST_CLOSE = "</suggestions>"

function closetag(buf: string) : { index: number, tag: string } | null {
  for (const tag of THINK_CLOSE){
    const index = buf.indexOf(tag)
    if(index !== -1){
      return {
        index,
        tag,
      }
    }
  }

  return null
}


export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }>}){
 const { projectId } = await params

 let body: { prompt: string, files: Record<string, string>, reasoning: string }

  try {
    body = await req.json()

    const project = await prisma.projects.update({
      where: {
        id: projectId,
      },

      data: {
        messages: {
          create: [
            {
              content: body.prompt,
              role: "USER"
            },

            {
              content: "",
              role: "ASSISTANT",
            }
          ]
        }
      },
      include: {
        messages: true
      }
    })

    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
    const writer = writable.getWriter()
    const assistantmessage = project.messages.at(-1)

    generateUI(body.files, body.reasoning, body.prompt, writer, assistantmessage?.id ?? '', project.id).catch(() => {
      writer.write(encode("error", "Generation Failed")).finally(() => writer.close())
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      }
    })
  }catch (err){
       return Response.json({ error: err instanceof Error ? err.message : "Something went wrong" }, {
        status: 500
      })
  }
}

async function generateUI(files: Record<string, string>, reasoning: string, prompt: string, writer: WritableStreamDefaultWriter<Uint8Array>, messageId: string, projectId: string){
  const send = async (type: EventType, data: string) => {
    try {
      await writer.write(encode(type, data))
    } catch {}
  }

  await send("metadata", JSON.stringify({ projectId, messageId }))

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 180_000)

  try {
    await prisma.projects.update({
      where: {
        id: projectId,
      },

      data: {
        status: "Planning"
      }
    })

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "I/0",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b:free",
        stream: true,
        max_tokens: 32768,
        messages: [
          {
            role: "system",
            content: followup
          },

          {
            role: "user",
            content: `Previous files:\n${JSON.stringify(files, null, 2)}\n\nPrevious reasoning:\n${reasoning}\n\nUser request:\n${prompt}`,
          }
        ]
      })
    })

    if(!res.ok){
      console.error(`error ${res.status} ${res.statusText}`)
      throw new Error(`error ${res.status} ${res.statusText}`)
    }

    if(!res.body){
      throw new Error("No response body")
    }

    const buffers = {
      raw: "",
      reasoninig: "",
      code: "",
      suggestions: "",
      name: "",
    }

    let thinking = false, thinkingDone = false, suggestions = false, suggestionsDone = false

    const flush = async (chunk: string) => {
      buffers.raw += chunk

      if(!thinkingDone){
        if(!thinking){
          const index = buffers.raw.indexOf(THINK_OPEN)
          const json = buffers.raw.indexOf("{")

          if(index === -1 && json === -1){
            buffers.raw = buffers.raw.slice(Math.max(0, buffers.raw.length - THINK_OPEN.length))
            return
          }

          if(index === -1){
            thinkingDone = true
            await prisma.projects.update({
              where: {
                id: projectId,
              },

              data: {
                status: "building"
              }
            })

            await send("building", "Processing")
          } else {
            thinking = true
            buffers.raw = buffers.raw.slice(index + THINK_OPEN.length)
          }
        }

        if(thinking){
          const end = closetag(buffers.raw)

          if(!end){
            const safe = buffers.raw.slice(0, Math.max(0, buffers.raw.length - 15))
            if(safe){
              buffers.reasoninig += safe
              await send("reasoning", safe)
              buffers.raw = buffers.raw.slice(Math.max(0, buffers.raw.length - 15))
            }

            return
          }

          const { index, tag } = end
          const last = buffers.raw.slice(0, index)

          if(last){
            buffers.reasoninig += last
            await send("reasoning", last)
          }

          await send("plan", buffers.reasoninig)
          thinkingDone = true
          thinking = false
          buffers.raw = buffers.raw.slice(index + tag.length)
          await send("building", "processing")
        }
      }

      if(!suggestions && !suggestionsDone){
        const index = buffers.raw.indexOf(SUGGEST_OPEN)

        if(index === -1){
          const safe = strip(buffers.raw.slice(0, Math.max(0, buffers.raw.length - SUGGEST_OPEN.length)))
          if(safe){
            buffers.code += safe
            await send("code", safe)
          }

          buffers.raw = buffers.raw.slice(Math.max(0, buffers.raw.length - SUGGEST_OPEN.length))
          return
        }

        const code = strip(buffers.raw.slice(0, index))
        if(code){
          buffers.code += code
          await send("code", code)
        }

        suggestions = true
        buffers.raw = buffers.raw.slice(index + SUGGEST_OPEN.length)
      }

      if(suggestions && !suggestionsDone){
        const index = buffers.raw.indexOf(SUGGEST_CLOSE)

        if(index === -1){
          const safe = buffers.raw.slice(0, Math.max(0, buffers.raw.length - SUGGEST_CLOSE.length))

          if(safe){
            buffers.suggestions += safe
            buffers.raw = buffers.raw.slice(Math.max(0, buffers.raw.length - SUGGEST_CLOSE.length))
          }

          return
        }

        buffers.suggestions += buffers.raw.slice(0, index)
        suggestions = false
        suggestionsDone = true
        buffers.raw = ""
      }
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    let linebuf = ""

    try {
      while(true){
        const { done, value } = await reader.read()

        if(done) break

        linebuf += decoder.decode(value, {
          stream: true,
        })

        const lines = linebuf.split("\n")
        linebuf = lines.pop() ?? ''

        for(const line of lines){
          if(!line.startsWith("data: ")) continue
          const payload = line.slice(6).trim()
          if(payload === "[DONE]") break

          try {
            const chunk : string = JSON.parse(payload)?.choices?.[0]?.delta?.content ?? ""
            if(chunk) await flush(chunk)
          } catch {}
        }
      }

      if(buffers.raw.trim()){
        await flush("")
      }

      const files = parseFiles(buffers.code)
      const suggestion = buffers.suggestions.split("\n").map((s) => s.trim()).filter(Boolean)

      await Promise.all([
        prisma.message.update({
          where: {
            id: messageId,
          },
          data: {
            content: buffers.code,
            reasoning: buffers.reasoninig,
            generations: {
              upsert: {
                create: {
                  files
                },
                update: {
                  files
                }
              }
            }
          }
        })
      ])

      await send("suggestions", JSON.stringify(suggestion))
      await send("done", JSON.stringify({ files }))
    } catch (err){
      await send("error", "Something went wrong")
    } finally {
      reader.releaseLock()
    }
  } finally {
    clearTimeout(timeout)
    controller.abort()
    await writer.close().catch(() => {})
  }
}
