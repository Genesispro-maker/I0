import { ToggleProvider } from "@/components/provider/toogle-provider"
import { getAuth } from "./api/query/get-user"
import { Header } from "@/components/header"
import Home from "@/components/home"

export default async function Homepage() {
  const user = await getAuth()

  return (
    <ToggleProvider>
      <main className="w-full h-screen overflow-auto">
        {!user && <Header />}
        <Home user={user} />
      </main>
    </ToggleProvider>
  )
}