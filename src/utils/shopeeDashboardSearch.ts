import type { ShopeeDashboardSearchState } from "../components/incomes/shopee-dashboard/ShopeePerformanceDashboardPage"
import type { ShopeeRangePreset } from "../hooks/models"
import { SHOPEE_ALL_CHANNEL_ID } from "../hooks/shopeeDashboardApi"
import {
  createDefaultRange,
  parseDateInputValue
} from "../components/incomes/shopee-dashboard/performanceTimeUtils"

const getDefaultDate = () => new Date()

const parseMonth = (value: unknown) => {
  const fallback = getDefaultDate().getMonth() + 1
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) return fallback

  return Math.min(12, Math.max(1, Math.trunc(parsed)))
}

const parseYear = (value: unknown) => {
  const fallback = getDefaultDate().getFullYear()
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) return fallback

  return Math.max(2000, Math.trunc(parsed))
}

const parseTab = (value: unknown): ShopeeDashboardSearchState["tab"] => {
  return value === "orders" ? "orders" : "dashboard"
}

const parseMode = (value: unknown): ShopeeDashboardSearchState["mode"] => {
  return value === "range" ? "range" : "month"
}

const parseDateString = (value: unknown) => {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined

  return parseDateInputValue(trimmed) ? trimmed : undefined
}

const parsePreset = (value: unknown): ShopeeRangePreset | undefined => {
  if (typeof value !== "string") return undefined

  if (
    value === "last-7-days" ||
    value === "last-14-days" ||
    value === "last-30-days" ||
    value === "this-month" ||
    value === "last-month"
  ) {
    return value
  }

  return undefined
}

export const validateShopeeDashboardSearch = (
  search: Record<string, unknown>
): ShopeeDashboardSearchState => {
  const mode = parseMode(search.mode)
  const channel =
    typeof search.channel === "string" && search.channel.trim()
      ? search.channel
      : SHOPEE_ALL_CHANNEL_ID
  const orderFrom = parseDateString(search.orderFrom ?? search.fromDate)
  const orderTo = parseDateString(search.orderTo ?? search.toDate)
  const preset = parsePreset(search.preset)
  const fallbackRange = createDefaultRange()

  return {
    mode,
    channel,
    month: parseMonth(search.month),
    year: parseYear(search.year),
    tab: parseTab(search.tab),
    orderFrom:
      mode === "range" ? orderFrom ?? fallbackRange.orderFrom : undefined,
    orderTo: mode === "range" ? orderTo ?? fallbackRange.orderTo : undefined,
    preset: mode === "range" ? preset ?? "last-7-days" : undefined
  }
}
