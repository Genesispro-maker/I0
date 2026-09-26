"use client"
import { update } from "@/app/actions/user/update";
import { Prisma } from "@/app/generated/prisma/client";
import { useActionFeedback } from "@/app/hooks/use-action-feedback";
import { I0 } from "@/app/util/constants";
import { EMPTY_ACTION_STATE } from "@/app/util/error-handler";
import { Dialog } from "@base-ui/react";
import { Pencil, X } from "lucide-react";
import Image from "next/image"
import { useActionState } from "react";
import { toast } from "sonner";

type Props = {
    user: Prisma.UserGetPayload<{
        select: {
            username: true,
            image: true,
            email: true,
        }
    }>,
    project: Array<{
      title: string, 
      id: string,
    }>
}

export const ProfilePage = ({ user, }: Props) => {
    const [actionState, action] = useActionState(update, EMPTY_ACTION_STATE)

    useActionFeedback(actionState, {
        onSuccess: () => toast.success("Profile Updated"),
        onError: () => toast.error("Something went wrong")
    })

    return (
      <main className="w-full h-screen overflow-hidden flex flex-col">
          <nav className="border-b border-zinc-800 px-2 shrink-0">
              <I0 aria-hidden />
          </nav>
  
          <section className="w-full md:w-full md:shrink-0 shrink-0 border-zinc-800 flex flex-col items-center gap-4 px-6 py-8 md:py-8">
              <div className="flex flex-col">
                  <Image loading="eager" className="rounded-full border border-zinc-300 dark:border-zinc-800" src={user.image ?? ''} width={64} height={64} alt="" />
              </div>
              <div className="flex justify-center items-center gap-2">
                  <p className="text-base font-semibold">@{user.username}</p>
                  <Dialog.Root>
                    <Dialog.Trigger className="hover:cursor-pointer size-8 border flex justify-center items-center dark:border-zinc-700 dark:hover:bg-zinc-800 hover:bg-zinc-300 border-zinc-300 text-sm p-1 rounded-lg transition-colors">
                      <Pencil size={15} />
                    </Dialog.Trigger>
                    <Dialog.Portal>
                      <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute" />
                      <Dialog.Popup className="bg-black fixed top-1/2 left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] rounded-xl -translate-x-1/2 -translate-y-1/2 flex-col gap-4 p-5 text-neutral-950 dark:text-white border border-neutral-950 dark:border-zinc-800 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-1">
                      <div className="flex justify-between">
                        <Dialog.Title className="text-lg">Edit Profile</Dialog.Title>
                        <Dialog.Close className="hover:cursor-pointer"> <X color="gray" size={15}/> </Dialog.Close>
                      </div>
                        <form action={action} className="flex flex-col gap-2">
                          <label className="text-zinc-300 text-sm">Name:</label>
                          <input defaultValue={user.username} name="name" className="w-full px-3 py-1 rounded-md outline outline-zinc-800 hover:outline hover:outline-zinc-700" type="text"  placeholder="name...." />
                          <label className="text-zinc-300 text-sm">Email:</label>
                          <input defaultValue={user.email} type="email" name="email" className="w-full px-3 py-1 rounded-md outline outline-zinc-800 hover:outline hover:outline-zinc-700" placeholder="email...." />
    
                          <button type="submit" className="border hover:cursor-pointer">Save</button>
                        </form>
                      </Dialog.Popup>
                    </Dialog.Portal>
                  </Dialog.Root>
              </div>
          </section>
      </main>
    )
}