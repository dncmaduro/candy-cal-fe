import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router"
import { useUsers } from "../../hooks/useUsers"
import { useQuery } from "@tanstack/react-query"
import { useUserStore } from "../../store/userStore"
import { useEffect } from "react"

export const Route = createFileRoute("/postauth/")({
  component: RouteComponent
})

function RouteComponent() {
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
    // Không có token hoặc token hỏng, về login, đừng render gì
    if (!accessToken || isError) {
      clearUser()
      navigate({ to: "/" })
    }
  }, [accessToken, isError, clearUser, navigate])

  // Khi đang loading hoặc đang navigate thì render null (chặn nháy UI/flicker)
  if (!accessToken || isLoading || isError) return null

  // Nếu có meData thì route theo role
  if (meData?.role === "admin" || meData?.role === "order-emp") {
    return <Navigate to="/storage" />
  }
  if (meData?.role === "accounting-emp") {
    return <Navigate to="/accounting-storage" />
  }

  // Nếu không xác định role, cũng trả null chờ fetch tiếp hoặc sẽ bị navigate ở useEffect
  return null
}
