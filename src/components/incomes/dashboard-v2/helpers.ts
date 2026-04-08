import { format } from "date-fns"
import type { GetIncomesByDateRangeResponse } from "../../../hooks/models"
import type {
  DashboardStatus,
  DetailMetric,
  DiscountMode,
  PerformanceTone,
  ProgressPhase,
  RevenueTrendMode,
  RevenueTrendPoint,
  SelectOption
} from "./types"

type IncomeItem = GetIncomesByDateRangeResponse["incomes"][number]
type IncomeProduct = IncomeItem["products"][number]

export const toneClasses: Record<
  PerformanceTone | NonNullable<DetailMetric["tone"]>,
  {
    badge: string
    soft: string
    border: string
    text: string
    progress: string
  }
> = {
  good: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    soft: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    progress: "bg-emerald-500"
  },
  warning: {
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    soft: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    progress: "bg-amber-500"
  },
  bad: {
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    soft: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    progress: "bg-rose-500"
  },
  slate: {
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
    soft: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-700",
    progress: "bg-slate-500"
  },
  emerald: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    soft: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    progress: "bg-emerald-500"
  },
  amber: {
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    soft: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    progress: "bg-amber-500"
  },
  rose: {
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    soft: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    progress: "bg-rose-500"
  }
}

export const getCurrentMonthValue = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

export const createMonthOptions = (count = 18): SelectOption[] => {
  const now = new Date()

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1)

    return {
      value: date.toISOString(),
      label: format(date, "MM/yyyy")
    }
  })
}

export const pickModeValue = <T,>(
  data: unknown,
  mode: DiscountMode
): T | undefined => {
  if (!data || typeof data !== "object") return undefined

  if ("beforeDiscount" in data && "afterDiscount" in data) {
    return (data as Record<DiscountMode, T>)[mode]
  }

  return data as T
}

export const formatCurrency = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "..."
  return `${Math.round(value).toLocaleString("vi-VN")} đ`
}

export const formatCompactCurrency = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "..."

  const absolute = Math.abs(value)

  if (absolute >= 1_000_000_000) {
    return `${trimTrailingZero((value / 1_000_000_000).toFixed(1))} tỷ`
  }

  if (absolute >= 1_000_000) {
    return `${trimTrailingZero((value / 1_000_000).toFixed(1))} tr`
  }

  if (absolute >= 1_000) {
    return `${trimTrailingZero((value / 1_000).toFixed(1))}k`
  }

  return value.toLocaleString("vi-VN")
}

export const formatPercent = (value?: number, digits = 1) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "..."
  return `${Number(value.toFixed(digits)).toLocaleString("vi-VN")}%`
}

export const formatSignedPercent = (value?: number, digits = 1) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "..."
  const rounded = Number(value.toFixed(digits))
  return `${rounded > 0 ? "+" : ""}${rounded.toLocaleString("vi-VN")}%`
}

export const clampPercentage = (value: number) => {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, value))
}

export const getMonthProgress = (
  selectedDate: Date
): { expectedPercentage: number; phase: ProgressPhase } => {
  const now = new Date()
  const selectedMonthStart = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  )
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  if (selectedMonthStart.getTime() === currentMonthStart.getTime()) {
    const currentDay = now.getDate()
    const totalDays = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    ).getDate()

    return {
      expectedPercentage: Number(((currentDay / totalDays) * 100).toFixed(1)),
      phase: "current"
    }
  }

  if (selectedMonthStart < currentMonthStart) {
    return { expectedPercentage: 100, phase: "past" }
  }

  return { expectedPercentage: 0, phase: "future" }
}

