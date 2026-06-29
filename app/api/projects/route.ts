import prisma from "@/app/lib/prisma"
import { getAuth } from "../query/get-user"
import { NextResponse } from "next/server"

export async function GET() {
  const user = await getAuth()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, {
        status: 401
    })
  }

  try {
    const projects = await prisma.projects.findMany({
      where: {
        userId: user.id
    },
      orderBy: {
        createdAt: "desc"
    },
    select: {
      id: true,
      title: true,
      user: true,
      createdAt: true,
    }
})
    return NextResponse.json({ projects })
  } catch {
    return NextResponse.json({ error: "Failed to get projects" }, {
        status: 500
    })
  }
}