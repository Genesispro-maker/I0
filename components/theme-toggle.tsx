"use client"
import { Toggle, ToggleGroup } from "@base-ui/react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export const ThemeToggle = () => {
    const [mounted, setMounted] = useState<boolean>(false)
    const { resolvedTheme, setTheme, } = useTheme()

    useEffect(() => {
        const mount = () => {
            setMounted(true)
        }
        mount()
    }, []) 

    if(!mounted){
        return <div className="w-25 h-8.5 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-800" />
    }

    return (
       <ToggleGroup value={resolvedTheme ? [resolvedTheme] : []} onValueChange={(value) => {
        if(value) setTheme(value[0])
       }} defaultValue={["system"]} aria-label="Change Theme" className="flex gap-px p-px border items-center border-zinc-300 dark:border-zinc-800 rounded-[7px]">
        <Toggle onPointerDown={(e) => e.stopPropagation()} className="flex size-6 items-center justify-center rounded-md border-none text-zinc-600 dark:text-zinc-400 select-none cursor-pointer transition-all hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 data-pressed:bg-white dark:data-pressed:bg-zinc-800 data-pressed:text-zinc-950 dark:data-pressed:text-white data-pressed:shadow-sm" value="system" aria-label="System theme">
            <Monitor aria-hidden size={15} style={{ stroke: "var(--miscallenous)"}}/>
        </Toggle>

        <Toggle onPointerDown={(e) => e.stopPropagation()} className="flex size-6 items-center justify-center rounded-md border-none text-zinc-600 dark:text-zinc-400 select-none cursor-pointer transition-all hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 data-pressed:bg-white dark:data-pressed:bg-zinc-800 data-pressed:text-zinc-950 dark:data-pressed:text-white data-pressed:shadow-sm" value="dark" aria-label="Dark theme">
            <Moon size={15} style={{ stroke: "var(--miscallenous)"}} aria-hidden />
        </Toggle>

        <Toggle onPointerDown={(e) => e.stopPropagation()} className="flex size-6 items-center justify-center rounded-md border-none text-zinc-600 dark:text-zinc-400 select-none cursor-pointer transition-all hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 data-pressed:bg-zinc-300 dark:data-pressed:bg-zinc-800 data-pressed:text-zinc-950 dark:data-pressed:text-white data-pressed:shadow-sm" value="light" aria-label="Light theme">
            <Sun size={15} aria-hidden />
        </Toggle>
       </ToggleGroup>
    )
}