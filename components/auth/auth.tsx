"use client"
import { Loginaction } from "@/app/actions/auth/login"
import { EMPTY_ACTION_STATE } from "@/app/util/error-handler"
import { Dispatch, useActionState, useState, useRef, useEffect } from "react"
import { Github, Loader, V0 } from "@/app/util/constants"
import { Dialog } from '@base-ui/react/dialog';
import { FieldError } from "../field-error"
import { ArrowRight, X } from "lucide-react"
import { Signup } from "@/app/actions/auth/sign-up"
import { signIn } from "next-auth/react"

export function Auth({ open, setOpen, mode, onChangeMode }: { open: boolean, setOpen: Dispatch<boolean>, mode: "login" | "signup", onChangeMode: (mode: "login" | "signup") => void}) {
    const [actionState, action] = useActionState(mode === "login" ? Loginaction : Signup, EMPTY_ACTION_STATE)
    const [loading, setLoading] = useState<boolean>(false)
    const formRef = useRef<HTMLFormElement | null>(null)
    const [values, setValues] = useState<{
      email: string
      password: string
      confirmPassword: string
    }>({
      email: "",
      password: '',
      confirmPassword: ''
    })

    useEffect(() => {
      if(actionState.status === "SUCCESS"){
        const form = formRef.current
        if(!form) return

        const data = new FormData(form)
        const email = data.get("email") as string
        const password = data.get("password") as string
        
        signIn("credentials", {
          email,
          password,
          redirect: true,
          callbackUrl: '/'
        })
      }
    }, [actionState])

    const title = mode === "login" ? "Login To Get Started" : "Create Your Account"
    const submitText = mode === "login" ? "Continue" : "Sign Up"
    const alttext = mode === "login" ? "Don't have an account?" : "Already have an account?"
    const switchmode = mode === "login" ? "signup" : "login"

  return (
       <Dialog.Root open={open} onOpenChange={setOpen}>
         <Dialog.Portal>
           <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute" />
           <Dialog.Popup className="bg-white dark:bg-[#1c1c1c] fixed top-1/2 left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] rounded-xl -translate-x-1/2 -translate-y-1/2 flex-col gap-4 p-5 text-neutral-950 dark:text-white border border-neutral-300 dark:border-zinc-800 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-1">
             <div className="flex flex-col gap-3">
               <div className="flex flex-col gap-2 mb-4">
                 <div className="flex justify-between items-center">
                   <V0 />
                   <Dialog.Close className="hover:cursor-pointer">
                    <X className="hover:stroke-zinc-400 transition-all duration-100 ease-in-out" color="gray" size={19}/>
                   </Dialog.Close>
                 </div>
                 <Dialog.Title className="text-xl font-semibold">{title}</Dialog.Title>
               </div>

               <div>
                <button className="flex w-full border-[0.5px] border-zinc-300 dark:border-zinc-800 py-1 rounded-md hover:cursor-pointer justify-center items-center hover:border-zinc-700 gap-3" onClick={() => {
                  setLoading(true)
                  signIn("github", {
                    redirect: true,
                    callbackUrl: "/",
                  })
                }}>{loading ? <Loader /> : <><Github /> Continue with Github</>}</button>
               </div>

               <div className="flex items-center gap-2">
                 <hr className="flex-1 border-t border-zinc-300 dark:border-zinc-700" />
                 <span className="text-sm">OR</span>
                 <hr className="flex-1 border-t border-zinc-300 dark:border-zinc-700" />
               </div>

               <form action={action} className="flex flex-col gap-5">
                <div>
                  <input value={values.email} onChange={(e) => setValues({
                    ...values,
                    email: e.target.value
                  })} placeholder="Email" type="email" name="email" className="w-full px-3 py-1 rounded-md outline outline-zinc-800 hover:outline hover:outline-zinc-700" />
                  <FieldError actionState={actionState} name="email" />
                </div>

                <div>
                  <input value={values.password} onChange={(e) => setValues({
                    ...values,
                    password: e.target.value
                  })} placeholder="Password" type="password" name="password" className="w-full px-3 py-1 rounded-md outline outline-zinc-800 hover:outline hover:outline-zinc-700" />
                  <FieldError actionState={actionState} name="password" />
                </div>

                {mode === "signup" && (
                  <div>
                    <input value={values.confirmPassword} onChange={(e) => setValues({
                      ...values,
                      confirmPassword: e.target.value
                    })} placeholder="Confirm Password" type="password" name="confirmPassword" className="w-full px-3 py-1 rounded-md outline outline-zinc-800 hover:outline hover:outline-zinc-700" />
                    <FieldError actionState={actionState} name="confirmPassword" />
                  </div>
                )}

                <button type="submit" className="flex w-full bg-white text-black border-[0.5px] border-zinc-300 dark:border-zinc-800 py-1 rounded-md hover:cursor-pointer justify-center items-center hover:bg-zinc-200 gap-3"><ArrowRight size={18} /> {submitText}</button>
                
                <div className="flex justify-center gap-1 text-sm">
                  <span>{alttext}</span>
                  <button type="button" className="font-bold hover:underline hover:underline-offset-3 cursor-pointer" onClick={() => onChangeMode(switchmode)}>
                    {mode === "login" ? "Sign up" : "Login"}
                  </button>
                </div>
                <hr className="border-t border-zinc-300 dark:border-zinc-800" />
               </form>
             </div>
           </Dialog.Popup>
         </Dialog.Portal>
       </Dialog.Root>
  )
}