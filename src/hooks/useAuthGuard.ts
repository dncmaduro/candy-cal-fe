import { useUserStore } from "../store/userStore"
import { useUsers } from "../hooks/useUsers"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

export const useAuthGuard = (roles: string[]) => {
  const { getMe } = useUsers()
  const { accessToken, clearUser } = useUserStore()
  const navigate = useNavigate()

  const {
    data: meData,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["getMe"],
    queryFn: getMe,
    enabled: !!accessToken,
    select: (data) => data.data
  })

  useEffect(() => {
    if (roles.includes("all")) {
      roles = ["admin", "order-emp", "accounting-emp"]
    }
    // Nếu chưa login hoặc token fail, về login
    if (!accessToken || isError) {
      clearUser()
      navigate({ to: "/" })
    }
    // Nếu login ok nhưng sai quyền, về home
    if (roles && meData && !roles.some((role) => meData.roles.includes(role))) {
      navigate({ to: "/access-denied" })
    }
  }, [accessToken, isError, meData])

  return { meData, isLoading }
}
