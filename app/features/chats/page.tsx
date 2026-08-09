"use client"
import { signinpath } from "@/app/util/path"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Project } from "@/app/types/types"
import Link from "next/link"
import Image from "next/image"
import Skeleton from "./skeleton"
import { Plus, Search } from "lucide-react"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [search, setSearch] = useState<string>("")
  const router = useRouter()

  const key : keyof Project = "createdAt"

  const filterd = projects.filter((i) => {
    if(!search) return true

    return i.title.toLowerCase().includes(search.trim().toLowerCase())
  })

  const groupby = filterd.reduce((acc, pro) => {
     const group = pro[key];
     const keystr = String(group).split("T")[0]
  
    if (!acc[keystr]) {
      acc[keystr] = [];
    }
  
    acc[keystr].push(pro);
    return acc;
  }, {} as Record<string, Project[]>);
  

  useEffect(() => {
    setStatus("loading")
    fetch("/api/projects").then(res => {
        if (res.status === 401) {
          router.push(signinpath())
          return null
        }
        return res.json()
      }).then(data => {
        if (data) setProjects(data.projects)
        setStatus("idle")
      }).catch(() => setStatus("error"))
  }, [router])

  if(status === "loading") return <Skeleton />
  if(status === "error") return <h1>Something went Wrong</h1>

  return (
    <main className="p-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Projects</h1>
        <button onClick={() => router.push("/")} className="flex gap-2 items-center border rounded-lg px-3 hover:bg-zinc-950 py-1 border-zinc-600 hover:cursor-pointer text-zinc-200">Create <Plus size={20}/></button>
      </div>
      
      <div className="flex my-2 items-center gap-2.5 border w-fit p-1 rounded-md border-zinc-600 focus-within:border-zinc-400">
        <Search size={20} color="gray"/>
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="focus:outline-none" type="text" placeholder="search projects..."/>
      </div>

      <div className="p-5">
        {Object.entries(groupby).map(([group, project]) => {
          return (
            <div key={group}>
              <h2 className="text-zinc-300 font-bold">{group}</h2>

              <ul className="flex items-center flex-wrap gap-3 my-3">
                {project.map((p) => (
                  <div key={p.id} className="w-100">
                    <div className="hover:cursor-pointer border h-50 border-zinc-600 rounded-lg"></div>

                     <div className="flex items-center my-3 gap-2">
                       {p.user.image ? <Image src={p.user.image} alt={p.user.username ?? ""} width={30} height={30} className="rounded-full border border-zinc-400"/> : <button className="w-8 h-8 rounded-[50%] border my-1.5 mx-1 hover:cursor-pointer">{p.user.username?.slice(0, 1) ?? ""}</button>}
                       <Link className="text-zinc-200 hover:underline hover:underline-offset-2" href={`/features/project/${p.id}`}>{p.title}</Link>
                     </div>
                  </div>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </main>
  )
}