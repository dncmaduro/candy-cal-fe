import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UIState {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: true,
      setSidebarCollapsed: (value) =>
        set((state) => ({
          sidebarCollapsed:
            typeof value === "function"
              ? (value as (prev: boolean) => boolean)(state.sidebarCollapsed)
              : value
        })),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed })
    }),
    { name: "ui-store" }
  )
)
