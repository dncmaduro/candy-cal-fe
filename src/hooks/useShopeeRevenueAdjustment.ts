import { useCallback, useEffect, useMemo, useState } from "react"
import type {
  ShopeeDashboardRevenueAdjustment,
  ShopeeDashboardRevenueAdjustmentMode
} from "./models"
import {
  SHOPEE_ALL_CHANNEL_ID,
  normalizeShopeeRevenueAdjustment
} from "./shopeeDashboardApi"

const createDefaultAdjustment = (): ShopeeDashboardRevenueAdjustment => ({
  mode: "additive",
  manualRevenue: 0
})

const parseStoredAdjustment = (value: string | null) => {
  if (!value) return createDefaultAdjustment()

  try {
    const parsed = JSON.parse(value) as Partial<ShopeeDashboardRevenueAdjustment>
    return normalizeShopeeRevenueAdjustment(parsed)
  } catch {
    return createDefaultAdjustment()
  }
}

export const getShopeeDashboardAdjustmentStorageKey = ({
  year,
  month,
  channelId
}: {
  year: number
  month: number
  channelId?: string
}) => {
  const normalizedChannelId = channelId?.trim() || SHOPEE_ALL_CHANNEL_ID

  return `shopee-dashboard-adjustment:${year}:${month}:${normalizedChannelId}`
}

export const useShopeeRevenueAdjustment = ({
  year,
  month,
  channelId
}: {
  year: number
  month: number
  channelId?: string
}) => {
  const storageKey = useMemo(
    () => getShopeeDashboardAdjustmentStorageKey({ year, month, channelId }),
    [channelId, month, year]
  )
  const [adjustment, setAdjustment] = useState<ShopeeDashboardRevenueAdjustment>(
    () => {
      if (typeof window === "undefined") return createDefaultAdjustment()

      return parseStoredAdjustment(window.localStorage.getItem(storageKey))
    }
  )
  const [isHydrated, setIsHydrated] = useState(() => typeof window !== "undefined")

  useEffect(() => {
    if (typeof window === "undefined") return

    setIsHydrated(false)
    setAdjustment(parseStoredAdjustment(window.localStorage.getItem(storageKey)))
    setIsHydrated(true)
  }, [storageKey])

  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) return

    const normalizedAdjustment = normalizeShopeeRevenueAdjustment(adjustment)
    const hasStoredValue =
      normalizedAdjustment.mode === "override" ||
      normalizedAdjustment.manualRevenue > 0

    if (!hasStoredValue) {
      window.localStorage.removeItem(storageKey)
      return
    }

    window.localStorage.setItem(storageKey, JSON.stringify(normalizedAdjustment))
  }, [adjustment, isHydrated, storageKey])

  const setManualRevenue = useCallback((value: number) => {
    setAdjustment((current) => ({
      ...current,
      manualRevenue: Math.max(0, Number(value) || 0)
    }))
  }, [])

  const setMode = useCallback((mode: ShopeeDashboardRevenueAdjustmentMode) => {
    setAdjustment((current) => ({
      ...current,
      mode
    }))
  }, [])

  const resetAdjustment = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey)
    }

    setAdjustment(createDefaultAdjustment())
  }, [storageKey])

  return {
    storageKey,
    adjustment,
    isHydrated,
    setManualRevenue,
    setMode,
    resetAdjustment
  }
}
