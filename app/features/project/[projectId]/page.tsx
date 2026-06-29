import prisma from "@/app/lib/prisma"
import { ProjectEditor } from "@/components/project-view/project-view"
import { ToggleProvider } from "@/components/provider/toogle-provider"
import { notFound } from "next/navigation"

export async function generateMetadata({params,}: {params: Promise<{ projectId: string }>}){
    const { projectId } = await params

    const project = await prisma.projects.findUnique({
        where: {
            id: projectId,
        },

        select: {
            title: true
        }
    })

    return {
         title: `${project?.title} - I/0 by Genesis`,
    }
}

export default async function Projectpage({params,}: {params: Promise<{ projectId: string }>}){
    const { projectId } = await params

    const project = await prisma.projects.findUnique({
        where: {
            id: projectId,
        },
        include: {
            messages: {
                select: {
                    id: true,
                    reasoning: true,
                    generations: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    content: true,
                    projectId: true,
                },
                orderBy: {
                    createdAt: "asc"
                }
            }
        }
    })

    if(!project){
        notFound()
    }

    return (
        <ToggleProvider>
          <ProjectEditor project={project} />
        </ToggleProvider>
    )
}