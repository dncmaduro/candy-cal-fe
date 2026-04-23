import { useEffect, useMemo, useState } from "react"
import { Helmet } from "react-helmet-async"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
  Button,
  Divider,
  Group,
  Skeleton,
  Stack,
  Switch,
  Tabs,
  Text,
  Tooltip,
  rem
} from "@mantine/core"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { format } from "date-fns"
import {
  SHOPEE_NAVS,
  SHOPEE_ROLES
} from "../../../constants/navs"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import type {
  ShopeePerformanceTimeMode,
  ShopeeRangePreset
} from "../../../hooks/models"
import { SHOPEE_ALL_CHANNEL_ID, type ShopeeChannelOption } from "../../../hooks/shopeeDashboardApi"
import { useShopeeChannels } from "../../../hooks/useShopeeChannels"
import { useUsers } from "../../../hooks/useUsers"
import {
  useMonthlyMetrics,
  useRangeMetrics
} from "../../../hooks/useShopeePerformanceMetrics"
import { AppLayout } from "../../layouts/AppLayout"
import { PerformanceTimeFilter } from "./PerformanceTimeFilter"
import { MonthlyDashboard } from "./MonthlyDashboard"
import { DailyAnalyticsDashboard } from "./DailyAnalyticsDashboard"
import { ShopeeDashboardOrdersSection } from "./ShopeeDashboardOrdersSection"
import { ShopeeRevenueEntryModal } from "./ShopeeRevenueEntryModal"
import { DeleteShopeeRangeDataModal } from "./DeleteShopeeRangeDataModal"
import {
  createDefaultRange,
  getDaysInRange,
  resolvePresetRange
} from "./performanceTimeUtils"
import type { MonthlyMetricsViewModel } from "../../../hooks/useShopeePerformanceMetrics"

export interface ShopeeDashboardSearchState {
  tab: "dashboard" | "orders"
  mode: ShopeePerformanceTimeMode
  channel: string
  month: number
  year: number
  orderFrom?: string
  orderTo?: string
  preset?: ShopeeRangePreset
}

interface ShopeePerformanceDashboardPageProps {
  search: ShopeeDashboardSearchState
  onSearchChange: (
    nextSearch: Partial<ShopeeDashboardSearchState>,
    replace?: boolean
  ) => void
}

const createMonthOptions = (): ShopeeChannelOption[] => {
  return Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1),
    label: `Tháng ${String(index + 1).padStart(2, "0")}`
  }))
}

const createYearOptions = (selectedYear: number): ShopeeChannelOption[] => {
  return Array.from({ length: 5 }, (_, index) => {
    const year = selectedYear - 2 + index

    return {
      value: String(year),
      label: String(year)
    }
  })
}

const SHOPEE_FILTER_STICKY_TOP = rem(76)

const getMonthlyPaceStatus = (
  achievedPercentage: number,
  expectedPercentage: number,
  target: number
): MonthlyMetricsViewModel["metrics"][number]["paceStatus"] => {
  if (!target || target <= 0 || expectedPercentage <= 0) return "unknown"

  if (Math.abs(achievedPercentage - expectedPercentage) < 0.01) {
    return "on-track"
  }

  return achievedPercentage > expectedPercentage ? "ahead" : "behind"
}

const safeDivide = (numerator: number, denominator: number) => {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return 0
  if (denominator <= 0) return 0

  return numerator / denominator
}

