import prisma from "@/app/lib/prisma";
import { getAuth } from "../query/get-user";
import { inngest } from "@/app/lib/inngest/client";
import { getSubscriptionToken } from "inngest/realtime";
import { generationchannel } from "@/app/lib/inngest/channel";

export async function POST(req: Request){
  const user = await getAuth()

  if(!user){
    return new Response("unauthorized", {
      status: 401,
    })
  }

  let body: { prompt?: string, images?: string[] }

  try {
    body = await req.json()
  } catch {
    return new Response("Invalid body", {
      status: 400
    })
  }

  const prompt = body.prompt?.trim()
  if (!prompt) return new Response("prompt is required", { status: 422 });

  const project = await prisma.projects.create({
    data: {
      title: "untitled",
      userId: user.id,
      status: "sending",
      messages: {
        create: [
          {
            role: "USER",
            content: prompt,
            images: {
              create: (body.images ?? []).map((url) => ({
                url
              }))
            }
          },

          {
            role: "ASSISTANT",
            content: ""
          }
        ]
      },
    },

    include: {
      messages: true
    }
  })

  const assistantmessage = project.messages.find((m) => m.role === "ASSISTANT");

  await inngest.send({
    name: "ui/generate.requested",
    data: {
      prompt,
      projectId: project.id,
      messageId: assistantmessage?.id ?? '',
      userId: user.id,
      images: body.images,
    }
  })

  const token = await getSubscriptionToken(inngest, {
    channel: generationchannel({projectId: project.id}).name,
    topics: ["progress"]
  })

  return Response.json({
    projectId: project.id,
    messageId: assistantmessage?.id,
    token
  })
}
