import { createFileRoute } from "@tanstack/react-router"
import { DeliveredRequestsPage } from "../../marketing-storage/delivered-requests"

export const Route = createFileRoute("/mkt-storage/delivered-requests/")({
  component: RouteComponent
})

function RouteComponent() {
  return <DeliveredRequestsPage />
}
