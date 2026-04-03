import { createFileRoute } from "@tanstack/react-router"
import {
  TIKTOKSHOP_NAVS,
  TIKTOKSHOP_NAVS_URL,
  TIKTOKSHOP_ROLES
} from "../../../constants/navs"
import {
  StorageIncomesPage,
  validateIncomesSearch
} from "../../marketing-storage/incomes"

export const Route = createFileRoute("/tiktokshop/incomes/")({
  component: RouteComponent,
  validateSearch: validateIncomesSearch
})

function RouteComponent() {
  const search = Route.useSearch()

  return (
    <StorageIncomesPage
      search={search}
      baseUrl={TIKTOKSHOP_NAVS_URL}
      navs={TIKTOKSHOP_NAVS}
      allowedRoles={TIKTOKSHOP_ROLES}
      allowedPlatforms={["tiktokshop", "tiktok"]}
    />
  )
}
