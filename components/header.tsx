"use client"
import { V0 } from "@/app/util/constant"
import Link from "next/link"
import { Auth } from "./auth/auth"
import { useState } from "react"
import { useToggle } from "./provider/toggle"

export const Header = () => {
  const { open, setOpen } = useToggle()
  const [mode, setMode] = useState<"login" | "signup">("login")

   return (
    <>
      <nav className="bg-transparent flex py-0.5 px-1 mx-2.5 justify-between items-center relative">
          <Link href={"/"}>
            <V0 />
          </Link>
            <div className="flex gap-2">
              <button onClick={() => {
                setOpen(true)
                setMode("login")
              }} className="border border-zinc-600 rounded-[5px] w-fit flex items-center h-7 p-2 text-[1rem] hover:cursor-pointer">Login</button>

              <button onClick={() => {
                setOpen(true)
                setMode("signup")
              }} className="bg-white text-black border border-zinc-600 rounded-[5px] flex items-center h-7 p-2 text-[1rem] hover:cursor-pointer hover:bg-[#f5f5fa] hover:text-black">Get Started</button>
            </div>
          <Auth open={open} setOpen={setOpen} mode={mode} onChangeMode={setMode} />
      </nav>
    </>
  )
}