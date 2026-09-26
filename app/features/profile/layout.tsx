import { getAuth } from "@/app/api/query/get-user"
import { ReactNode } from "react"

export async function generateMetadata(){
    const user = await getAuth()

    if(!user) return

    return {
         title: `I/0 - ${user?.username} - I/0 By Genesis`
    }
}

export default async function ProfileLayout({ children }: {children: ReactNode}){
    const user = await getAuth()

    if(!user) return

    return <main>{children}</main>
}