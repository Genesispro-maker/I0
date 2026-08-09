import { EventType } from "@/app/types/types";
import prisma from "../../prisma";
import { inngest } from "../client";
import { generationchannel } from "../channel";
import { parseFiles, strip } from "@/app/util/constants";
import { codeprompt, followup } from "@/app/util/prompt";

const tags = {
    THINK_OPEN: "<thinking>",
    THINK_CLOSE: "</thinking>",
    SUMMARY_OPEN: "<summary>",
    SUMMARY_CLOSE: "</summary>",
    SUGGESTIONS_OPEN: "<suggestions>",
    SUGGESTIONS_CLOSE: "</suggestions>"
}

export const generateUI = inngest.createFunction(
    {
        id: "generate-ui",
        triggers: {
            event: "ui/generate.requested",
        },
        retries: 2,
        concurrency: {
            limit: 3,
            key: "event.data.userId"
        },
        onFailure: async ({event, error}) => {
            const { projectId } = event.data.event.data as { projectId: string }
            await prisma.projects.update({
                where: {
                    id: projectId
                },
                data: {
                    status: "error",
                }
            }).catch(() => {})
        },
    },

    async ({event, step}) => {
        const { prompt, projectId, messageId, file, reasoning, images } = event.data;
        const channel = generationchannel({ projectId })

        const send = (type: EventType, data: string) => inngest.realtime.publish(channel.progress, { type, data })

            await step.run("building", async () => {
                await prisma.projects.update({
                    where: {
                        id: projectId,
                    },
                    data: {
                        status: "Building",
                    }
                })
            })

            const iterating = Boolean(file && Object.keys(file).length > 0 && reasoning)

            const userprompt = iterating ? `Previous files:\n${JSON.stringify(file, null, 2)}\n\nPrevious reasoning:\n${reasoning}\n\nUser request:\n${prompt}` : `Build this UI ${prompt}`

            const result : { code: string, reasoning: string, suggestions: string, summary: string } = await step.run("generate-and-stream", async () => {
                const controller = new AbortController()
                const timeout = setTimeout(() => controller.abort(), 180_000)
                try {
                    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${process.env.GOOGLE}`
                        },
                        body: JSON.stringify({
                            model: "gemini-3.1-flash-lite",
                            stream: true,
                            max_tokens: 65536,
                            messages: [
                                {
                                    role: "system",
                                    content: iterating ? followup : codeprompt,
                                },

                                {
                                    role: "user",
                                    content: [
                                        {
                                            "type": "text",
                                            "text": userprompt,
                                        },

                                        ...(images ?? []).map((image: string) => ({
                                            "type": "image_url",
                                            "image_url": {
                                                url: image
                                            }
                                        }))
                                    ],
                                }
                            ]
                        })
                    })
                    if(!res.ok){
                        throw new Error(`error: ${res.status}, ${res.statusText}`)
                    }
                    
                    if(!res.body){
                        throw new Error("no response from body")
                    }

                    const buffers = {
                        raw: "",
                        full: "",
                        reasoning: "",
                        code: "",
                        summary: "",
                        suggestion: "",
                    }

                    let namesaved = false, thinking = false, thinkingDone = false, summary = false, summaryDone = false, suggesting = false, suggestionsDone = false

                    const flush  = async (chunk: string) => {
                        buffers.raw += chunk
                        buffers.full += chunk

                        if(!namesaved){
                            const name = buffers.full.match(/<name>([^<]+)<\/name>/)
                            if(name?.[1]){
                                namesaved = true
                                await prisma.projects.update({
                                    where: {
                                        id: projectId,
                                    },
                                    data: {
                                        title: name[1]
                                    }
                                })
                            }
                        }

                        if(!thinkingDone){
                            if(!thinking){
                                const index = buffers.raw.indexOf(tags.THINK_OPEN)
                                const jsonindex = buffers.raw.indexOf("{")

                                if(index === -1 && jsonindex === -1){
                                    buffers.raw = buffers.raw.slice(Math.max(0, buffers.raw.length - tags.THINK_OPEN.length))
                                    return
                                }

                                if(index === -1){
                                    thinkingDone = true
                                    await send("building", "processing")
                                } else {
                                    thinking = true
                                    buffers.raw = buffers.raw.slice(index + tags.THINK_OPEN.length)
                                }
                            }

                            if(thinking){
                                const index = buffers.raw.indexOf(tags.THINK_CLOSE)
                                
                                if(index === -1){
                                    const safe = buffers.raw.slice(0, Math.max(0, buffers.raw.length - 15))
                                    if(safe){
                                        buffers.reasoning += safe
                                        await send("reasoning", safe)
                                        buffers.raw = buffers.raw.slice(Math.max(0, buffers.raw.length - 15))
                                    }
                                    return
                                }

                                const last = buffers.raw.slice(0, index)
                                if(last){
                                    buffers.reasoning += last
                                    await send("reasoning", last)
                                }

                                thinkingDone = true
                                thinking = false
                                buffers.raw = buffers.raw.slice(index + tags.THINK_CLOSE.length)
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

                            if(!summary && !summaryDone && !suggesting && !suggestionsDone){
                                const summaryindex = buffers.raw.indexOf(tags.SUMMARY_OPEN)
                                const suggestindex = buffers.raw.indexOf(tags.SUGGESTIONS_OPEN)

                                if(summaryindex === -1 && suggestindex === -1){
                                    const len = Math.max(0, buffers.raw.length - Math.max(tags.SUMMARY_OPEN.length, tags.SUGGESTIONS_OPEN.length))
                                    const safe = strip(buffers.raw.slice(0, len))
                                    if(safe){
                                        buffers.code += safe
                                        await send("code", safe)
                                    }
                                    buffers.raw = buffers.raw.slice(len)
                                    return
                                }

                                const firstsummary = summaryindex !== -1 && (suggestindex === -1 || summaryindex < suggestindex)

                                if(firstsummary){
                                    const code = strip(buffers.raw.slice(0, summaryindex))
                                    if(code){
                                        buffers.code += code
                                        await send("code", code)
                                    }
                                    summary = true
                                    buffers.raw = buffers.raw.slice(summaryindex + tags.SUMMARY_OPEN.length)
                                } else {
                                    summaryDone = true
                                }
                            }

                            if(summary && !summaryDone){
                                const index = buffers.raw.indexOf(tags.SUMMARY_CLOSE)

                                if(index === -1){
                                    const len = Math.max(0, buffers.raw.length - tags.SUMMARY_CLOSE.length)
                                    const safe = buffers.raw.slice(0, len)
                                    if(safe){
                                        buffers.summary += safe
                                        await send("summary", safe)
                                        buffers.raw = buffers.raw.slice(len)
                                    }
                                    return
                                }

                                const last = buffers.raw.slice(0, index)
                                if(last){
                                    buffers.summary += last
                                    await send('summary', last)
                                }

                                summary = false
                                summaryDone = true
                                buffers.raw = buffers.raw.slice(index + tags.SUMMARY_CLOSE.length)
                            }

                            if(!suggesting && !suggestionsDone){
                                const index = buffers.raw.indexOf(tags.SUGGESTIONS_OPEN)

                                if(index === -1){
                                    const len = Math.max(0, buffers.raw.length - tags.SUGGESTIONS_OPEN.length)
                                    const safe = strip(buffers.raw.slice(0, len))
                                    if(safe){
                                        buffers.code += safe
                                        await send("code", safe)
                                    }
                                    buffers.raw = buffers.raw.slice(len)
                                    return
                                }

                                const code = strip(buffers.raw.slice(0, index))
                                if(code){
                                    buffers.code += code
                                    await send("code", code)
                                }

                                suggesting = true
                                buffers.raw = buffers.raw.slice(index + tags.SUGGESTIONS_OPEN.length)
                            }

                            if(suggesting && !suggestionsDone){
                                const index = buffers.raw.indexOf(tags.SUGGESTIONS_CLOSE)

                                if(index === -1){
                                    const len = Math.max(0, buffers.raw.length - tags.SUGGESTIONS_CLOSE.length)
                                    const safe = buffers.raw.slice(0, len)

                                    if(safe){
                                        buffers.suggestion += safe
                                        buffers.raw = buffers.raw.slice(len)
                                    }
                                    return
                                }

                                buffers.suggestion += buffers.raw.slice(0, index)
                                suggesting = false
                                suggestionsDone = true
                                buffers.raw = buffers.raw.slice(index + tags.SUGGESTIONS_CLOSE.length)
                            }
                    }

                    const reader = res.body?.getReader()
                    const decoder = new TextDecoder()
                    let lineBuf = ""

                      while(true){
                          const { done, value } = await reader?.read()
                          if(done) break

                          lineBuf += decoder.decode(value, {
                              stream: true
                          })  

                          const lines = lineBuf.split("\n")
                          lineBuf = lines.pop() ?? ""  

                          for(const line of lines){
                              if(!line.startsWith("data: ")) continue

                              const payload = line.slice(6).trim()
                              if(payload === "[DONE]") break
                              try {
                                  const chunk : string = JSON.parse(payload)?.choices?.[0]?.delta?.content ?? ''
                                  if(chunk){
                                      await flush(chunk)
                                  }
                              } catch {}
                          }
                      }
                      
                      if(buffers.raw.trim()){
                          await flush("")
                      }

                      return {
                        code: buffers.code,
                        suggestions: buffers.suggestion,
                        reasoning: buffers.reasoning,
                        summary: buffers.summary,
                      }
                } finally {
                    clearTimeout(timeout)
                }
            })

            const files = parseFiles(result?.code)
            const merged = {...file, ...files}
            const suggestions = result.suggestions.split("\n").map(s => s.trim()).filter(Boolean)

           await step.run("persist-result", async () => (
            await Promise.all([
                prisma.message.update({
                    where: {
                        id: messageId,
                    },
                    data: {
                        content: result.code,
                        reasoning: result.reasoning,
                        summary: result.summary
                    }
                }),

                prisma.generations.upsert({
                    where: {
                        messageId: messageId
                    },
                    create: {
                        messageId: messageId,
                        files: merged
                    },
                    update: {
                        files: merged,
                    }
                })
            ])
           ))
              

            await send("suggestions", JSON.stringify(suggestions))
            await send("done", JSON.stringify({ files }))

            return {
                files,
                suggestions,
            }
        }
)

