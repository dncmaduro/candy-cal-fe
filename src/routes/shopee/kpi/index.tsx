import { createFileRoute } from "@tanstack/react-router"
import {
  ShopeeMonthKpiPage,
  type ShopeeMonthKpiSearchState
} from "../../../components/incomes/shopee-dashboard/ShopeeMonthKpiPage"

const getCurrentPeriod = () => {
  const currentDate = new Date()

  return {
    month: String(currentDate.getMonth() + 1),
    year: String(currentDate.getFullYear())
  }
}

const parsePositiveInt = (value: unknown, fallback: number) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const parseMonth = (value: unknown, fallback: string) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 12
    ? String(parsed)
    : fallback
}

const parseYear = (value: unknown, fallback: string) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 2000 && parsed <= 3000
    ? String(parsed)
    : fallback
}

const parseString = (value: unknown) => {
  if (typeof value !== "string") return undefined

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const validateShopeeMonthKpiSearch = (
  search: Record<string, unknown>
): ShopeeMonthKpiSearchState => {
  const currentPeriod = getCurrentPeriod()

  return {
    page: parsePositiveInt(search.page, 1),
    limit: parsePositiveInt(search.limit, 10),
    month: parseMonth(search.month, currentPeriod.month),
    year: parseYear(search.year, currentPeriod.year),
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
