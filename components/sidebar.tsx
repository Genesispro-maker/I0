"use client"
import { Project, User } from "@/app/types/types"
import { Loader, V0 } from "@/app/util/constants"
import { signinpath } from "@/app/util/path"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import clsx from "clsx"
import { ChevronRight, Ellipsis, List, Settings, Trash2, UserRound } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Menu } from "@base-ui/react"
import { SignOutIcon } from "@codesandbox/sandpack-react"
import { signOut } from "next-auth/react"
import { Delete } from "@/app/actions/project/delete"
import { toast } from "sonner"
import { ThemeToggle } from "./theme-toggle"
import { useToggle } from "@/app/hooks/use-toggle"

export function Sidebar({ isOpen, user }: { isOpen: boolean; user: User | null }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [toggle, handleToggle] = useToggle(false)
  const [show, handleShow] = useToggle(false)
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    fetch("/api/projects", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(res => {
        if (!navigator.onLine) return null

        if (res.status === 401) {
          router.push(signinpath()); 
          return null
        }
        
        return res.json()
      }).then(data => {
        if (data){
          setProjects(data.projects)
          setLoading(false)
        }
      }).catch(() => setLoading(false))
  }, [router])

  const Del = useCallback(async (id: string) => {
    const result = await Delete(id)

    if(result.status === "success"){
      setProjects((prev) => prev.filter(p => p.id !== id))
    }
  }, [])

  return (
    <aside className={clsx("flex flex-col h-full overflow-hidden py-2 px-2 border-r border-zinc-300 dark:border-zinc-800 transition-all duration-300 ease-in-out shrink-0",
      isOpen ? "w-60 opacity-100" : "w-0 opacity-0 pointer-events-none")}>

      <div className="w-56 px-1 mb-4">
        <V0 />
      </div>

      <div className="w-56 flex flex-col flex-1 min-h-0">
        <div className="px-1 mt-1 shrink-0 flex flex-col gap-1.5">
          <button onClick={() => router.push("/features/chats")} className="flex items-center gap-2.5 w-full px-2 py-1 hover:cursor-pointer rounded-md hover:bg-zinc-300 hover:text-black dark:hover:bg-zinc-800  transition-colors">
            <List size={18} />
            Chats
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-1 flex flex-col mt-20">
          <button onMouseOver={handleShow} onMouseLeave={handleShow} onClick={handleToggle} className="flex items-center gap-2 font-normal w-full px-1 mb-1.5 text-sm hover:cursor-pointer transition-colors">
            Recent
            {show && <ChevronRight aria-hidden={true} size={20} className={clsx("transition-all ease-out w-3 h-3", toggle ? "rotate-90" : "rotate-0")} />}
          </button>

          {toggle && (
            <div className="flex flex-col gap-0.5 overflow-y-auto flex-1">
              {loading && (
                <span className="text-center">
                  <Loader />
                </span>
              )}

              {!loading && projects.length === 0 ?  (
                <p className="text-sm px-2 py-1">No projects yet</p>
              ) : (
                <div>
                  {projects.map(p => (
                    <div key={p.id} className="flex items-center rounded-md hover:bg-zinc-300 justify-between group transition-colors">
                      <Link href={`/features/project/${p.id}`} className="text-[0.9rem] flex min-w-0 flex-1 px-2 py-1.5 transition-colors">
                       <span className="truncate">{p.title}</span>
                      </Link>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-1 shrink-0">
                        <Menu.Root>
                          <Menu.Trigger className='flex items-center hover:bg-zinc-300 dark:hover:bg-zinc-800 hover:cursor-pointer p-0.5 rounded-sm'>
                            <Ellipsis size={14} className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-300 transition-colors" />
                          </Menu.Trigger>
                          <Menu.Portal>
                            <Menu.Positioner sideOffset={8} side="right">
                              <Menu.Popup className='border rounded-lg border-zinc-300 dark:border-zinc-800 bg-white dark:bg-black'>
                                 <div className="w-50 p-1">
                                  <Menu.Item onClick={() => toast.promise(Del(p.id), {
                                    loading: "Deleting...",
                                    success: "Project Deleted",
                                    error: "An Error Occured"
                                  })} className="hover:bg-red-200 dark:hover:bg-red-950 rounded-sm w-full p-1 hover:cursor-pointer flex gap-2 items-center text-red-600 text-sm">
                                    <Trash2 size={18}/> Delete
                                  </Menu.Item>
                                 </div>
                              </Menu.Popup>
                            </Menu.Positioner>
                          </Menu.Portal>
                        </Menu.Root>
                      </div>
                    </div>
                   ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-56 mt-2 px-0.5">
        <Menu.Root>
          <Menu.Trigger className="w-full select-none flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-800 hover:text-black hover:dark:text-white cursor-pointer transition-colors group">
            {user?.image ? <Image className="rounded-full ring-1 ring-white/10" src={user?.image ?? ""} alt={user?.username ?? ""} width={26} height={26} /> : <p className="w-7 font-bold border border-zinc-300 dark:border-zinc-800 bg-zinc-400 dark:bg-zinc-600 dark:text-black rounded-full">{user?.username?.slice(0, 1).toUpperCase()}</p>}
            <span className="text-[14px] group-hover:text-black group-hover:dark:text-zinc-300 font-semibold transition-colors truncate">
              {user?.username}
            </span>
         </Menu.Trigger>
           <Menu.Portal>
             <Menu.Positioner align="end" className="outline-hidden" sideOffset={10}>
               <Menu.Popup className='border w-60 rounded-lg border-zinc-400 dark:border-zinc-800 bg-white dark:bg-black'>
                 <div className="px-2 py-2">
                  <Menu.Item>{user?.username}</Menu.Item>
                  <Menu.Item className="text-sm">{user?.email}</Menu.Item>
                 </div>

                <Menu.Separator className="h-px w-full bg-zinc-400 dark:bg-zinc-800" />
                  <div className="px-2 py-1 flex flex-col gap-1">
                    <Menu.Item onClick={() => {
                      router.push(`/features/profile`)
                    }} className="dark:hover:bg-zinc-800 hover:bg-zinc-300 rounded-sm w-full p-1 hover:cursor-pointer flex gap-2 items-center text-sm"><UserRound size={19} /> Profile</Menu.Item>
                    <Menu.Item className="dark:hover:bg-zinc-800 hover:bg-zinc-300 rounded-sm w-full p-1 hover:cursor-pointer flex gap-2 items-center text-sm"><Settings size={19} /> Settings</Menu.Item>
                  </div>

                <Menu.Separator className="h-px w-full bg-zinc-400 dark:bg-zinc-800" />
                  <div className="px-2 py-1">
                    <Menu.Item closeOnClick={false} className="flex items-center gap-2">
                      <span className="text-sm">Theme: </span>
                      <ThemeToggle />
                    </Menu.Item>
                  </div>

                 <Menu.Separator className="h-px w-full bg-zinc-400 dark:bg-zinc-800" />
                  <div className="p-1">
                    <Menu.Item onClick={() => signOut({
                      callbackUrl: "/",
                      redirect: true,
                    })} className="dark:hover:bg-zinc-800 hover:bg-zinc-300 rounded-sm w-full p-1 hover:cursor-pointer flex gap-2 items-center text-sm"><SignOutIcon /> Sign Out</Menu.Item>
                  </div>
               </Menu.Popup>
             </Menu.Positioner>
           </Menu.Portal>
        </Menu.Root>
      </div>
    </aside>
  )
}