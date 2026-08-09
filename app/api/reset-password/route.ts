import prisma from "@/app/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import z from "zod/v3"

const schema = z.object({
    token: z.string(),
    newPassword: z.string().min(6).max(191)
})

export async function POST(req: Request){
    const { token, newPassword } = schema.parse(await req.json())

    const hash = crypto.createHash("sha256").update(token).digest("hex")
    
    const resetToken = await prisma.passwordReset.findUnique({
        where: {
            tokenHash: hash
        }
    })

    if(!resetToken || resetToken.used || resetToken.expiresAt < new Date()){
        return NextResponse.json({
            error: "Invalid or expired token.",
        })
    }

    const hashedpassword = await bcrypt.hash(newPassword, 10)

    await prisma.$transaction([
        prisma.user.update({
            where: {
                id: resetToken.userId,
            },
            data: {
                passwordHash: hashedpassword,
            }
        }),

        prisma.passwordReset.update({
            where: {
                id: resetToken.id,
            },
            data: {
                used: true
            }
        })
    ])

    return NextResponse.json({
        message: "Password Reset Successful"
    })
}