import prisma from "@/app/lib/prisma"
import { getAuth } from "../query/get-user"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest){
  const search =  req.nextUrl.searchParams.get("search") ?? ''

  const user = await getAuth()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, {
        status: 401
    })
  }

  try {
    const projects = await prisma.projects.findMany({
      where: {
        userId: user.id,
        ...(search && {
          title: {
            contains: search,
            mode: "insensitive" as const
          }
        })
    },
      orderBy: {
        createdAt: "desc"
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          image: true,
          username: true
        }
      }
    }
})
    return NextResponse.json({ projects })
  } catch {
    return NextResponse.json({ error: "Failed to get projects" }, {
        status: 500
    })
  }
}