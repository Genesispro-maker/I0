"use client"
import { Delete } from "@/app/actions/project/delete"
import { Rename } from "@/app/actions/project/rename"
import { Prisma, Projects } from "@/app/generated/prisma/client"
import { I0, } from "@/app/util/constants"
import { Menu, Tabs } from "@base-ui/react"
import { ChevronDown, Code2Icon, Eye, Pencil, Plus, Trash, } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dispatch, SetStateAction, useEffect, useRef, useTransition } from "react"
import { toast } from "sonner"

type Prop = {
    project: Prisma.ProjectsGetPayload<{
      select: {
        id: true,
        messages: true,
        title: true,
      }
    }>,
    rename: {
        title: string,
        isEditing: boolean,
    },
    setRename: Dispatch<SetStateAction<{title: string, isEditing: boolean}>>,
}

export const ProjectHeader = ({ project, rename, setRename }: Prop) => {
    const router = useRouter()
    const [, startTransition] = useTransition()
    const inputRef = useRef<HTMLInputElement | null>(null)  

   useEffect(() => {
    if(rename.isEditing && inputRef.current){
      inputRef.current.focus()
      inputRef.current.select()
    }
   }, [rename.isEditing])

    async function handleRename(e: React.KeyboardEvent, id: string, title: string){
        if(e.key === "Enter"){
            e.preventDefault()
            try {
                await Rename(id, title)
            } catch {
                return
            }
            setRename({...rename, isEditing: false})
        } else if(e.key === "Escape"){
            setRename({title: project.title, isEditing: false})
        }
    }

    function onRename(){
       if(rename.isEditing) setRename({...rename, isEditing: false})
       else setRename({...rename, isEditing: true})
    }

    async function onDelete(projectId: string){
      startTransition(async () => {
         const res = await Delete(projectId)

         if(res.status === "success") router.push("/")
         else toast.error("An Error Occured")
      })
    }

    return (
      <nav className="shrink-0 justify-between px-2 py-1 flex border-b border-zinc-400 dark:border-zinc-950">
        <div className="flex items-center gap-3">
            <I0 />
            {rename.isEditing ? <input onBlur={() => setRename({
              ...rename, 
              isEditing: false
            })} autoFocus aria-label="Project name" value={rename.title} ref={inputRef} onChange={(e) => setRename({...rename, title: e.target.value})} onKeyDown={(e) => handleRename(e, project.id, rename.title)} className="border p-1 border-zinc-800 rounded-lg focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-zinc-800" /> : <p className="truncate font-semibold text-base">{project.title}</p>}
            <ProjectMenu project={project} onRename={onRename} onDelete={onDelete} />
        </div>

        <Tabs.List className="mx-auto border select-none rounded-[10px] p-1 border-zinc-400 dark:border-zinc-800 items-center z-1 flex justify-end gap-1">
            <Tabs.Tab value="preview" className="hover:cursor-pointer flex h-8 items-center px-3 font-semibold text-sm dark:data-active:bg-zinc-800 dark:data-active:text-white data-active:text-black data-active:bg-zinc-300 gap-2 rounded-md transition-colors"><Eye size={16} /> Preview</Tabs.Tab>
            <Tabs.Tab value="editor" className="hover:cursor-pointer flex h-8 items-center px-3 font-semibold text-sm dark:data-active:bg-zinc-800 dark:data-active:text-white data-active:text-black data-active:bg-zinc-300 gap-2 rounded-md transition-colors"><Code2Icon size={16} /> Editor</Tabs.Tab>
        </Tabs.List>
       </nav>
    )
}

function ProjectMenu<T>({ project, onRename, onDelete }: {
  project: Pick<Projects, "id" | "title">
  onRename: () => void
  onDelete: (id: string) => Promise<T>
}) {

  const router = useRouter()
  return (
    <Menu.Root>
      <Menu.Trigger aria-label={`Options for ${project.title}`} className="dark:hover:bg-zinc-800 hover:bg-zinc-300 p-0.5 rounded-md hover:cursor-pointer">
        <ChevronDown size={17} aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner className="outline-hidden" sideOffset={8}>
          <Menu.Popup className="bg-white border-zinc-400 dark:bg-black p-2 border dark:border-zinc-800 flex flex-col gap-2 rounded-lg w-40">
            <Menu.Item onClick={() => router.push("/")} className="flex hover:cursor-pointer gap-3 px-1 py-1 items-center dark:hover:bg-zinc-800 hover:bg-zinc-300 rounded-lg"><Plus /> New </Menu.Item>
            <Menu.Item onClick={onRename} className="flex hover:cursor-pointer gap-3 px-1 py-1 items-center dark:hover:bg-zinc-800 hover:bg-zinc-300 rounded-lg">
              <Pencil size={18} aria-hidden="true" /> Rename
            </Menu.Item>
            <Menu.Item onClick={() => toast.promise(onDelete(project.id), {
              loading: "Loading.....",
              success: () => {
                return `Project Deleted`
              }
            })} className="text-red-600 dark:hover:bg-red-900 hover:cursor-pointer hover:bg-red-200 flex items-center rounded-lg gap-3 justify-start px-1 py-1">
              <Trash size={18} aria-hidden="true" /> Delete
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}