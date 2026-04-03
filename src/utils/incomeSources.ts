export type IncomeProductSource =
  | "internal"
  | "affiliate"
  | "affiliate-ads"
  | "ads"
  | "other"

export type IncomeSourceStatsKey =
  | "internal"
  | "affiliate"
  | "affiliateAds"
  | "ads"
  | "other"

export type IncomeSourceStats = Partial<Record<IncomeSourceStatsKey, number>> &
  Record<string, number | undefined>

export type IncomeSourceStatsChanges = Partial<
  Record<
    | "internalPct"
    | "affiliatePct"
    | "affiliateAdsPct"
    | "adsPct"
    | "otherPct",
    number
  >
> &
  Record<string, number | undefined>

type IncomeSourceMeta = {
  filterValue: IncomeProductSource
  label: string
  badgeColor: string
  chartColor: string
}

const INCOME_SOURCE_META: Record<IncomeSourceStatsKey, IncomeSourceMeta> = {
  internal: {
    filterValue: "internal",
    label: "Nội bộ",
    badgeColor: "cyan",
    chartColor: "#15aabf"
  },
  affiliate: {
    filterValue: "affiliate",
    label: "Affiliate",
    badgeColor: "red",
    chartColor: "#fa5252"
  },
  affiliateAds: {
    filterValue: "affiliate-ads",
    label: "Affiliate Ads",
    badgeColor: "violet",
    chartColor: "#7950f2"
  },
  ads: {
    filterValue: "ads",
    label: "Ads",
    badgeColor: "green",
    chartColor: "#40c057"
  },
  other: {
    filterValue: "other",
    label: "Khác",
    badgeColor: "blue",
    chartColor: "#228be6"
  }
}

const INCOME_SOURCE_ORDER: IncomeSourceStatsKey[] = [
  "internal",
  "affiliate",
  "affiliateAds",
  "ads",
  "other"
]

export const normalizeIncomeSourceKey = (source: string): string => {
  if (source === "affiliate-ads") return "affiliateAds"
  return source
}

const getIncomeSourceMeta = (source: string) => {
  const normalized = normalizeIncomeSourceKey(source)
  if (normalized in INCOME_SOURCE_META) {
    return INCOME_SOURCE_META[normalized as IncomeSourceStatsKey]
  }

  return {
    filterValue: source as IncomeProductSource,
    label: source,
    badgeColor: "gray",
    chartColor: "#9ca3af"
  }
}

export const getIncomeSourceLabel = (source: string) =>
  getIncomeSourceMeta(source).label

export const getIncomeSourceBadgeColor = (source: string) =>
  getIncomeSourceMeta(source).badgeColor

export const getIncomeSourceChartColor = (source: string) =>
  getIncomeSourceMeta(source).chartColor

const getIncomeSourceOrder = (source: string) => {
  const normalized = normalizeIncomeSourceKey(source)
  const index = INCOME_SOURCE_ORDER.indexOf(normalized as IncomeSourceStatsKey)
  return index === -1 ? INCOME_SOURCE_ORDER.length : index
}

export const sortIncomeSources = <T extends string>(sources: T[]) => {
  return [...sources].sort((a, b) => {
    const orderDiff = getIncomeSourceOrder(a) - getIncomeSourceOrder(b)
    if (orderDiff !== 0) return orderDiff

    return getIncomeSourceLabel(a).localeCompare(getIncomeSourceLabel(b), "vi")
  })
}

export const getIncomeSourceFilterOptions = (includeAllOption = true) => {
  const options = INCOME_SOURCE_ORDER.map((key) => {
    const meta = INCOME_SOURCE_META[key]
    return {
      value: meta.filterValue,
      label: meta.label
    }
  })

  if (!includeAllOption) return options

  return [{ label: "Tất cả nguồn", value: "" }, ...options]
}

export const getIncomeSourceChangeValue = (
  changes: IncomeSourceStatsChanges | undefined,
  source: string
) => {
  const normalized = normalizeIncomeSourceKey(source)

  switch (normalized) {
    case "internal":
      return changes?.internalPct
    case "affiliate":
      return changes?.affiliatePct
    case "affiliateAds":
      return changes?.affiliateAdsPct
    case "ads":
      return changes?.adsPct
    case "other":
      return changes?.otherPct
    default:
      return undefined
  }
}
