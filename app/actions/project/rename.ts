"use server"
import { getAuth } from "@/app/api/query/get-user"
import prisma from "@/app/lib/prisma"
import { revalidatePath } from "next/cache"

export async function Rename(projectId: string, title: string): Promise<{ status: "error" | "success", message: string }>{
    try {
        const user = await getAuth()

        if(!user){
            return {
                status: "error",
                message: "Unauthorized",
            }
        }

        const project = await prisma.projects.findUnique({
            where: {
                id: projectId,
                userId: user.id,
            },
        })

        if(!project) {
            return {
                status: "error",
                message: "Project not Found"
            }
        }

        await prisma.projects.update({
            where: {
                id: projectId,
            },
            data: {
                title,
            }
        })

        revalidatePath(`/features/project/${project.id}`)
        revalidatePath("/")

        return {
            status: "success",
            message: "Title Updated",
        }
    } catch(err: unknown){
        return {
            status: "success",
            message: "Something went wrong", 
        }
    }
}