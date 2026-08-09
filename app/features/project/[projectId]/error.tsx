"use client"
export default function Errorpage({retry, }: { retry: () => void}){
    return (
        <main className="p-4 flex flex-col justify-center items-center min-h-screen">
            <h1>Something Went Wrong</h1>
            <button className="bg-white w-fit p-1 rounded-md">Retry</button>
        </main>
    )
}