import { createFileRoute } from "@tanstack/react-router"
import { SHOPEE_NAVS, SHOPEE_NAVS_URL, SHOPEE_ROLES } from "../../../constants/navs"
import {
  StorageIncomesPage,
  validateIncomesSearch
} from "../../marketing-storage/incomes"

export const Route = createFileRoute("/shopee/incomes/")({
  component: RouteComponent,
  validateSearch: validateIncomesSearch
})

function RouteComponent() {
  const search = Route.useSearch()

  return (
    <StorageIncomesPage
      search={search}
      baseUrl={SHOPEE_NAVS_URL}
      navs={SHOPEE_NAVS}
      allowedRoles={SHOPEE_ROLES}
      allowedPlatforms={["shopee"]}
    />
  )
}
