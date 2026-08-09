"use server"
import { getAuth } from "@/app/api/query/get-user";
import prisma from "@/app/lib/prisma";

export async function Remix(projectId: string){
    const user = await getAuth()

    const [project, existingproject] = await Promise.all([
        await prisma.projects.findUnique({
            where: {
                id: projectId,
                visiblity: "PUBLIC",
            }
        }),

        await prisma.projects.findUnique({
            where: {
                id: projectId,
            }
        })
    ])

    if(existingproject){
        return {
            success: false,
            error: "You've already remix this Project"
        }
    }

    if(!user){
        return {
            success: false,
            error: "Login to remix a project"
        }
    }

    if(!project){
        return {
            success: false,
            error: "No project Found"
        }
    }

    await prisma.fork.create({
        data: {
            userId: user.id,
            forkedId: project.id,
            sourceId: project.id
        }
    })

    return {
        success: true,
        message: "Project remixed successsfully"
    }
}