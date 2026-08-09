import { authOptions } from "@/app/lib/auth"
import prisma from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { cache } from "react"

export const getAuth = cache(async () => {
    const session = await getServerSession(authOptions)
    
    if(!session?.user.id){
        return null
    }

    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
        select: {
            id: true,
            username: true,
            email: true,
            image: true,
        }
    })

    return user;
})
