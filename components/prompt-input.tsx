import { ArrowUp, Plus, Square } from "lucide-react"
import { User } from "@/app/types/types"
import { Getfiletype } from "@/app/util/constants"
import React, { ChangeEvent, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, } from "react"
import Image from "next/image"
import { Dialog } from "@base-ui/react"

export interface InputHandle {
  textarea: HTMLTextAreaElement | null
  focus: () => void
  setValue: (value: string) => void
  getValue: () => string
}

interface Props {
  cancel?: () => void
  onSubmit: (value: string) => void
  onInputResize?: () => void
  files?: File[]
  loading: boolean
  handleupload?: (e: ChangeEvent<HTMLInputElement>) => void
  removeFile?: (index: number) => void
  user: User | null
  className?: string
  size: "compact" | "default" | "large"
}

export const PromptInput = React.memo(forwardRef<InputHandle, Props>(
  function PromptInput({ className, size, onSubmit, user,  onInputResize, files, loading, handleupload }, ref) {
    const [prompt, setPrompt] = useState(() => {
      if(typeof window !== "undefined"){
        return localStorage.getItem("prompt") || "" 
      }
      return ""
    })
    const [index, setIndex] = useState(-1)

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      localStorage.setItem("prompt", prompt)
    }, [prompt])

    useImperativeHandle(ref, () => ({
      textarea: textareaRef.current,
      focus: () => textareaRef.current?.focus(),
      setValue: (value: string) => {
        setPrompt(value)

        requestAnimationFrame(() => onInputResize?.())
      },
      getValue: () => prompt,
    }), [prompt, onInputResize])

    const fileurls = useMemo(() => files?.map((f) => URL.createObjectURL(f)), [files])
    useEffect(() => () => fileurls?.forEach(URL.revokeObjectURL), [fileurls])

    useEffect(() => {
      function Keydown(e: KeyboardEvent) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
          e.preventDefault()
          fileInputRef.current?.click()
        }
      }
      window.addEventListener("keydown", Keydown)
      return () => window.removeEventListener("keydown", Keydown)
    }, [])

    const submit = useCallback(() => {
      if (!prompt.trim()) return
      onSubmit(prompt)
      setPrompt("")
    }, [prompt, onSubmit])

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        submit()
      }
    }, [submit])

    const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
      setPrompt(e.target.value)
      onInputResize?.()
    }, [onInputResize])

    const disabled = !user || loading

    const textareasize = {
      compact: "min-h-10 sm:min-h-12",
      default: "min-h-16 sm:min-h-20",
      large: "min-h-24 sm:min-h-32",
    }[size]

    return (
      <section className={`w-full max-w-2xl shrink-0 px-1 sm:px-0 ${className ?? ""}`}>
        <div className="flex relative bottom-2.5 flex-col bg-transparent border border-zinc-400 dark:border-zinc-800 rounded-2xl p-2 sm:p-3 mt-5 focus-within:border-zinc-400 dark:focus-within:border-zinc-800 ease-in-out transition-all duration-300">
          <Dialog.Root>
            {(files || []).length > 0 && (
              <ul role="feed" className="flex flex-wrap gap-2">
                {files?.map((file, i) => (
                  <Dialog.Trigger
                    onClick={() => setIndex(i)}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-30 md:h-30 hover:cursor-pointer p-px border border-zinc-400 rounded-lg"
                    key={`${file.name}-${file.size}-${i}`}
                  >
                    {Getfiletype(file.type) === "image" && fileurls?.[i] && (
                      <Image aria-label={`Uploaded Image - ${file.name}`} className="w-full rounded-md h-full" unoptimized src={fileurls[i] ?? ""} alt="" width={120} height={120} />
                    )}
                  </Dialog.Trigger>
                ))}
              </ul>
            )}

            {index !== -1 && files?.[index] && (() => {
              const file = files?.[index]
              const type = Getfiletype(file.type)

              return (
                <Dialog.Portal>
                  <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-50 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute" />
                  <Dialog.Popup className="fixed top-1/2 left-1/2 -mt-8 flex w-[90vw] sm:w-96 max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 bg-white dark:bg-neutral-950 p-3 sm:p-4 text-neutral-950 dark:text-white rounded-xl dark:border-white transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
                    <div className="flex h-40 sm:h-50 justify-center items-center">
                      {type === "image" && <Image src={fileurls?.[index] ?? ''} alt="" fill className="rounded-lg" /> }
                    </div>
                  </Dialog.Popup>
                </Dialog.Portal>
              )
            })()}

            <textarea
              onKeyDown={handleKeyDown}
              aria-label="Prompt Input"
              value={prompt}
              rows={1}
              className={`w-full ${textareasize} outline-none p-2 text-base sm:text-sm overflow-hidden resize-none transition-all duration-300 ease-in-out bg-transparent`}
              placeholder="Ask I/0 to Build...."
              onChange={handleChange}
              ref={textareaRef}
            />
            <div className="flex justify-between items-center">
              <button disabled={disabled} onClick={() => fileInputRef.current?.click()} aria-label="Upload Images" className="hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:text-white dark:hover:bg-zinc-800 p-2 sm:p-1 flex items-center hover:bg-zinc-300 w-fit overflow-hidden rounded-sm transition-all duration-300 ease-in-out whitespace-nowrap">
                <Plus aria-hidden size={18} className="shrink-0" />
              </button>
              <button onClick={submit} className="active:scale-75 hover:cursor-pointer hover:scale-110 transition-all duration-300 bg-black dark:bg-white p-2 sm:p-1 text-white rounded-md dark:text-black">
                {loading ? <Square size={18} className="shrink-0" aria-hidden /> : <ArrowUp size={18} className="shrink-0" aria-hidden />}
              </button>
            </div>
          </Dialog.Root>
        </div>
        <input accept="image/png,image/jpeg,video/mp4" onChange={handleupload} aria-hidden type="file" className="hidden" ref={fileInputRef} multiple />
      </section>
    )
  }
))