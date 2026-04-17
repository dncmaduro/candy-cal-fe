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
  orderFrom?: string
  orderTo?: string
  preset?: ShopeeRangePreset
}

export const toDateInputValue = (date: Date) => format(date, "yyyy-MM-dd")

export const parseDateInputValue = (value?: string) => {
  if (!value) return null

  const parsed = parseISO(value)
  if (!isValid(parsed)) return null

  return parsed
}

export const getDaysInRange = (orderFrom?: string, orderTo?: string) => {
  const fromDate = parseDateInputValue(orderFrom)
  const toDate = parseDateInputValue(orderTo)

  if (!fromDate || !toDate) return 0

  const diff = toDate.getTime() - fromDate.getTime()
  if (diff < 0) return 0

  return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1
}

export const isRangeValid = (orderFrom?: string, orderTo?: string) => {
  const days = getDaysInRange(orderFrom, orderTo)
  if (!days) return false

  return days <= MAX_RANGE_DAYS
}

export const createDefaultRange = () => {
  const end = new Date()
  const start = subDays(end, 6)

  return {
    orderFrom: toDateInputValue(start),
    orderTo: toDateInputValue(end)
  }
}

export const resolvePresetRange = (preset: ShopeeRangePreset, now = new Date()) => {
  if (preset === "last-7-days") {
    return {
      orderFrom: toDateInputValue(subDays(now, 6)),
      orderTo: toDateInputValue(now)
    }
  }

  if (preset === "last-14-days") {
    return {
      orderFrom: toDateInputValue(subDays(now, 13)),
      orderTo: toDateInputValue(now)
    }
  }

  if (preset === "last-30-days") {
    return {
      orderFrom: toDateInputValue(subDays(now, 29)),
      orderTo: toDateInputValue(now)
    }
  }

  if (preset === "this-month") {
    return {
      orderFrom: toDateInputValue(startOfMonth(now)),
      orderTo: toDateInputValue(now)
    }
  }

  const lastMonthDate = subMonths(now, 1)
  return {
    orderFrom: toDateInputValue(startOfMonth(lastMonthDate)),
    orderTo: toDateInputValue(endOfMonth(lastMonthDate))
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
  orderFrom,
  orderTo
}: Pick<TimeFilterState, "channel" | "orderFrom" | "orderTo">) => ({
  channelId: channel,
  orderFrom,
  orderTo
})

export const buildOrdersQueryParams = ({
  mode,
  channel,
  month,
  year,
  orderFrom,
  orderTo,
  page,
  pageSize
}: TimeFilterState & {
  page: number
  pageSize: number
}): OrdersQueryRequest => {
  if (mode === "range") {
    return {
      channel,
      orderFrom,
      orderTo,
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
