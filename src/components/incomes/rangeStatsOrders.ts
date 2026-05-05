import type { GetRangeStatsResponse } from "../../hooks/models"

export type RangeStatsOrderMetrics = {
  live: number
  shop: number
  total: number
  livePct: number
  shopPct: number
  totalPct: number
}

export const getRangeStatsOrderMetrics = (
  stats?: Pick<GetRangeStatsResponse, "current" | "changes"> | null
): RangeStatsOrderMetrics => ({
  live: stats?.current?.orders?.live ?? 0,
  shop: stats?.current?.orders?.shop ?? 0,
  total: stats?.current?.orders?.total ?? 0,
  livePct: stats?.changes?.orders?.livePct ?? 0,
  shopPct: stats?.changes?.orders?.shopPct ?? 0,
  totalPct: stats?.changes?.orders?.totalPct ?? 0
})
