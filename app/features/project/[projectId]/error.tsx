"use client"
import { useEffect } from "react"

export default function Errorpage({ reset, error }: { reset: () => void, error: Error & { digest?: string} }){
    useEffect(() => {
        console.error(error)
    }, [error])
        
    return (
        <main className="p-4 flex flex-col gap-3 justify-center items-center min-h-screen">
            <h1 className="text-xl">Something Went Wrong</h1>
            <button onClick={() => reset()} className="dark:bg-white px-3 dark:hover:bg-zinc-400 dark:text-black bg-black text-white hover:cursor-pointer w-fit p-1 rounded-md">Retry</button>
        </main>
    )
}