import { getAuth } from "@/app/api/query/get-user"
import { redirect } from "next/navigation"

const Projectlayout = async ({children}: {children: React.ReactNode}) => {
    const user = await getAuth()

    return <>{children}</>
}

export default Projectlayout