import { useSandpack } from "@codesandbox/sandpack-react"
import { Loader } from "@/app/util/constants"
import { useRef, useState } from "react"

export function Mechanic({messageId}: {messageId: string | undefined}){
  const [loading, setLoading] = useState(false)
  const { sandpack } = useSandpack()
  const index = useRef(0)

  const fix = async () => {
    setLoading(true)
    try {
      const fetchindex = index.current + 1
      index.current = fetchindex

      const files = Object.fromEntries(Object.entries(sandpack.files).map(([path, file]) => [path, file.code]))

      const res = await fetch("/api/fix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          files,
          error: sandpack.error?.message,
          messageId: messageId
        }),
      })

      const data = await res.json()

      if(index.current === fetchindex){
        for (const [path, content] of Object.entries(data.fixed)){
          sandpack.updateFile(path, content as string)
        }
      }
    } catch (err) {
      console.error("Fix failed:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!sandpack.error) return null

  return (
     <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-black border border-zinc-700 rounded-xl p-6 w-300 max-w-sm mx-4 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
          <div>
            <p className="text-white text-sm font-medium mb-1">Sandbox error</p>
            <p className="text-red-500 text-xs font-mono leading-relaxed line-clamp-4">
              {sandpack.error?.message}
            </p>
          </div>
        </div>

        <button onClick={fix} disabled={loading} className="hover:cursor-pointer border-zinc-800 border m-auto w-full px-3 py-1 rounded-lg bg-black text-white text-sm font-medium hover:bg-zinc-950 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? (
            <>
             <Loader color="white" />
              Fixing...
            </>
          ) : "Fix"}
        </button>
      </div>
    </div>
  )
}