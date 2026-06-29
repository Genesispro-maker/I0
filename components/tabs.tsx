"use client"
import React, { createContext, Dispatch, useContext, useState } from "react"
import { clsx } from "clsx"

const TabsContext = createContext<{active: string, setActive: Dispatch<string>} | null>(null)

export const Tabs = ({children, defaultTab, ...delegated}: {children: React.ReactNode, defaultTab: string} & React.ComponentProps<"div">) => {
    const [active, setActive] = useState(defaultTab)

    return (
        <TabsContext.Provider value={{active, setActive}}>
            <div {...delegated}>{children}</div>
        </TabsContext.Provider>
    )
}

Tabs.Tab = function Tab({ id, children, className, ...delegated }: { id: string; children: React.ReactNode } & React.ComponentProps<"button">) {
  const context = useContext(TabsContext)
  if (!context) return null

  const { active, setActive } = context

  return (
    <button {...delegated} onClick={() => setActive(id)} className={clsx(
        "flex justify-center items-center cursor-pointer rounded-[2px] transition-all",
        active === id ? "bg-zinc-800" : "hover:text-gray-200",
        className
      )}>
      {children}
    </button>
  )
}

Tabs.Panel = function Panel({id, children, ...delegated}: {id: string, children: React.ReactNode} & React.ComponentProps<"div">){
    const context = useContext(TabsContext)
    if(!context) return
    const { active } = context

    if(active !== id) return

    return <div {...delegated}>{children}</div>
}