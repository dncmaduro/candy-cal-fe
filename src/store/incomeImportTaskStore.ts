import { create } from "zustand"

export type IncomeImportTaskStatus =
  | "preparing"
  | "uploading"
  | "success"
  | "error"

export interface IncomeImportTask {
  id: string
  status: IncomeImportTaskStatus
  fileName: string
  currentChunk: number
  totalChunks: number
  message?: string
}

interface IncomeImportTaskState {
  task: IncomeImportTask | null
  setTask: (task: IncomeImportTask) => void
  updateTask: (updates: Partial<IncomeImportTask>) => void
  clearTask: () => void
}

export const useIncomeImportTaskStore = create<IncomeImportTaskState>(
  (set) => ({
    task: null,
    setTask: (task) => set({ task }),
    updateTask: (updates) =>
      set((state) => ({
        task: state.task ? { ...state.task, ...updates } : null
      })),
    clearTask: () => set({ task: null })
  })
)
