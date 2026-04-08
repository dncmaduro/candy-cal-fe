import { Badge } from "@mantine/core"
import { formatPercent, formatSignedPercent } from "./formatters"

interface TrendBadgeProps {
  value?: number | null
  positiveMeaning?: "good" | "bad"
  precision?: number
  variant?: "filled" | "light"
}

export const TrendBadge = ({
  value,
  positiveMeaning = "good",
  precision = 1,
  variant = "light"
}: TrendBadgeProps) => {
  if (typeof value !== "number" || Number.isNaN(value)) return null

  const isPositive = value >= 0
  const color =
    positiveMeaning === "good"
      ? isPositive
        ? "teal"
        : "red"
      : isPositive
        ? "red"
        : "teal"

  return (
    <Badge color={color} variant={variant} radius="xl" size="sm">
      {formatSignedPercent(value, precision)}
    </Badge>
  )
}

export const ShareBadge = ({ value }: { value?: number }) => {
  if (typeof value !== "number" || Number.isNaN(value)) return null

  return (
    <Badge color="gray" variant="light" radius="xl" size="sm">
      {formatPercent(value)}
    </Badge>
  )
}
