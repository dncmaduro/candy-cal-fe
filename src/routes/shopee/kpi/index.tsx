import { createFileRoute } from "@tanstack/react-router"
import {
  ShopeeMonthKpiPage,
  type ShopeeMonthKpiSearchState
} from "../../../components/incomes/shopee-dashboard/ShopeeMonthKpiPage"

const parsePositiveInt = (value: unknown, fallback: number) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const parseString = (value: unknown) => {
  if (typeof value !== "string") return undefined

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const validateShopeeMonthKpiSearch = (
  search: Record<string, unknown>
): ShopeeMonthKpiSearchState => {
  return {
    page: parsePositiveInt(search.page, 1),
    limit: parsePositiveInt(search.limit, 10),
    month: parseString(search.month),
    year: parseString(search.year),
    channel: parseString(search.channel)
  }
}

export const Route = createFileRoute("/shopee/kpi/")({
  component: RouteComponent,
  validateSearch: validateShopeeMonthKpiSearch
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <ShopeeMonthKpiPage
      search={search}
      onSearchChange={(nextSearch, replace = true) =>
        navigate({
          search: {
            ...search,
            ...nextSearch
          },
          replace
        })
      }
    />
  )
}
