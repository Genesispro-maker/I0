"use server"
import { getAuth } from "@/app/api/query/get-user";
import prisma from "@/app/lib/prisma";
import { ActionType } from "@/app/types/types";
import { toActionState } from "@/app/util/error-handler";
import { revalidatePath } from "next/cache";
import z from "zod";

const schema = z.object({
  name: z.string(),
  email: z.string().min(1, {message: "Is required"}).max(191).email(),
})

export const update = async (_actionState: ActionType, formdata: FormData) => {
    try {
        const user = await getAuth()

        if(!user) {
            return toActionState("ERROR", "Login to continue")
        }

        const data = schema.parse({
            name: formdata.get("name"),
            email: formdata.get("email")
        })

        await prisma.user.update({
            where: {
                id: user.id
            },

            data: {
                username: data.name,
                email: data.email,
            }
        })

        revalidatePath("/features/profile")
        revalidatePath("/")

        return toActionState("SUCCESS", "profile updated successfullly")
    } catch (err){
        return toActionState("ERROR", err instanceof Error ? err.message : "Something went wrong")
    }
}