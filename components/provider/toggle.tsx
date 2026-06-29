import { createContext, ReactNode, useContext, useState } from "react";

const ToggleContext = createContext<{open: boolean, setOpen: (val: boolean) => void} | null>(null)

export const Toggle = ({children}: {children: ReactNode}) => {
    const [open, setOpen] = useState(false)

    return (
        <ToggleContext.Provider value={{ open, setOpen }}>
            {children}
        </ToggleContext.Provider>
    )
}

export const useToggle = () => {
    const context = useContext(ToggleContext)
    if(!context) throw new Error("useToggle must be used within a ToogleProvider")
    return context
}