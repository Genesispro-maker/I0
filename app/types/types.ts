import { Session } from "next-auth";

export interface ActionType {
    status?: "SUCCESS" | "ERROR",
    message: string,
    payload?: FormData,
    fieldError: Record<string, string[] | undefined>,
    timeStamp: number,
}

export interface options {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  shortcut?: string
  disabled?: boolean
  separator?: boolean
}

export interface contextMenu {
  menuItems: options[]
  children: React.ReactNode
}

export type Authuser = Session["user"]

export type EventType = "metadata" | "name" | "reasoning" | "code" | "done" | "error" | "suggestions" | "building" | "summary"

export type FileCollection = Record<string, string>

export interface User {
   id: string | null,
   username: string | null,
   email: string | null,
   image: string | null,
}

export type Project = {
  id: string
  title: string
  createdAt: string
  user: {
    username: string | null,
    image: string | null
  }
}
export interface LoaderProps {
  size?: number; 
  color?: string;
}
