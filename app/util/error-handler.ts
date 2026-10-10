import { ActionType } from "@/app/types/types"
import z from "zod/v3"

const generic = (error: unknown): string => {
  const text = error instanceof Error ? `${error.name} ${error.message}` : ""

  if (/fetch failed|network|ECONN|ENOTFOUND|ETIMEDOUT/i.test(text)) {
    return "Network problem. Please check your connection and try again."
  }
  if (/prisma|database|sql/i.test(text)) {
    return "We're having trouble reaching our servers. Please try again shortly."
  }
  return "Something went wrong. Please try again."
}

export const EMPTY_ACTION_STATE: ActionType = {
        message: "",
        fieldError: {},
        timeStamp: Date.now(),
}

export const fromErrortoaction = (error: unknown, formdata?: FormData): ActionType => {
     if(error instanceof z.ZodError){
         return {
            status: "ERROR",
            message: error.errors[0].message,
            payload: formdata,
            fieldError: JSON.parse(JSON.stringify(error.flatten().fieldErrors)),
            timeStamp: Date.now(),
          }
        }
        else if (error instanceof Error){
            return {
                status: "ERROR",
                message: error.message,
                fieldError: {},
                payload: formdata,
                timeStamp: Date.now(),
            }
        }
        else{
            return {
                status: "ERROR",
                message: generic(error),
                fieldError: {},
                payload: formdata,
                timeStamp: Date.now(),
            }
        }
    }

export const toActionState = (status: ActionType["status"], message: string) : ActionType => {
        return {
            status,
            message,
            fieldError: {},
            timeStamp: Date.now()
        }
    }