export const getPerformanceStatus = ({
  achievedPercentage,
  expectedPercentage,
  phase,
  hasGoal
}: {
  achievedPercentage: number
  expectedPercentage: number
  phase: ProgressPhase
  hasGoal: boolean
}): DashboardStatus => {
  if (!hasGoal) {
    return {
      tone: "warning",
      label: "Chưa có KPI",
      description: "Cần bổ sung KPI tháng để hệ thống đánh giá đúng tiến độ."
    }
  }

  if (phase === "future") {
    return {
      tone: "warning",
      label: "Chưa bắt đầu",
      description: "Tháng này chưa diễn ra, số liệu hiện tại chỉ dùng để chuẩn bị mục tiêu."
    }
  }

  if (phase === "past") {
    if (achievedPercentage >= 100) {
      return {
        tone: "good",
        label: "Đạt mục tiêu",
        description: "KPI tháng đã hoàn thành hoặc vượt kế hoạch."
      }
    }

    return {
      tone: "bad",
      label: "Chưa đạt",
      description: "KPI tháng đã kết thúc nhưng doanh thu vẫn thấp hơn mục tiêu."
    }
  }

  const delta = achievedPercentage - expectedPercentage

  if (delta >= 5) {
    return {
      tone: "good",
      label: "Tốt",
      description: "Đang vượt nhịp kỳ vọng, có thể giữ tốc độ hiện tại."
    }
  }

  if (delta >= -5) {
    return {
      tone: "warning",
      label: "Cần chú ý",
      description: "Đang bám sát mục tiêu nhưng biên an toàn khá mỏng."
    }
  }

  return {
    tone: "bad",
    label: "Chưa đạt",
    description: "Đang hụt tiến độ rõ rệt và cần xử lý ngay ở kênh yếu."
  }
}

export const getTrendRevenueValue = (
  point: RevenueTrendPoint,
  trendMode: RevenueTrendMode
) => {
  if (trendMode === "live") return point.liveRevenue
  if (trendMode === "shop") return point.shopRevenue
  return point.totalRevenue
}

const getProductRevenue = (product: IncomeProduct, mode: DiscountMode) => {
  const unitPrice =
    mode === "afterDiscount" ? product.priceAfterDiscount : product.price

  return (unitPrice || 0) * (product.quantity || 0)
}

const isLiveProduct = (product: IncomeProduct) => {
  return (
    typeof product.content === "string" &&
    /Phát trực tiếp|livestream/i.test(product.content)
  )
}

export const buildRevenueTrend = (
  incomes: IncomeItem[] | undefined,
  selectedDate: Date,
  mode: DiscountMode
): RevenueTrendPoint[] => {
  const totalDays = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  ).getDate()

  const baseData = Array.from({ length: totalDays }, (_, index) => ({
    day: index + 1,
    label: `${index + 1}`,
    totalRevenue: 0,
    liveRevenue: 0,
    shopRevenue: 0
  }))

  if (!incomes?.length) return baseData

  incomes.forEach((income) => {
    const incomeDate = new Date(income.date)

    if (
      incomeDate.getFullYear() !== selectedDate.getFullYear() ||
      incomeDate.getMonth() !== selectedDate.getMonth()
    ) {
      return
    }

    const dayIndex = incomeDate.getDate() - 1

    if (dayIndex < 0 || dayIndex >= baseData.length) return

    income.products.forEach((product) => {
      const revenue = getProductRevenue(product, mode)

      baseData[dayIndex].totalRevenue += revenue

      if (isLiveProduct(product)) {
        baseData[dayIndex].liveRevenue += revenue
        return
      }

      baseData[dayIndex].shopRevenue += revenue
    })
  })

  return baseData
}

export const getBestDay = (
  trendData: RevenueTrendPoint[],
  trendMode: RevenueTrendMode
) => {
  return trendData.reduce(
    (best, item) =>
      getTrendRevenueValue(item, trendMode) >
      getTrendRevenueValue(best, trendMode)
        ? item
        : best,
    trendData[0] ?? {
      day: 0,
      label: "0",
      totalRevenue: 0,
      liveRevenue: 0,
      shopRevenue: 0
    }
  )
}

const trimTrailingZero = (value: string) => value.replace(/\.0$/, "")
