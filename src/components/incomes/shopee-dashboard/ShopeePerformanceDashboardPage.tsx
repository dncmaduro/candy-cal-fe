import { useEffect, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { useQuery } from "@tanstack/react-query"
import { Box, Button, Divider, Skeleton, Stack, Tabs, Text, rem } from "@mantine/core"
import { IconPlus } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
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
import {
  createDefaultRange,
  getDaysInRange,
  resolvePresetRange
} from "./performanceTimeUtils"

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

  const monthOptions = useMemo(() => createMonthOptions(), [])
  const yearOptions = useMemo(() => createYearOptions(search.year), [search.year])

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
              top: 0,
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
                search.mode === "month" ? (
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
                ) : undefined
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
                        data={monthlyQuery.data}
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
