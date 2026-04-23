import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  addMonths,
  endOfMonth,
  getDaysInMonth,
  isAfter,
  isValid,
  parseISO,
  startOfMonth
} from "date-fns"
import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import { SHOPEE_ALL_CHANNEL_ID } from "./shopeeDashboardApi"
import type {
  GetShopeeMonthKpisResponse,
  LivestreamChannel,
  MonthlyKpisResponse,
  MonthlyKpiItem,
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

const safeDivide = (numerator: number, denominator: number) => {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return 0
  if (denominator <= 0) return 0

  return numerator / denominator
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

const parseDateValue = (value?: string) => {
  if (!value) return null

  const parsed = parseISO(value)
  if (!isValid(parsed)) return null

  return parsed
}

const getRangeMonthSegments = (orderFrom?: string, orderTo?: string) => {
  const fromDate = parseDateValue(orderFrom)
  const toDate = parseDateValue(orderTo)

  if (!fromDate || !toDate || isAfter(fromDate, toDate)) return []

  const segments: Array<{ month: number; year: number; days: number }> = []
  let cursor = startOfMonth(fromDate)

  while (!isAfter(cursor, toDate)) {
    const segmentStart = Math.max(cursor.getTime(), fromDate.getTime())
    const segmentEnd = Math.min(endOfMonth(cursor).getTime(), toDate.getTime())
    const days =
      Math.floor((segmentEnd - segmentStart) / (24 * 60 * 60 * 1000)) + 1

    segments.push({
      month: cursor.getMonth() + 1,
      year: cursor.getFullYear(),
      days
    })

    cursor = addMonths(cursor, 1)
  }

  return segments
}

export interface MonthlyMetricsViewModel {
  summaryItems: ShopeeDashboardSummaryItem[]
  metrics: ShopeeDashboardMetricViewModel[]
  expectedProgressPercentage: number
  revenueTarget: number
  lastSyncedAt: string | null
  timezone: string
  currency: "VND"
  isEmpty: boolean
}

export interface MonthlyChannelComparisonMetricViewModel {
  actual: number
  target: number | null
  achievedPercentage: number | null
  expectedPercentage: number | null
  expectedValue: number | null
  format: "currency" | "decimal"
}

export interface MonthlyChannelComparisonRowViewModel {
  channelId: string
  channelName: string
  revenue: MonthlyChannelComparisonMetricViewModel
  liveRevenue: MonthlyChannelComparisonMetricViewModel
  adsCost: MonthlyChannelComparisonMetricViewModel
  roas: MonthlyChannelComparisonMetricViewModel
  totalOrders: number
  adsRevenueRatio: number
  lastSyncedAt: string | null
}

export interface MonthlyChannelComparisonViewModel {
  rows: MonthlyChannelComparisonRowViewModel[]
  totals: MonthlyChannelComparisonRowViewModel
  shopCount: number
  lastSyncedAt: string | null
  isEmpty: boolean
}

export interface RangeNormalizedMetricItem {
  key:
    | "revenuePerDay"
    | "ordersPerDay"
    | "adsCostPerDay"
    | "aov"
    | "adsRevenueRatio"
  label: string
  value: number
  format: "currency" | "decimal" | "integer" | "percentage"
  description: string
}

export interface RangeMetricsViewModel {
  summaryItems: ShopeeDashboardSummaryItem[]
  normalizedItems: RangeNormalizedMetricItem[]
  rangeRevenueTarget: number
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
  const currentRevenue = normalizeNumber(summary.summary.currentRevenue)
  const adsCost = normalizeNumber(summary.summary.adsCost)
  const revenueTarget = normalizeNumber(summary.summary.revenueTarget)
  const adsRevenueRatio = safeDivide(adsCost, currentRevenue) * 100
  const revenueVsMonthlyKpi = safeDivide(currentRevenue, revenueTarget) * 100

  const summaryItems: ShopeeDashboardSummaryItem[] = [
    {
      key: "revenue",
      label: "Doanh thu hiện tại",
      value: currentRevenue,
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
      value: adsCost,
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
    },
    {
      key: "adsRevenueRatio",
      label: "% Ads so với doanh thu tháng",
      value: adsRevenueRatio,
      format: "percentage",
      description:
        "Tỷ lệ chi phí ads trên doanh thu thực tế của tháng đang chọn."
    },
    {
      key: "avgRevenuePerDayVsKpi",
      label: "% DT so với KPI tháng",
      value: revenueVsMonthlyKpi,
      format: "percentage",
      description: "So sánh doanh thu thực tế hiện tại với KPI doanh thu tháng."
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
    revenueTarget,
    lastSyncedAt: summary.meta.lastSyncedAt,
    timezone: summary.meta.timezone,
    currency: summary.meta.currency,
    isEmpty: values.every((value) => normalizeNumber(value) === 0)
  }
}

const adaptRangeMetrics = (
  summary: RangeSummaryResponse,
  timeseries: RangeTimeseriesResponse,
  rangeRevenueTarget: number
): RangeMetricsViewModel => {
  const netRevenue = normalizeNumber(summary.summary.netRevenue)
  const adsRevenueRatio =
    safeDivide(normalizeNumber(summary.summary.adsCost), netRevenue) * 100

  const summaryItems: ShopeeDashboardSummaryItem[] = [
    {
      key: "revenue",
      label: "Tổng doanh thu",
      value: netRevenue,
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
    },
    {
      key: "adsRevenueRatio",
      label: "% Ads so với doanh thu",
      value: adsRevenueRatio,
      format: "percentage",
      description: "Tỷ lệ chi phí ads trên doanh thu thuần trong khoảng ngày đang chọn."
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
    rangeRevenueTarget,
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

const findMonthlyKpiItem = (
  kpis: MonthlyKpiItem[],
  key: MonthlyKpiItem["key"]
) => {
  return kpis.find((item) => item.key === key)
}

const resolveLatestSyncedAt = (
  current?: string | null,
  candidate?: string | null
) => {
  if (!candidate) return current ?? null
  if (!current) return candidate

  const currentTime = new Date(current).getTime()
  const candidateTime = new Date(candidate).getTime()

  if (Number.isNaN(currentTime)) return candidate
  if (Number.isNaN(candidateTime)) return current

  return candidateTime > currentTime ? candidate : current
}

const buildMonthlyComparisonMetric = ({
  actual,
  target,
  achievedPercentage,
  expectedPercentage,
  expectedValue,
  format
}: {
  actual: number
  target?: number | null
  achievedPercentage?: number | null
  expectedPercentage?: number | null
  expectedValue?: number | null
  format: "currency" | "decimal"
}): MonthlyChannelComparisonMetricViewModel => ({
  actual: normalizeNumber(actual),
  target:
    typeof target === "number" && Number.isFinite(target)
      ? normalizeNumber(target)
      : null,
  achievedPercentage:
    typeof achievedPercentage === "number" && Number.isFinite(achievedPercentage)
      ? normalizeNumber(achievedPercentage)
      : null,
  expectedPercentage:
    typeof expectedPercentage === "number" && Number.isFinite(expectedPercentage)
      ? normalizeNumber(expectedPercentage)
      : null,
  expectedValue:
    typeof expectedValue === "number" && Number.isFinite(expectedValue)
      ? normalizeNumber(expectedValue)
      : typeof target === "number" &&
          Number.isFinite(target) &&
          typeof expectedPercentage === "number" &&
          Number.isFinite(expectedPercentage)
        ? normalizeNumber((target * expectedPercentage) / 100)
      : null,
  format
})

const adaptMonthlyChannelComparisonRow = (
  channel: Pick<LivestreamChannel, "_id" | "name">,
  summary: MonthlySummaryResponse,
  kpis: MonthlyKpisResponse
): MonthlyChannelComparisonRowViewModel => {
  const revenueKpi = findMonthlyKpiItem(kpis.kpis, "revenue")
  const adsCostKpi = findMonthlyKpiItem(kpis.kpis, "adsCost")
  const roasKpi = findMonthlyKpiItem(kpis.kpis, "roas")
  const revenueActual = normalizeNumber(summary.summary.currentRevenue)
  const liveRevenueActual = normalizeNumber(summary.summary.liveRevenue)
  const adsCostActual = normalizeNumber(summary.summary.adsCost)
  const revenueExpectedValue =
    revenueKpi?.target && revenueKpi.expectedProgressPercent !== undefined
      ? (revenueKpi.target * revenueKpi.expectedProgressPercent) / 100
      : undefined
  const adsCostExpectedValue =
    adsCostKpi?.target && adsCostKpi.expectedProgressPercent !== undefined
      ? (adsCostKpi.target * adsCostKpi.expectedProgressPercent) / 100
      : undefined
  const roasExpectedValue =
    typeof revenueExpectedValue === "number" &&
    typeof adsCostExpectedValue === "number"
      ? safeDivide(revenueExpectedValue, adsCostExpectedValue)
      : undefined

  return {
    channelId: channel._id,
    channelName: channel.name,
    revenue: buildMonthlyComparisonMetric({
      actual: revenueActual,
      target: revenueKpi?.target || summary.summary.revenueTarget,
      achievedPercentage:
        revenueKpi?.actualProgressPercent ||
        summary.summary.actualRevenueProgressPercent,
      expectedPercentage: revenueKpi?.expectedProgressPercent,
      format: "currency"
    }),
    liveRevenue: buildMonthlyComparisonMetric({
      actual: liveRevenueActual,
      format: "currency"
    }),
    adsCost: buildMonthlyComparisonMetric({
      actual: adsCostActual,
      target: adsCostKpi?.target || summary.summary.adsCostTarget,
      achievedPercentage:
        adsCostKpi?.actualProgressPercent ||
        summary.summary.actualAdsCostProgressPercent,
      expectedPercentage: adsCostKpi?.expectedProgressPercent,
      format: "currency"
    }),
    roas: buildMonthlyComparisonMetric({
      actual: normalizeNumber(summary.summary.roas),
      target: roasKpi?.target || summary.summary.roasTarget,
      achievedPercentage:
        roasKpi?.actualProgressPercent ||
        summary.summary.actualRoasProgressPercent,
      expectedPercentage:
        roasKpi?.target && typeof roasExpectedValue === "number"
          ? safeDivide(roasExpectedValue, roasKpi.target) * 100
          : roasKpi?.expectedProgressPercent,
      expectedValue: roasExpectedValue,
      format: "decimal"
    }),
    totalOrders: normalizeNumber(summary.summary.totalOrders),
    adsRevenueRatio: safeDivide(adsCostActual, revenueActual) * 100,
    lastSyncedAt: resolveLatestSyncedAt(
      summary.meta.lastSyncedAt,
      kpis.meta.lastSyncedAt
    )
  }
}

const buildMonthlyComparisonTotals = (
  rows: MonthlyChannelComparisonRowViewModel[]
): MonthlyChannelComparisonRowViewModel => {
  const revenueActual = rows.reduce((total, row) => total + row.revenue.actual, 0)
  const revenueTarget = rows.reduce(
    (total, row) => total + (row.revenue.target ?? 0),
    0
  )
  const liveRevenueActual = rows.reduce(
    (total, row) => total + row.liveRevenue.actual,
    0
  )
  const adsCostActual = rows.reduce((total, row) => total + row.adsCost.actual, 0)
  const adsCostTarget = rows.reduce(
    (total, row) => total + (row.adsCost.target ?? 0),
    0
  )
  const totalOrders = rows.reduce((total, row) => total + row.totalOrders, 0)
  const roasActual = safeDivide(revenueActual, adsCostActual)
  const roasTarget = safeDivide(revenueTarget, adsCostTarget)
  const revenueExpectedValue = rows.reduce(
    (total, row) => total + (row.revenue.expectedValue ?? 0),
    0
  )
  const adsCostExpectedValue = rows.reduce(
    (total, row) => total + (row.adsCost.expectedValue ?? 0),
    0
  )
  const roasExpectedValue = rows.reduce(
    (total, row) => total + (row.revenue.expectedValue ?? 0),
    0
  )
  const roasExpectedAdsValue = rows.reduce(
    (total, row) => total + (row.adsCost.expectedValue ?? 0),
    0
  )
  const roasExpectedMetricValue = safeDivide(roasExpectedValue, roasExpectedAdsValue)
  const latestSyncedAt = rows.reduce<string | null>(
    (latest, row) => resolveLatestSyncedAt(latest, row.lastSyncedAt),
    null
  )

  return {
    channelId: "total",
    channelName: `Tổng ${rows.length} shop`,
    revenue: buildMonthlyComparisonMetric({
      actual: revenueActual,
      target: revenueTarget,
      achievedPercentage: safeDivide(revenueActual, revenueTarget) * 100,
      expectedPercentage: safeDivide(revenueExpectedValue, revenueTarget) * 100,
      format: "currency"
    }),
    liveRevenue: buildMonthlyComparisonMetric({
      actual: liveRevenueActual,
      format: "currency"
    }),
    adsCost: buildMonthlyComparisonMetric({
      actual: adsCostActual,
      target: adsCostTarget,
      achievedPercentage: safeDivide(adsCostActual, adsCostTarget) * 100,
      expectedPercentage: safeDivide(adsCostExpectedValue, adsCostTarget) * 100,
      format: "currency"
    }),
    roas: buildMonthlyComparisonMetric({
      actual: roasActual,
      target: roasTarget > 0 ? roasTarget : null,
      achievedPercentage: safeDivide(roasActual, roasTarget) * 100,
      expectedPercentage:
        roasTarget > 0
          ? safeDivide(roasExpectedMetricValue, roasTarget) * 100
          : null,
      expectedValue: roasExpectedMetricValue,
      format: "decimal"
    }),
    totalOrders,
    adsRevenueRatio: safeDivide(adsCostActual, revenueActual) * 100,
    lastSyncedAt: latestSyncedAt
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

export const useMonthlyChannelComparison = ({
  month,
  year,
  channels,
  enabled = true
}: {
  month?: number
  year?: number
  channels: Array<Pick<LivestreamChannel, "_id" | "name">>
  enabled?: boolean
}) => {
  const { accessToken } = useUserStore()
  const normalizedMonth = normalizeMonth(month)
  const normalizedYear = normalizeYear(year)
  const channelKeys = useMemo(
    () => channels.map((channel) => `${channel._id}:${channel.name}`),
    [channels]
  )

  return useQuery({
    queryKey: [
      "shopee",
      "monthlyChannelComparison",
      normalizedMonth,
      normalizedYear,
      channelKeys
    ],
    queryFn: async (): Promise<MonthlyChannelComparisonViewModel> => {
      const rows = await Promise.all(
        channels.map(async (channel) => {
          const query = toQueryString({
            channel: channel._id,
            month: normalizedMonth,
            year: normalizedYear
          })

          const [summaryResponse, kpisResponse] = await Promise.all([
            callApi<never, MonthlySummaryResponse>({
              method: "GET",
              path: `/v1/shopee/incomes/monthly-summary?${query}`,
              token: accessToken
            }),
            callApi<never, MonthlyKpisResponse>({
              method: "GET",
              path: `/v1/shopee/incomes/monthly-kpis?${query}`,
              token: accessToken
            })
          ])

          return adaptMonthlyChannelComparisonRow(
            channel,
            summaryResponse.data,
            kpisResponse.data
          )
        })
      )

      const sortedRows = [...rows].sort(
        (left, right) => right.revenue.actual - left.revenue.actual
      )
      const totals = buildMonthlyComparisonTotals(sortedRows)
      const lastSyncedAt = resolveLatestSyncedAt(
        totals.lastSyncedAt,
        null
      )

      return {
        rows: sortedRows,
        totals,
        shopCount: sortedRows.length,
        lastSyncedAt,
        isEmpty: sortedRows.every(
          (row) =>
            row.revenue.actual === 0 &&
            row.liveRevenue.actual === 0 &&
            row.adsCost.actual === 0 &&
            row.roas.actual === 0 &&
            row.totalOrders === 0
        )
      }
    },
    enabled: enabled && Boolean(accessToken) && channels.length > 0,
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
      const monthSegments = getRangeMonthSegments(orderFrom, orderTo)

      const [summaryResponse, timeseriesResponse, ...monthKpiResponses] =
        await Promise.all([
        callApi<never, RangeSummaryResponse>({
          method: "GET",
          path: `/v1/shopee/analytics/range-summary?${query}`,
          token: accessToken
        }),
        callApi<never, RangeTimeseriesResponse>({
          method: "GET",
          path: `/v1/shopee/analytics/range-timeseries?${query}`,
          token: accessToken
        }),
        ...monthSegments.map((segment) =>
          callApi<never, GetShopeeMonthKpisResponse>({
            method: "GET",
            path: `/v1/shopeemonthkpis?${toQueryString({
              page: 1,
              limit: 999,
              month: segment.month,
              year: segment.year,
              channel: normalizedChannel
            })}`,
            token: accessToken
          })
        )
      ])

      const rangeRevenueTarget = monthSegments.reduce((total, segment, index) => {
        const records = monthKpiResponses[index]?.data.data ?? []
        const monthlyRevenueTarget = records.reduce(
          (sum, item) => sum + normalizeNumber(item.revenueKpi),
          0
        )
        const daysInMonth = getDaysInMonth(new Date(segment.year, segment.month - 1))

        return total + safeDivide(monthlyRevenueTarget, daysInMonth) * segment.days
      }, 0)

      return adaptRangeMetrics(
        summaryResponse.data,
        timeseriesResponse.data,
        rangeRevenueTarget
      )
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
