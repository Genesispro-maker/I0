"use client"
import { Project, User } from "@/app/types/types"
import { ChevronIcon, V0 } from "@/app/util/constant"
import { signinpath } from "@/app/util/path"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import clsx from "clsx"
import { Ellipsis, LayoutGrid, List, Settings, Trash2, UserRound } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Menu } from "@base-ui/react"
import { SignOutIcon } from "@codesandbox/sandpack-react"
import { signOut } from "next-auth/react"
import { Delete } from "@/app/actions/project/delete"

export function Sidebar({ open, user }: { open: boolean; user: User | null }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [recentOpen, setRecentOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/projects").then(res => {
        if (!navigator.onLine) return null

        if (res.status === 401) {
          router.push(signinpath()); 
          return null
        }
        
        return res.json()
      }).then(data => {
        if (data){
          setProjects(data.projects)
        }
      })
  }, [router])

  const handleRecentOpen = useCallback(() => setRecentOpen(prev => !prev), [])

  const del = useCallback( async (id: string) => {
    const result = await Delete(id)

    if(result.status === "success"){
      setProjects((prev) => prev.filter(p => p.id !== id))
    }
  }, [])

  return (
    <aside className={clsx("flex flex-col h-full overflow-hidden py-3 px-2 bg-black border-r border-zinc-800 transition-all duration-300 ease-in-out shrink-0",
      open ? "w-60 opacity-100" : "w-0 opacity-0 pointer-events-none")}>

      <div className="w-56 px-1 mb-4">
        <V0 />
      </div>

      <div className="w-56 flex flex-col flex-1 min-h-0">
        <div className="px-1 mt-1 shrink-0 flex flex-col gap-1.5">
          <button onClick={() => router.push("/features/chats")} className="flex items-center gap-2.5 w-full px-2 py-1 hover:cursor-pointer rounded-md hover:text-zinc-100 hover:bg-[#1c1c1c] transition-colors">
            <List size={18} />
            Chats
          </button>

          <button className="flex items-center gap-2.5 w-full px-2 py-1 hover:cursor-pointer rounded-md hover:text-zinc-100 hover:bg-[#1c1c1c] transition-colors">
            <LayoutGrid size={18} />
            Projects
          </button>
        </div>

        <div className="my-3 border-t border-white/5" />

        <div className="flex-1 overflow-y-auto min-h-0 px-1 flex flex-col mt-30">
          <button onClick={handleRecentOpen} className="flex items-center justify-between w-full px-1 mb-1.5 text-[0.9rem] font-light tracking-widest hover:cursor-pointer transition-colors">
            Recent
            <ChevronIcon className={clsx("transition-all ease-out w-3 h-3", recentOpen ? "rotate-90" : "rotate-0")} />
          </button>

          {recentOpen && (
            <div className="flex flex-col gap-0.5 overflow-y-auto flex-1">
              {projects.length === 0 && (
                <p className="text-sm px-2 py-1">No projects yet</p>
              )}
              {projects.map(p => (
                <div key={p.id} className="flex items-center justify-between group rounded-md hover:bg-[#1c1c1c] transition-colors">
                  <Link href={`/features/project/${p.id}`} className="group-hover:text-zinc-100 text-[0.9rem] truncate flex min-w-0 flex-1 px-2 py-1.5 transition-colors">
                   {p.title}
                  </Link>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-1 shrink-0">
                    <Menu.Root>
                      <Menu.Trigger className='flex items-center hover:bg-zinc-800 hover:cursor-pointer p-0.5 rounded-sm'><Ellipsis size={14} className="text-zinc-500 hover:text-zinc-200 transition-colors" /></Menu.Trigger>
                      <Menu.Portal>
                        <Menu.Positioner sideOffset={8} side="right">
                          <Menu.Popup className='border rounded-lg border-zinc-800 bg-black'>
                             <div className="w-50 p-1">
                              <Menu.Item onClick={() => del(p.id)} className="hover:bg-red-950 rounded-sm w-full p-1 hover:cursor-pointer flex gap-2 items-center text-red-600 text-sm"><Trash2 size={18}/> Delete</Menu.Item>
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
      </div>

      <div className="w-56 mt-2 px-0.5">
        <Menu.Root>
          <Menu.Trigger className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-[#1c1c1c] cursor-pointer transition-colors group">
            <Image className="rounded-full ring-1 ring-white/10" src={user?.image ?? ""} alt={user?.username ?? ""} width={26} height={26} />
            <span className="text-[14px] group-hover:text-zinc-100 font-semibold transition-colors truncate">
              {user?.username}
            </span>
          </Menu.Trigger>
           <Menu.Portal>
             <Menu.Positioner className="outline-hidden" sideOffset={8}>
               <Menu.Popup className='border rounded-lg border-zinc-800 bg-black'>
                 <div className="px-2 py-2">
                  <Menu.Item>{user?.username}</Menu.Item>
                  <Menu.Item className="text-zinc-300 text-sm">{user?.email}</Menu.Item>
                 </div>

                 <Menu.Separator className="h-px w-full bg-zinc-800" />
                  <div className="px-2 py-1 flex flex-col gap-1">
                    <Menu.Item onClick={() => {
                      router.push(`/features/profile`)
                    }} className="hover:bg-zinc-800 rounded-sm w-full p-1 hover:cursor-pointer flex gap-2 items-center text-sm"><UserRound size={19} /> Profile</Menu.Item>
                    <Menu.Item className="hover:bg-zinc-800 rounded-sm w-full p-1 hover:cursor-pointer flex gap-2 items-center text-sm"><Settings size={19} /> Settings</Menu.Item>
                  </div>
                <Menu.Separator className="h-px w-full bg-zinc-800" />
                <div className="px-2 py-1">
                  <Menu.Item onClick={() => signOut({
                    callbackUrl: "/",
                    redirect: true,
                  })} className="hover:bg-zinc-800 rounded-sm w-full p-1 hover:cursor-pointer flex gap-2 items-center text-sm"><SignOutIcon /> Sign Out</Menu.Item>
                </div>
               </Menu.Popup>
             </Menu.Positioner>
           </Menu.Portal>
        </Menu.Root>
      </div>
    </aside>
  )
}