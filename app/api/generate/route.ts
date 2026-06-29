import { EventType } from "@/app/types/types";
import { getAuth } from "../query/get-user";
import prisma from "@/app/lib/prisma";
import { codeprompt } from "@/app/util/prompt";
import { parseFiles, strip } from "@/app/util/constant";

const THINK_OPEN        = "<thinking>"
const THINK_CLOSES      = ["</think>", "</thinking>"]
const SUMMARY_OPEN = "<summary>"
const SUMMARY_CLOSE = "</summary>"
const SUGGESTIONS_OPEN  = "<suggestions>"
const SUGGESTIONS_CLOSE = "</suggestions>"

function encode(type: EventType, data: string): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify({ type, data })}\n\n`)
}

function thinkingclose(buf: string): { index: number; tag: string } | null {
  for (const tag of THINK_CLOSES) {
    const index = buf.indexOf(tag)
    if (index !== -1){
      return {
        index, 
        tag
      }
    }
  }
  return null
}

export async function POST(req: Request) {
  const user = await getAuth()
  if (!user) return new Response("unauthorized", {
    status: 401
  })

  let body: { prompt?: string }
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid body", {
      status: 400
    })
  }

  const prompt = body.prompt?.trim()
  if (!prompt) return new Response("prompt is required", {
    status: 422
  })

  const project = await prisma.projects.create({
    data: {
      title: "untitled",
      userId: user.id,
      status: "planning",
      messages: {
        create: [
          {
            role: "USER",
            content: prompt
          },

          {
            role: "ASSISTANT",
            content: ""
          },
        ],
      },
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc"
        }
      }
    },
  })

  const [, assistantmessage] = project.messages
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
  const writer = writable.getWriter()

   writer.write(encode("metadata", JSON.stringify({
    projectId: project.id,
    messageId: assistantmessage.id,
  })))

  generateUI(prompt, writer, assistantmessage.id, project.id).catch(() => {
    writer.write(encode("error", "Generation failed")).finally(() => writer.close())
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}

async function generateUI(prompt: string, writer: WritableStreamDefaultWriter<Uint8Array>, messageId: string, projectId: string) {
  const send = async (type: EventType, data: string) => {
    try { await writer.write(encode(type, data)) } catch {}
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 180_000)

  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GOOGLE}`,
        // "HTTP-Referer": "http://localhost:3000",
        // "X-Title": "I/0",
      },
      body: JSON.stringify({
        model: "gemini-3.1-flash-lite",
        stream: true,
        max_tokens: 65536,
        messages: [
          {
            role: "system",
            content: codeprompt
          },

          {
            role: "user",
            content: `Build this UI: ${prompt}`
          },
        ],
      }),
    })

    if (!res.ok){
      const errBody = await res.text()
      console.error(`Groq error ${res.status}:`, errBody) 
      console.error(`error ${res.status}: ${res.statusText}`)
      throw new Error(`error ${res.status}: ${res.statusText}`)
    }
    if (!res.body) throw new Error("No response body")

    const buffers = {
      raw: "",
      reasoning: "",
      code: "",
      summary: "",
      suggestion: "",
      full: ""
    }

    let namesaved = false, inThinking = false, thinkingDone = false, inSummary = false, summaryDone = false, inSuggestions = false, suggestionsDone = false


