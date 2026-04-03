import { createFileRoute, Navigate } from "@tanstack/react-router"

export const Route = createFileRoute("/marketing-storage/orders-logs/")({
  component: RouteComponent
})

function RouteComponent() {
  return <Navigate to="/tiktokshop/sku" />
}
