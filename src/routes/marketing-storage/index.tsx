import { createFileRoute, Navigate } from "@tanstack/react-router"
import { useAuthGuard } from "../../hooks/useAuthGuard"

export const Route = createFileRoute("/marketing-storage/")({
  component: RouteComponent
})

function RouteComponent() {
  const { meData, isLoading } = useAuthGuard([
    "admin",
    "accounting-emp",
    "order-emp",
    "shopee-emp",
    "system-emp"
  ])

  if (isLoading || !meData) return null

  if (meData.roles.includes("shopee-emp")) {
    return <Navigate to="/shopee" />
  }

  if (meData.roles.includes("order-emp")) {
    return <Navigate to="/tiktokshop" />
  }

  return <Navigate to="/kho-van" />
}
