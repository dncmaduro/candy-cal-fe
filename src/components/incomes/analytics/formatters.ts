export const formatCurrency = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "..."
  return `${Math.round(value).toLocaleString("vi-VN")} đ`
}

type NumberFormatMode = "round" | "truncate"

const trimTrailingZero = (value: string) =>
  value.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "")

const normalizeNumber = (
  value: number,
  digits: number,
  mode: NumberFormatMode
) => {
  if (digits <= 0) {
    return mode === "truncate" ? Math.trunc(value) : Math.round(value)
  }

  const factor = 10 ** digits
  const normalized =
    mode === "truncate"
      ? Math.trunc(value * factor) / factor
      : Math.round(value * factor) / factor

  return normalized
}

export const formatCompactCurrency = (
  value?: number,
  digits = 1,
  mode: NumberFormatMode = "round"
) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "..."

  const absolute = Math.abs(value)

  if (absolute >= 1_000_000_000) {
    return `${trimTrailingZero(
      normalizeNumber(value / 1_000_000_000, digits, mode).toFixed(digits)
    )} tỷ`
  }

  if (absolute >= 1_000_000) {
    return `${trimTrailingZero(
      normalizeNumber(value / 1_000_000, digits, mode).toFixed(digits)
    )} tr`
  }

  if (absolute >= 1_000) {
    return `${trimTrailingZero(
      normalizeNumber(value / 1_000, digits, mode).toFixed(digits)
    )}k`
  }

  return value.toLocaleString("vi-VN")
}

export const formatPercent = (
  value?: number,
  digits = 1,
  mode: NumberFormatMode = "round"
) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "..."
  return `${normalizeNumber(value, digits, mode).toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  })}%`
}

export const formatSignedPercent = (
  value?: number,
  digits = 1,
  mode: NumberFormatMode = "round"
) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "..."
  const sign = value > 0 ? "+" : value < 0 ? "-" : ""
  return `${sign}${Math.abs(normalizeNumber(value, digits, mode)).toLocaleString(
    "vi-VN",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits
    }
  )}%`
}
