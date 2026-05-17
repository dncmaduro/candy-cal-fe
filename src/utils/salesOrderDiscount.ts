export type SalesOrderDiscountType = "percent" | "value"

const MAX_PERCENT = 100
const PERCENT_PRECISION = 100

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const roundPercent = (value: number) =>
  Math.round(value * PERCENT_PRECISION) / PERCENT_PRECISION

export const getEffectiveOrderDiscountType = (
  type?: SalesOrderDiscountType | null
): SalesOrderDiscountType => (type === "percent" ? "percent" : "value")

export const clampOrderDiscountPercent = (percent?: number) => {
  if (!Number.isFinite(percent)) return 0

  return roundPercent(clamp(percent ?? 0, 0, MAX_PERCENT))
}

export const calculatePercentDiscountAmount = (
  subtotal: number,
  percent?: number
) => {
  if (!Number.isFinite(subtotal) || subtotal <= 0) return 0

  return Math.round((subtotal * clampOrderDiscountPercent(percent)) / 100)
}

export const calculatePercentFromAmount = (
  subtotal: number,
  amount?: number
) => {
  if (!Number.isFinite(subtotal) || subtotal <= 0) return 0
  if (!Number.isFinite(amount) || (amount ?? 0) <= 0) return 0

  return clampOrderDiscountPercent(((amount ?? 0) / subtotal) * 100)
}

export const formatOrderDiscountPercent = (percent?: number) => {
  const normalizedPercent = clampOrderDiscountPercent(percent)

  return Number.isInteger(normalizedPercent)
    ? normalizedPercent.toString()
    : normalizedPercent.toFixed(2).replace(/\.?0+$/, "")
}
