"use client"
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { InputHandle, PromptInput } from "./prompt-input";
import { User } from "@/app/types/types";
import { Base64 } from "@/app/util/constants";
import { PanelLeft } from "lucide-react";
import { Sidebar } from "./sidebar";
import { useStreamContext } from "./providers/stream-provider";
import { useToggle } from "@/app/hooks/use-toggle";
import { Auth } from "./auth/auth";

type Props = {
  user: User | null
}

export default function Home({ user }: Props){
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [open, handleToggle] = useToggle(false)
  const [mode, setMode] = useState<"login" | "signup">("login")
  const { submit, status, cancel } = useStreamContext()
  const [files, setFiles] = useState<File[]>([])
  const textareaRef = useRef<InputHandle>(null)

  useEffect(() => {
    if (status === "unauthorized" && !open) handleToggle()
  }, [status])

  useEffect(() => {
    function Cancel(e: KeyboardEvent){
      if(e.key === "Escape" && status === "loading") cancel()
    }
    window.addEventListener("keydown", Cancel)

    return () => window.removeEventListener("keydown", Cancel)
  }, [status, cancel])

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
    const textarea = textareaRef.current?.textarea
    if (!textarea) return
    textarea.style.height = "auto"
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }
  
  const Submit = useCallback(async (value: string) => {
    if (status === "loading") return;
    if (!value.trim() && files.length === 0) return

    const converted = await Promise.all(files.map((f) => Base64(f)))

    try {
      await submit(value, "/api/generate", converted as Array<string>);
      setFiles([]);
    } catch (error) {
      return error
    }

    localStorage.removeItem("prompt")
  }, [files, status, submit]);

  return (
    <main>
     {!user ? (
       <section className="flex justify-center px-3">
         <div className="flex w-250 flex-col items-center mt-10">
           <h1 className="text-3xl font-bold">What Do You Wanna Spawn ?</h1>
           <PromptInput
            onSubmit={Submit}
            user={user!}
            loading={status === "loading"}
            ref={textareaRef}
            size="default" />
         </div>
       </section>
     ) : (
      <section className="flex w-full h-dvh min-h-0 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} user={user} />
        <div className="relative flex-3 overflow-y-auto p-1.5">
          <button className="absolute top-4 left-4 rounded-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 p-1 hover:cursor-pointer" onClick={() => setSidebarOpen(p => !p)}><PanelLeft size={18} /></button>
          <div className="flex flex-col items-center mt-10">
            <h1 className="text-3xl font-bold">What Do You Wanna Spawn ?</h1>
            <PromptInput
             cancel={cancel}
             user={user}
             loading={status === "loading"}
             ref={textareaRef}
             files={files}
             removeFile={removefile}
             onInputResize={handleinput}
             onSubmit={Submit}
             handleupload={uploadfile}
             size="default" />
          </div>
        </div>
      </section>
     )}
    <Auth open={open} setOpen={handleToggle} mode={mode} onChangeMode={setMode} />
  </main>
 )
}