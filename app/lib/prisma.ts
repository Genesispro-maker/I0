import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"

const globalforprisma = global as unknown as {
    prisma: PrismaClient,
}

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
})

const prisma = globalforprisma.prisma || new PrismaClient({
    adapter
})

if(process.env.NODE_ENV !== "production"){
    globalforprisma.prisma = prisma
}

export default prisma