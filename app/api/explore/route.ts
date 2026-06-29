import { getAuth } from "../query/get-user";
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(){
    const user = await getAuth()
    if(!user){
        return new NextResponse("unauthorized", {
            status: 401,
        })
    }

   try {
    const projects = await prisma.projects.findMany({
        where: {
            visiblity: "PUBLIC"
        }
    })

    return NextResponse.json(projects)
   }catch{
       return NextResponse.json(
          {
            error: "Something went wrong",
          },

          {
            status: 500
          }
       )
    }
}