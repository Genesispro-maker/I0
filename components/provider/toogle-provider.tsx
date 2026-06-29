"use client"
import { Toggle } from "./toggle"

export const ToggleProvider = ({ children }: { children: React.ReactNode }) => {
  return <Toggle>{children}</Toggle>
}