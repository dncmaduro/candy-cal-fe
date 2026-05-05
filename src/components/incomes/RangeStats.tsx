import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { DatePickerInput } from "@mantine/dates"
import {
  Alert,
  Flex,
  Grid,
  Group,
  Loader,
  Paper,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text
} from "@mantine/core"
import {
  IconAlertCircle,
  IconChartBar,
  IconCalendarStats,
  IconDiscount2,
  IconPercentage,
  IconReceipt2
} from "@tabler/icons-react"
import { format } from "date-fns"
import type {
  GetIncomesByDateRangeResponse,
  GetRangeStatsResponse
} from "../../hooks/models"
import { useIncomes } from "../../hooks/useIncomes"
import { useMonthGoals } from "../../hooks/useMonthGoals"
import { useLivestreamChannel } from "../../context/LivestreamChannelContext"
import { LiveAndVideoStats } from "./LiveAndVideoStats"
import { SourcesStats } from "./SourcesStats"
import { ProductsQuantityStats } from "./ProductsQuantityStats"
import { ShippingProvidersStats } from "./ShippingProvidersStats"
import { BoxesStats } from "./BoxesStats"
import { CDashboardLayout } from "../common/CDashboardLayout"
import { DailyKpiSummary } from "./analytics/DailyKpiSummary"
import { RevenueOverviewCard } from "./analytics/RevenueOverviewCard"
import { MetricStatCard } from "./analytics/MetricStatCard"
import { TrendBadge } from "./analytics/TrendBadge"
import { formatCurrency, formatPercent } from "./analytics/formatters"
import { getRangeStatsOrderMetrics } from "./rangeStatsOrders"
import {
  filterDropdownStyles,
  filterInputStyles,
  filterLabelStyles,
  filterSegmentedStyles
} from "./filterStyles"

type DiscountMode = "beforeDiscount" | "afterDiscount"

type RangeSelectorProps = {
  startDate: Date | null
  endDate: Date | null
  onChangeStartDate: (d: Date | null) => void
  onChangeEndDate: (d: Date | null) => void
}

type ChannelSelectorProps = {
  selectedChannelId: string | null
  channels: Array<{
    _id: string
    name: string
  }>
  onChange?: (channelId: string | null) => void
}

const ChannelSelector = ({
  selectedChannelId,
  channels,
  onChange
}: ChannelSelectorProps) => {
  return (
    <Select
      label="Kênh"
      value={selectedChannelId}
      onChange={(value) => onChange?.(value)}
      data={channels.map((channel) => ({
        value: channel._id,
        label: channel.name
      }))}
      placeholder="Chọn kênh"
      searchable
      nothingFoundMessage="Không có kênh"
      size="sm"
      w={260}
      styles={{
        label: filterLabelStyles,
        input: filterInputStyles,
        dropdown: filterDropdownStyles
      }}
    />
  )
}

const RangeSelector = ({
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate
}: RangeSelectorProps) => {
  const handleChangeStartDate = (date: Date | null) => {
    const normalizedStart = date
      ? new Date(new Date(date).setHours(0, 0, 0, 0))
      : null

    onChangeStartDate(normalizedStart)
  }

  const handleChangeEndDate = (date: Date | null) => {
    if (!date) {
      onChangeEndDate(null)
      return
    }

    const normalizedEnd = new Date(new Date(date).setHours(23, 59, 59, 999))

    onChangeEndDate(normalizedEnd)
  }

  return (
    <Group align="flex-end" gap={12} wrap="wrap">
      <DatePickerInput
        label="Từ ngày"
        type="default"
        value={startDate}
        onChange={handleChangeStartDate}
        valueFormat="DD/MM/YYYY"
        size="sm"
        maxDate={new Date()}
        w={164}
        placeholder="Chọn ngày bắt đầu"
        clearable
        styles={{
          label: filterLabelStyles,
          input: filterInputStyles
        }}
      />

      <DatePickerInput
        label="Đến ngày"
        type="default"
        value={endDate}
        onChange={handleChangeEndDate}
        valueFormat="DD/MM/YYYY"
        size="sm"
        maxDate={new Date()}
        w={164}
        placeholder="Chọn ngày kết thúc"
        clearable
        styles={{
          label: filterLabelStyles,
          input: filterInputStyles
        }}
      />
    </Group>
  )
}

