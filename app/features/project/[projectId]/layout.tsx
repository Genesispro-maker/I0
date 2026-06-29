import { getAuth } from "@/app/api/query/get-user"
import { signinpath } from "@/app/util/path"
import { redirect } from "next/navigation"

const Projectlayout = async ({children}: {children: React.ReactNode}) => {
    const user = await getAuth()

    if(!user){
        redirect(signinpath())
    }

    return <>{children}</>
}

export default Projectlayout