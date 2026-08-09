"use client"
import { V0 } from "@/app/util/constants"
import Link from "next/link"
import { Auth } from "./auth/auth"
import { useState } from "react"
import { useToggle } from "@/app/hooks/use-toggle"

export const Header = () => {
  const [open, handleToggle] = useToggle(false)
  const [mode, setMode] = useState<"login" | "signup">("login")

   return (
      <nav className="bg-transparent flex py-0.5 px-1 mx-2.5 justify-between items-center relative">
          <Link href={"/"}>
            <V0 />
          </Link>
            <div className="flex gap-2">
              <button onClick={() => {
                handleToggle()
                setMode("login")
              }} className="border border-zinc-600 rounded-md w-fit flex items-center h-7 p-2 text-[1rem] hover:cursor-pointer">Login</button>

              <button onClick={() => {
                handleToggle()
                setMode("signup")
              }} className="bg-black text-white border-zinc-300 dark:bg-white dark:border-zinc-600 dark:text-black border rounded-md flex items-center h-7 p-2 text-md hover:cursor-pointer">Get Started</button>
            </div>
            
          <Auth open={open} setOpen={handleToggle} mode={mode} onChangeMode={setMode} />
      </nav>
  )
}