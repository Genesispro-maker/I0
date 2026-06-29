import { useRouter } from "next/navigation"
import { useGeneration } from "../store/generation-store"
import { useCallback, useRef, useState } from "react"

type Status = "idle" | "loading" | "unauthorized"

type useStreamType = {
  submit:  (prompt: string) => Promise<void>
  status:  Status
  cancel:  () => void
}

export function useStream(): useStreamType {
  const router = useRouter()
  const store = useGeneration()
  const storeRef = useRef(store)
  storeRef.current = store

  const [status, setStatus] = useState<Status>("idle")
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)

  const cancel = useCallback(() => {
    readerRef.current?.cancel().catch(() => {})
    readerRef.current = null
    setStatus("idle")
  }, [])

  const handleStream = useCallback(async (res: Response, metadata?: (projectId: string, messageId: string) => void,) => {
    if (!res.ok || !res.body) {
      storeRef.current.setError(res.ok ? "No response body" : `Server error: ${res.status}`)
      return
    }

    const reader = res.body.getReader()
    readerRef.current = reader
    const decoder = new TextDecoder()
    let buffer  = ""

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split("\n\n")
        buffer = parts.pop() ?? ""

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue

          let type: string
          let data: string

          try {
            const parsed = JSON.parse(part.slice(6))
            type = parsed.type
            data = parsed.data
          } catch { continue }

          switch (type) {
            case "metadata": {
              const { projectId, messageId } = JSON.parse(data)
              storeRef.current.setMetadata(projectId, messageId)
              metadata?.(projectId, messageId)
              break
            }

            case "reasoning":
              storeRef.current.appendReasoning(data)
              break

            case "building": 
            storeRef.current.status = "building"
            break

            case "files":
            storeRef.current.setFiles(JSON.parse(data) as Array<string>)
            break

            case "code":
              storeRef.current.appendCode(data)
            break

            case "summary":
              storeRef.current.appendSummary(data)
              break 

            case "suggestions":
              storeRef.current.appendSuggestions(data)
              break
              
            case "done": {
              const { files } = JSON.parse(data) as { files: Record<string, string> }
              storeRef.current.setDone(files)
              return
            }

            case "error": {
              storeRef.current.setError(data)
              return
            }
          }
        }
      }
    } catch (err){
      storeRef.current.setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      await reader.cancel().catch(() => {})
      readerRef.current = null
    }
  }, [])

  const submit = useCallback(async (prompt: string) => {
    const trimmed = prompt.trim()
    if (!trimmed || status === "loading") return

    setStatus("loading")
    storeRef.current.reset()

    try {
      const res = await fetch("/api/generate", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: trimmed }),
      })

      if (res.status === 401) {
        setStatus("unauthorized")
        return
      }

      await handleStream(res, (projectId) => {
        router.push(`/features/project/${projectId}`)
      })

    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return
      storeRef.current.setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      readerRef.current = null
      setStatus("idle")
    }
  }, [status, router, handleStream])

  return { submit, status, cancel }
}