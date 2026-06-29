import { update } from "@/app/actions/user/update"
import { getAuth } from "@/app/api/query/get-user"
import { V0 } from "@/app/util/constant"
import { EMPTY_ACTION_STATE } from "@/app/util/error-handler"
import { Dialog } from "@base-ui/react"
import { X } from "lucide-react"
import Image from "next/image"
// import { useActionState } from "react"

export async function generateMetadata(){
    const user = await getAuth()

    if(!user){
      return
    }

    return {
        title: `I/0 - ${user?.username} - I/0 By Genesis`
    }
}

export default async function ProfilePage() {
  // const [actionState, action] = useActionState(update, EMPTY_ACTION_STATE)
  const user = await getAuth()

  return (

    <main className="w-full h-screen overflow-hidden flex flex-col">
      <nav className="border-b border-zinc-800 px-2 shrink-0">
        <V0 />
      </nav>

      <div className="flex flex-1 min-h-0 w-full md:flex-row">
        <section className="w-64 md:w-64 md:shrink-0 md:border-b-0 md:border-r shrink-0 border-r border-zinc-800 flex flex-col gap-4 px-6 py-8 md:py-8">
          <div className="flex flex-col gap-2">
            <Image loading="eager" className="rounded-full border border-zinc-800" src={user?.image ?? ""} alt={user?.username ?? ''} width={64} height={64} />
            <div>
              <p className="text-base font-semibold text-zinc-100">{user?.username}</p>
              <p className="text-sm text-zinc-500">@{user?.username}</p>
            </div>

              <div className="border-t border-zinc-800 w-full" />

              <Dialog.Root>
                <Dialog.Trigger className="hover:cursor-pointer w-full border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 text-sm py-1.5 px-3 rounded-lg transition-colors">
                  Edit Profile
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute" />
                  <Dialog.Popup className="bg-black fixed top-1/2 left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] rounded-xl -translate-x-1/2 -translate-y-1/2 flex-col gap-4 p-5 text-neutral-950 dark:text-white border border-neutral-950 dark:border-zinc-800 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-1">
                  <div className="flex justify-between">
                    <Dialog.Title className="text-lg">Edit Profile</Dialog.Title>
                    <Dialog.Close className="hover:cursor-pointer"> <X color="gray" size={15}/> </Dialog.Close>
                  </div>
                    <form action="" className="flex flex-col gap-2">
                      <label className="text-zinc-300 text-sm">Name:</label>
                      <input name="name" className="w-full px-3 py-1 rounded-md outline outline-zinc-800 hover:outline hover:outline-zinc-700" type="text"  placeholder="name...." />
                      <label className="text-zinc-300 text-sm">Email:</label>
                      <input type="email" name="email" className="w-full px-3 py-1 rounded-md outline outline-zinc-800 hover:outline hover:outline-zinc-700" placeholder="email...." />

                      <button type="submit" className="border hover:cursor-pointer">Save</button>
                    </form>
                  </Dialog.Popup>
                </Dialog.Portal>
              </Dialog.Root>
          </div>
        </section>
      </div>
    </main>
  )
}