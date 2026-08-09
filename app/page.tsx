import { getAuth } from "./api/query/get-user"
import { Header } from "@/components/header"
import Home from "@/components/home"

export const generateMetadata = async () => {
  const user = await getAuth()

  if(!user) return

  return {
    title: "New chat - I/0"
  }
}

export default async function Homepage() {
  const user = await getAuth()

  return (
      <main className="w-full h-screen overflow-auto">
        {!user && <Header />}
        <Home user={user} />
      </main>
  )
}