export const ShopeePerformanceDashboardPage = ({
  search,
  onSearchChange
}: ShopeePerformanceDashboardPageProps) => {
  useAuthGuard(SHOPEE_ROLES)
  const { getMe } = useUsers()
  const { data: meData } = useQuery({
    queryKey: ["getMe"],
    queryFn: getMe,
    select: (data) => data.data
  })
  const canMutateShopee = Boolean(
    meData?.roles?.includes("admin") || meData?.roles?.includes("shopee-emp")
  )
  const [usePreviousDayKpiMode, setUsePreviousDayKpiMode] = useState(false)

  const monthOptions = useMemo(() => createMonthOptions(), [])
  const yearOptions = useMemo(() => createYearOptions(search.year), [search.year])
  const today = useMemo(() => new Date(), [])
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const currentDate = today.getDate()
  const isCurrentMonthSelection =
    search.month === currentMonth && search.year === currentYear
  const canUsePreviousDayKpiMode =
    search.mode === "month" && isCurrentMonthSelection && currentDate >= 2
  const previousDayDate = useMemo(
    () => new Date(currentYear, currentMonth - 1, currentDate - 1),
    [currentDate, currentMonth, currentYear]
  )
  const previousDayLabel = format(previousDayDate, "dd/MM/yyyy")

  useEffect(() => {
    if (canUsePreviousDayKpiMode) return
    setUsePreviousDayKpiMode(false)
  }, [canUsePreviousDayKpiMode])

  const channelsQuery = useShopeeChannels()
  const channelOptions = channelsQuery.data?.options ?? [
    {
      value: SHOPEE_ALL_CHANNEL_ID,
      label: "Tất cả kênh Shopee"
    }
  ]

  const selectedChannelExists = channelsQuery.data?.channels.some(
    (channel) => channel._id === search.channel
  )
  const normalizedChannelId =
    search.channel === SHOPEE_ALL_CHANNEL_ID || selectedChannelExists
      ? search.channel
      : SHOPEE_ALL_CHANNEL_ID
  const selectedChannelName =
    normalizedChannelId === SHOPEE_ALL_CHANNEL_ID
      ? "Tất cả kênh Shopee"
      : channelsQuery.data?.channels.find(
          (channel) => channel._id === normalizedChannelId
        )?.name ?? normalizedChannelId

  useEffect(() => {
    if (!channelsQuery.isSuccess) return
    if (search.channel === normalizedChannelId) return

    onSearchChange({ channel: normalizedChannelId }, true)
  }, [
    channelsQuery.isSuccess,
    normalizedChannelId,
    onSearchChange,
    search.channel
  ])

  const monthlyQuery = useMonthlyMetrics({
    month: search.month,
    year: search.year,
    channelId: normalizedChannelId,
    enabled: search.tab === "dashboard" && search.mode === "month"
  })

  const monthlyDashboardData = useMemo(() => {
    const data = monthlyQuery.data

    if (!data || !usePreviousDayKpiMode || !canUsePreviousDayKpiMode) {
      return data
    }

    const daysInMonth = new Date(search.year, search.month, 0).getDate()
    const expectedPercentage = Number(
      (((currentDate - 1) / daysInMonth) * 100).toFixed(1)
    )

    return {
      ...data,
      expectedProgressPercentage: expectedPercentage,
      metrics: data.metrics.map((metric) => {
        const gapPercentage = metric.achievedPercentage - expectedPercentage
        const paceRatio = safeDivide(
          metric.achievedPercentage,
          expectedPercentage
        )

        return {
          ...metric,
          expectedPercentage,
          gapPercentage,
          paceRatio,
          paceStatus: getMonthlyPaceStatus(
            metric.achievedPercentage,
            expectedPercentage,
            metric.target
          )
        }
      })
    } satisfies MonthlyMetricsViewModel
  }, [
    canUsePreviousDayKpiMode,
    currentDate,
    monthlyQuery.data,
    search.month,
    search.year,
    usePreviousDayKpiMode
  ])

  const rangeDays = getDaysInRange(search.orderFrom, search.orderTo)
  const isRangeReady =
    Boolean(search.orderFrom) && Boolean(search.orderTo) && rangeDays > 0

  const rangeQuery = useRangeMetrics({
    orderFrom: search.orderFrom,
    orderTo: search.orderTo,
    channelId: normalizedChannelId,
    enabled: search.tab === "dashboard" && search.mode === "range" && isRangeReady
  })

  const activeDashboardFetching =
    search.mode === "month" ? monthlyQuery.isFetching : rangeQuery.isFetching

  const handleRetry = () => {
    channelsQuery.refetch()

    if (search.tab !== "dashboard") return

    if (search.mode === "month") {
      monthlyQuery.refetch()
      return
    }

    rangeQuery.refetch()
  }

  const handleOpenRevenueEntryModal = () => {
    modals.open({
      title: <b>Thêm doanh số Shopee</b>,
      size: "lg",
      children: (
        <ShopeeRevenueEntryModal
          currentChannelId={normalizedChannelId}
          channels={channelsQuery.data?.channels ?? []}
          month={search.month}
          year={search.year}
          onSuccess={() => {
            if (search.mode === "month") {
              monthlyQuery.refetch()
            } else {
              rangeQuery.refetch()
            }
          }}
        />
      )
    })
  }

  const handleOpenDeleteDataModal = () => {
    if (
      !isRangeReady ||
      normalizedChannelId === SHOPEE_ALL_CHANNEL_ID ||
      !search.orderFrom ||
      !search.orderTo
    ) {
      return
    }

    modals.open({
      title: <b>Xóa dữ liệu Shopee</b>,
      size: "md",
      children: (
        <DeleteShopeeRangeDataModal
          channelId={normalizedChannelId}
          channelName={selectedChannelName}
          orderFrom={search.orderFrom}
          orderTo={search.orderTo}
        />
      )
    })
  }

  const rangeDeleteDisabledReason =
    !canMutateShopee
      ? "Bạn không có quyền xóa dữ liệu Shopee"
      : !isRangeReady
        ? "Vui lòng chọn đầy đủ khoảng ngày"
        : normalizedChannelId === SHOPEE_ALL_CHANNEL_ID
          ? "Vui lòng chọn 1 kênh Shopee cụ thể trước khi xóa dữ liệu"
          : undefined

  const filterAction =
    search.mode === "month" ? (
      <Group gap="md" align="center">
        {canUsePreviousDayKpiMode && (
          <Stack gap={2}>
            <Switch
              checked={usePreviousDayKpiMode}
              onChange={(event) =>
                setUsePreviousDayKpiMode(event.currentTarget.checked)
              }
              label="So với KPI ngày hôm trước"
              size="sm"
            />
            {usePreviousDayKpiMode && (
              <Text size="xs" c="dimmed">
                Đang so với KPI đến ngày {previousDayLabel}
              </Text>
            )}
          </Stack>
        )}

        <Button
          variant="light"
          color="blue"
          leftSection={<IconPlus size={16} />}
          onClick={handleOpenRevenueEntryModal}
          disabled={channelsQuery.isLoading || !canMutateShopee}
          title={!canMutateShopee ? "Bạn chỉ có quyền xem dữ liệu Shopee" : undefined}
        >
          Thêm doanh số
        </Button>
      </Group>
    ) : (
      <Group gap="sm">
        <Tooltip
          label={rangeDeleteDisabledReason}
          disabled={!rangeDeleteDisabledReason}
          openDelay={0}
          closeDelay={0}
          withArrow
          position="bottom-end"
          transitionProps={{ duration: 80 }}
        >
          <span>
            <Button
              variant="light"
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={handleOpenDeleteDataModal}
              disabled={Boolean(rangeDeleteDisabledReason)}
            >
              Xóa dữ liệu
            </Button>
          </span>
        </Tooltip>
      </Group>
    )

  return (
    <>
      <Helmet>
        <title>Dashboard Shopee | MyCandy</title>
      </Helmet>

      <AppLayout navs={SHOPEE_NAVS}>
        <Box
          mt={40}
          mx="auto"
          px={{ base: 8, md: 0 }}
          w="100%"
          style={{
            background: "rgba(255,255,255,0.97)",
            borderRadius: rem(20),
            boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
            border: "1px solid #ececec"
          }}
        >
          <Box
            pt={32}
            pb={16}
            px={{ base: 8, md: 28 }}
            style={{
              position: "sticky",
              top: SHOPEE_FILTER_STICKY_TOP,
              zIndex: 10,
              borderRadius: rem(20),
              background: "rgba(255,255,255,0.98)",
              backdropFilter: "blur(10px)",
              borderBottom: "1px solid #e9ecef"
            }}
          >
            <PerformanceTimeFilter
              mode={search.mode}
              channelId={search.channel}
              month={search.month}
              year={search.year}
              orderFrom={search.orderFrom}
              orderTo={search.orderTo}
              preset={search.preset}
              channelOptions={channelOptions}
              monthOptions={monthOptions}
              yearOptions={yearOptions}
              isChannelsLoading={channelsQuery.isLoading}
              isRefreshing={
                channelsQuery.isFetching ||
                (search.tab === "dashboard" && activeDashboardFetching)
              }
              onModeChange={(mode) => {
                if (mode === search.mode) return

                if (mode === "month") {
                  onSearchChange(
                    {
                      mode: "month",
                      preset: undefined,
                      orderFrom: undefined,
                      orderTo: undefined
                    },
                    true
                  )
                  return
                }

                const fallbackRange = search.preset
                  ? resolvePresetRange(search.preset)
                  : createDefaultRange()

                onSearchChange(
                  {
                    mode: "range",
                    orderFrom: fallbackRange.orderFrom,
                    orderTo: fallbackRange.orderTo,
                    preset: search.preset ?? "last-7-days"
                  },
                  true
                )
              }}
              onMonthChannelChange={(channel) =>
                onSearchChange({ channel }, true)
              }
              onMonthChange={(month) => onSearchChange({ month }, true)}
              onYearChange={(year) => onSearchChange({ year }, true)}
              onRangeApply={({ channel, orderFrom, orderTo, preset }) =>
                onSearchChange(
                  {
                    channel,
                    orderFrom,
                    orderTo,
                    preset
                  },
                  true
                )
              }
              action={
                filterAction
              }
            />
          </Box>

          <Divider />

          <Box px={{ base: 8, md: 28 }} py={20}>
            <Tabs
              value={search.tab}
              onChange={(value) =>
                value &&
                onSearchChange(
                  {
                    tab: value as ShopeeDashboardSearchState["tab"]
                  },
                  true
                )
              }
            >
              <Tabs.List>
                <Tabs.Tab value="dashboard">Hiệu suất</Tabs.Tab>
                <Tabs.Tab value="orders">Đơn hàng</Tabs.Tab>
              </Tabs.List>

              <Box mt="md">
                <Tabs.Panel value="dashboard">
                  <Stack gap="lg">
                    {search.mode === "month" ? (
                      <MonthlyDashboard
                        data={monthlyDashboardData}
                        isLoading={monthlyQuery.isLoading}
                        isError={monthlyQuery.isError}
                        onRetry={handleRetry}
                      />
                    ) : isRangeReady ? (
                      <DailyAnalyticsDashboard
                        data={rangeQuery.data}
                        isLoading={rangeQuery.isLoading}
                        isError={rangeQuery.isError}
                        onRetry={handleRetry}
                      />
                    ) : (
                      <PaperWithHint />
                    )}
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="orders">
                  {channelsQuery.isError && !channelsQuery.data ? (
                    <Skeleton height={360} radius="xl" />
                  ) : channelsQuery.isLoading ? (
                    <Skeleton height={360} radius="xl" />
                  ) : (
                    <ShopeeDashboardOrdersSection
                      mode={search.mode}
                      month={search.month}
                      year={search.year}
                      orderFrom={search.orderFrom}
                      orderTo={search.orderTo}
                      channelId={normalizedChannelId}
                    />
                  )}
                </Tabs.Panel>
              </Box>
            </Tabs>
          </Box>
        </Box>
      </AppLayout>
    </>
  )
}

const PaperWithHint = () => (
  <Box
    p="xl"
    style={{
      borderRadius: rem(24),
      border: "1px solid #dbe4f0",
      background: "#ffffff"
    }}
  >
    <Text fw={700} fz="lg">
      Chọn khoảng ngày để bắt đầu phân tích
    </Text>
    <Text mt={6} c="dimmed">
      Vui lòng chọn đầy đủ từ ngày và đến ngày trong bộ lọc để hệ thống tải dữ
      liệu range.
    </Text>
  </Box>
)
