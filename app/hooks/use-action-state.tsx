"use client"
import { useEffect, useRef } from "react"
import { ActionType } from "@/app/types/types"

type onArgs = {
    actionState: ActionType,
}

type useActionFeedbackOptions = {
  onSuccess?: (args: onArgs) => void,
  onError?: (args: onArgs) => void
}

export const useActionFeedback = (actionState: ActionType, options: useActionFeedbackOptions) => {
  const previousTimeStamp = useRef(actionState.timeStamp)

  useEffect(() => {
    const update = previousTimeStamp.current !== actionState.timeStamp

    if (!update) return
    
    import('sonner').then(({ toast }) => {
    if (actionState.status === "SUCCESS") {
      options.onSuccess?.({ actionState })
      toast.success(actionState.message)
    }
    if (actionState.status === "ERROR") {
      toast.error(actionState.message)
    }
  })

    previousTimeStamp.current = actionState.timeStamp
  }, [actionState, options])
  
}