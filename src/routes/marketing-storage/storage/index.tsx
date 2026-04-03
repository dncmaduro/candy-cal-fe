import { createFileRoute, Navigate } from "@tanstack/react-router"
import { useAuthGuard } from "../../../hooks/useAuthGuard"

type StorageTab = {
  tab: string
}

export const Route = createFileRoute("/marketing-storage/storage/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): StorageTab => {
    return {
      tab: String(search.tab ?? "tiktok-products")
    }
  }
})

function RouteComponent() {
  const { tab } = Route.useSearch()
  const { meData, isLoading } = useAuthGuard([
    "admin",
    "order-emp",
    "shopee-emp",
    "system-emp"
  ])

  if (isLoading || !meData) return null

  if (tab === "shopee-products" || meData.roles.includes("shopee-emp")) {
    return <Navigate to="/shopee/sku" />
  }

  return <Navigate to="/tiktokshop/sku" />
}
