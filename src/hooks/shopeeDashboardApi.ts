import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import type {
  LivestreamChannel,
  SearchLivestreamChannelsRequest,
  SearchLivestreamChannelsResponse,
  ShopeeChannelOption,
  ShopeeDashboardMetricViewModel,
  ShopeeDashboardOverviewRequest,
  ShopeeDashboardOverviewResponse,
  ShopeeDashboardOverviewViewModel,
  ShopeeDashboardRevenueAdjustment,
  ShopeeDashboardRevenueAdjustmentMode,
  ShopeeDashboardSummaryItem
} from "./models"
export type {
  ShopeeChannelOption,
  ShopeeDashboardMetricViewModel,
  ShopeeDashboardOverviewViewModel,
  ShopeeDashboardRevenueAdjustment,
  ShopeeDashboardSummaryItem
} from "./models"

export const SHOPEE_ALL_CHANNEL_ID = "all"
export const SHOPEE_ALL_CHANNEL_LABEL = "Tất cả kênh Shopee"

type AccessTokenArgs = {
  accessToken?: string
}

const normalizeNumber = (value: unknown) => {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

const normalizeMonth = (month?: number) => {
  const currentMonth = new Date().getMonth() + 1

  if (typeof month !== "number" || Number.isNaN(month)) {
    return currentMonth
  }

  return Math.min(12, Math.max(1, Math.trunc(month)))
}

const normalizeYear = (year?: number) => {
  const currentYear = new Date().getFullYear()

  if (typeof year !== "number" || Number.isNaN(year)) {
    return currentYear
  }

  return Math.max(2000, Math.trunc(year))
}

const formatDateLabel = (value?: string) => {
  if (!value) return "Chưa có ngày cập nhật"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa có ngày cập nhật"

  return date.toLocaleDateString("vi-VN")
}

const mapShopeeOverviewRevenueActual = (value: unknown) => {
  return {
    label: "Doanh thu hiện tại",
    value: normalizeNumber(value),
    description: "Doanh thu đã được backend tổng hợp cho phạm vi đang chọn."
  }
}

const mapShopeeOverviewLiveRevenueActual = (value: unknown) => {
  return {
    label: "Doanh thu live hiện tại",
    value: normalizeNumber(value),
    description:
      "Doanh thu live Shopee đã được backend tổng hợp cho phạm vi đang chọn."
  }
}

const getPaceStatus = (
  paceRatio: number
): ShopeeDashboardMetricViewModel["paceStatus"] => {
  if (!Number.isFinite(paceRatio)) return "unknown"
  if (paceRatio === 1) return "on-track"
  if (paceRatio > 1) return "ahead"
  return "behind"
}

const safeDivide = (numerator: number, denominator: number) => {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return 0
  if (denominator <= 0) return 0

  return numerator / denominator
}

const calculateAchievedPercentage = (actual: number, target: number) => {
  return safeDivide(actual, target) * 100
}

const calculateGapPercentage = (achieved: number, expected: number) => {
  return achieved - expected
}

const calculatePaceRatio = (achieved: number, expected: number) => {
  return safeDivide(achieved, expected)
}

const calculateRoas = (revenue: number, adsCost: number) => {
  return safeDivide(revenue, adsCost)
}

export const normalizeShopeeRevenueAdjustment = (
  adjustment?: Partial<ShopeeDashboardRevenueAdjustment>
): ShopeeDashboardRevenueAdjustment => {
  const mode: ShopeeDashboardRevenueAdjustmentMode =
    adjustment?.mode === "override" ? "override" : "additive"

  return {
    mode,
    manualRevenue: Math.max(0, normalizeNumber(adjustment?.manualRevenue))
  }
}

export const normalizeShopeeChannelsRequest = (
  request: Partial<SearchLivestreamChannelsRequest> = {}
): SearchLivestreamChannelsRequest => {
  return {
    searchText: request.searchText ?? "",
    platform: "shopee",
    page: request.page ?? 1,
    limit: request.limit ?? 100
  }
}

export const normalizeShopeeDashboardOverviewRequest = (
  request: Partial<ShopeeDashboardOverviewRequest> = {}
): ShopeeDashboardOverviewRequest => {
  const channelId = request.channelId?.trim()

  return {
    month: normalizeMonth(request.month),
    year: normalizeYear(request.year),
    channelId: !channelId || channelId === SHOPEE_ALL_CHANNEL_ID ? SHOPEE_ALL_CHANNEL_ID : channelId
  }
}

export const fetchShopeeChannels = ({
  accessToken,
  request
}: AccessTokenArgs & {
  request?: Partial<SearchLivestreamChannelsRequest>
}) => {
  const query = toQueryString(normalizeShopeeChannelsRequest(request))

  return callApi<never, SearchLivestreamChannelsResponse>({
    method: "GET",
    path: `/v1/livestreamchannels/search?${query}`,
    token: accessToken
  })
}

export const fetchShopeeDashboardOverview = ({
  accessToken,
  request
}: AccessTokenArgs & {
  request?: Partial<ShopeeDashboardOverviewRequest>
}) => {
  const query = toQueryString(normalizeShopeeDashboardOverviewRequest(request))

  return callApi<never, ShopeeDashboardOverviewResponse>({
    method: "GET",
    path: `/v1/shopeedashboard/overview?${query}`,
    token: accessToken
  })
}

export const buildShopeeChannelOptions = (channels: LivestreamChannel[]) => {
  const channelOptions: ShopeeChannelOption[] = channels.map((channel) => ({
    value: channel._id,
    label: channel.name
  }))

  return [
    {
      value: SHOPEE_ALL_CHANNEL_ID,
      label: SHOPEE_ALL_CHANNEL_LABEL
    },
    ...channelOptions
  ]
}

export const adaptShopeeDashboardOverview = (
  overview: ShopeeDashboardOverviewResponse
): ShopeeDashboardOverviewViewModel => {
  const revenueActual = mapShopeeOverviewRevenueActual(overview.actuals.revenue)
  const liveRevenueActual = mapShopeeOverviewLiveRevenueActual(
    overview.actuals.liveRevenue
  )
  const progressRevenueActual = mapShopeeOverviewRevenueActual(
    overview.progress.revenue.actual
  )

  const currentDateLabel = formatDateLabel(overview.scope.currentDate)
  const scopeLabel =
    overview.scope.type === "all"
      ? SHOPEE_ALL_CHANNEL_LABEL
      : overview.channel?.name || "Kênh Shopee"
  const originalRevenue = revenueActual.value
  const originalRoas = normalizeNumber(overview.actuals.roas)

  const summaryItems: ShopeeDashboardSummaryItem[] = [
    {
      key: "revenue",
      label: revenueActual.label,
      value: revenueActual.value,
      description: revenueActual.description,
      format: "currency",
      originalValue: revenueActual.value
    },
    {
      key: "liveRevenue",
      label: liveRevenueActual.label,
      value: liveRevenueActual.value,
      description: liveRevenueActual.description,
      format: "currency"
    },
    {
      key: "adsCost",
      label: "Chi phí ads hiện tại",
      value: normalizeNumber(overview.actuals.adsCost),
      description: "Chi phí ads đã được backend tổng hợp cho phạm vi đang chọn.",
      format: "currency"
    },
    {
      key: "roas",
      label: "ROAS hiện tại",
      value: originalRoas,
      description: "ROAS hiện tại lấy trực tiếp từ overview backend.",
      format: "decimal",
      originalValue: originalRoas
    },
    {
      key: "totalOrders",
      label: "Tổng số đơn hàng",
      value: normalizeNumber(overview.actuals.totalOrders),
      description: "Tổng số đơn hàng đã được backend tổng hợp.",
      format: "integer"
    }
  ]

  const metrics: ShopeeDashboardMetricViewModel[] = [
    {
      key: "revenue",
      label: "KPI doanh thu",
      format: "currency",
      target: normalizeNumber(overview.progress.revenue.target),
      actual: progressRevenueActual.value,
      originalActual: progressRevenueActual.value,
      achievedPercentage: normalizeNumber(
        overview.progress.revenue.achievedPercentage
      ),
      expectedPercentage: normalizeNumber(
        overview.progress.revenue.expectedPercentage
      ),
      gapPercentage: normalizeNumber(overview.progress.revenue.gapPercentage),
      paceRatio: normalizeNumber(overview.progress.revenue.paceRatio),
      paceStatus: getPaceStatus(normalizeNumber(overview.progress.revenue.paceRatio))
    },
    {
      key: "adsCost",
      label: "KPI chi phí ads",
      format: "currency",
      target: normalizeNumber(overview.progress.adsCost.target),
      actual: normalizeNumber(overview.progress.adsCost.actual),
      achievedPercentage: normalizeNumber(
        overview.progress.adsCost.achievedPercentage
      ),
      expectedPercentage: normalizeNumber(
        overview.progress.adsCost.expectedPercentage
      ),
      gapPercentage: normalizeNumber(overview.progress.adsCost.gapPercentage),
      paceRatio: normalizeNumber(overview.progress.adsCost.paceRatio),
      paceStatus: getPaceStatus(normalizeNumber(overview.progress.adsCost.paceRatio))
    },
    {
      key: "roas",
      label: "KPI ROAS",
      format: "decimal",
      target: normalizeNumber(overview.progress.roas.target),
      actual: originalRoas,
      originalActual: originalRoas,
      achievedPercentage: normalizeNumber(overview.progress.roas.achievedPercentage),
      expectedPercentage: normalizeNumber(overview.progress.roas.expectedPercentage),
      gapPercentage: normalizeNumber(overview.progress.roas.gapPercentage),
      paceRatio: normalizeNumber(overview.progress.roas.paceRatio),
      paceStatus: getPaceStatus(normalizeNumber(overview.progress.roas.paceRatio))
    }
  ]

  const allValues = [
    overview.targets.revenueKpi,
    overview.targets.adsCostKpi,
    overview.targets.roasKpi,
    overview.actuals.revenue,
    overview.actuals.liveRevenue,
    overview.actuals.adsCost,
    overview.actuals.roas,
    overview.actuals.totalOrders
  ].map(normalizeNumber)

  return {
    scope: overview.scope,
    channel: overview.channel,
    scopeLabel,
    scopeDescription: `Đã qua ${normalizeNumber(overview.scope.elapsedDays)}/${normalizeNumber(
      overview.scope.totalDays
    )} ngày, cập nhật ${currentDateLabel}`,
    summaryItems,
    metrics,
    expectedProgressPercentage: normalizeNumber(
      overview.scope.expectedProgressPercentage
    ),
    elapsedDays: normalizeNumber(overview.scope.elapsedDays),
    totalDays: normalizeNumber(overview.scope.totalDays),
    currentDateLabel,
    originalRevenue,
    adjustedRevenue: originalRevenue,
    originalRoas,
    adjustedRoas: originalRoas,
    revenueAdjustment: {
      mode: "additive",
      manualRevenue: 0,
      originalRevenue,
      adjustedRevenue: originalRevenue,
      originalRoas,
      adjustedRoas: originalRoas,
      isAdjusted: false,
      note: undefined
    },
    isEmpty: allValues.every((value) => value === 0)
  }
}

export const applyRevenueAdjustment = (
  viewModel: ShopeeDashboardOverviewViewModel,
  adjustment?: Partial<ShopeeDashboardRevenueAdjustment>
): ShopeeDashboardOverviewViewModel => {
  const normalizedAdjustment = normalizeShopeeRevenueAdjustment(adjustment)
  const isAdjusted =
    normalizedAdjustment.mode === "override" || normalizedAdjustment.manualRevenue > 0

  const adjustedRevenue =
    normalizedAdjustment.mode === "override"
      ? normalizedAdjustment.manualRevenue
      : viewModel.originalRevenue + normalizedAdjustment.manualRevenue

  const adsCost =
    viewModel.summaryItems.find((item) => item.key === "adsCost")?.value ?? 0
  const adjustedRoas = calculateRoas(adjustedRevenue, adsCost)

  const metrics = viewModel.metrics.map((metric) => {
    if (metric.key !== "revenue" && metric.key !== "roas") {
      return metric
    }

    const actual = metric.key === "revenue" ? adjustedRevenue : adjustedRoas
    const achievedPercentage = calculateAchievedPercentage(actual, metric.target)
    const gapPercentage = calculateGapPercentage(
      achievedPercentage,
      metric.expectedPercentage
    )
    const paceRatio = calculatePaceRatio(
      achievedPercentage,
      metric.expectedPercentage
    )

    return {
      ...metric,
      actual,
      achievedPercentage,
      gapPercentage,
      paceRatio,
      paceStatus: getPaceStatus(paceRatio),
      isAdjusted
    }
  })

  const summaryItems = viewModel.summaryItems.map((item) => {
    if (item.key === "revenue") {
      return {
        ...item,
        value: adjustedRevenue,
        originalValue: viewModel.originalRevenue,
        isAdjusted,
        description: isAdjusted
          ? "Đã bao gồm điều chỉnh thủ công để phản ánh doanh thu vận hành."
          : item.description
      }
    }

    if (item.key === "roas") {
      return {
        ...item,
        value: adjustedRoas,
        originalValue: viewModel.originalRoas,
        isAdjusted,
        description: isAdjusted
          ? "ROAS đã được tính lại từ doanh thu điều chỉnh và chi phí ads hiện tại."
          : item.description
      }
    }

    return item
  })

  const adjustmentNote = isAdjusted
    ? normalizedAdjustment.mode === "override"
      ? "Đã dùng doanh thu ghi đè thủ công cho KPI doanh thu và ROAS."
      : "Đã cộng thêm doanh thu thủ công vào KPI doanh thu và ROAS."
    : undefined

  const valuesForEmptyState = [
    adjustedRevenue,
    adsCost,
    adjustedRoas,
    ...metrics.map((metric) => metric.target),
    ...summaryItems.map((item) => item.value)
  ]

  return {
    ...viewModel,
    summaryItems,
    metrics,
    adjustedRevenue,
    adjustedRoas,
    revenueAdjustment: {
      mode: normalizedAdjustment.mode,
      manualRevenue: normalizedAdjustment.manualRevenue,
      originalRevenue: viewModel.originalRevenue,
      adjustedRevenue,
      originalRoas: viewModel.originalRoas,
      adjustedRoas,
      isAdjusted,
      note: adjustmentNote
    },
    isEmpty: valuesForEmptyState.every((value) => normalizeNumber(value) === 0)
  }
}

export const mapOverviewWithAdjustment = (
  overview: ShopeeDashboardOverviewResponse,
  adjustment?: Partial<ShopeeDashboardRevenueAdjustment>
) => {
  return applyRevenueAdjustment(adaptShopeeDashboardOverview(overview), adjustment)
}