const flush = async (chunk: string) => {
  buffers.raw += chunk
  buffers.full += chunk

  // ── NAME ──────────────────────────────────────────────────────────────────
  if (!namesaved) {
    const name = buffers.full.match(/<name>([^<]+)<\/name>/)
    if (name?.[1]) {
      namesaved = true
      await prisma.projects.update({
        where: { id: projectId },
        data: { title: name[1] }
      })
    }
  }

  // ── THINKING ──────────────────────────────────────────────────────────────
  if (!thinkingDone) {
    if (!inThinking) {
      const thinkIdx = buffers.raw.indexOf(THINK_OPEN)
      const jsonIdx  = buffers.raw.indexOf("{")

      if (thinkIdx === -1 && jsonIdx === -1) {
        buffers.raw = buffers.raw.slice(Math.max(0, buffers.raw.length - THINK_OPEN.length))
        return
      }

      if (thinkIdx === -1) {
        thinkingDone = true
        await send("building", "processing")
      } else {
        inThinking = true
        buffers.raw = buffers.raw.slice(thinkIdx + THINK_OPEN.length)
      }
    }

    if (inThinking) {
      const end = thinkingclose(buffers.raw)

      if (!end) {
        const safeLen = Math.max(0, buffers.raw.length - 15)
        const safe = buffers.raw.slice(0, safeLen)
        if (safe) {
          buffers.reasoning += safe
          await send("reasoning", safe)
          buffers.raw = buffers.raw.slice(safeLen)
        }
        return
      }

      const { index, tag } = end
      const last = buffers.raw.slice(0, index)
      if (last) {
        buffers.reasoning += last
        await send("reasoning", last)
      }

      thinkingDone = true
      inThinking   = false
      buffers.raw  = buffers.raw.slice(index + tag.length)
      await prisma.projects.update({
        where: {
          id: projectId,
        },

        data: {
          status: "building"
        }
      })
      await send("building", "processing")
    }
  }

  // ── CODE ──────────────────────────────────────────────────────────────────
  if (!inSummary && !summaryDone && !inSuggestions && !suggestionsDone) {
    const summaryIdx  = buffers.raw.indexOf(SUMMARY_OPEN)
    const suggestIdx  = buffers.raw.indexOf(SUGGESTIONS_OPEN)

    if (summaryIdx === -1 && suggestIdx === -1) {
      const safeLen = Math.max(0, buffers.raw.length - Math.max(SUMMARY_OPEN.length, SUGGESTIONS_OPEN.length))
      const safe = strip(buffers.raw.slice(0, safeLen))
      if (safe) {
        buffers.code += safe
        await send("code", safe)

        const file = buffers.code.match(/(\/[^"]+\.(tsx|ts|css|json))"/g)
        if(file){
          const path = [...new Set(file.map(m => m.replace(/"/g, "")))]
          await send("files", JSON.stringify(path))
        }
      }
      buffers.raw = buffers.raw.slice(safeLen)
      return
    }

    const firstIsSummary =
      summaryIdx !== -1 && (suggestIdx === -1 || summaryIdx < suggestIdx)

    if (firstIsSummary) {
      const code = strip(buffers.raw.slice(0, summaryIdx))
      if (code) {
        buffers.code += code
        await send("code", code)
      }
      inSummary   = true
      buffers.raw = buffers.raw.slice(summaryIdx + SUMMARY_OPEN.length)
    } else {
      // <suggestions> arrived without <summary> — skip summary phase entirely
      summaryDone = true
    }
  }

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  if (inSummary && !summaryDone) {
    const index = buffers.raw.indexOf(SUMMARY_CLOSE)

    if (index === -1) {
      const safeLen = Math.max(0, buffers.raw.length - SUMMARY_CLOSE.length)
      const safe = buffers.raw.slice(0, safeLen)
      if (safe) {
        buffers.summary += safe
        await send("summary", safe)
        buffers.raw = buffers.raw.slice(safeLen)
      }
      return
    }

    const last = buffers.raw.slice(0, index)
    if (last) {
      buffers.summary += last
      await send("summary", last)
    }

    inSummary   = false
    summaryDone = true
    buffers.raw = buffers.raw.slice(index + SUMMARY_CLOSE.length)
  }

  // ── SUGGESTIONS ───────────────────────────────────────────────────────────
  if (!inSuggestions && !suggestionsDone) {
    const index = buffers.raw.indexOf(SUGGESTIONS_OPEN)

    if (index === -1) {
      const safeLen = Math.max(0, buffers.raw.length - SUGGESTIONS_OPEN.length)
      const safe = strip(buffers.raw.slice(0, safeLen))
      if (safe) {
        buffers.code += safe
        await send("code", safe)
      }
      buffers.raw = buffers.raw.slice(safeLen)
      return
    }

    const code = strip(buffers.raw.slice(0, index))
    if (code) {
      buffers.code += code
      await send("code", code)
    }
    inSuggestions = true
    buffers.raw   = buffers.raw.slice(index + SUGGESTIONS_OPEN.length)
  }

  if (inSuggestions && !suggestionsDone) {
    const index = buffers.raw.indexOf(SUGGESTIONS_CLOSE)

    if (index === -1) {
      const safeLen = Math.max(0, buffers.raw.length - SUGGESTIONS_CLOSE.length)
      const safe = buffers.raw.slice(0, safeLen)
      if (safe) {
        buffers.suggestion += safe
        buffers.raw = buffers.raw.slice(safeLen)
      }
      return
    }

    buffers.suggestion += buffers.raw.slice(0, index)
    inSuggestions = false
    suggestionsDone = true
    buffers.raw = ""
  }
}

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let lineBuf = ""

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        lineBuf += decoder.decode(value, { stream: true })
        const lines = lineBuf.split("\n")
        lineBuf = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const payload = line.slice(6).trim()
          if (payload === "[DONE]") break

          try {
            const chunk: string = JSON.parse(payload)?.choices?.[0]?.delta?.content ?? ""
            if (chunk) {
              await flush(chunk)
            }
          } catch {}
        }
      }

      if (buffers.raw.trim()){
        await flush("")
      }

      const files = parseFiles(buffers.code)
      const suggestions = buffers.suggestion.split("\n").map((s) => s.trim()).filter(Boolean)

      await Promise.all([
        prisma.message.update({
          where: {
            id: messageId
          },
          data: {
            content: buffers.code,
            reasoning: buffers.reasoning,
            generations: {
              upsert: {
                create: {
                  files
                },
                update: {
                  files
                }
              }
            },
          },
        }),
        prisma.projects.update({
          where: {
            id: projectId
          },
          data: {
            status: "complete"
          },
        }),
      ])

      await send("suggestions", JSON.stringify(suggestions))
      await send("done", JSON.stringify({ files }))

    } catch (err) {
      await send("error", err instanceof Error ? err.message : "Something went wrong")
      await prisma.projects.update({
        where: {
          id: projectId
        },
        data: {
          status: "error"
        },
      }).catch(() => {})
    } finally {
      reader.releaseLock()
    }

  } finally {
    clearTimeout(timeout)
    controller.abort()
    await writer.close().catch(() => {})
  }
}