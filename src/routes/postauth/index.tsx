import { createFileRoute, Navigate } from "@tanstack/react-router"
import { useUsers } from "../../hooks/useUsers"
import { useQuery } from "@tanstack/react-query"
import { useUserStore } from "../../store/userStore"

export const Route = createFileRoute("/postauth/")({
  component: RouteComponent
})

function RouteComponent() {
  const { getMe } = useUsers()
  const { accessToken } = useUserStore()

  const { data: meData } = useQuery({
    queryKey: ["getMe"],
    queryFn: getMe,
    enabled: !!accessToken,
    select: (data) => data.data
  })

  if (meData?.role === "admin" || meData?.role === "order-manager") {
    return <Navigate to="/storage" />
  }

  if (meData?.role === "client") {
    return <Navigate to="/orders" />
  }

  return <></>
}
