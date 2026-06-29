import { ActionType } from "@/app/types/types"
import z from "zod/v3"

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
                message: "something went wrong",
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