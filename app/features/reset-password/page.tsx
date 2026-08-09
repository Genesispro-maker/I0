"use client"
import { Loader } from "@/app/util/constants";
import { Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ResetPassword(){
    const [state, setState] = useState<{
        email: string
        status: "idle" | "loading" | "success" | "error"
        message: string
    }>({
        email: '',
        status: "idle",
        message: ""
    })
    const [password, setPassword] = useState<string>("")
    const router = useRouter()
    const params = useSearchParams()
    const token = params.get("token") || ''

    async function Submit(e: React.ChangeEvent<HTMLFormElement>){
        e.preventDefault()
        setState({
            ...state,
            status: "loading"
        })

        try {
            const res = await fetch('/api/forgot-password', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: state.email,
                })
            })

            const data = await res.json()

            if(!res.ok){
                throw new Error("Something went wrong")
            }

            setState({
                ...state, 
                message: data.message,
                status: "success"
            })

            toast.message(data.message || "Reset link sent! Check your email.")
        } catch (err){
            if(err instanceof Error)
            setState({
                ...state, 
                message: err.message || "Something went Wrong",
                status: "error"
            })
            toast.error(state.message)
        }
    }

    async function reset(e: React.ChangeEvent<HTMLFormElement>, token: string, newPassword: string): Promise<void>{
        setState({
            ...state, 
            status: "loading"
        })
        e.preventDefault()
         try {
            const res = await fetch("/api/reset-password/", {
                method: "POST",
                headers: {
                    "Content-Type": "applications/json",
                },
                body: JSON.stringify({
                    token,
                    newPassword,
                })
            })

            const data = await res.json()

            if(!res.ok) throw new Error("Something went Wrong")
            
            setState({
                ...state,
                status: "success",
                message: data.message
            })

           toast.success(data.message || "Password reset successfully!")
           router.push('/')
         } catch (err){
            if(err instanceof Error)
            setState({
                ...state,
                status: "error",
                message: err.message,
            })
            toast.error(state.message)
         }
    }

    const isToken = Boolean(token)

    return (
        <main className="p-4 flex flex-col min-h-screen items-center justify-center">
            {!isToken ? (
                <section>
                    <form className="flex w-70 justify-center flex-col gap-3" onSubmit={Submit}>
                        <div className="flex flex-col gap-1">
                            <label className="flex gap-1 items-center text-zinc-300" htmlFor="email"><Mail size={17} aria-hidden={true} color="lightgray"/> Email: </label>
                            <input autoFocus aria-label="Email input" placeholder="Enter your email.." className="border focus-within:outline focus-within:outline-zinc-800 border-zinc-800 rounded-md p-1" type="email" id="email" value={state.email} required onChange={(e) => setState({...state, email: e.target.value})} />
                        </div>

                        <button role="button" aria-live="polite" type="submit" disabled={state.status === "loading"} className="bg-white flex gap-3 items-center justify-center border-2 border-zinc-800 font-medium rounded-md hover:cursor-pointer hover:bg-zinc-200 text-black w-fit py-0.5 px-2">
                            {state.status === "loading" ? <><Loader /> {"Sending Link...."} </> : "Send Reset Link"}
                        </button>
                    </form>
                </section>
            ) : (
                <section>
                    <form className="flex flex-col gap-2" onSubmit={(e) => reset(e, token, password)}>
                        <label htmlFor="password" className="flex gap-1 items-center text-zinc-300"><Lock aria-hidden={true} size={17} color="lightgray" /> Password: </label>
                        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" autoFocus aria-label="Password Input" className="border focus-within:outline focus-within:outline-zinc-800 border-zinc-800 rounded-md p-1" placeholder="Password..."/>
                        <button type="submit" className="w-fit p-1 bg-white text-black rounded-md hover:cursor-pointer hover:bg-zinc-300 border-2 border-zinc-800">Change Password</button>
                    </form>
                </section>
            )}
        </main>
    )
}