import { Role } from "@/app/generated/prisma/client"
import { useGeneration } from "@/app/store/generation-store"
import { ChevronIcon } from "@/app/util/constant"
import { Collapsible } from "@base-ui/react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"

type messages = {
  id: string,
  projectId: string,
  content: string,
  role: Role,
  updatedAt: Date | null,
  createdAt: Date | null,
  reasoning: string | null
}

type Props = {
  isProject: boolean,
  reasoning: string,
  summary: string,
  messageId: string,
  error: string | null,
  project: {
    id: string,
    title: string,
    messages: messages[]
  }
}

export function Messages({ error, isProject, reasoning, project, summary, messageId }: Props ){
  const store = useGeneration()
    return (
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col gap-3">
         {project.messages.map((m, i) => {
           if (m.role === "USER") {
             return (
               <p key={i} className="px-4 max-w-50 py-2.5 rounded-[18px] rounded-tr-none bg-zinc-800 self-end sm:max-w-[70%] md:max-w-[60%] wrap-break-word">
                 {m.content}
               </p>
             )
           }
     
           if (m.role === "ASSISTANT") {
             const isStreaming = isProject && m.id === messageId
             const Reasoning = isProject ? reasoning : m.reasoning
             return (
               <div key={i}>
                 {error && <p>{error}</p>}
                 
                 <Collapsible.Root defaultOpen={isStreaming} className="flex mx-2 mt-1 w-150 flex-col justify-center text-neutral-950 dark:text-white">
                   <Collapsible.Trigger className="group text-zinc-300 hover:cursor-pointer flex h-8 items-center gap-3.5 text-sm">
                     Thought for 0s <ChevronIcon color="lightgray" className="group-data-panel-open:rotate-90 transition-transform duration-150" />
                   </Collapsible.Trigger>
                   <Collapsible.Panel className="flex border rounded-lg border-zinc-800 px-3 py-2 h-50 flex-col justify-end overflow-hidden text-sm transition-[height] duration-150 ease-[ease-out] [&[hidden]:not([hidden='until-found'])]:hidden data-ending-style:h-0 data-starting-style:h-0">

                     <div className="min-h-full overflow-y-auto relative overflow-x-hidden">
                       <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} components={{
                         h2: ({ children }) => (
                           <h2 className="text-zinc-300 font-semibold text-sm mt-6 mb-2">{children}</h2>
                         ),
                         h3: ({ children }) => (
                           <h3 className="text-zinc-300 font-medium text-sm mt-4 mb-1">{children}</h3>
                         ),
                         ol: ({ children }) => (
                           <ol className="flex flex-col list-decimal list-inside">{children}</ol>
                         ),
                         p: ({ children }) => (
                           <p className="text-zinc-300 text-sm leading-relaxed">{children}</p>
                         ),
                         ul: ({ children }) => (
                           <ul className="flex flex-col">{children}</ul>
                         ),
                         li: ({ children }) => (
                           <li className="text-zinc-300 text-sm flex items-start gap-2 my-1">
                            <span className="text-zinc-500 mt-0.5 shrink-0">·</span>
                            <span>{children}</span>
                           </li>
                         ),
                         code: ({ children }) => (
                           <code className="bg-white/5 border mt-3 mb-2 px-1.5 py-px h-fit border-white/10 text-red-400 rounded-md whitespace-nowrap text-[0.85rem]">{children}</code>
                         ),
                         strong: ({ children }) => (
                           <strong className="text-zinc-200 font-semibold">{children}</strong>
                         )}}>
                          {Reasoning ?? ""}
                       </ReactMarkdown>
                      <div className="sticky bottom-0 left-0 right-0 h-5 bg-linear-to-t from-[#020000] to-transparent pointer-events-none" />
                     </div>
                   </Collapsible.Panel>
                 </Collapsible.Root>   


                 {store.file && store.status === "building" && (
                   <div>
                     {store.file.map((f, i) => (
                       <p key={i}>{f}</p>
                     ))}
                   </div>
                 )}   


                 {/* {building === "building" && (
                   <div>
                    <p className="text-sm text-zinc-300 thinking"><Microchip size={15} /> Building</p>
                   </div>
                 )}            */}
               </div>
             )
           }
     
           return null
         })}
     </div>
    )
}