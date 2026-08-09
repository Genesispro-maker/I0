import { usePathname, useRouter } from "next/navigation"
import { useGeneration } from "../store/generation-store"
import { useCallback, useEffect, useRef, useState } from "react"
import { subscribe } from "inngest/realtime"
import { generationchannel } from "@/app/lib/inngest/channel"

type Status = "idle" | "loading" | "unauthorized"

type StreamType = {
  submit: (prompt: string, url: string, imageurls?: string[]) => Promise<void>
  status: Status
  cancel: () => void
}

export function useStream(): StreamType {
  const router = useRouter()
  const pathname = usePathname()
  const store = useGeneration()
  const storeRef = useRef(store)
  storeRef.current = store

  const [status, setStatus] = useState<Status>("idle")
  const subscriptionRef = useRef<Awaited<ReturnType<typeof subscribe>> | null>(null)

  useEffect(() => {
    return () => {
      subscriptionRef.current?.close()
    }
  }, [])

  const cancel = useCallback(() => {
    subscriptionRef.current?.close()
    subscriptionRef.current = null
    setStatus("idle")
  }, [])

  const Stream = useCallback(async (projectId: string, key: string, apiBaseUrl: string | undefined) => {
    let stream
    try {
      stream = await subscribe({
        channel: generationchannel({ projectId }),
        topics: ["progress"],
        key,
        apiBaseUrl,
      })
    } catch (err) {
      storeRef.current.setError(err instanceof Error ? err.message : "Failed to subscribe")
      setStatus("idle")
      return
    }

    subscriptionRef.current = stream
    const reader = stream.getReader()

    try {
      while (true) {
        const { done, value: message } = await reader.read()
        if (done) break
        if (message.kind !== "data") continue

        const { type, data } = message.data as { type: string; data: string }

        switch (type) {
          case "reasoning":
            storeRef.current.appendReasoning(data)
            break

          case "building":
            storeRef.current.setStatus("building")
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
            storeRef.current.clearMessages()
            router.refresh()
            setStatus("idle")
            return
          }

          case "error":
            storeRef.current.setError(data)
            storeRef.current.clearMessages()
            setStatus("idle")
            return
        }
      }
    } catch (err) {
      storeRef.current.setError(err instanceof Error ? err.message : "Something went wrong")
      setStatus("idle")
    } finally {
      subscriptionRef.current = null
    }
  }, [router])

  const submit = useCallback(async (prompt: string, url: string, imageurls?: string[]) => {
    const trimmed = prompt.trim()
    if (!trimmed || status === "loading") return

    const isNewchat = !pathname?.startsWith('/features/project/')

    setStatus("loading")
    storeRef.current.reset()
    storeRef.current.setPendingmessage(trimmed, imageurls)

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: trimmed,
          images: imageurls,
        }),
      })

      if (res.status === 401) {
        setStatus("unauthorized")
        return
      }

      if (!res.ok) {
        storeRef.current.setError(`Server error: ${res.status}`)
        setStatus("idle")
        return
      }

      const { projectId, messageId, token } = await res.json()
      storeRef.current.setMetadata(projectId, messageId)

      await Stream(projectId, token.key, token.apiBaseUrl)

      if (isNewchat) {
        router.push(`/features/project/${projectId}`)
      }
    } catch (err) {
      storeRef.current.setError(err instanceof Error ? err.message : "Something went wrong")
      storeRef.current.clearMessages()
      setStatus("idle")
    }
  }, [status, router, pathname, Stream])

  return { submit, status, cancel }
}