import { createFileRoute, Navigate } from "@tanstack/react-router"

export const Route = createFileRoute("/marketing-storage/delivered-requests/")({
  component: RouteComponent
})

function RouteComponent() {
  return <Navigate to="/kho-van/delivered-requests" />
}
