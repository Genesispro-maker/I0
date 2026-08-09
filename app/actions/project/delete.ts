"use server"
import { getAuth } from "@/app/api/query/get-user"
import prisma from "@/app/lib/prisma"
import { revalidatePath } from "next/cache"

export async function Delete(id: string): Promise<{status: "success" | "error", code: number}>{
   try {
    const user = await getAuth()

    if(!user){
       return {
        status: "error",
        code: 401,
       }
    }

    const project = await prisma.projects.findUnique({
        where: {
            id
        },
        select: {
            userId: true
        }
    })

    if(project?.userId !== user.id){
        return {
            status: "error",
            code: 403,
        }
    }

    await prisma.projects.delete({
        where: {
            id,
        }
    })

    revalidatePath("/", "layout")
    revalidatePath("/features", "layout")

    return {
        status: "success",
        code: 200,
    }

   }catch(err){
     return {
        status: "error",
        code: 500
     }
   }

}