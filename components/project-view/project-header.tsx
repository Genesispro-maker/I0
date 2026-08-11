"use client"
import { Delete } from "@/app/actions/project/delete"
import { Rename } from "@/app/actions/project/rename"
import { Prisma, Projects } from "@/app/generated/prisma/client"
import { Github, V0 } from "@/app/util/constants"
import { Dialog, Menu, Switch, Tabs } from "@base-ui/react"
import { ChevronDown, Code2Icon, Eye, Pencil, Trash, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dispatch, SetStateAction, useEffect, useRef, useTransition } from "react"
import { toast } from "sonner"

type Prop = {
    project: Prisma.ProjectsGetPayload<{
      select: {
        id: true,
        messages: true,
        visiblity: true,
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
      <nav className="shrink-0 px-2 py-1 flex justify-between border-b border-zinc-400 dark:border-zinc-950">
        <div className="flex items-center gap-3">
            <V0 />
            {rename.isEditing ? <input onBlur={() => setRename({
              ...rename, 
              isEditing: false
            })} autoFocus aria-label="Project name" value={rename.title} ref={inputRef} onChange={(e) => setRename({...rename, title: e.target.value})} onKeyDown={(e) => handleRename(e, project.id, rename.title)} className="border p-1 border-zinc-800 rounded-lg focus-within:outline-2 focus-within:outline-offset-2" /> : <p className="truncate font-semibold text-base">{project.title}</p>}
            <ProjectMenu project={project} onRename={onRename} onDelete={onDelete} />
        </div>

        <Tabs.List className="relative border rounded-[10px] p-1 border-zinc-400 dark:border-zinc-800 items-center z-1 flex justify-end gap-1">
            <Tabs.Tab value="preview" className="hover:cursor-pointer flex h-8 items-center px-3 font-semibold text-sm data-active:text-black data-active:bg-zinc-300 gap-2 rounded-md transition-colors"><Eye size={16} /> Preview</Tabs.Tab>
            <Tabs.Tab value="editor" className="hover:cursor-pointer flex h-8 items-center px-3 font-semibold text-sm data-active:text-black data-active:bg-zinc-300 gap-2 rounded-md transition-colors"><Code2Icon size={16} /> Editor</Tabs.Tab>
        </Tabs.List>

          <div className="flex gap-2 items-center">
              <Dialog.Root>
                  <Dialog.Trigger className="flex items-center gap-2 rounded-lg bg-white text-black py-0.5 px-2 font-medium h-fit hover:cursor-pointer hover:bg-zinc-200">Github</Dialog.Trigger>
                  <Dialog.Portal>
                      <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute" />
                      <Dialog.Popup className="bg-black p-2 fixed top-1/2 left-1/2 -mt-8 flex w-120 h-100 max-w-[calc(100vw-3rem)] z-100000 rounded-lg -translate-x-1/2 -translate-y-1/2 flex-col text-neutral-950 dark:text-white border border-neutral-950 dark:border-zinc-800 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-1 overflow-hidden">
                       <div className="flex justify-between p-1 items-center">
                         <p className="font-bold flex gap-2"><Github aria-hidden/> GitHub</p>
                         <Dialog.Close aria-label="Close dialog" className="hover:cursor-pointer px-2 py-2"><X aria-hidden size={18}/></Dialog.Close>
                       </div>
                       <div className="mt-4 flex justify-center items-center">
                          <form className="flex flex-col gap-3.5">
                              <div>
                                <label htmlFor="repo-name" className="text-zinc-300 font-medium text-sm">Name</label>
                                <input id="repo-name" type="text" className="w-full px-3 py-1 rounded-md outline outline-zinc-800 hover:outline hover:outline-zinc-700" placeholder="name" />
                              </div>
                              <div>
                                <label htmlFor="repo-description" className="text-zinc-300 font-medium text-sm">Description</label>
                                <input id="repo-description" type="text" className="w-full px-3 py-1 rounded-md outline outline-zinc-800 hover:outline hover:outline-zinc-700" placeholder="description" />
                              </div>        
                              <div>
                                <label htmlFor="commit-message" className="text-zinc-300 font-medium text-sm">Commit-Message</label>
                                <input id="commit-message" type="text" className="w-full px-3 py-1 rounded-md outline outline-zinc-800 hover:outline hover:outline-zinc-700" placeholder="Inital commit" />
                              </div>    
                              <div>
                                  <span id="visibility-label" className="text-md text-zinc-300">Visibility: Private</span>
                                  <Switch.Root className="flex h-5 w-9 shrink-0 border border-neutral-950 rounded-2xl bg-white p-0.5 transition-colors duration-150 ease-[ease] dark:border-white dark:bg-neutral-950 data-checked:bg-neutral-950 dark:data-checked:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white" aria-labelledby="visibility-label">
                                      <Switch.Thumb className="size-3.5 rounded-2xl bg-neutral-950 transition-[translate,background-color] duration-150 ease-[ease] data-checked:translate-x-4 data-checked:bg-white dark:bg-white dark:data-checked:bg-neutral-950" />
                                  </Switch.Root>
                              </div>  
                              <button className="border h-7 text-sm rounded-lg hover:cursor-pointer bg-white text-black hover:bg-zinc-300" type="submit">Push To Github</button>                  
                          </form>
                       </div>
                      </Dialog.Popup>
                  </Dialog.Portal>
              </Dialog.Root>
          </div>
       </nav>
    )
}

function ProjectMenu<T>({ project, onRename, onDelete }: {
  project: Pick<Projects, "id" | "title">
  onRename: () => void
  onDelete: (id: string) => Promise<T>
}) {
  return (
    <Menu.Root>
      <Menu.Trigger aria-label={`Options for ${project.title}`} className="dark:hover:bg-zinc-800 hover:bg-zinc-300 p-0.5 rounded-md hover:cursor-pointer">
        <ChevronDown size={17} aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner className="outline-hidden" sideOffset={8}>
          <Menu.Popup className="bg-white dark:bg-black p-2 border border-zinc-800 flex flex-col gap-2 rounded-lg w-40">
            <Menu.Item onClick={onRename} className="flex hover:cursor-pointer gap-3 px-1 py-1 items-center hover:bg-zinc-300 rounded-lg">
              <Pencil size={18} aria-hidden="true" /> Rename
            </Menu.Item>
            <Menu.Item onClick={() => toast.promise(onDelete(project.id), {
              loading: "Loading.....",
              success: () => {
                return `Project Deleted`
              }
            })} className="text-red-600 hover:cursor-pointer hover:bg-red-200 flex items-center rounded-lg gap-3 justify-start px-1 py-1">
              <Trash size={18} aria-hidden="true" /> Delete
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}