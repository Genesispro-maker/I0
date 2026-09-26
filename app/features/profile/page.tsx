import { getAuth } from "@/app/api/query/get-user"
import { ProfilePage } from "./components"
import prisma from "@/app/lib/prisma"

export async function generateMetadata(){
  const user = await getAuth()

  if(!user) return null

  return {
    title: `${user.username}`
  }
}

export default async function Profile() {
  const user = await getAuth()

  const project = await prisma.projects.findMany({
    where: {
      userId: user?.id,
    },
    select: {
      id: true,
      title: true,
    }
  })

  if(!user) return null

  return <ProfilePage user={user} project={project} />
}