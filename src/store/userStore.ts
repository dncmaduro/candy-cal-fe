import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UserState {
  accessToken: string
  setUser: (accessToken: string) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      accessToken: "",
      setUser: (accessToken) => set({ accessToken }),
      clearUser: () => set({ accessToken: "" })
    }),
    {
      name: "user-store"
    }
  )
)
