import prisma from "@/app/lib/prisma"
import { getAuth } from "../../query/get-user"
import { inngest } from "@/app/lib/inngest/client"
import { getSubscriptionToken } from "inngest/realtime"
import { generationchannel } from "@/app/lib/inngest/channel"

export async function POST(req: Request, { params,}: {params: Promise<{projectId: string}>}){
  const { projectId } = await params

  const user = await getAuth()

  if(!user){
    return new Response("unauthorized", {
      status: 401
    })
  }

  let body : { prompt: string, images?: string[] }

  try {
    body = await req.json()
  } catch {
    return new Response("invalid body", {
      status: 400
    })
  }

  const project = await prisma.projects.findUniqueOrThrow({
      where: {
        id: projectId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            generations: true
          }
        }
      }
    })

    const lastmessage = project.messages.find((m) => m.role === "ASSISTANT")

    const [, assitantmessage] = await Promise.all([
      prisma.message.create({
        data: {
          projectId,
          role: "USER",
          content: body.prompt,
        }
      }),

      prisma.message.create({
        data: {
          projectId,
          content: '',
          role: "ASSISTANT"
        },
        include: {
          generations: true
        }
      })
    ])

    await inngest.send({
      name: "ui/generate.requested",
      data: {
        prompt: body.prompt.trim(),
        projectId: project.id,
        messageId: assitantmessage.id,
        file: lastmessage?.generations?.files,
        reasoning: lastmessage?.reasoning,
        images: body.images
      }
    })

    const token = await getSubscriptionToken(inngest, {
      channel: generationchannel({projectId: project.id}).name,
      topics: ["progress"]
    })

    return Response.json({
      projectId: project.id,
      messageId: assitantmessage.id,
      token
    })
}