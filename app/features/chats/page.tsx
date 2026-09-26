"use client"
import { Fragment, useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Project } from "@/app/types/types"
import Link from "next/link"
import Skeleton from "./skeleton"
import { Plus, Search } from "lucide-react"
import { useDebounce } from "@/app/hooks/use-debounce"

export default function ProjectsPage() {
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "unauthorized">("idle")
  const [search, setSearch] = useState<string>("")

  const pathname = usePathname()
  const router = useRouter()

  const value = useDebounce(search, 500)
  const key : keyof Project = "updatedAt"

  useEffect(() => {
    document.title = "Chats - I/0 by Genesis"
  }, [searchParams])

  useEffect(() => {
    const currentParam = searchParams.get("search") ?? ''
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
          return null
        }
        return res.json()
      }).then(data => {
        if (data) setProjects(data.projects)
        setStatus("idle")
      }).catch(() => setStatus("error"))
  }, [router, searchParams, value])

  const groupby = projects.reduce((acc, pro) => {
     const group = pro[key];
     const keystr = String(group).split("T")[0]
  
    if (!acc[keystr]) {
      acc[keystr] = [];
    }
  
    acc[keystr].push(pro);
    return acc;
  }, {} as Record<string, Project[]>);

  if(status === "loading") return <Skeleton />

  return (
    <main className="p-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Chats</h1>
        <button onClick={() => router.push("/")} className="flex gap-2 items-center border rounded-lg px-3 hover:bg-zinc-950 py-1 border-zinc-800 hover:cursor-pointer text-zinc-200">
          Create <Plus size={20} />
        </button>
      </div>

      <div className="flex my-2 items-center gap-2.5 border w-full max-w-2xl p-1 rounded-md border-zinc-800 focus-within:outline focus-within:outline-zinc-800">
        <Search size={20} color="gray" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="focus:outline-none w-full bg-transparent" type="text"
          placeholder="search projects..." />
      </div>

      <div className="p-5">
        {projects.length === 0 && status === "idle" && (
          <p className="text-zinc-400 text-center my-8">
            No projects found matching &quot;{search}&quot;
          </p>
        )}
    
        <table className="w-full">
          <thead className="font-medium border-b dark:border-zinc-800 tracking-wider dark:text-zinc-300 text-xs">
            <tr className="flex justify-between">
              <th scope="col">Name</th>
              <th scope="col">Updated</th>
            </tr>
          </thead>
    
          <tbody>
            {Object.entries(groupby).map(([group, projects]) => (
              <Fragment key={group}>
                <tr>
                  <td colSpan={2} className="text-xs uppercase text-zinc-500 pt-4 pb-1">
                    {group}
                  </td>
                </tr>
                {projects.map((p) => (
                  <tr className="flex justify-between" key={p.id}>
                    <td scope="row" className="text-sm tracking-wide dark:text-zinc-200 font-medium" aria-label={p.title}>
                      <Link href={`/features/project/${p.id}`}>{p.title}</Link>
                    </td>
                    <td>
                      <time dateTime={p.updatedAt} aria-label={`Project was updated on ${new Date(p.updatedAt).toLocaleDateString("en-US", {
                        dateStyle: "long"
                      })}`}>
                        {new Date(p.updatedAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {status === "error" && <h1>Something went Wrong</h1>}
    </main>
  )
}