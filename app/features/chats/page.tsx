"use client"
import { use, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Project } from "@/app/types/types"
import Link from "next/link"
import Skeleton from "./skeleton"
import { Plus, Search } from "lucide-react"
import { useDebounce } from "@/app/hooks/use-debounce"

export default function ProjectsPage({ searchParams,} : { searchParams: Promise<{[key: string]: string | string[] | null | undefined}> }) {
  const param = use(searchParams)
  const [projects, setProjects] = useState<Project[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "unauthorized">("idle")
  const [search, setSearch] = useState<string>("")

  const pathname = usePathname()
  const router = useRouter()

  const value = useDebounce(search, 500)
  const key : keyof Project = "updatedAt"

  useEffect(() => {
    document.title = "Chats - I/0 by Genesis"
  }, [])

  useEffect(() => {
    const currentParam = (param?.search as string) ?? ''
    if(currentParam === value) return

    const params = new URLSearchParams(searchParams.toString())
    if(value) params.set("search", value)
     else params.delete("search")
    
    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    })
  }, [value])
  

  useEffect(() => {
    setStatus("loading")

    fetch(`/api/projects?search=${encodeURIComponent(value)}`).then(res => {
        if (res.status === 401) {
          setStatus("unauthorized")
          return
        }
        return res.json()
      }).then(data => {
        if (data) setProjects(data.projects)
        setStatus("idle")
      }).catch(() => setStatus("error"))
  }, [router, searchParams, value])

  const groupby = useMemo(() => {
    return projects.reduce((acc, pro) => {
      const group = pro[key]
      const keystr = String(group).split("T")[0]

      if(!acc[keystr]){
        acc[keystr] = []
      }

      acc[keystr].push(pro)
      return acc;
    }, {} as Record<string, Project[]>)
  }, [projects])

  const groups = Object.entries(groupby)

  return (
    <main className="mx-auto w-full max-w-3xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Chats</h1>
        <button onClick={() => router.push("/")} className="flex items-center gap-2 rounded-lg border border-zinc-400 px-3 py-1 hover:cursor-pointer hover:bg-zinc-300 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-950">
          Create <Plus size={20} />
        </button>
      </div>

     <div className="my-3 flex w-full items-center gap-2.5 rounded-md border border-zinc-400 p-1 focus-within:outline focus-within:outline-zinc-300 dark:border-zinc-800 dark:focus-within:outline-zinc-800">
       <Search size={20} color="gray" />
       <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent focus:outline-none" type="text" placeholder="search projects..." />
     </div>

     {status === "loading" ? (
      <Skeleton />
     ) : status === "unauthorized" ? (
       <p role="alert">
         <Link href={"/"} className="underline">Back</Link>
       </p>
     ) : status === "error" ? (
      <div role="alert">
        <p>Something went wrong. Check your connection and try again.</p>
        <button onClick={() => router.refresh()}>Refresh</button>
      </div>
     ) : groups.length === 0 ? (
        <p className="my-8 text-center flex flex-col items-center gap-10">
          {search ? `No projects found matching "${search}"` : <>No projects Found <Link className="border size-auto p-1 rounded-md bg-black dark:text-black text-white items-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-300 transition-colors ease-in-out dark:bg-white flex" href={"/"}>Create <Plus size={18} /></Link></>}
        </p>
     ) : (
      <div className="mt-6 space-y-6">
        {groups.map(([group, projects]) => (
          <section key={group}>
            <h2 className="px-3 pb-1 text-xs text-zinc-500">{group}</h2>
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link className="flex items-center justify-between gap-4 rounded-xs px-3 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900" href={`/features/project/${p.id}`}>
                    <span className="truncate text-sm font-medium dark:text-zinc-200">{p.title}</span>
                    <time dateTime={p.updatedAt} className="shrink-0 text-xs text-zinc-500">
                    {new Date(p.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
     )}
    </main>
  )
}