type ModeSelectorProps = {
  mode: DiscountMode
  onChange: (value: DiscountMode) => void
}

const ModeSelector = ({ mode, onChange }: ModeSelectorProps) => {
  return (
    <Stack gap={0}>
      <Text style={filterLabelStyles}>Chế độ dữ liệu</Text>
      <SegmentedControl
        value={mode}
        onChange={(value) => onChange(value as DiscountMode)}
        data={[
          { label: "Sau CK", value: "afterDiscount" },
          { label: "Trước CK", value: "beforeDiscount" }
        ]}
        radius={18}
        styles={filterSegmentedStyles}
      />
    </Stack>
  )
}

const getRangeProgressPercentage = (start: Date | null, end: Date | null) => {
  if (!start || !end) return 0

  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()

  if (endTime <= startTime) return 0

  const now = Date.now()
  const clampedNow = Math.min(Math.max(now, startTime), endTime)

  return ((clampedNow - startTime) / (endTime - startTime)) * 100
}

export const RangeStats = () => {
  const { getRangeStats, getIncomesByDateRange } = useIncomes()
  const { getGoal } = useMonthGoals()
  const { selectedChannelId, channels, setSelectedChannelId } =
    useLivestreamChannel()

  const [mode, setMode] = useState<DiscountMode>("afterDiscount")

  const [startDate, setStartDate] = useState<Date | null>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [endDate, setEndDate] = useState<Date | null>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    d.setHours(23, 59, 59, 999)
    return d
  })

  const now = useMemo(() => new Date(), [])
  const rangeReferenceDate = useMemo(
    () => endDate ?? startDate ?? now,
    [endDate, startDate, now]
  )
  const rangeGoalMonth = rangeReferenceDate.getMonth()
  const rangeGoalYear = rangeReferenceDate.getFullYear()
  const daysInRangeGoalMonth = new Date(
    rangeGoalYear,
    rangeGoalMonth + 1,
    0
  ).getDate()
  const rangeProgressPercentage = getRangeProgressPercentage(startDate, endDate)

  const range = useMemo(() => {
    if (!startDate || !endDate) return null

    const s = new Date(startDate.getTime())
    const e = new Date(endDate.getTime())

    if (e.getTime() < s.getTime()) return null

    s.setHours(0, 0, 0, 0)
    e.setHours(23, 59, 59, 999)

    const label = `${format(s, "dd/MM/yyyy")} - ${format(e, "dd/MM/yyyy")}`

    return {
      start: s.toISOString(),
      end: e.toISOString(),
      label
    }
  }, [startDate, endDate])
  const rangeMonthProgress = useMemo(() => {
    if (!range) return null

    const monthStart = new Date(rangeGoalYear, rangeGoalMonth, 1)
    monthStart.setHours(0, 0, 0, 0)

    return {
      start: monthStart.toISOString(),
      end: range.end,
      elapsedDays: rangeReferenceDate.getDate()
    }
  }, [range, rangeGoalMonth, rangeGoalYear, rangeReferenceDate])

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "getRangeStats",
      range?.start ?? null,
      range?.end ?? null,
      selectedChannelId
    ],
    queryFn: async () => {
      if (!range || !selectedChannelId) return null
      const res = await getRangeStats({
        startDate: range.start,
        endDate: range.end,
        channelId: selectedChannelId
      })
      return res.data as GetRangeStatsResponse
    },
    enabled: !!range && !!selectedChannelId,
    staleTime: 60 * 1000
  })

  const { data: rangeIncomes } = useQuery({
    queryKey: [
      "getIncomesByDateRange",
      range?.start ?? null,
      range?.end ?? null,
      selectedChannelId
    ],
    queryFn: async () => {
      if (!range || !selectedChannelId) return null
      const res = await getIncomesByDateRange({
        startDate: range.start,
        endDate: range.end,
        page: 1,
        limit: 10000,
        channelId: selectedChannelId
      })
      return res.data as GetIncomesByDateRangeResponse
    },
    enabled: !!range && !!selectedChannelId,
    staleTime: 60 * 1000
  })

  const {
    data: rangeMonthProgressStats,
    isLoading: isLoadingRangeMonthProgress
  } = useQuery({
    queryKey: [
      "getRangeStats",
      "range-month-progress",
      selectedChannelId,
      rangeMonthProgress?.start ?? null,
      rangeMonthProgress?.end ?? null
    ],
    queryFn: async () => {
      if (!selectedChannelId || !rangeMonthProgress) return null
      const res = await getRangeStats({
        startDate: rangeMonthProgress.start,
        endDate: rangeMonthProgress.end,
        channelId: selectedChannelId
      })
      return res.data as GetRangeStatsResponse
    },
    enabled: !!selectedChannelId && !!rangeMonthProgress,
    staleTime: 60 * 1000
  })

  const { data: filterMonthGoalData } = useQuery({
    queryKey: [
      "range-stats-filter-month-goal",
      selectedChannelId,
      rangeGoalMonth,
      rangeGoalYear
    ],
    queryFn: () =>
      getGoal({
        month: rangeGoalMonth,
        year: rangeGoalYear,
        channelId: selectedChannelId || undefined
      }),
    select: (response) => response.data,
    enabled: !!selectedChannelId,
    staleTime: 5 * 60 * 1000
  })

  const current = data?.current
  const changes = data?.changes
  const isInvalidDateRange = !!(
    startDate &&
    endDate &&
    endDate.getTime() < startDate.getTime()
  )
  const modeLabel =
    mode === "afterDiscount" ? "Sau chiết khấu" : "Trước chiết khấu"

  const liveIncome = current?.[mode].liveIncome ?? 0
  const shopIncome =
    (current?.[mode].videoIncome || 0) + (current?.[mode].otherIncome || 0)
  const totalRevenue = current?.[mode].totalIncome ?? 0
  const totalAdsCost =
    current?.ads?.totalAdsCost ??
    (current?.ads?.liveAdsCost ?? 0) + (current?.ads?.shopAdsCost ?? 0)
  const totalAdsToRevenuePct =
    totalRevenue > 0 ? (totalAdsCost / totalRevenue) * 100 : 0
  const orderMetrics = getRangeStatsOrderMetrics(data)
  const liveOrders = orderMetrics.live
  const shopOrders = orderMetrics.shop
  const totalOrders = orderMetrics.total
  const liveOrdersPct = orderMetrics.livePct
  const shopOrdersPct = orderMetrics.shopPct
  const totalOrdersPct = orderMetrics.totalPct
  const currentPeriodDays = data?.period.days ?? 0
  const filterMonthGoalTotal =
    (filterMonthGoalData?.liveStreamGoal ?? 0) +
    (filterMonthGoalData?.shopGoal ?? 0)
  const filterDailyGoalTotal =
    filterMonthGoalTotal > 0
      ? filterMonthGoalTotal / daysInRangeGoalMonth
      : undefined
  const rangeGoalTotal =
    typeof filterDailyGoalTotal === "number" && currentPeriodDays > 0
      ? filterDailyGoalTotal * currentPeriodDays
      : undefined
  const rangeGoalPct =
    typeof rangeGoalTotal === "number" && rangeGoalTotal > 0
      ? (totalRevenue / rangeGoalTotal) * 100
      : undefined
  const rangeLiveGoal =
    typeof filterMonthGoalData?.liveStreamGoal === "number" &&
    filterMonthGoalData.liveStreamGoal > 0 &&
    currentPeriodDays > 0
      ? (filterMonthGoalData.liveStreamGoal / daysInRangeGoalMonth) *
        currentPeriodDays
      : undefined
  const rangeShopGoal =
    typeof filterMonthGoalData?.shopGoal === "number" &&
    filterMonthGoalData.shopGoal > 0 &&
    currentPeriodDays > 0
      ? (filterMonthGoalData.shopGoal / daysInRangeGoalMonth) *
        currentPeriodDays
      : undefined
  const rangeLivePct =
    typeof rangeLiveGoal === "number" && rangeLiveGoal > 0
      ? (liveIncome / rangeLiveGoal) * 100
      : undefined
  const rangeShopPct =
    typeof rangeShopGoal === "number" && rangeShopGoal > 0
      ? (shopIncome / rangeShopGoal) * 100
      : undefined
  const rangeGoalLabel =
    currentPeriodDays > 1 ? `KPI ${currentPeriodDays} ngày` : "KPI ngày"
  const deltaVsRangeExpectation =
    typeof rangeGoalPct === "number"
      ? rangeGoalPct - rangeProgressPercentage
      : undefined
  const rangeMonthProgressRevenue =
    rangeMonthProgressStats?.current?.[mode].totalIncome ?? 0
  const forecastMonthRevenue =
    rangeMonthProgress?.elapsedDays && rangeMonthProgress.elapsedDays > 0
      ? (rangeMonthProgressRevenue / rangeMonthProgress.elapsedDays) *
        daysInRangeGoalMonth
      : undefined

  const discountMetrics = useMemo(
    () =>
      current?.discounts
        ? [
            {
              label: "Tổng chiết khấu",
              value: formatCurrency(current.discounts.totalDiscount),
              tone: "red",
              hint: "Toàn bộ chiết khấu phát sinh trong range.",
              change: (changes as any)?.discounts?.totalDiscountPct,
              positiveMeaning: "bad" as const
            },
            {
              label: "Chiết khấu nền tảng",
              value: formatCurrency(current.discounts.totalPlatformDiscount),
              tone: "orange",
              hint: "Chiết khấu do nền tảng tài trợ.",
              change: (changes as any)?.discounts?.totalPlatformDiscountPct,
              positiveMeaning: "bad" as const
            },
            {
              label: "Chiết khấu shop",
              value: formatCurrency(current.discounts.totalSellerDiscount),
              tone: "blue",
              hint: "Chiết khấu do shop chủ động áp dụng.",
              change: (changes as any)?.discounts?.totalSellerDiscountPct,
              positiveMeaning: "bad" as const
            },
            {
              label: "TB / đơn",
              value: formatCurrency(current.discounts.avgDiscountPerOrder),
              tone: "grape",
              hint: "Mức chiết khấu trung bình trên mỗi đơn.",
              change: (changes as any)?.discounts?.avgDiscountPerOrderPct,
              positiveMeaning: "bad" as const
            },
            {
              label: "Tỷ lệ chiết khấu",
              value: formatPercent(
                current.discounts.discountPercentage,
                2,
                "truncate"
              ),
              tone: "indigo",
              hint: "Tỷ lệ chiết khấu trên doanh thu.",
              change: (changes as any)?.discounts?.discountPercentageDiff,
              positiveMeaning: "bad" as const
            }
          ]
        : [],
    [changes, current]
  )

  const productsRevenue = useMemo(() => {
    const totals: Record<string, number> = {}

    rangeIncomes?.incomes?.forEach((income) => {
      income.products.forEach((product) => {
        const unitPrice =
          mode === "afterDiscount" ? product.priceAfterDiscount : product.price
        const revenue = (unitPrice || 0) * (product.quantity || 0)

        if (!product.code) return

        totals[product.code] = (totals[product.code] || 0) + revenue
      })
    })

    return totals
  }, [mode, rangeIncomes])

  useEffect(() => {
    if (!current) return
    if (liveOrders + shopOrders !== totalOrders) {
      console.warn("[RangeStats] Inconsistent order split from BE", {
        channelId: selectedChannelId,
        range: range?.label,
        live: liveOrders,
        shop: shopOrders,
        total: totalOrders
      })
    }
  }, [
    current,
    liveOrders,
    shopOrders,
    totalOrders,
    selectedChannelId,
    range?.label
  ])

  return (
    <CDashboardLayout
      icon={<IconCalendarStats size={24} color="#1d4ed8" />}
      title="Thống kê tuỳ chọn"
      rightHeader={
        <Group align="flex-end" gap="md" wrap="wrap">
          <ChannelSelector
            selectedChannelId={selectedChannelId}
            channels={channels}
            onChange={setSelectedChannelId}
          />
          <RangeSelector
            startDate={startDate}
            endDate={endDate}
            onChangeStartDate={setStartDate}
            onChangeEndDate={setEndDate}
          />
          <ModeSelector mode={mode} onChange={setMode} />
        </Group>
      }
      content={
        <>
          {isInvalidDateRange && (
            <Alert
              color="red"
              variant="light"
              mb="lg"
              icon={<IconAlertCircle size={16} />}
              radius="xl"
            >
              Ngày kết thúc không được nhỏ hơn ngày bắt đầu.
            </Alert>
          )}

          {!selectedChannelId ? (
            <Paper withBorder p="xl" radius="xl" bg="gray.0">
              <Flex
                justify="center"
                align="center"
                h={160}
                direction="column"
                gap="md"
              >
                <IconCalendarStats
                  size={48}
                  color="var(--mantine-color-gray-5)"
                />
                <Text c="dimmed" fw={500} size="lg">
                  Chọn kênh để xem dashboard
                </Text>
              </Flex>
            </Paper>
          ) : (
            <Stack gap="xl">
              {isLoading ? (
                <Paper withBorder p="xl" radius="xl">
                  <Flex
                    justify="center"
                    align="center"
                    h={220}
                    direction="column"
                    gap="md"
                  >
                    <Loader size="lg" />
                    <Text c="dimmed" size="sm">
                      Đang tải dashboard khoảng thời gian...
                    </Text>
                  </Flex>
                </Paper>
              ) : error ? (
                <Paper withBorder p="xl" radius="xl" bg="red.0">
                  <Flex
                    justify="center"
                    align="center"
                    h={200}
                    direction="column"
                    gap="md"
                  >
                    <Text c="red" fw={600}>
                      Không lấy được dữ liệu thống kê
                    </Text>
                    <Text c="red.7" size="sm">
                      Vui lòng thử lại sau hoặc kiểm tra lại bộ lọc.
                    </Text>
                  </Flex>
                </Paper>
              ) : current ? (
                <>
                  <RevenueOverviewCard
                    title="Tổng doanh thu trong khoảng"
                    rangeLabel={range?.label || "Khoảng đang chọn"}
                    totalRevenue={totalRevenue}
                    changePct={changes?.[mode]?.totalIncomePct}
                    modeLabel={modeLabel}
                    detailSections={
                      <Stack gap="md">
                        <DailyKpiSummary
                          revenue={totalRevenue}
                          goal={rangeGoalTotal}
                          totalOrders={totalOrders}
                          totalOrdersChangePct={totalOrdersPct}
                          achievedPct={rangeGoalPct}
                          expectedPct={rangeProgressPercentage}
                          deltaPct={deltaVsRangeExpectation}
                          forecastMonthRevenue={forecastMonthRevenue}
                          monthGoal={
                            filterMonthGoalTotal > 0
                              ? filterMonthGoalTotal
                              : undefined
                          }
                          rangeDays={currentPeriodDays}
                          isLoading={isLoadingRangeMonthProgress}
                        />

                        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                          <MetricStatCard
                            label="Tổng CP ads trong khoảng"
                            value={formatCurrency(totalAdsCost)}
                            icon={<IconChartBar size={20} />}
                            tone="orange"
                            trailing={
                              <TrendBadge
                                value={changes?.ads?.totalAdsCostPct}
                                positiveMeaning="bad"
                                variant="light"
                              />
                            }
                          />
                          <MetricStatCard
                            label="% Ads / doanh thu"
                            value={formatPercent(
                              totalAdsToRevenuePct,
                              2,
                              "truncate"
                            )}
                            icon={<IconPercentage size={20} />}
                            tone="amber"
                          />
                        </SimpleGrid>
                      </Stack>
                    }
                  />

                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, xl: 5 }}>
                      <LiveAndVideoStats
                        title="Livestream"
                        income={current[mode].liveIncome}
                        ordersCount={liveOrders}
                        ordersChangePct={liveOrdersPct}
                        incomePct={rangeLivePct}
                        incomeGoal={rangeLiveGoal}
                        goalLabel={rangeGoalLabel}
                        adsCost={current.ads.liveAdsCost}
                        adsCostChangePct={changes?.ads?.liveAdsCostPct}
                        adsSharePctDiff={
                          changes?.ads?.liveAdsToLiveIncomePctDiff
                        }
                        flex={1}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, xl: 7 }}>
                      <LiveAndVideoStats
                        title="Doanh thu Sàn"
                        income={shopIncome}
                        ordersCount={shopOrders}
                        ordersChangePct={shopOrdersPct}
                        incomePct={rangeShopPct}
                        incomeGoal={rangeShopGoal}
                        goalLabel={rangeGoalLabel}
                        adsCost={current.ads.shopAdsCost}
                        adsCostChangePct={changes?.ads?.shopAdsCostPct}
                        adsSharePctDiff={
                          changes?.ads?.shopAdsToShopIncomePctDiff
                        }
                        ownVideoIncome={current[mode].ownVideoIncome}
                        otherVideoIncome={current[mode].otherVideoIncome}
                        otherIncome={current[mode].otherIncome}
                        flex={1}
                      />
                    </Grid.Col>
                  </Grid>

                  <Grid gutter="md">
                    {current[mode].sources && (
                      <Grid.Col span={{ base: 12, xl: 5 }}>
                        <SourcesStats
                          sources={current[mode].sources}
                          changes={changes?.[mode]?.sources}
                        />
                      </Grid.Col>
                    )}

                    {current.productsQuantity &&
                      Object.keys(current.productsQuantity).length > 0 && (
                        <Grid.Col span={{ base: 12, xl: 7 }}>
                          <ProductsQuantityStats
                            productsQuantity={current.productsQuantity}
                            productsRevenue={productsRevenue}
                          />
                        </Grid.Col>
                      )}
                  </Grid>

                  {(((current as any).boxes &&
                    (current as any).boxes.length > 0) ||
                    (current.shippingProviders &&
                      current.shippingProviders.length > 0)) && (
                    <Grid gutter="md">
                      {current.shippingProviders &&
                        current.shippingProviders.length > 0 && (
                          <Grid.Col span={{ base: 12, xl: 6 }}>
                            <ShippingProvidersStats
                              shippingProviders={current.shippingProviders}
                            />
                          </Grid.Col>
                        )}

                      {(current as any).boxes &&
                        (current as any).boxes.length > 0 && (
                          <Grid.Col span={{ base: 12, xl: 6 }}>
                            <BoxesStats boxes={(current as any).boxes} />
                          </Grid.Col>
                        )}
                    </Grid>
                  )}

                  {discountMetrics.length > 0 && (
                    <Stack gap="md">
                      <Stack gap={2}>
                        <Text
                          fz="xs"
                          fw={700}
                          c="dimmed"
                          tt="uppercase"
                          style={{ letterSpacing: "0.16em" }}
                        >
                          Chiết khấu
                        </Text>
                        <Text fw={700} fz="xl">
                          Tác động từ chiết khấu
                        </Text>
                      </Stack>

                      <SimpleGrid cols={{ base: 1, md: 2, xl: 5 }} spacing="md">
                        {discountMetrics.map((metric) => (
                          <MetricStatCard
                            key={metric.label}
                            label={metric.label}
                            value={metric.value}
                            icon={
                              metric.label === "TB / đơn" ? (
                                <IconReceipt2 size={20} />
                              ) : (
                                <IconDiscount2 size={20} />
                              )
                            }
                            tone={metric.tone}
                            trailing={
                              <TrendBadge
                                value={metric.change}
                                positiveMeaning={metric.positiveMeaning}
                                variant="light"
                              />
                            }
                          />
                        ))}
                      </SimpleGrid>
                    </Stack>
                  )}

                  <Text c="dimmed" fz="xs">
                    Cập nhật: {format(new Date(), "dd/MM/yyyy HH:mm:ss")}
                  </Text>
                </>
              ) : (
                <Paper withBorder p="xl" radius="xl" bg="gray.0">
                  <Flex
                    justify="center"
                    align="center"
                    h={180}
                    direction="column"
                    gap="md"
                  >
                    <IconCalendarStats
                      size={48}
                      color="var(--mantine-color-gray-5)"
                    />
                    <Text c="dimmed" fw={500} size="lg">
                      Chọn khoảng thời gian để xem dashboard
                    </Text>
                    <Text c="dimmed" size="sm" ta="center">
                      Màn này ưu tiên trả lời nhanh KPI ngày, nguồn doanh thu và
                      kênh dẫn kết quả.
                    </Text>
                  </Flex>
                </Paper>
              )}
            </Stack>
          )}
        </>
      }
    />
  )
}
