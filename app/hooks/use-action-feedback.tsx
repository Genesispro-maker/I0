"use client"
import { useEffect, useRef } from "react"
import { ActionType } from "@/app/types/types"

type Args = {
  actionState: ActionType
}

type Options = {
  onSuccess?: (args: Args) => void
  onError?: (args: Args) => void
}

export const useActionFeedback = (actionState: ActionType, options: Options) => {
  const previousTimeStamp = useRef(actionState.timeStamp)
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    const currentTime = previousTimeStamp.current !== actionState.timeStamp
    previousTimeStamp.current = actionState.timeStamp

    if (!currentTime) return

    if (actionState.status === "SUCCESS") {
      optionsRef.current.onSuccess?.({ actionState })
    }
    if (actionState.status === "ERROR") {
      optionsRef.current.onError?.({ actionState })
    }
  }, [actionState])
}