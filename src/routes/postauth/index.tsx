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
    if (!accessToken) {
      clearUser()
      navigate({ to: "/" })
    }
    // Nếu gọi getMe mà fail (token hết hạn hoặc lỗi), cũng clear & về login
    if (accessToken && isError) {
      clearUser()
      navigate({ to: "/" })
    }
  }, [accessToken, isError])

  // Loading trạng thái gọi getMe
  if (isLoading) return null

  if (
    meData?.role === "admin" ||
    meData?.role === "order-manager" ||
    meData?.role === "order-emp"
  ) {
    return <Navigate to="/storage" />
  }
  if (meData?.role === "client") {
    return <Navigate to="/orders" />
  }
  if (meData?.role === "accounting-emp") {
    return <Navigate to="/accounting-storage" />
  }
  // fallback
  return <Navigate to="/" />
}
