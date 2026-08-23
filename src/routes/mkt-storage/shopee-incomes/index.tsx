import { createFileRoute } from "@tanstack/react-router"
import {
  ShopeePerformanceDashboardPage,
  type ShopeeDashboardSearchState
} from "../../../components/incomes/shopee-dashboard/ShopeePerformanceDashboardPage"
import { NAVS, STORAGE_ACCESS_PERMISSIONS } from "../../../constants/navs"
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
      allowedPermissions={STORAGE_ACCESS_PERMISSIONS}
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
