"use server"
import prisma from "@/app/lib/prisma";
import { ActionType } from "@/app/types/types";
import { fromErrortoaction, toActionState } from "@/app/util/error-handler";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod/v3";

export const Loginaction = async (_actionState: ActionType, formdata: FormData) => {
    const SignInSchema = z.object({
        email: z.string().min(0).max(191).email(),
        password: z.string().min(0).max(191)
    })

    try{
        const { email, password } = SignInSchema.parse(Object.fromEntries(formdata))

        const user = await prisma.user.findUnique({
            where: {
                email,
            }
        })
    
        if(!user){
            return toActionState("ERROR", "Invalid email or password")
        }
    
        const isValiduser = await bcrypt.compare(password, user.passwordHash)
    
        if(!isValiduser){
            return toActionState("ERROR", "Invalid email or password")
        }
    
        const cookiestore = await cookies()
        const isProduction = process.env.NODE_ENV === "production"
    
        const tokenpayload = {
            name: user.username,
            email: user.email,
            id: user.id,
            sub: user.id,
        }
    
        const encodedToken = await encode({
            token: tokenpayload,
            secret: process.env.NEXTAUTH_SECRET!,
            maxAge: 30 * 24 * 60 * 60,
        })
    
        cookiestore.set({
            name: isProduction ? "__Secure-next-auth.session-token" : "next-auth.session-token",
            value: encodedToken,
            path: "/",
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
        })
    }catch(err){
        return fromErrortoaction(err, formdata)
    }

    redirect("/")
}