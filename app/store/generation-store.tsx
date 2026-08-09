import { FileCollection } from "../types/types";
import { create } from "zustand"

interface GenerationState {
  pendingprompt: string | null
  pendingImages: string[] | null
  projectId: string | null,
  messageId: string | null,
  reasoning: string,
  name: string,
  files: FileCollection,
  summary: string,
  suggestions: string[],
  status: string,
  error: string | null
}

interface GenerationAction {
  setMetadata: (projectId: string, messageId: string) => void,
  setPendingmessage: (prompt: string, images?: string[]) => void
  clearMessages: () => void
  appendReasoning: (text: string) => void
  appendSummary: (text: string) => void
  appendSuggestions: (text: string) => void
  setDone: (files: FileCollection) => void
  setError: (message: string) => void
  setStatus: (status: string) => void
  reset: () => void
}

const state: GenerationState = {
  name: "",
  pendingImages: null,
  pendingprompt: null,
  projectId: null,
  messageId: null,
  reasoning: "",
  files: {},
  summary: "",
  suggestions: [] as string[],
  status: "idle",
  error: null,
}

export const useGeneration = create<GenerationState & GenerationAction>((set) => ({
  ...state,

  setMetadata: (projectId, messageId) => set(() => ({ projectId, messageId, })),
  setPendingmessage: (prompt, images) => set({ pendingprompt: prompt, pendingImages: images }),
  clearMessages: () => set({ pendingImages: null, pendingprompt: null}),
  appendReasoning: ((text) => set((prev) => ({ reasoning: prev.reasoning + text }))),
  appendSummary: ((text) => set((prev) => ({ summary: prev.summary + text }))),
  appendSuggestions: (text: string) => set({ suggestions: JSON.parse(text) }),
  setStatus: ((text) => set((prev) => ({ status: prev.status + text }))),
  setDone: (files) => set({ files, status: "done" }),
  setError: (message) => set({ status: "error", error: message }),
  reset: () => set(state)
}));