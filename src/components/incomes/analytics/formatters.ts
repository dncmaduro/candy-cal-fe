export const formatCurrency = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "..."
  return `${Math.round(value).toLocaleString("vi-VN")} đ`
}

const trimTrailingZero = (value: string) => value.replace(/\.0$/, "")

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
  const sign = value > 0 ? "+" : value < 0 ? "-" : ""
  return `${sign}${Math.abs(Number(value.toFixed(digits))).toLocaleString("vi-VN")}%`
}
