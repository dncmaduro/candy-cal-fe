import { useMemo } from "react"
import { DashboardSectionCard } from "./DashboardSectionCard"
import { IconHierarchy2 } from "@tabler/icons-react"
import { RankedBarList } from "./analytics/RankedBarList"
import { TrendBadge } from "./analytics/TrendBadge"
import { formatCurrency, formatPercent } from "./analytics/formatters"

interface SourceRow {
  key: string
  label: string
  value: number
  pct: number
  change?: number
}

export const SourcesStats = ({
  sources,
  changes
}: {
  sources: Record<string, number>
  changes?: any
}) => {
  const entries = Object.entries(sources || {})
  if (!entries.length) return null

  const sum = entries.reduce((s, [, v]) => s + v, 0) || 1
  const labels: Record<string, string> = {
    ads: "Ads",
    affiliate: "Affiliate",
    affiliateAds: "Affiliate Ads",
    other: "Khác"
  }

  const data: SourceRow[] = useMemo(
    () =>
      entries
        .map(([k, v]) => ({
          key: k,
          label: labels[k] || k,
          value: v,
          pct: (v / sum) * 100,
          change:
            k === "ads"
              ? changes?.adsPct
              : k === "affiliate"
                ? changes?.affiliatePct
                : k === "affiliateAds"
                  ? changes?.affiliateAdsPct
                  : changes?.otherPct
        }))
        .sort((a, b) => b.value - a.value),
    [entries, sum, labels, changes]
  )

  const topSource = data[0]

  return (
    <DashboardSectionCard
      title="Theo nguồn"
      subtitle={
        topSource
          ? `${topSource.label} dẫn với ${formatPercent(
              topSource.pct,
              2,
              "truncate"
            )} doanh thu`
          : `Tổng: ${sum.toLocaleString()} VNĐ`
      }
      icon={<IconHierarchy2 size={18} />}
      accentColor="indigo"
    >
      <RankedBarList
        items={data.map((item) => ({
          key: item.key,
          label: item.label,
          value: item.value,
          caption: `${formatPercent(item.pct, 2, "truncate")} tổng doanh thu`,
          delta: <TrendBadge value={item.change} />,
          color: item.key === topSource?.key ? "indigo" : undefined
        }))}
        totalValue={sum}
        color="indigo"
        valueFormatter={(value) => formatCurrency(value)}
        shareFormatter={(share) => formatPercent(share, 2, "truncate")}
      />
    </DashboardSectionCard>
  )
}
