import { FileCollection } from "../types/types";
import { create } from "zustand"

type Status = "idle" | "thinking" | "done" | "error" | "building"
interface GenerationState {
  file: Array<string>
  projectId: string | null,
  messageId: string | null,
  reasoning: string,
  code: string,
  files: FileCollection,
  summary: string,
  suggestions: string[],
  status: Status,
  error: string | null
}
interface GenerationAction {
  setMetadata: (projectId: string, messageId: string) => void,
  appendReasoning: (text: string) => void
  appendCode: (text: string) => void
  appendSummary: (text: string) => void
  appendSuggestions: (text: string) => void
  setDone: (files: FileCollection) => void
  setError: (message: string) => void
  setFiles: (files: string[]) => void
  reset: () => void
}

const state: GenerationState = {
  file: [],
  projectId: null,
  messageId: null,
  reasoning: "",
  code: "",
  files: {},
  summary: "",
  suggestions: [] as string[],
  status: "idle",
  error: null,
}

export const useGeneration = create<GenerationState & GenerationAction>((set) => ({
  ...state,

  setMetadata: (projectId, messageId) => set({ projectId, messageId, status: "thinking", error: null }),
  appendReasoning: ((text) => set((prev) => ({reasoning: prev.reasoning + text, status: prev.status === "idle" ? "thinking" : prev.status}))),
  appendCode: ((text) => set((prev) => ({ code: prev.code + text, status: "building"}))),
  appendSummary: ((text) => set((prev) => ({ summary: prev.summary + text}))),
  appendSuggestions: (text: string) => set({ suggestions: JSON.parse(text) }),
  setFiles: ((file) => set({ file, status: "building" })),
  setDone: (files) => set({ files, status: "done" }),
  setError: (message) => set({ status: "error", error: message }),
  reset: () => set(state)
}));