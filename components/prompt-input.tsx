import { ArrowUp, Mic, Plus, X } from "lucide-react"
import { Modal } from "./modal"
import { User } from "@/app/types/types"
import { ChevronIcon, Figma, FileuploadIcon, Getfiletype } from "@/app/util/constant"
import { ChangeEvent, Dispatch, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Menu } from "@base-ui/react"

interface PromptInputProps {
  prompt: string
  setPrompt: Dispatch<string>
  handleInput: () => void
  handleSubmit: () => void
  files: File[]
  loading: boolean
  handleUpload: (e: ChangeEvent<HTMLInputElement>) => void
  removeFile: (index: number) => void
  user: User | null
}

export const PromptInput = forwardRef<HTMLTextAreaElement, PromptInputProps>(
  function PromptInput({ prompt, setPrompt, handleInput, handleSubmit, files, loading, handleUpload, removeFile, user }, textareaRef) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [modalIndex, setModalIndex] = useState(-1)
    const fileurls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])

    useEffect(() => () => fileurls.forEach(URL.revokeObjectURL), [fileurls])

    const openFilePicker = useCallback(() => fileInputRef.current?.click(), [])

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() }
    }, [handleSubmit])

    const disabled = !user || loading

    return (
      <section className="w-full max-w-2xl">
        <div className="relative flex flex-col bg-black border border-zinc-800 rounded-2xl p-3 mt-5 shadow-2xl focus-within:border-zinc-600 transition-all duration-200">
          {files.length > 0 && (
            <ul className="flex gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none">
              {files.map((file, i) => (
                <li key={`${file.name}-${i}`} className="flex items-center gap-1.5 border bg-black hover:cursor-pointer border-zinc-800 rounded-md px-2 py-1 min-w-0 transition-colors">
                  <button type="button" onClick={() => setModalIndex(i)} className="flex items-center gap-1.5 min-w-0">
                    {Getfiletype(file.type) === "image" && (
                      <Image src={fileurls[i]} width={18} height={18} alt={file.name} className="rounded shrink-0 object-cover" />
                    )}
                    {Getfiletype(file.type) === "video" && (
                      <video src={fileurls[i]} width={18} height={18} className="rounded shrink-0" />
                    )}
                    <span className="text-xs text-zinc-400 truncate max-w-24">{file.name}</span>
                  </button>
                  <button type="button" onClick={() => { if (modalIndex === i) setModalIndex(-1); removeFile(i) }} className="transition-colors shrink-0 ml-0.5">
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {modalIndex !== -1 && files[modalIndex] && (() => {
            const file = files[modalIndex]
            const type = Getfiletype(file.type)
            return (
              <Modal onClose={() => setModalIndex(-1)}>
                <p className="text-sm font-medium text-white mb-3">{file.name}</p>
                {type === "image" && <Image src={fileurls[modalIndex]} width={500} height={300} alt={file.name} className="rounded-lg" />}
                {type === "video" && <video src={fileurls[modalIndex]} controls width={500} className="rounded-lg" />}
                <span className="text-xs text-zinc-200 mt-2 block">{(file.size / 1024).toFixed(1)} KB</span>
              </Modal>
            )
          })()}

          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask I/O to build..."
            rows={1}
            className="w-full bg-transparent outline-none resize-none text-sm text-white py-2 px-1 min-h-20 disabled:opacity-50"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              <Menu.Root>
                <Menu.Trigger type="button" disabled={disabled} className="p-1.5 text-zinc-200 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  <Plus size={17} />
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner sideOffset={6} side="top" align="start" className="outline-none z-50">
                    <Menu.Popup className="bg-black border border-zinc-800 rounded-xl shadow-xl p-1 min-w-44">
                      <Menu.Item onClick={openFilePicker} className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors">
                        <FileuploadIcon /> File or Photo
                      </Menu.Item>
                      <Menu.Item onClick={openFilePicker} className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors">
                        <Figma /> Import from Figma
                      </Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>

              <button type="button" disabled={disabled} className="flex items-center gap-1 px-2 py-1.5 text-sm text-zinc-200 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                Projects <ChevronIcon width={8} height={8} />
              </button>
            </div>

            <div className="flex gap-3">
              <button type="button" disabled={disabled} className="p-1.5 hover:cursor-pointer text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <Mic size={17} />
              </button>

              <button type="button" onClick={handleSubmit} className="hover:cursor-pointer rounded-full p-1.5 bg-white hover:bg-zinc-200 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <ArrowUp size={16} color="black" />
              </button>
            </div>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,video/mp4" multiple className="hidden" onChange={handleUpload} aria-hidden tabIndex={-1} />
      </section>
    )
  }
)