"use client"
import { Prisma } from "@/app/generated/prisma/client"
import { useGeneration } from "@/app/store/generation-store"
import { useCallback, useMemo, useRef, useState, ChangeEvent, useEffect } from "react"
import { Tabs } from "@base-ui/react"
import { Messages } from "./messages"
import { Suggestions } from "./suggestions"
import { ProjectHeader } from "./project-header"
import { useStream } from "@/app/hooks/use-stream"
import { PromptInput, InputHandle } from "../prompt-input"
import { User } from "@/app/types/types"
import dynamic from "next/dynamic"

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
    messages: Message[]
  },
  user: User | null
}

const Preview = dynamic(() => import("./preview").then((mod) => mod.Preview), {
  ssr: false,
})

export const ProjectEditor = ({ project, user }: Props) => {
  const [files, setFiles] = useState<File[]>([])
  const [rename, setRename] = useState({ title: project.title, isEditing: false })
  const containerRef = useRef<HTMLDivElement>(null)
  const { submit, status } = useStream()
  const textareaRef = useRef<InputHandle | null>(null)
  const filesRef = useRef<Array<string>>([])
  const pendingmessage = useGeneration((s) => s.pendingprompt)
  const projectId = useGeneration((s) => s.projectId)
  const Files = useGeneration((s) => s.files)
  const isProject = project.id === projectId
  const assistantmessage = useMemo(() => [...project.messages].reverse().find((m) => m.role === "ASSISTANT"), [project.messages])

  const scrolltoBottom = useCallback((smooth = true) => {
    const el = containerRef.current

    if(!el) return
    if(smooth){
      el.scrollTo({
        top: containerRef.current?.scrollHeight,
        behavior: "smooth"
      })
    } else {
      el.scrollTop = el.scrollHeight
    }
  }, [])

  useEffect(() => {
     scrolltoBottom()
  }, [pendingmessage, project.messages.length, scrolltoBottom])

  useEffect(() => {
    if(status === "loading"){
      scrolltoBottom()
    }
  }, [status, assistantmessage?.generations, scrolltoBottom])

  const handleinput = useCallback(() => {
    const textarea = textareaRef.current?.textarea
    if (!textarea) return
    textarea.style.height = "auto"
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px"
  }, [])

  const uploadfile = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const Files = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...Files])
    if (e.target) e.target.value = ""
  }, [])

  const removefile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const codefiles = useMemo(() => {
    if (Files && Object.keys(Files).length > 0) return Files
    return (assistantmessage?.generations?.files ?? {}) as Record<string, string>
  }, [Files, assistantmessage?.generations])

  const handleSubmit = useCallback(async (value: string) => {
    try {
      await submit(value, `/api/generate/${project.id}`)
      localStorage.removeItem("prompt")
    } catch (err: unknown) {
     console.error(err)
    }
  }, [submit, project.id])

  return (
    <Tabs.Root defaultValue="preview" className="h-screen overflow-hidden w-full flex flex-col">
      <ProjectHeader project={project} rename={rename} setRename={setRename} />

      <div className="flex mt-2 flex-1 min-h-0 gap-2 w-full">
        <section className="flex-1 flex flex-col min-h-0 px-1 min-w-0">
          <time className="text-center truncate text-[0.8rem] font-semibold" dateTime={project.messages[0].createdAt?.toISOString()}>
            {project.messages[0].createdAt.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              month: "long",
              day: "numeric",
            })}
          </time>

          <div ref={containerRef} className="flex-1 overflow-y-auto min-h-0">
            <Messages isProject={isProject} project={project} />
          </div>

          <Suggestions textareaRef={textareaRef} />

          <PromptInput
            ref={textareaRef}
            loading={status === "loading"}
            user={user}
            onSubmit={handleSubmit}
            onInputResize={handleinput}
            handleupload={uploadfile}
            files={files}
            removeFile={removefile}
            size="compact"
          />
        </section>

        <section className="flex-1 min-w-0 overflow-hidden rounded-lg bg-[#1c1c1c] min-h-0 h-full">
          <Preview filesRef={filesRef} filename={project.title} files={codefiles} id={assistantmessage?.id} />
        </section>
      </div>
    </Tabs.Root>
  )
}