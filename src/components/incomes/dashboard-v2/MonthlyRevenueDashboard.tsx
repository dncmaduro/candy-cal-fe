"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { modals } from "@mantine/modals"
import {
  IconCash,
  IconChartBar,
  IconReceipt2,
  IconTargetArrow,
  IconTrophy
} from "@tabler/icons-react"
import { useIncomes } from "../../../hooks/useIncomes"
import { useMonthGoals } from "../../../hooks/useMonthGoals"
import { useLivestreamChannel } from "../../../context/LivestreamChannelContext"
import { TopCreatorsModal } from "../TopCreatorsModal"
import { AdsMetricsSummaryCard } from "../AdsMetricsSummaryCard"
import { ChannelBreakdown } from "./ChannelBreakdown"
import { DashboardHeader } from "./DashboardHeader"
import { DetailMetricsSection } from "./DetailMetricsSection"
import { HeroKpiCard } from "./HeroKpiCard"
import {
  buildRevenueTrend,
  createMonthOptions,
  formatCurrency,
  formatPercent,
  getCurrentMonthValue,
  getMonthProgress,
  getPerformanceStatus,
  pickModeValue
} from "./helpers"
import { RevenueTrendChart } from "./RevenueTrendChart"
import type {
  ChannelPerformanceCardData,
  DetailMetric,
  DiscountMode
} from "./types"

type IncomeSplit = { live: number; shop: number }
type QuantitySplit = { live: number; shop: number }
type AdsSplit = { liveAdsCost: number; shopAdsCost: number }

