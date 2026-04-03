import { createFileRoute } from "@tanstack/react-router"
import { DeliveredRequestsPage } from "../../../components/delivered-requests/DeliveredRequestsPage"
import { WAREHOUSE_NAVS } from "../../../constants/navs"

export const Route = createFileRoute("/kho-van/delivered-requests/")({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <DeliveredRequestsPage
      roles={["admin", "accounting-emp", "system-emp"]}
      navs={WAREHOUSE_NAVS}
    />
  )
}
