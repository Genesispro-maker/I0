import { Prisma } from "@/app/generated/prisma/client"
import { useGeneration } from "@/app/store/generation-store"
import { ChevronIcon, markdown } from "@/app/util/constants"
import { Collapsible } from "@base-ui/react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { useEffect, useState } from "react"
import Image from "next/image"
import { useToggle } from "@/app/hooks/use-toggle"
import { Copy } from "lucide-react"

type Message = Prisma.MessageGetPayload<{
  include: {
    generations: true,
    images: true,
  }
}>

type Props = {
  isProject: boolean,
  project: {
    id: string,
    title: string,
    messages: Message[]
  }
}

interface Assitant {
  m: Message,
  isStreaming: boolean,
  Reasoning: string | null,
  error: string | null,
  summary: string | null,
}

function Assistantmessage({ m, isStreaming, Reasoning, error, summary }: Assitant) {
  const [open, setOpen] = useState(false)

 useEffect(() => {
  if(!isStreaming){
    (() => setOpen(false))()
  } else {
    (() => setOpen(true))()
  }
 }, [isStreaming])

  return (
    <div key={m.id}>
      <Collapsible.Root open={open} onOpenChange={setOpen} className="flex mx-2 mt-1 w-150 flex-col justify-center text-neutral-950 dark:text-white">
        <Collapsible.Trigger aria-controls="panel" aria-expanded={open} role="button" className="group text-sm font-medium dark:text-zinc-300 hover:cursor-pointer flex h-8 items-center gap-1.5">
          Thoughts <ChevronIcon className="group-data-panel-open:rotate-90 transition-transform duration-150" />
        </Collapsible.Trigger>
        <Collapsible.Panel aria-controls="panel" role="region" aria-label="reasoning" className="flex border w-120 rounded-lg border-zinc-400 dark:border-zinc-800 px-3 py-2 h-50 flex-col justify-end overflow-hidden text-sm transition-[height] duration-150 ease-[ease-out] [&[hidden]:not([hidden='until-found'])]:hidden data-ending-style:h-0 data-starting-style:h-0">
          <div className="panel min-h-full scrollbar-none overflow-y-auto relative overflow-x-hidden">
            <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} components={markdown}>
              {Reasoning ?? ""}
            </ReactMarkdown>
            <div className="sticky bottom-0 left-0 right-0 h-5 bg-linear-to-t dark:from-[#020000] from-white to-transparent pointer-events-none" />
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>

      {summary && (
        <div className="m-3">
          <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} components={markdown}>
            {summary}
          </ReactMarkdown>
        </div>
      )}

      {isStreaming && error && (
        <p role="alert" className="text-red-400 text-sm mx-3 mt-2">{error}</p>
      )}
    </div>
  )
}

export function Messages({ isProject, project }: Props){
  const messageId = useGeneration((s) => s.messageId)
  const reasoning = useGeneration((s) => s.reasoning)
  const summary = useGeneration((s) => s.summary)
  const error = useGeneration((s) => s.error)
  const pendingprompt = useGeneration((s) => s.pendingprompt)
  const pendingimages = useGeneration((s) => s.pendingImages)

  return (
    <div role="feed" aria-live="polite" className="flex-1 transition-all ease-in-out duration-300 min-h-0 overflow-y-auto overflow-x-hidden flex mt-5 flex-col gap-3">
      {project.messages.map((m) => {
        if(m.role === "USER"){
          return (
            <div key={m.id} className="self-end flex flex-col gap-3 max-w-70 mr-4 sm:max-w-[70%] md:max-w-[60%]">
              {m.images && m.images.length > 0 && m.images.map(img => (
                <Image src={img.url ?? ''} height={150} width={150} className="rounded-lg self-end hover:cursor-pointer" key={img.id} alt="" />
              ))}
             <p role="article" className="wrap-break-word bg-zinc-300 dark:bg-zinc-800 text-sm px-3 py-2 rounded-tr-sm rounded-2xl">
               {m.content}
             </p>
            </div>
          )
        }

        if(m.role === "ASSISTANT"){
          const isStreaming = isProject && m.id === messageId
          const Reasoning = isStreaming ? reasoning : m.reasoning
          const Summary = isStreaming ? summary : m.summary

          return (
            <Assistantmessage key={m.id} m={m} isStreaming={isStreaming} Reasoning={Reasoning}
              error={error}
              summary={Summary} />
          )
        }

        return null
      })}

      {pendingprompt && (
        <div className="self-end flex flex-col gap-3 max-w-70 mr-4 sm:max-w-[70%] md:max-w-[60%]">
          {pendingimages && pendingimages.length > 0 && pendingimages.map((url, i) => (
            <Image src={url ?? ''} width={150} height={150} key={i} alt="" className="rounded-lg hover:cursor-pointer" />
          ))}
          <p role="article" className="wrap-break-word bg-zinc-800 px-3 py-2 rounded-tr-sm rounded-2xl">{pendingprompt}</p>
        </div>
      )}
    </div>
  )
}