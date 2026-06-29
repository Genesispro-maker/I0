"use server"
import { ActionType } from "@/app/types/types"
import z from "zod/v3"
import bcrypt from "bcrypt"
import prisma from "@/app/lib/prisma"
import { fromErrortoaction, toActionState } from "@/app/util/error-handler"

const signUpSchema = z.object({
    email: z.string().min(1, {message: "Is required"}).max(191).email(),
    password: z.string().min(6).max(191),
    confirmPassword: z.string().min(6).max(191)
}).superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
        ctx.addIssue({
            code: "custom",
            message: "password don't match",
            path: ["confirmPassword"],
        })
    }
})

export const Signup = async (_actionState: ActionType, formdata: FormData) => {
    try {
        const { email, password } = signUpSchema.parse(Object.fromEntries(formdata))

        const existinguser = await prisma.user.findUnique({
            where: {
                email,
            }
        })

        if (existinguser) {
            return toActionState("ERROR", "Email already in use")
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                username: email.slice(0, 5),
                email,
                passwordHash: hashedPassword,
                createdAt: new Date(),
            }
        })

        return toActionState("SUCCESS", "Account Created Successfully")
    } catch (error) {
        return fromErrortoaction(error, formdata)
    }
}
