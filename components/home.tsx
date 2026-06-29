"use client"
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useStream } from "@/app/hooks/use-stream";
import { SST } from "@/app/lib/sst";
import { PromptInput } from "./prompt-input";
import { User } from "@/app/types/types";
import { Auth } from "./auth/auth";
import { Loader, V0 } from "@/app/util/constant";
import { getFigmaFile } from "@/app/lib/figma";
import { enhance } from "@/app/lib/enhancer";
import { PanelLeft } from "lucide-react";
import { Sidebar } from "./sidebar";

type Props = {
  user: User | null
}

export default function Home({user}: Props) {
  const [prompt, setPrompt] = useState(() => {
    if(typeof window !== "undefined"){
       return localStorage.getItem("prompt") || "" 
    }
    return ""
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [recording, setRecording] = useState(false)
  const { submit, status, cancel } = useStream()
  
  const [files, setFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const mediarecoderRef = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  useEffect(() => {
    localStorage.setItem("prompt", prompt)
  }, [prompt])

  async function record(){
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediarecoderRef.current = new MediaRecorder(stream)
    chunks.current = []

    mediarecoderRef.current.ondataavailable = (e) => {
      chunks.current.push(e.data)
    }

    mediarecoderRef.current.onstop = async () => {
      const blob = new Blob(chunks.current, {
        type: "audio/webm",
      })

      const result = await SST(blob)
      setPrompt(result.text)
    }

    mediarecoderRef.current?.start()
    setRecording(true)
  }

  const stopRecord = () => {
    mediarecoderRef.current?.stop()
    setRecording(false)
  }

  // useEffect(() => {
  //   const string = "https://www.figma.com/design/ioAvUdDBiq6QF9Mbi1o3a9/neowear?t=Saka2656rVVpnHeW-0"
  //   const key = string.split("/")[4]

  //   async function fetchfigma(){
  //      const files = await getFigmaFile(key)
  //      console.log(JSON.stringify(files.data))
  //   }

  //   fetchfigma()
  // }, [])

  const handlefile = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
    
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

    try {
      await submit(prompt);
      localStorage.removeItem("prompt")
      setPrompt("");
      setFiles([]);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      return error
    }
  }, [prompt, files, status, submit]);

  return (
    <>
     {!user ? (
       <main className="flex justify-center px-3">
         <div className="flex w-250 flex-col items-center mt-10">
           <h1 className="text-3xl font-bold">What Do You Wanna Spawn ?</h1>
           <PromptInput user={user!} loading={status === "loading"} ref={textareaRef} files={files} removeFile={removefile} prompt={prompt} setPrompt={setPrompt} handleInput={handleinput} handleSubmit={Submit} handleUpload={handlefile} />
         </div>
       </main>
     ) : (
      <main className="flex w-full h-dvh min-h-0 overflow-hidden">
        <Sidebar open={sidebarOpen} user={user} />

        <section className="relative flex-3 overflow-y-auto bg-black p-1.5">
          <button className="absolute top-4 left-4 rounded-sm hover:bg-zinc-800 p-1 hover:cursor-pointer" onClick={() => setSidebarOpen(p => !p)}><PanelLeft size={18} /></button>

          <div className="flex flex-col items-center mt-10">
            <h1 className="text-3xl font-bold text-white">What Do You Wanna Spawn ?</h1>
            <PromptInput user={user} loading={status === "loading"} ref={textareaRef} files={files} removeFile={removefile} prompt={prompt} setPrompt={setPrompt} handleInput={handleinput} handleSubmit={Submit} handleUpload={handlefile} />
          </div>
          
        </section>
      </main>
     )}
    </>
 )
}