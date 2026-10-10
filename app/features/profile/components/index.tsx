"use client"
import { update } from "@/app/actions/user/update";
import { Prisma } from "@/app/generated/prisma/client";
import { useActionFeedback } from "@/app/hooks/use-action-feedback";
import { I0, Loader } from "@/app/util/constants";
import { EMPTY_ACTION_STATE } from "@/app/util/error-handler";
import { Dialog } from "@base-ui/react";
import { Pencil, Plus, X } from "lucide-react";
import Image from "next/image"
import Link from "next/link";
import { useActionState, useState } from "react";
import { toast } from "sonner";

type Props = {
  user: Prisma.UserGetPayload<{
    select: {
      username: true,
      image: true,
      email: true
    }
  }>,
  project: Array<{
    title: string,
    id: string
  }>,
  total: number,
}

const input = "w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-800 dark:focus:border-zinc-600"

export const ProfilePage = ({ user, project, total }: Props) => {
  const [open, setOpen] = useState(false)
  const [actionState, action, pending] = useActionState(update, EMPTY_ACTION_STATE)

  useActionFeedback(actionState, {
    onSuccess: () => {
      toast.success("Profile updated")
      setOpen(false)
    },
    onError: () => toast.error("Something went wrong"),
  })

  return (
    <div className="min-h-dvh overflow-auto">
      <nav className="border-b border-zinc-200 px-2 dark:border-zinc-800">
        <I0 aria-hidden />
      </nav>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user.image ? (
              <Image loading="eager" className="rounded-full border border-zinc-300 dark:border-zinc-800" src={user.image} width={80}
                height={80}
                alt={user.username} />
            ) : (
              <div className="grid size-20 place-items-center rounded-full bg-zinc-200 text-2xl font-semibold dark:bg-zinc-800">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold">@{user.username}</h1>
              <p className="truncate text-sm text-zinc-500">{user.email}</p>
            </div>
          </div>

          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className="inline-flex items-center gap-2 self-start rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:cursor-pointer hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <Pencil size={14} /> Edit profile
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 bg-black/40 transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0" />
              <Dialog.Popup className="fixed top-1/2 left-1/2 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-5 shadow-lg transition-[scale,opacity] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between">
                  <Dialog.Title className="text-lg font-semibold">Edit profile</Dialog.Title>
                  <Dialog.Close aria-label="Close" className="rounded-md p-1 hover:cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900">
                    <X size={16} />
                  </Dialog.Close>
                </div>

                <form action={action} className="mt-4 flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-sm text-zinc-600 dark:text-zinc-300">Name</label>
                    <input id="name" name="name" type="text" defaultValue={user.username} className={input} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-sm text-zinc-600 dark:text-zinc-300">Email</label>
                    <input id="email" name="email" type="email" defaultValue={user.email} className={input} />
                  </div>
                  <button type="submit" disabled={pending} className="mt-1 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:cursor-pointer hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
                    {pending ? <><Loader /> Saving... </> : "Save changes"}
                  </button>
                </form>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </header>

        <section className="mt-10" aria-labelledby="projects-heading">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
            <h2 id="projects-heading" className="text-md font-bold tracking-wider">
              Projects : <span className="ml-1 dark:text-zinc-300">{total}</span>
            </h2>
            <Link href="/" className="inline-flex items-center gap-1 dark:hover:bg-zinc-700 transition-colors size-auto hover:bg-zinc-800 ease-in-out text-white bg-black text-sm dark:bg-zinc-800 p-1.5 rounded-md">
              New <Plus size={14} />
            </Link>
          </div>

          {project.length === 0 ? (
            <p className="py-16 text-center text-sm">
              No projects yet.{" "}
              <Link href="/" className="underline">Create your first one</Link>
            </p>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.map((p) => (
                <li key={p.id}>
                  <Link href={`/features/project/${p.id}`} className="group block">
                    <div className="grid aspect-video place-items-center rounded-lg border border-zinc-200 bg-transparent text-3xl font-semibold transition-colors group-hover:border-zinc-400 dark:border-zinc-800 dark:bg-transparent dark:group-hover:border-zinc-600">
                      {p.title.charAt(0).toUpperCase()}
                    </div>
                    <p className="mt-2 truncate text-sm text-zinc-300 font-medium">{p.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}