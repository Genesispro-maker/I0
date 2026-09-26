"use client"
import { Loader } from "@/app/util/constants";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const dynamic = "force-dynamic"

export default function ResetPassword({ token }: { token?: string }){
    const [state, setState] = useState<{
        email: string
        status: "idle" | "loading" | "success" | "error"
        message: string
    }>({
        email: '',
        status: "idle",
        message: ""
    })
    const [show, setShow] = useState(false)
    const [password, setPassword] = useState<string>("")
    const router = useRouter()

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

    async function reset(e: React.ChangeEvent<HTMLFormElement>, newPassword: string, token?: string): Promise<void>{
        setState({
            ...state, 
            status: "loading"
        })
        toast.loading("Sending Reset Link")
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

    const isToken = !!token
    console.log(isToken)

    return (
        <main className="p-4 flex flex-col min-h-screen items-center justify-center">
            {!isToken ? (
                <section>
                    <form className="flex w-70 justify-center flex-col gap-3" onSubmit={Submit}>
                        <div className="flex flex-col gap-1">
                            <label className="flex gap-1 items-center text-black dark:text-zinc-300" htmlFor="email">
                              <Mail size={17} aria-hidden={true} /> Email: 
                            </label>
                            <input autoFocus aria-label="Email input" placeholder="Enter your email.." className="border focus-within:outline focus-within:outline-zinc-800 border-zinc-800 rounded-md p-1" type="email" id="email" value={state.email} required onChange={(e) => setState({...state, email: e.target.value})} />
                        </div>

                        <button role="button" aria-live="polite" type="submit" disabled={state.status === "loading"} className="bg-black text-white dark:bg-white flex gap-3 items-center justify-center border border-zinc-800 font-medium hover:bg-zinc-800 rounded-md hover:cursor-pointer dark:hover:bg-zinc-200 dark:text-black w-full py-0.5 px-2">
                            Send Reset Link
                        </button>
                    </form>
                </section>
            ) : (
                <section>
                    <form className="flex justify-center flex-col gap-2" onSubmit={(e) => reset(e, password, token)}>
                        <label htmlFor="password" className="flex gap-1 items-center text-black dark:text-zinc-300">
                          <Lock aria-hidden={true} size={17} /> Password: 
                        </label>

                        <div className="relative">
                          <input value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} name="password" autoFocus aria-label="Password Input" className="border focus:outline focus:outline-offset-1 border-zinc-600 dark:border-zinc-800 rounded-md p-1" placeholder="Password..."/>
                          <button className="absolute right-2 hover:cursor-pointer top-2" aria-label="Password Toggle Button" type="button" onClick={() => setShow(!show)}>
                             {show ? <EyeOff aria-hidden size={18} /> : <Eye aria-hidden size={18} />}
                          </button>
                        </div>

                        <button type="submit" className="w-full p-0.5 text-white bg-black dark:bg-white dark:text-black rounded-md hover:cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-300 border-2 border-zinc-800">
                           Change Password
                        </button>
                    </form>
                </section>
            )}
        </main>
    )
}