import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import { SHOPEE_ALL_CHANNEL_ID } from "./shopeeDashboardApi"
import type {
  MonthlyKpisResponse,
  MonthlySummaryResponse,
  OrdersListResponse,
  OrdersQueryRequest,
  RangeSummaryResponse,
  RangeTimeseriesResponse,
  ShopeeDashboardMetricViewModel,
  ShopeeDashboardSummaryItem
} from "./models"

const normalizeNumber = (value: unknown) => {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

const getPaceStatus = (
  value: MonthlyKpisResponse["kpis"][number]["status"]
): ShopeeDashboardMetricViewModel["paceStatus"] => {
  if (value === "ahead") return "ahead"
  if (value === "behind") return "behind"
  if (value === "on_track") return "on-track"
  return "unknown"
}

const normalizeChannel = (channelId?: string) => {
  if (!channelId || channelId === SHOPEE_ALL_CHANNEL_ID) return undefined
  return channelId
}

const normalizeMonth = (month?: number) => {
  const currentMonth = new Date().getMonth() + 1

  if (typeof month !== "number" || Number.isNaN(month)) return currentMonth

  return Math.min(12, Math.max(1, Math.trunc(month)))
}

const normalizeYear = (year?: number) => {
  const currentYear = new Date().getFullYear()

  if (typeof year !== "number" || Number.isNaN(year)) return currentYear

  return Math.max(2000, Math.trunc(year))
}

const normalizePage = (page?: number) => {
  if (typeof page !== "number" || Number.isNaN(page)) return 1
  return Math.max(1, Math.trunc(page))
}

const normalizePageSize = (pageSize?: number) => {
  if (typeof pageSize !== "number" || Number.isNaN(pageSize)) return 10
  return Math.min(100, Math.max(5, Math.trunc(pageSize)))
}

export interface MonthlyMetricsViewModel {
  summaryItems: ShopeeDashboardSummaryItem[]
  metrics: ShopeeDashboardMetricViewModel[]
  expectedProgressPercentage: number
  lastSyncedAt: string | null
  timezone: string
  currency: "VND"
  isEmpty: boolean
}

export interface RangeNormalizedMetricItem {
  key: "revenuePerDay" | "ordersPerDay" | "adsCostPerDay" | "aov"
  label: string
  value: number
  format: "currency" | "decimal" | "integer"
  description: string
}

export interface RangeMetricsViewModel {
  summaryItems: ShopeeDashboardSummaryItem[]
  normalizedItems: RangeNormalizedMetricItem[]
  series: RangeTimeseriesResponse["series"]
  orderFrom: string
  orderTo: string
  days: number
  lastSyncedAt: string | null
  timezone: string
  currency: "VND"
  isPartialToday: boolean
  isEmpty: boolean
}

const adaptMonthlyMetrics = (
  summary: MonthlySummaryResponse,
  kpis: MonthlyKpisResponse
): MonthlyMetricsViewModel => {
  const summaryItems: ShopeeDashboardSummaryItem[] = [
    {
      key: "revenue",
      label: "Doanh thu hiện tại",
      value: normalizeNumber(summary.summary.currentRevenue),
      format: "currency",
      description: "Doanh thu thực tế theo phạm vi tháng đã chọn."
    },
    {
      key: "liveRevenue",
      label: "Doanh thu live hiện tại",
      value: normalizeNumber(summary.summary.liveRevenue),
      format: "currency",
      description: "Doanh thu live thực tế theo phạm vi tháng đã chọn."
    },
    {
      key: "adsCost",
      label: "Chi phí ads hiện tại",
      value: normalizeNumber(summary.summary.adsCost),
      format: "currency",
      description: "Chi phí ads thực tế theo phạm vi tháng đã chọn."
    },
    {
      key: "roas",
      label: "ROAS hiện tại",
      value: normalizeNumber(summary.summary.roas),
      format: "decimal",
      description: "ROAS thực tế theo phạm vi tháng đã chọn."
    },
    {
      key: "totalOrders",
      label: "Tổng số đơn hàng",
      value: normalizeNumber(summary.summary.totalOrders),
      format: "integer",
      description: "Tổng đơn hàng theo phạm vi tháng đã chọn."
    }
  ]

  const fallbackTargets: Record<"revenue" | "adsCost" | "roas", number> = {
    revenue: normalizeNumber(summary.summary.revenueTarget),
    adsCost: normalizeNumber(summary.summary.adsCostTarget),
    roas: normalizeNumber(summary.summary.roasTarget)
  }

  const metrics = kpis.kpis.map<ShopeeDashboardMetricViewModel>((item) => ({
    key: item.key,
    label: item.label,
    format: item.key === "roas" ? "decimal" : "currency",
    target: normalizeNumber(item.target || fallbackTargets[item.key]),
    actual: normalizeNumber(item.actual),
    achievedPercentage: normalizeNumber(item.actualProgressPercent),
    expectedPercentage: normalizeNumber(item.expectedProgressPercent),
    gapPercentage: normalizeNumber(item.deltaPercent),
    paceRatio: normalizeNumber(item.speedMultiplier),
    paceStatus: getPaceStatus(item.status)
  }))

  const values = [
    ...summaryItems.map((item) => item.value),
    ...metrics.map((item) => item.actual),
    ...metrics.map((item) => item.target)
  ]

  return {
    summaryItems,
    metrics,
    expectedProgressPercentage: normalizeNumber(
      summary.summary.expectedProgressPercent
    ),
    lastSyncedAt: summary.meta.lastSyncedAt,
    timezone: summary.meta.timezone,
    currency: summary.meta.currency,
    isEmpty: values.every((value) => normalizeNumber(value) === 0)
  }
}

const adaptRangeMetrics = (
  summary: RangeSummaryResponse,
  timeseries: RangeTimeseriesResponse
): RangeMetricsViewModel => {
  const summaryItems: ShopeeDashboardSummaryItem[] = [
    {
      key: "revenue",
      label: "Tổng doanh thu",
      value: normalizeNumber(summary.summary.netRevenue),
      format: "currency",
      description: "Doanh thu thuần trong khoảng thời gian đang chọn."
    },
    {
      key: "liveRevenue",
      label: "Tổng doanh thu live",
      value: normalizeNumber(summary.summary.liveRevenue),
      format: "currency",
      description: "Doanh thu live trong khoảng thời gian đang chọn."
    },
    {
      key: "adsCost",
      label: "Tổng chi phí ads",
      value: normalizeNumber(summary.summary.adsCost),
      format: "currency",
      description: "Chi phí ads trong khoảng thời gian đang chọn."
    },
    {
      key: "roas",
      label: "ROAS",
      value: normalizeNumber(summary.summary.roas),
      format: "decimal",
      description: "ROAS trong khoảng thời gian đang chọn."
    },
    {
      key: "totalOrders",
      label: "Tổng số đơn hàng",
      value: normalizeNumber(summary.summary.totalOrders),
      format: "integer",
      description: "Tổng đơn hàng trong khoảng thời gian đang chọn."
    }
  ]

  const normalizedItems: RangeNormalizedMetricItem[] = [
    {
      key: "revenuePerDay",
      label: "Doanh thu / ngày",
      value: normalizeNumber(summary.summary.revenuePerDay),
      format: "currency",
      description: "Trung bình doanh thu thuần mỗi ngày."
    },
    {
      key: "ordersPerDay",
      label: "Đơn hàng / ngày",
      value: normalizeNumber(summary.summary.ordersPerDay),
      format: "decimal",
      description: "Trung bình số đơn hàng mỗi ngày."
    },
    {
      key: "adsCostPerDay",
      label: "Ads cost / ngày",
      value: normalizeNumber(summary.summary.adsCostPerDay),
      format: "currency",
      description: "Trung bình chi phí ads mỗi ngày."
    },
    {
      key: "aov",
      label: "AOV",
      value: normalizeNumber(summary.summary.aov),
      format: "currency",
      description: "Giá trị đơn hàng trung bình."
    }
  ]

  const values = [
    ...summaryItems.map((item) => item.value),
    ...normalizedItems.map((item) => item.value),
    ...timeseries.series.map((item) => normalizeNumber(item.revenue)),
    ...timeseries.series.map((item) => normalizeNumber(item.adsCost)),
    ...timeseries.series.map((item) => normalizeNumber(item.orders))
  ]

  return {
    summaryItems,
    normalizedItems,
    series: timeseries.series,
    orderFrom: summary.scope.orderFrom,
    orderTo: summary.scope.orderTo,
    days: normalizeNumber(summary.scope.days),
    lastSyncedAt: summary.meta.lastSyncedAt,
    timezone: summary.meta.timezone,
    currency: summary.meta.currency,
    isPartialToday: summary.meta.isPartialToday,
    isEmpty: values.every((value) => normalizeNumber(value) === 0)
  }
}

export const useMonthlyMetrics = ({
  month,
  year,
  channelId,
  enabled = true
}: {
  month?: number
  year?: number
  channelId?: string
  enabled?: boolean
}) => {
  const { accessToken } = useUserStore()
  const normalizedMonth = normalizeMonth(month)
  const normalizedYear = normalizeYear(year)
  const normalizedChannel = normalizeChannel(channelId)

  return useQuery({
    queryKey: [
      "shopee",
      "monthlyMetrics",
      normalizedMonth,
      normalizedYear,
      normalizedChannel || SHOPEE_ALL_CHANNEL_ID
    ],
    queryFn: async () => {
      const summaryQuery = toQueryString({
        channel: normalizedChannel,
        month: normalizedMonth,
        year: normalizedYear
      })
      const kpisQuery = toQueryString({
        channel: normalizedChannel,
        month: normalizedMonth,
        year: normalizedYear
      })

      const [summaryResponse, kpisResponse] = await Promise.all([
        callApi<never, MonthlySummaryResponse>({
          method: "GET",
          path: `/v1/shopee/incomes/monthly-summary?${summaryQuery}`,
          token: accessToken
        }),
        callApi<never, MonthlyKpisResponse>({
          method: "GET",
          path: `/v1/shopee/incomes/monthly-kpis?${kpisQuery}`,
          token: accessToken
        })
      ])

      return adaptMonthlyMetrics(summaryResponse.data, kpisResponse.data)
    },
    enabled: enabled && Boolean(accessToken),
    placeholderData: (previousData) => previousData
  })
}

export const useRangeMetrics = ({
  orderFrom,
  orderTo,
  channelId,
  enabled = true
}: {
  orderFrom?: string
  orderTo?: string
  channelId?: string
  enabled?: boolean
}) => {
  const { accessToken } = useUserStore()
  const normalizedChannel = normalizeChannel(channelId)

  return useQuery({
    queryKey: [
      "shopee",
      "rangeMetrics",
      normalizedChannel || SHOPEE_ALL_CHANNEL_ID,
      orderFrom || "",
      orderTo || ""
    ],
    queryFn: async () => {
      const query = toQueryString({
        channel: normalizedChannel,
        orderFrom,
        orderTo
      })

      const [summaryResponse, timeseriesResponse] = await Promise.all([
        callApi<never, RangeSummaryResponse>({
          method: "GET",
          path: `/v1/shopee/analytics/range-summary?${query}`,
          token: accessToken
        }),
        callApi<never, RangeTimeseriesResponse>({
          method: "GET",
          path: `/v1/shopee/analytics/range-timeseries?${query}`,
          token: accessToken
        })
      ])

      return adaptRangeMetrics(summaryResponse.data, timeseriesResponse.data)
    },
    enabled:
      enabled && Boolean(accessToken) && Boolean(orderFrom) && Boolean(orderTo),
    placeholderData: (previousData) => previousData
  })
}

export const useShopeeOrdersList = ({
  request,
  enabled = true
}: {
  request: OrdersQueryRequest
  enabled?: boolean
}) => {
  const { accessToken } = useUserStore()
  const queryRequest: OrdersQueryRequest = {
    channel: normalizeChannel(request.channel),
    month:
      typeof request.month === "number"
        ? normalizeMonth(request.month)
        : undefined,
    year:
      typeof request.year === "number"
        ? normalizeYear(request.year)
        : undefined,
    orderFrom: request.orderFrom,
    orderTo: request.orderTo,
    page: normalizePage(request.page),
    pageSize: normalizePageSize(request.pageSize),
    sortBy: request.sortBy === "date" ? "orderDate" : request.sortBy,
    sortOrder: request.sortOrder
  }

  return useQuery({
    queryKey: [
      "shopee",
      "orders",
      queryRequest.channel || SHOPEE_ALL_CHANNEL_ID,
      queryRequest.month || "",
      queryRequest.year || "",
      queryRequest.orderFrom || "",
      queryRequest.orderTo || "",
      queryRequest.page,
      queryRequest.pageSize,
      queryRequest.sortBy || "",
      queryRequest.sortOrder || ""
    ],
    queryFn: () => {
      const query = toQueryString(queryRequest)

      return callApi<never, OrdersListResponse>({
        method: "GET",
        path: `/v1/shopee/orders?${query}`,
        token: accessToken
      })
    },
    select: (response) => response.data,
    enabled: enabled && Boolean(accessToken),
    placeholderData: (previousData) => previousData
  })
}

export const useRangeSeriesByMetric = (
  data?: RangeMetricsViewModel["series"]
) => {
  return useMemo(() => {
    if (!data) return []

    return data.map((point) => ({
      ...point,
      label: point.orderDate.slice(5).split("-").reverse().join("/")
    }))
  }, [data])
}
