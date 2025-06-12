import { create } from "zustand"
import { persist } from "zustand/middleware"
import { saveToCookies } from "./cookies"

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
      clearUser: () => {
        saveToCookies("refreshToken", "")
        set({ accessToken: "" })
      }
    }),
    {
      name: "user-store"
    }
  )
)
