import { createFileRoute, Navigate } from "@tanstack/react-router"
import { useAuthGuard } from "../../../hooks/useAuthGuard"

type Subtab = {
  tab: string
  channel?: string
}

export const Route = createFileRoute("/marketing-storage/incomes/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): Subtab => {
    return {
      tab: String(search.tab ?? "dashboard"),
      channel: search.channel ? String(search.channel) : undefined
    }
  }
})

function RouteComponent() {
  const { tab, channel } = Route.useSearch()
  const { meData, isLoading } = useAuthGuard([
    "admin",
    "accounting-emp",
    "order-emp",
    "shopee-emp",
    "system-emp"
  ])

  if (isLoading || !meData) return null

  if (meData.roles.includes("shopee-emp")) {
    return (
      <Navigate
        to="/shopee/incomes"
        search={{ tab, channel }}
      />
    )
  }

  if (meData.roles.includes("order-emp")) {
    return (
      <Navigate
        to="/tiktokshop/incomes"
        search={{ tab, channel }}
      />
    )
  }

  return (
    <Navigate
      to="/kho-van/incomes"
      search={{ tab, channel }}
    />
  )
}
