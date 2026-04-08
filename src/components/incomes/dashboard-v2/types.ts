import type { ReactNode } from "react"

export type DiscountMode = "beforeDiscount" | "afterDiscount"
export type ProgressPhase = "past" | "current" | "future"
export type PerformanceTone = "good" | "warning" | "bad"
export type ChannelKey = "live" | "shop"

export interface SelectOption {
  value: string
  label: string
}

export interface DashboardStatus {
  tone: PerformanceTone
  label: string
  description: string
}

export interface SummaryMetric {
  label: string
  value: string
  hint: string
  icon: ReactNode
  tone?: "slate" | "emerald" | "amber" | "rose"
}

export interface RevenueTrendPoint {
  day: number
  label: string
  revenue: number
}

export interface ChannelPerformanceCardData {
  key: ChannelKey
  name: string
  subtitle: string
  revenue: number
  adsSpend: number
  netRevenue: number
  share: number
  adsRatio: number
  achievedPct: number
  expectedPct: number
  deltaPct: number
  status: DashboardStatus
  highlight?: string
}

export interface DetailMetric {
  label: string
  value: string
  hint: string
  tone?: "slate" | "emerald" | "amber" | "rose"
}
