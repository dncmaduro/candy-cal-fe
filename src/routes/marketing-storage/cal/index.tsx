import { createFileRoute, Navigate } from "@tanstack/react-router"

export const Route = createFileRoute("/marketing-storage/cal/")({
  component: RouteComponent
})

function RouteComponent() {
  return <Navigate to="/tiktokshop/sku" />
}
