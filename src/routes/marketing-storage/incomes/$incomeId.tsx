import { createFileRoute, Navigate } from "@tanstack/react-router"
import { useAuthGuard } from "../../../hooks/useAuthGuard"

export const Route = createFileRoute("/marketing-storage/incomes/$incomeId")({
  component: RouteComponent
})

function RouteComponent() {
  const { incomeId } = Route.useParams()
  const { meData, isLoading } = useAuthGuard([
    "admin",
    "accounting-emp",
    "order-emp",
    "shopee-emp",
    "system-emp"
  ])

  if (isLoading || !meData) return null

  if (meData.roles.includes("order-emp")) {
    return (
      <Navigate
        to="/tiktokshop/incomes/$incomeId"
        params={{ incomeId }}
      />
    )
  }

  if (meData.roles.includes("shopee-emp")) {
    return <Navigate to="/shopee/incomes" />
  }

  return (
    <Navigate
      to="/kho-van/incomes/$incomeId"
      params={{ incomeId }}
    />
  )
}
