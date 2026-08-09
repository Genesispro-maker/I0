import prisma from "@/app/lib/prisma"
import { parseFiles } from "@/app/util/constants"
import { fixprompt } from "@/app/util/prompt"

export async function POST(req: Request){
    let body : { files: string, error: string, messageId: string }
    try {
        body = await req.json()
        const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GOOGLE}`,
            },
            body: JSON.stringify({ 
                model: "gemini-3.1-flash-lite",
                messages: [
                    {
                        role: "system",
                        content: fixprompt
                    },

                    {
                        role: "user",
                        content: `FILES:\n${JSON.stringify(body.files)}\n\nERRORS:\n${body.error} `
                    },
                ],
                max_tokens: 32768,
            })
        })

        if(!res.ok){
            throw new Error(`Something went Wrong ${res.statusText}`)
        }

        const data = await res.json()
        const fixed = data?.choices?.[0]?.message?.content ?? ""
        const files = parseFiles(fixed)

        const existing = await prisma.generations.findUnique({
            where: {
                messageId: body.messageId,
            }
        })

        const base = (existing?.files) as Record<string, string>
        const merge = {...base, ...files}

        await prisma.message.update({
            where: {
                id: body.messageId,
            },
            data: {
                generations: {
                    upsert: {
                        create: {
                            files: merge,
                        },
                        update: {
                            files: merge
                        }
                    }
                }
            }
        })

        return Response.json({ fixed: merge })
    }catch (err){
       return Response.json({ error: err instanceof Error ? err.message : "Something went wrong" }, {
        status: 500
      })
    }
}