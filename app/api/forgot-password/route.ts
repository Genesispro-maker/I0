import prisma from "@/app/lib/prisma"
import crypto from "crypto"
import { Email } from "@/app/lib/mail"
import { NextResponse } from "next/server"

export async function POST(req: Request){
    const message = "If that email exists, a reset link has been sent."

    try {
        const { email } = await req.json()

        if(!email || typeof email !== "string"){
            return NextResponse.json({
                    error: "A valid email is required."
                },
                {
                    status: 400
                })
        }

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if(!user){
            return NextResponse.json({ message })
        }

        const token = crypto.randomBytes(32).toString("hex")
        const hash = crypto.createHash("sha256").update(token).digest("hex")

        await prisma.passwordReset.create({
            data: {
                tokenHash: hash,
                userId: user.id,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000)
            }
        })

        const url = `http://localhost:3000/features/reset-password?token=${token}`
        await Email(user.email, url)

        return NextResponse.json({ message })
    } catch (err) {
        return NextResponse.json({
            error: "Something went wrong. Please try again later." 
        },
        {
            status: 500
        })
    }
}