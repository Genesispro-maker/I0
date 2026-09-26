import { useGeneration } from "@/app/store/generation-store"
import { RefObject } from "react"
import { InputHandle } from "../prompt-input"

export function Suggestions({ textareaRef }: { textareaRef: RefObject<InputHandle | null>  }){
  const suggestions = useGeneration((s) => s.suggestions)
  
    return (
        <div className="flex overflow-x-auto gap-2 py-2">
            {suggestions.map((s, i) => (
              <button onClick={() => {
               if(textareaRef?.current?.textarea){
                const value = textareaRef.current.textarea.value = s.replace(/-[0-9]/, "")
                textareaRef.current.setValue(value)
               }
              }} className="text-xs dark:bg-zinc-800 whitespace-nowrap px-2 py-1 hover:cursor-pointer text-zinc-300 border max-w-250 border-zinc-700 rounded-full hover:bg-zinc-800 hover:text-white transition-colors" key={i}>{s.replace(/^\d+\.\s*/, "")}</button>
            ))}
        </div>
    )
}