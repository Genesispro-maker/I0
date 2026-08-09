"use client"
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useStream } from "@/app/hooks/use-stream";
import { PromptInput } from "./prompt-input";
import { User } from "@/app/types/types";
import { Base64 } from "@/app/util/constants";
import { PanelLeft } from "lucide-react";
import { Sidebar } from "./sidebar";

type Props = {
  user: User | null
}

export default function Home({user}: Props){
  const [prompt, setPrompt] = useState(() => {
    if(typeof window !== "undefined"){
       return localStorage.getItem("prompt") || "" 
    }
    return ""
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { submit, status, cancel } = useStream()
  const [files, setFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    localStorage.setItem("prompt", prompt)
  }, [prompt])

  const uploadfile = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const Files = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...Files]);
    
    if (e.target) {
      e.target.value = "";
    }
  }, []);

   const removefile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

 const handleinput = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }

  const Submit = useCallback(async () => {
    if (status === "loading") return;
    if (!prompt.trim() && files.length === 0) return;

    const converted = await Promise.all(files.map(f => Base64(f)))

    try {
      await submit(prompt, "/api/generate", converted as string[],);
      localStorage.removeItem("prompt")
      setPrompt("");
      setFiles([]);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      return error
    }
  }, [files, status, submit, prompt]);

  return (
    <main>
     {!user ? (
       <section className="flex justify-center px-3">
         <div className="flex w-250 flex-col items-center mt-10">
           <h1 className="text-3xl font-bold">What Do You Wanna Spawn ?</h1>
           <PromptInput user={user!} loading={status === "loading"} ref={textareaRef} prompt={prompt} setPrompt={setPrompt} />
         </div>
       </section>
     ) : (
      <section className="flex w-full h-dvh min-h-0 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} user={user} />
        <div className="relative flex-3 overflow-y-auto p-1.5">
          <button className="absolute top-4 left-4 rounded-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 p-1 hover:cursor-pointer" onClick={() => setSidebarOpen(p => !p)}><PanelLeft size={18} /></button>
          <div className="flex flex-col items-center mt-10">
            <h1 className="text-3xl font-bold">What Do You Wanna Spawn ?</h1>
            <PromptInput cancel={cancel} user={user} loading={status === "loading"} ref={textareaRef} files={files} removeFile={removefile} prompt={prompt} setPrompt={setPrompt} handleInput={handleinput} handleSubmit={Submit} handleupload={uploadfile} />
          </div>
        </div>
      </section>
     )}
  </main>
 )
}