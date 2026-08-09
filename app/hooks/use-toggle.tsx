import { useState } from "react"

export const useToggle = (initial: boolean) => {
    const [toggle, setToggle] = useState(initial)

    const onHandleChange = () => {
        setToggle((prev) => !prev)
    }

    return [toggle, onHandleChange] as const
}