export function MonthlyRevenueDashboard({
  adsPresentation = "channel-breakdown",
  preferDailyAdsMetricsSummary = false
}: {
  adsPresentation?: "channel-breakdown" | "sheet-table"
  preferDailyAdsMetricsSummary?: boolean
}) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue)
  const [mode, setMode] = useState<DiscountMode>("afterDiscount")
  const [showComparison, setShowComparison] = useState(true)

  const { getGoal } = useMonthGoals()
  const {
    getAdsCostSplitByMonth,
    getIncomesByDateRange,
    getTotalIncomesByMonth,
    getTotalQuantityByMonth
  } = useIncomes()

  const { channels, selectedChannelId, setSelectedChannelId } =
    useLivestreamChannel()

  const monthOptions = useMemo(() => createMonthOptions(), [])
  const selectedDate = useMemo(() => new Date(selectedMonth), [selectedMonth])
  const month = selectedDate.getMonth()
  const year = selectedDate.getFullYear()
  const monthLabel = selectedDate.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric"
  })
  const usesNewAdsPresentation = adsPresentation === "sheet-table"

  const { expectedPercentage, phase } = useMemo(
    () => getMonthProgress(selectedDate),
    [selectedDate]
  )

  const queryEnabled = !!selectedChannelId

  const { data: monthGoalData } = useQuery({
    queryKey: ["dashboard-month-goal", month, year, selectedChannelId],
    queryFn: () =>
      getGoal({
        month,
        year,
        channelId: selectedChannelId || undefined
      }),
    select: (response) => response.data,
    enabled: queryEnabled
  })

  const { data: totalIncomeData } = useQuery({
    queryKey: ["dashboard-total-income", month, year, selectedChannelId],
    queryFn: () =>
      getTotalIncomesByMonth({
        month,
        year,
        channelId: selectedChannelId || undefined
      }),
    select: (response) => response.data,
    enabled: queryEnabled
  })

  const { data: totalQuantityData } = useQuery({
    queryKey: ["dashboard-total-quantity", month, year, selectedChannelId],
    queryFn: () =>
      getTotalQuantityByMonth({
        month,
        year,
        channelId: selectedChannelId || undefined
      }),
    select: (response) => response.data,
    enabled: queryEnabled
  })

  const { data: adsData } = useQuery({
    queryKey: ["dashboard-ads-split", month, year, selectedChannelId],
    queryFn: () =>
      getAdsCostSplitByMonth({
        month,
        year,
        channelId: selectedChannelId || undefined
      }),
    select: (response) => response.data,
    enabled: queryEnabled
  })

  const { data: monthlyIncomes } = useQuery({
    queryKey: ["dashboard-monthly-trend", selectedMonth, selectedChannelId],
    queryFn: () =>
      getIncomesByDateRange({
        startDate: new Date(year, month, 1).toISOString(),
        endDate: new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString(),
        page: 1,
        limit: 10000,
        channelId: selectedChannelId || undefined
      }),
    select: (response) => response.data.incomes,
    enabled: queryEnabled
  })

  const totalIncomeSelected = pickModeValue<IncomeSplit>(
    totalIncomeData?.totalIncome,
    mode
  )

  const adsModeData =
    pickModeValue<AdsSplit>(adsData, mode) ??
    (adsData
      ? {
          liveAdsCost: adsData.liveAdsCost ?? 0,
          shopAdsCost: adsData.shopAdsCost ?? 0
        }
      : undefined)

  const quantitySplit =
    (totalQuantityData?.totalQuantity as QuantitySplit | undefined) ?? undefined
  const ordersSplit =
    (totalQuantityData?.totalOrders as QuantitySplit | undefined) ?? undefined
  const totalProducts = quantitySplit
    ? (quantitySplit.live || 0) + (quantitySplit.shop || 0)
    : undefined
  const totalOrders = ordersSplit
    ? (ordersSplit.live || 0) + (ordersSplit.shop || 0)
    : undefined

  const liveRevenue = totalIncomeSelected?.live ?? 0
  const shopRevenue = totalIncomeSelected?.shop ?? 0
  const totalRevenue = liveRevenue + shopRevenue

  const liveAdsCost = adsModeData?.liveAdsCost ?? 0
  const shopAdsCost = adsModeData?.shopAdsCost ?? 0
  const totalAdsCost = adsData?.totalAdsCost ?? liveAdsCost + shopAdsCost
  const showDailyAdsMetricsSummary =
    preferDailyAdsMetricsSummary && Boolean(adsData?.hasDailyAdsMetrics)
  const totalAdsRatio =
    totalRevenue > 0 ? (totalAdsCost / totalRevenue) * 100 : 0
  const totalCost = adsData?.totalCost ?? totalAdsCost
  const costAfterRefund = adsData?.costAfterRefund ?? totalAdsCost

  const liveNetRevenue = liveRevenue - liveAdsCost
  const shopNetRevenue = shopRevenue - shopAdsCost
  const totalNetRevenue = totalRevenue - totalAdsCost

  const liveGoal = adsData?.kpi?.liveKpi ?? monthGoalData?.liveStreamGoal ?? 0
  const shopGoal = adsData?.kpi?.shopKpi ?? monthGoalData?.shopGoal ?? 0
  const totalGoal =
    (monthGoalData?.liveStreamGoal || 0) + (monthGoalData?.shopGoal || 0)

  const achievedPercentage =
    totalGoal > 0 ? (totalRevenue / totalGoal) * 100 : 0
  const deltaPercentage = achievedPercentage - expectedPercentage
  const overallStatus = getPerformanceStatus({
    achievedPercentage,
    expectedPercentage,
    phase,
    hasGoal: totalGoal > 0
  })

  const liveAchievedPercentage =
    liveGoal > 0 ? (liveRevenue / liveGoal) * 100 : 0
  const shopAchievedPercentage =
    shopGoal > 0 ? (shopRevenue / shopGoal) * 100 : 0
  const liveAdsRatio = liveRevenue > 0 ? (liveAdsCost / liveRevenue) * 100 : 0
  const shopAdsRatio = shopRevenue > 0 ? (shopAdsCost / shopRevenue) * 100 : 0

  const channelsData = useMemo<ChannelPerformanceCardData[]>(() => {
    const liveStatus = getPerformanceStatus({
      achievedPercentage: liveAchievedPercentage,
      expectedPercentage,
      phase,
      hasGoal: liveGoal > 0
    })

    const shopStatus = getPerformanceStatus({
      achievedPercentage: shopAchievedPercentage,
      expectedPercentage,
      phase,
      hasGoal: shopGoal > 0
    })

    const data: ChannelPerformanceCardData[] = [
      {
        key: "shop",
        name: "Sàn",
        subtitle: "",
        revenue: shopRevenue,
        adsSpend: shopAdsCost,
        netRevenue: shopNetRevenue,
        goalRevenue: shopGoal,
        share: totalRevenue > 0 ? (shopRevenue / totalRevenue) * 100 : 0,
        adsRatio: shopAdsRatio,
        achievedPct: shopAchievedPercentage,
        expectedPct: expectedPercentage,
        deltaPct: shopAchievedPercentage - expectedPercentage,
        status: shopStatus
      },
      {
        key: "live",
        name: "Livestream",
        subtitle: "",
        revenue: liveRevenue,
        adsSpend: liveAdsCost,
        netRevenue: liveNetRevenue,
        goalRevenue: liveGoal,
        share: totalRevenue > 0 ? (liveRevenue / totalRevenue) * 100 : 0,
        adsRatio: liveAdsRatio,
        achievedPct: liveAchievedPercentage,
        expectedPct: expectedPercentage,
        deltaPct: liveAchievedPercentage - expectedPercentage,
        status: liveStatus
      }
    ]

    const topRevenueChannel = data.reduce((best, item) =>
      item.revenue > best.revenue ? item : best
    )
    const weakestChannel = data.reduce((worst, item) =>
      item.deltaPct < worst.deltaPct ? item : worst
    )

    return data.map((item) => ({
      ...item,
      highlight:
        item.key === topRevenueChannel.key
          ? "Đóng góp lớn nhất"
          : item.key === weakestChannel.key
            ? "Cần chú ý"
            : undefined
    }))
  }, [
    expectedPercentage,
    liveAchievedPercentage,
    liveAdsCost,
    liveAdsRatio,
    liveGoal,
    liveNetRevenue,
    liveRevenue,
    phase,
    shopAchievedPercentage,
    shopAdsCost,
    shopAdsRatio,
    shopGoal,
    shopNetRevenue,
    shopRevenue,
    totalRevenue
  ])

  const summaryMetrics = [
    {
      label: "Doanh thu",
      value: formatCurrency(totalRevenue),
      hint: "Tổng doanh thu của tháng đang xem",
      icon: <IconCash size={22} />,
      tone: "slate" as const
    },
    {
      label: "Chi ads thực tế",
      value: formatCurrency(totalAdsCost),
      hint: "Tổng chi phí ads thực tế trong tháng",
      icon: <IconTargetArrow size={22} />,
      tone:
        totalAdsCost > totalRevenue * 0.25
          ? ("amber" as const)
          : ("slate" as const)
    },
    {
      label: "% ads/doanh thu",
      value: formatPercent(
        adsData?.ratios?.adsRatioOnBeforeDiscountRevenue ?? totalAdsRatio
      ),
      hint: "Tỷ lệ chi ads trên doanh thu trước chiết khấu",
      icon: <IconChartBar size={22} />,
      tone: totalAdsRatio > 25 ? ("amber" as const) : ("emerald" as const)
    },
    {
      label: "Đơn hàng",
      value:
        typeof totalOrders === "number"
          ? `${totalOrders.toLocaleString("vi-VN")} đơn`
          : "...",
      hint: "Tổng số đơn hàng trong tháng",
      icon: <IconReceipt2 size={22} />,
      tone: "slate" as const
    }
  ]

  const detailMetrics: DetailMetric[] = [
    {
      label: "Mục tiêu tháng",
      value: formatCurrency(totalGoal),
      hint: "Tổng KPI của Livestream và Sàn",
      tone: "slate"
    },
    {
      label: "Tổng đơn hàng",
      value:
        typeof totalOrders === "number"
          ? `${totalOrders.toLocaleString("vi-VN")} đơn`
          : "...",
      hint: "Tổng số đơn phát sinh trong tháng",
      tone: "slate"
    },
    {
      label: "Tổng sản phẩm",
      value:
        typeof totalProducts === "number"
          ? `${totalProducts.toLocaleString("vi-VN")} sp`
          : "...",
      hint: "Khối lượng hàng đã bán trong tháng",
      tone: "slate"
    },
    {
      label: "Tổng chi phí",
      value: formatCurrency(totalCost),
      hint: "Chi phí ads thực tế + affiliate",
      tone: "slate"
    },
    ...(showDailyAdsMetricsSummary
      ? [
          {
            label: "Tỉ lệ hoàn hủy",
            value: formatPercent(adsData?.rawMetrics?.refundCancelRate || 0),
            hint: "Tỉ lệ hoàn/hủy đang lưu trong DailyAdsMetrics",
            tone: "amber" as const
          },
          {
            label: "% Sau HH / DT trước CK",
            value: formatPercent(
              adsData?.ratios?.costAfterRefundRatioOnBeforeDiscountRevenue || 0
            ),
            hint: "Tỷ lệ chi phí trên doanh thu sau khi trừ hoàn/hủy",
            tone: "emerald" as const
          }
        ]
      : [
          {
            label: "Sau trừ hoàn huỷ",
            value: formatCurrency(costAfterRefund),
            hint: "Tổng chi phí sau khi trừ AFF hoàn/hủy",
            tone: "slate" as const
          }
        ]),
    {
      label: "% Tổng chi phí / DT trước CK",
      value: formatPercent(
        adsData?.ratios?.totalCostRatioOnBeforeDiscountRevenue || 0
      ),
      hint: "Tỷ lệ tổng chi phí trên doanh thu trước chiết khấu",
      tone: "amber"
    },
    {
      label: "% Sau HH / DT trước CK",
      value: formatPercent(
        adsData?.ratios?.costAfterRefundRatioOnBeforeDiscountRevenue || 0
      ),
      hint: "Tỷ lệ chi phí sau hoàn/hủy trên doanh thu trước chiết khấu",
      tone: "amber"
    }
  ]

  const trendData = useMemo(
    () => buildRevenueTrend(monthlyIncomes, selectedDate, mode),
    [mode, monthlyIncomes, selectedDate]
  )

  const isLoading =
    !monthGoalData && !totalIncomeData && !totalQuantityData && !adsData

  const channelOptions = channels.map((channel) => ({
    value: channel._id,
    label: channel.name
  }))

  return (
    <div className="mx-auto mt-6 w-full max-w-[1480px] px-2 pb-10 md:px-4">
      <div className="space-y-6">
        <DashboardHeader
          title="Hiệu suất doanh thu"
          selectedChannelId={selectedChannelId}
          channels={channelOptions}
          onChannelChange={setSelectedChannelId}
          selectedMonth={selectedMonth}
          monthOptions={monthOptions}
          onMonthChange={setSelectedMonth}
          mode={mode}
          onModeChange={setMode}
          showComparison={showComparison}
          onShowComparisonChange={setShowComparison}
        />

        {isLoading ? (
          <LoadingShell />
        ) : (
          <>
            <HeroKpiCard
              achievedPercentage={achievedPercentage}
              expectedPercentage={expectedPercentage}
              deltaPercentage={deltaPercentage}
              status={overallStatus}
              actualRevenue={totalRevenue}
              targetRevenue={totalGoal}
              netRevenue={totalNetRevenue}
              monthLabel={monthLabel}
              summaryMetrics={summaryMetrics}
            />

            {showDailyAdsMetricsSummary ? (
              <AdsMetricsSummaryCard
                title="Tổng chỉ số ads trong tháng"
                subtitle="Khi tháng có DailyAdsMetrics, phần so sánh ads theo Live/Sàn được ẩn và thay bằng card tổng hợp này."
                data={{
                  totalAdsCost,
                  actualAdsCost: adsData?.actualAdsCost ?? 0,
                  totalCost: adsData?.totalCost ?? 0,
                  ratios: {
                    adsRatioOnBeforeDiscountRevenue:
                      adsData?.ratios?.adsRatioOnBeforeDiscountRevenue ?? 0,
                    totalCostRatioOnBeforeDiscountRevenue:
                      adsData?.ratios?.totalCostRatioOnBeforeDiscountRevenue ?? 0,
                    costAfterRefundRatioOnBeforeDiscountRevenue:
                      adsData?.ratios?.costAfterRefundRatioOnBeforeDiscountRevenue ??
                      0
                  },
                  rawMetrics: {
                    roiProtect: adsData?.rawMetrics?.roiProtect ?? 0,
                    tinRefundAmount: adsData?.rawMetrics?.tinRefundAmount ?? 0,
                    gmvAds: adsData?.rawMetrics?.gmvAds ?? 0,
                    affiliateCost: adsData?.rawMetrics?.affiliateCost ?? 0,
                    affiliateRefundAmount:
                      adsData?.rawMetrics?.affiliateRefundAmount ?? 0,
                    totalRevenue: adsData?.rawMetrics?.totalRevenue ?? 0,
                    adjustedRevenue: adsData?.rawMetrics?.adjustedRevenue ?? 0,
                    refundCancelRate:
                      adsData?.rawMetrics?.refundCancelRate ?? 0
                  },
                  adsSourceMode: adsData?.adsSourceMode,
                  metricsDaysCount: adsData?.metricsDaysCount
                }}
              />
            ) : usesNewAdsPresentation ? (
              <ChannelBreakdown
                channels={channelsData}
                showComparison={showComparison}
              />
            ) : (
              <ChannelBreakdown
                channels={channelsData}
                showComparison={showComparison}
              />
            )}

            <RevenueTrendChart data={trendData} monthLabel={monthLabel} />

            <DetailMetricsSection
              metrics={detailMetrics}
              action={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  onClick={() => {
                    modals.open({
                      title: (
                        <div className="flex items-center gap-2">
                          <IconTrophy size={18} />
                          <b>Top creator</b>
                        </div>
                      ),
                      children: <TopCreatorsModal />,
                      size: "60vw"
                    })
                  }}
                >
                  <IconTrophy size={16} />
                  Xem top creator
                </button>
              }
            />
          </>
        )}
      </div>
    </div>
  )
}

function LoadingShell() {
  return (
    <div className="space-y-6">
      <div className="h-[520px] animate-pulse rounded-[32px] bg-slate-200" />
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="h-[360px] animate-pulse rounded-[28px] bg-slate-200"
          />
        ))}
      </div>
      <div className="h-[420px] animate-pulse rounded-[28px] bg-slate-200" />
    </div>
  )
}
