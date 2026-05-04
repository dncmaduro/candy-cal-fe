import { createFileRoute } from "@tanstack/react-router"
import {
  ShopeePerformanceDashboardPage,
  type ShopeeDashboardSearchState
} from "../../../components/incomes/shopee-dashboard/ShopeePerformanceDashboardPage"
import {
  KHO_VAN_ROLES,
  NAVS
} from "../../../constants/navs"
import { validateShopeeDashboardSearch } from "../../../utils/shopeeDashboardSearch"

export const Route = createFileRoute("/mkt-storage/shopee-incomes/")({
  component: RouteComponent,
  validateSearch: validateShopeeDashboardSearch
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <ShopeePerformanceDashboardPage
      search={search}
      allowedRoles={KHO_VAN_ROLES}
      navs={NAVS}
      pageTitle="Doanh thu Shopee"
      onSearchChange={(nextSearch, replace = true) =>
        navigate({
          search: {
            ...search,
            ...nextSearch
          } as ShopeeDashboardSearchState,
          replace
        })
      }
    />
  )
}
