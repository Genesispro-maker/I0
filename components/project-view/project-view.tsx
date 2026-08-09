"use client"
import { Prisma, Visiblity } from "@/app/generated/prisma/client"
import { useGeneration } from "@/app/store/generation-store"
import { ArrowUp, Mic, Plus } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { Tabs } from "@base-ui/react"
import { Messages } from "./messages"
import { Suggestions } from "./suggestions"
import { Preview } from "./preview"
import { ProjectHeader } from "./project-header"
import { useStream } from "@/app/hooks/use-stream"

type Message = Prisma.MessageGetPayload<{
  include: {
    generations: true,
    images: true,
  }
}>

type Props = {
  project: {
    id: string
    title: string,
    visiblity: Visiblity,
    messages: Message[]
  }
}

export const ProjectEditor = ({ project }: Props) => {
  const [prompt, setPrompt] = useState("")
  const [rename, setRename] = useState({
    title: project.title,
    isEditing: false
  })

  const { submit, status } = useStream()
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const filesRef = useRef<Array<string>>([])

  const handleinput = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }

  const projectId = useGeneration((s) => s.projectId)
  const Files = useGeneration((s) => s.files)
  const isProject = project.id === projectId
  const assistantmessage = [...project.messages].reverse().find((m) => m.role === "ASSISTANT")

  const files = useMemo(() => {
     if(Object.keys(Files).length > 0) return Files
     return (assistantmessage?.generations?.files ?? {}) as Record<string, string>
  }, [Files, assistantmessage?.generations])


  async function handleSubmit(prompt: string){
    try {
      await submit(prompt, `/api/generate/${project.id}`)
    } catch(err){
      return err
    }
  }

  return (
    <Tabs.Root defaultValue="preview" className="h-screen overflow-hidden w-full flex flex-col">
      <ProjectHeader project={project} rename={rename} setRename={setRename}/>

      <div className="flex mt-2 flex-1 min-h-0 gap-2 w-full">
        <section className="flex-1 flex flex-col min-h-0 px-1 min-w-0">
          <time className="text-center truncate text-[0.8rem] font-semibold" dateTime={project.messages[0].createdAt?.toISOString()}>{project.messages[0].createdAt.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            month: "long",
            day: "numeric",
          })}</time>

         <Messages isProject={isProject} project={project} />
         <Suggestions textareaRef={textareaRef} />

    
        </section>

        <section className="flex-1 min-w-0 overflow-hidden rounded-lg bg-[#1c1c1c] min-h-0 h-full flex flex-col">
         <Preview filesRef={filesRef} filename={project.title} files={files} id={assistantmessage?.id} />
        </section>
         
      </div>
    </Tabs.Root>
  )
}