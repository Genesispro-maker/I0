import { ActionType } from "@/app/types/types";

export const FieldError = ({actionState, name}: {actionState: ActionType, name: string}) => {
    const message = actionState.fieldError?.[name]?.[0]

    return <span className="text-red-600 text-sm text-start">{message}</span>
}