import { useEffect, useState } from "react"

export const useDebounce = (initialvalue: string, delay: number): string => {
    const [value, setValue] = useState(initialvalue)

    useEffect(() => {
        const interval = setTimeout(() => {
            setValue(initialvalue)
        }, delay)

        return () => clearTimeout(interval)
    }, [initialvalue, delay])

    return value
}