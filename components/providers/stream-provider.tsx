"use client"
import { useStream } from "@/app/hooks/use-stream";
import { createContext, ReactNode, useContext } from "react";

const StreamContext = createContext<ReturnType<typeof useStream> | null>(null)

export const StreamProvider = ({ children }: { children: ReactNode }) => {
    const stream = useStream()
    
    return <StreamContext.Provider value={stream}>{children}</StreamContext.Provider>
} 

export function useStreamContext(){
    const context = useContext(StreamContext)
    if(!context) throw new Error("useStreamContext must be used within StreamProvider")
    return context
}