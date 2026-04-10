import {
  endOfMonth,
  format,
  isValid,
  parseISO,
  startOfMonth,
  subDays,
  subMonths
} from "date-fns"
import type {
  OrdersQueryRequest,
  ShopeePerformanceTimeMode,
  ShopeeRangePreset
} from "../../../hooks/models"

export const MAX_RANGE_DAYS = 93

export type TimeFilterState = {
  mode: ShopeePerformanceTimeMode
  channel: string
  month: number
  year: number
  fromDate?: string
  toDate?: string
  preset?: ShopeeRangePreset
}

export const toDateInputValue = (date: Date) => format(date, "yyyy-MM-dd")

export const parseDateInputValue = (value?: string) => {
  if (!value) return null

  const parsed = parseISO(value)
  if (!isValid(parsed)) return null

  return parsed
}

export const getDaysInRange = (from?: string, to?: string) => {
  const fromDate = parseDateInputValue(from)
  const toDate = parseDateInputValue(to)

  if (!fromDate || !toDate) return 0

  const diff = toDate.getTime() - fromDate.getTime()
  if (diff < 0) return 0

  return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1
}

export const isRangeValid = (from?: string, to?: string) => {
  const days = getDaysInRange(from, to)
  if (!days) return false

  return days <= MAX_RANGE_DAYS
}

export const createDefaultRange = () => {
  const end = new Date()
  const start = subDays(end, 6)

  return {
    from: toDateInputValue(start),
    to: toDateInputValue(end)
  }
}

export const resolvePresetRange = (preset: ShopeeRangePreset, now = new Date()) => {
  if (preset === "last-7-days") {
    return {
      from: toDateInputValue(subDays(now, 6)),
      to: toDateInputValue(now)
    }
  }

  if (preset === "last-14-days") {
    return {
      from: toDateInputValue(subDays(now, 13)),
      to: toDateInputValue(now)
    }
  }

  if (preset === "last-30-days") {
    return {
      from: toDateInputValue(subDays(now, 29)),
      to: toDateInputValue(now)
    }
  }

  if (preset === "this-month") {
    return {
      from: toDateInputValue(startOfMonth(now)),
      to: toDateInputValue(now)
    }
  }

  const lastMonthDate = subMonths(now, 1)
  return {
    from: toDateInputValue(startOfMonth(lastMonthDate)),
    to: toDateInputValue(endOfMonth(lastMonthDate))
  }
}

export const buildMonthlyQueryParams = ({
  channel,
  month,
  year
}: Pick<TimeFilterState, "channel" | "month" | "year">) => ({
  channelId: channel,
  month,
  year
})

export const buildRangeQueryParams = ({
  channel,
  fromDate,
  toDate
}: Pick<TimeFilterState, "channel" | "fromDate" | "toDate">) => ({
  channelId: channel,
  from: fromDate,
  to: toDate
})

export const buildOrdersQueryParams = ({
  mode,
  channel,
  month,
  year,
  fromDate,
  toDate,
  page,
  pageSize
}: TimeFilterState & {
  page: number
  pageSize: number
}): OrdersQueryRequest => {
  if (mode === "range") {
    return {
      channel,
      from: fromDate,
      to: toDate,
      page,
      pageSize
    }
  }

  return {
    channel,
    month,
    year,
    page,
    pageSize
  }
}
