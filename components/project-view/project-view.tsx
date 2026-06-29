"use client"
import { Role } from "@/app/generated/prisma/client"
import { useGeneration } from "@/app/store/generation-store"
import { ChevronIcon, V0, Github, Loader } from "@/app/util/constant"
import { JsonValue } from "@prisma/client/runtime/client"
import { ArrowUp, Code2Icon, Eye, Globe, Mic, MoreHorizontalIcon, Plus, X } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { Dialog, Switch, Tabs } from "@base-ui/react"
import { Messages } from "./messages"
import { Suggestions } from "./suggestions"
import { Preview } from "./preview"

type Generations = {
  id: string,
  createdAt: Date,
  messageId: string,
  files: JsonValue,
}

type messages = {
  id: string,
  projectId: string,
  content: string,
  role: Role,
  updatedAt: Date | null,
  createdAt: Date | null,
  generations: Generations | null,
  reasoning: string | null
}

type Props = {
  project: {
    id: string
    title: string
    messages: messages[]
  }
}

export const ProjectEditor = ({ project }: Props) => {
  const [data, setData] = useState({
    name: '',
    description: '',
    isPrivate: true,
    message: '',
  })

  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const filesRef = useRef<Array<string>>([])

  const handleinput = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }

  const projectId = useGeneration((s) => s.projectId)
  const error = useGeneration((s) => s.error)
  const messageId = useGeneration((s) => s.messageId)
  const store = useGeneration()
  const reasoning = useGeneration((s) => s.reasoning)
  const sugg = useGeneration((s) => s.suggestions)
  const Files = useGeneration((s) => s.files)
  const sum = useGeneration((s) => s.summary)
  
  const isProject = project.id === projectId

  const assistantmessage = project.messages.find(m => m.role === "ASSISTANT")

  const files = useMemo(() => {
     if(Object.keys(Files).length > 0) return Files
     return (assistantmessage?.generations?.files ?? {}) as Record<string, string>
  }, [Files, assistantmessage?.generations])

  async function handleSubmit(prompt: string, files: Record<string, string>){
    store.reset()
     try {
         const res = await fetch(`/api/generate/${project.id}`, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({
           prompt: prompt,
           files: files,
           reasoning: assistantmessage?.reasoning,
         })
       })

      const reader = res.body?.getReader() as ReadableStreamDefaultReader<Uint8Array> 
      const decoder = new TextDecoder()

      let buffer = ""

      try {
        while(true){
          const { done, value } = await reader?.read()
          if(done) break

          buffer += decoder.decode(value, {
            stream: true
          })

          const parts = buffer.split("\n\n")
          buffer = parts.pop() ?? ""

          for(const part of parts){
            if(!part.startsWith("data: ")) continue

            let type : string
            let data : string

            try {
              const parsed = JSON.parse(part.slice(6))
              type = parsed.type
              data = parsed.data
            } catch {
              continue
            }

            switch(type){
              case "metadata": {
                const { projectId, messageId } = JSON.parse(data)
                store.setMetadata(projectId, messageId)
                break
              }

              case "reasoning":
              store.appendReasoning(data)
              break

              case "code": 
              store.appendCode(data)
              break

              case "suggestions":
              store.appendSuggestions(data)
              break

              case "done": {
                const { files } = JSON.parse(data) as { files: Record<string, string> }
                store.setDone(files)
                return
              }

              case "error": 
              store.setError(data)
              return
            }
          }
        }
      } finally {
        await reader.cancel().catch(() => {})
      }
     } catch (err){
      console.warn(err instanceof Error ? err.message : "Something went wrong")
     }
  }

  return (
    <Tabs.Root defaultValue="preview" className="h-screen overflow-hidden w-full p-1 flex flex-col">
      <nav className="shrink-0 px-2 py-1 flex justify-between border-b border-zinc-950">
        <div className="flex items-center gap-3">
          <V0 />
          <p className="truncate font-semibold text-base">{project.title}</p>
          <ChevronIcon />
        </div>

        <Tabs.List className="relative z-1 flex justify-end gap-1">
          <Tabs.Tab value="preview" className="hover:cursor-pointer flex h-8 items-center px-3 font-semibold text-sm text-zinc-200 data-active:text-white data-active:bg-zinc-800 gap-2 rounded-lg transition-colors"> <Eye size={16} /> Preview</Tabs.Tab>
          <Tabs.Tab value="editor" className="hover:cursor-pointer flex h-8 items-center px-3 font-semibold text-sm text-zinc-200 data-active:text-white data-active:bg-zinc-800 gap-2 rounded-lg transition-colors"> <Code2Icon size={16}/> Editor</Tabs.Tab>
        </Tabs.List>

        <div className="flex gap-2 items-center">
          <Dialog.Root>
            <Dialog.Trigger className="p-1 border border-zinc-700 rounded-lg hover:cursor-pointer hover:bg-zinc-900"><MoreHorizontalIcon size={18}/></Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute" />
              <Dialog.Popup className="bg-black p-2 fixed top-1/2 left-1/2 -mt-8 flex w-120 h-100 max-w-[calc(100vw-3rem)] z-100000 rounded-lg -translate-x-1/2 -translate-y-1/2 flex-col text-neutral-950 dark:text-white border border-neutral-950 dark:border-zinc-800 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-1 overflow-hidden">
                <div className="flex justify-between p-1 items-center">
                  <p className="font-bold flex gap-2"><Github /> GitHub</p>
                  <Dialog.Close className="hover:cursor-pointer px-2 py-2"><X size={18}/></Dialog.Close>
                </div>

                <div className="mt-4 flex justify-center items-center">
                  <form className="flex flex-col gap-3.5">
                    <div>
                      <label htmlFor="name" className="text-zinc-300 font-meduim text-sm">Name: </label>
                      <input value={data.name} onChange={(e) => setData({...data, name: e.target.value})} type="text" className="w-full px-3 py-1 rounded-md outline outline-zinc-800 hover:outline hover:outline-zinc-700" placeholder="name" />
                    </div>

                     <div>
                      <label htmlFor="Description" className="text-zinc-300 font-meduim text-sm">Description: </label>
                      <input value={data.description} onChange={(e) => setData({...data, description: e.target.value})} type="text" className="w-full px-3 py-1 rounded-md outline outline-zinc-800 hover:outline hover:outline-zinc-700" placeholder="Description" />
                     </div>

                     <div>
                      <label htmlFor="message" className="text-zinc-300 font-meduim text-sm">Commit message: </label>
                      <input value={data.message} onChange={(e) => setData({...data, message: e.target.value})} type="text" className="w-full px-3 py-1 rounded-md outline outline-zinc-800 hover:outline hover:outline-zinc-700" placeholder="Commit message..." />
                     </div>

                     <div className="flex gap-3 items-center">
                      <label htmlFor="Visibility" className="text-md text-zinc-300">Visibility: {data.isPrivate === false ? "Public" : "Private"} </label>
                       <Switch.Root value={String(data.isPrivate)} onCheckedChange={() => {
                        if(data.isPrivate === false){
                          setData({...data, isPrivate: true})
                        }
                        else{
                          setData({...data, isPrivate: false})
                        }
                       }} className="flex h-5 w-9 shrink-0 border border-neutral-950 rounded-2xl bg-white p-0.5 transition-colors duration-150 ease-[ease] dark:border-white dark:bg-neutral-950 data-checked:bg-neutral-950 dark:data-checked:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white">
                        <Switch.Thumb className="size-3.5 rounded-2xl bg-neutral-950 transition-[translate,background-color] duration-150 ease-[ease] data-checked:translate-x-4 data-checked:bg-white dark:bg-white dark:data-checked:bg-neutral-950" />
                       </Switch.Root>
                     </div>

                    <button className="border h-7 text-sm rounded-lg hover:cursor-pointer bg-white text-black hover:bg-zinc-300" type="submit">{loading ? <Loader color="black"/> : <>Push <strong>{filesRef.current.length}</strong> files to GitHub</>}</button>
                  </form>
                </div>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
          <button className="flex items-center gap-2 rounded-lg bg-white text-black py-0.5 px-2 font-medium h-fit hover:cursor-pointer hover:bg-zinc-200"> <Globe size={18} /> Publish</button>
        </div>
      </nav>

      <div className="flex mt-2 flex-1 min-h-0 gap-2 w-full">
        <section className="flex-1 flex flex-col min-h-0 px-1 min-w-0">
          <p className="text-center truncate text-[0.8rem] text-zinc-300 font-semibold">{project.messages[0].createdAt?.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            month: "long",
            day: "numeric",
          })}</p>

          <Messages error={error} summary={sum} isProject={isProject} reasoning={reasoning} messageId={messageId ?? ""} project={project} />

          <Suggestions sugg={sugg} textareaRef={textareaRef} />

          <form className="shrink-0 border p-4 rounded-3xl border-zinc-700 bg-[#77777114] flex flex-col gap-3">
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} ref={textareaRef} onInput={handleinput} rows={1} placeholder="Follow Up..." className="w-full resize-none overflow-hidden focus:outline-0 bg-transparent" />
             <div className="flex justify-between">
                <button className="rounded-full p-1 bg-[#77777133] border border-zinc-800">
                  <Plus size={18} color="lightgray" />
                </button>
              <div className="flex gap-2">
                 <button className="rounded-full p-1 bg-[#77777133] border border-zinc-800">
                   <Mic size={18} color="lightgray" />
                 </button>

                 <button type="button" onClick={() => {
                  handleSubmit(prompt, files)
                 }} className="rounded-full p-1 bg-white border border-zinc-800">
                   <ArrowUp size={18} color="black" />
                 </button>
              </div>
             </div>
          </form>
        </section>

         <section className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto rounded-lg bg-[#1c1c1c] min-h-0 h-full">
          <Preview filesRef={filesRef} files={files} id={assistantmessage?.id} />
         </section>
      </div>
    </Tabs.Root>
  )
}


// async function push(){
  //   setLoading(true)
  //    try {
  //        await fetch("/api/git", {
  //        method: "POST",
  //        headers: {
  //          "Content-Type": "application/json",
  //        },
  //        body: JSON.stringify({
  //          name: data.name,
  //          description: data.description,
  //          files: Object.entries(files).map(([path, content]) => ({ path, content })),
  //          isPrivate: data.isPrivate,
  //          message: data.message
  //        })
  //      })

  //      setLoading(false)
  //    } catch (err){
  //     setLoading(false)
  //    }
  // }