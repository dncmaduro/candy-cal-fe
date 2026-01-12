import { useQuery } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { useIncomes } from "../../hooks/useIncomes"
import {
  Box,
  Flex,
  Text,
  Group,
  Button,
  Stack,
  Paper,
  Select,
  Badge,
  SegmentedControl,
  SimpleGrid,
  Table
} from "@mantine/core"
import { modals } from "@mantine/modals"
import {
  IconStars,
  IconVideo,
  IconShoppingBag,
  IconSum,
  IconChartBar,
  IconCalendar,
  IconTarget,
  IconDeviceDesktop,
  IconBuilding,
  IconAnalyze,
  IconTrophy,
  IconFilter
} from "@tabler/icons-react"
import { useMonthGoals } from "../../hooks/useMonthGoals"
import { KPIBox } from "./KPIBox"
import { TopCreatorsModal } from "./TopCreatorsModal"
import { fmtPercent } from "../../utils/fmt"
import { CDashboardLayout } from "../common/CDashboardLayout"
import { format } from "date-fns"
import { useLivestreamChannel } from "../../context/LivestreamChannelContext"

type KPIView = "live" | "shop" | "total"
type DiscountMode = "beforeDiscount" | "afterDiscount"

export const Dashboard = () => {
  const [kpiView, setKpiView] = useState<KPIView>("live")
  const [mode, setMode] = useState<DiscountMode>("afterDiscount")

  const { selectedChannelId, channels } = useLivestreamChannel()
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  })

  const {
    getTotalIncomesByMonth,
    getTotalQuantityByMonth,
    getLiveShopIncomeByMonth,
    getAdsCostSplitByMonth
  } = useIncomes()

  const { getGoal } = useMonthGoals()

  // Generate list of last 24 months for selection
  const monthOptions = useMemo(() => {
    const now = new Date()
    const options = []
    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      options.push({
        value: date.toISOString(),
        label: format(date, "MM/yyyy")
      })
    }
    return options
  }, [])

  // Parse selected month
  const selectedDate = new Date(selectedMonth)
  const currentMonth = selectedDate.getMonth()
  const currentYear = selectedDate.getFullYear()

  const { data: totalQuantityData } = useQuery({
    queryKey: [
      "getTotalQuantityByMonth",
      currentMonth,
      currentYear,
      selectedChannelId
    ],
    queryFn: () =>
      getTotalQuantityByMonth({
        month: currentMonth,
        year: currentYear,
        channelId: selectedChannelId || undefined
      }),
    select: (data) => data.data
  })

  const { data: totalIncomesData } = useQuery({
    queryKey: [
      "getTotalIncomesByMonth",
      currentMonth,
      currentYear,
      selectedChannelId
    ],
    queryFn: () =>
      getTotalIncomesByMonth({
        month: currentMonth,
        year: currentYear,
        channelId: selectedChannelId || undefined
      }),
    select: (data) => data.data
  })

  const { data: liveVideoIncomeMonthData } = useQuery({
    queryKey: [
      "getLiveShopIncomeByMonth",
      currentMonth,
      currentYear,
      selectedChannelId
    ],
    queryFn: () =>
      getLiveShopIncomeByMonth({
        month: currentMonth,
        year: currentYear,
        channelId: selectedChannelId || undefined
      }),
    select: (data) => data.data
  })

  const { data: adsCostSplitMonthData } = useQuery({
    queryKey: [
      "getAdsCostSplitByMonth",
      currentMonth,
      currentYear,
      selectedChannelId
    ],
    queryFn: () =>
      getAdsCostSplitByMonth({
        month: currentMonth,
        year: currentYear,
        channelId: selectedChannelId || undefined
      }),
    select: (data) => data.data
  })

  const { data: monthGoalData } = useQuery({
    queryKey: ["getGoal", currentMonth, currentYear, selectedChannelId],
    queryFn: () =>
      getGoal({
        month: currentMonth,
        year: currentYear,
        channelId: selectedChannelId || undefined
      }),
    select: (data) => data.data
  })

  // helper: pick mode-specific part if response has beforeDiscount/afterDiscount
  const pickMode = <T,>(obj: any, mode: DiscountMode): T | undefined => {
    if (!obj) return undefined
    if (
      typeof obj === "object" &&
      "beforeDiscount" in obj &&
      "afterDiscount" in obj
    ) {
      return obj[mode] as T
    }
    return obj as T
  }

  // Derived KPI values based on selected view
  const goalValue = monthGoalData
    ? kpiView === "live"
      ? monthGoalData.liveStreamGoal
      : kpiView === "shop"
        ? monthGoalData.shopGoal
        : (monthGoalData.liveStreamGoal || 0) + (monthGoalData.shopGoal || 0)
    : undefined

  // derive total incomes for selected mode if backend returns nested shapes
  const totalIncomesSelected = pickMode<{ live: number; shop: number }>(
    totalIncomesData?.totalIncome,
    mode
  )

  const incomeValue = totalIncomesSelected
    ? kpiView === "live"
      ? totalIncomesSelected.live
      : kpiView === "shop"
        ? totalIncomesSelected.shop
        : totalIncomesSelected.live + totalIncomesSelected.shop
    : undefined

  const quantityValue = totalQuantityData
    ? kpiView === "live"
      ? totalQuantityData.totalQuantity?.live
      : kpiView === "shop"
        ? totalQuantityData.totalQuantity?.shop
        : (totalQuantityData.totalQuantity?.live || 0) +
          (totalQuantityData.totalQuantity?.shop || 0)
    : undefined

  const percentageValue = (() => {
    if (!monthGoalData) return undefined
    if (kpiView === "total") {
      const totalGoal =
        (monthGoalData.liveStreamGoal || 0) + (monthGoalData.shopGoal || 0)
      if (!totalGoal) return 0
      const totalIncome =
        (totalIncomesSelected?.live || 0) + (totalIncomesSelected?.shop || 0)
      return (totalIncome / totalGoal) * 100
    }

    // For live/shop view, calculate percentage directly from income and goal
    const income = totalIncomesSelected?.[kpiView]
    const goal =
      kpiView === "live" ? monthGoalData.liveStreamGoal : monthGoalData.shopGoal

    if (!goal || goal === 0) return 0
    if (income === undefined) return undefined

    return (income / goal) * 100
  })()

  // Calculate expected KPI based on current day of month
  const currentExpectedKPI = useMemo(() => {
    const now = new Date()
    const currentDay = now.getDate()
    const totalDaysInMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    ).getDate()

    // If selected month is current month, calculate expected percentage
    if (
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear()
    ) {
      const expected = (100 / totalDaysInMonth) * currentDay
      return Math.round(expected * 100) / 100
    }

    // If selected month is in the past, expected is 100%
    if (selectedDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
      return 100
    }

    // If selected month is in the future, expected is 0%
    return 0
  }, [selectedDate])

  const isKPIExceeded =
    percentageValue !== undefined &&
    percentageValue !== null &&
    percentageValue > currentExpectedKPI

  const percentageDisplay =
    percentageValue !== undefined && percentageValue !== null
      ? `${Math.round((percentageValue + Number.EPSILON) * 100) / 100}% / ${currentExpectedKPI}% (${isKPIExceeded ? "+" : "-"}${Math.round(Math.abs(percentageValue - currentExpectedKPI) * 100) / 100}%)`
      : "..."

  const percentageColor = (() => {
    if (isKPIExceeded) return "green"
    return "red"
  })()

  const liveVideoSelected = pickMode<{ live: number; shop: number }>(
    liveVideoIncomeMonthData?.totalIncome,
    mode
  )

  // Only use the selected mode values — the backend now nests live/video under beforeDiscount/afterDiscount
  const monthlyLiveIncome = liveVideoSelected?.live
  const monthlyShopIncome = liveVideoSelected?.shop

  const adsCostSelected = pickMode<{
    liveAdsCost: number
    shopAdsCost: number
  }>(adsCostSplitMonthData, mode)
  const monthlyLiveAdsCost = adsCostSelected?.liveAdsCost
  const monthlyShopAdsCost = adsCostSelected?.shopAdsCost

  const fmtVnd = (n?: number) =>
    typeof n === "number" ? n.toLocaleString() : "..."

  // Calculate ads ratio based on revenue
  const calculateAdsRatio = (adsCost: number, revenue: number) => {
    if (!revenue || revenue <= 0) return 0
    return (adsCost / revenue) * 100
  }

  const liveProfit = (monthlyLiveIncome || 0) - (monthlyLiveAdsCost || 0)
  const shopProfit = (monthlyShopIncome || 0) - (monthlyShopAdsCost || 0)
  const totalIncome = (monthlyLiveIncome || 0) + (monthlyShopIncome || 0)
  const totalAdsCost = (monthlyLiveAdsCost || 0) + (monthlyShopAdsCost || 0)
  const totalProfit = totalIncome - totalAdsCost

  return (
    <CDashboardLayout
      icon={<IconChartBar size={24} />}
      title="Dashboard Analytics"
      subheader="Tổng quan hiệu suất kinh doanh theo tháng"
      rightHeader={
        <Group gap="sm" align="flex-end">
          <Select
            label="Tháng"
            value={selectedMonth}
            onChange={(v) => setSelectedMonth(v || selectedMonth)}
            data={monthOptions}
            size="xs"
            w={120}
          />

          <SegmentedControl
            value={mode}
            onChange={(v) => setMode(v as DiscountMode)}
            data={[
              { label: "Sau CK", value: "afterDiscount" },
              { label: "Trước CK", value: "beforeDiscount" }
            ]}
            size="xs"
          />

          <Button
            variant="light"
            color="grape"
            size="xs"
            radius="xl"
            leftSection={<IconStars size={16} />}
            onClick={() => {
              modals.open({
                title: (
                  <Flex align="center" gap="xs">
                    <IconTrophy size={18} />
                    <b>Top nhà sáng tạo</b>
                  </Flex>
                ),
                children: <TopCreatorsModal />,
                size: "60vw"
              })
            }}
          >
            Top creator
          </Button>
        </Group>
      }
      content={
        <Stack gap="lg">
          {/* Header summary */}
          <Group gap="sm" align="center">
            <IconCalendar size={18} />
            <Text fw={600}>
              Số liệu tháng{" "}
              {selectedDate.toLocaleDateString("vi-VN", {
                month: "long",
                year: "numeric"
              })}
            </Text>
            {selectedChannelId && (
              <Badge
                variant="outline"
                color="violet"
                leftSection={<IconFilter size={14} />}
              >
                {channels.find((c) => c._id === selectedChannelId)?.name ||
                  "Kênh đã chọn"}
              </Badge>
            )}
          </Group>

          {/* 1. KPI TỔNG QUAN */}
          <Paper withBorder radius="md" p="md">
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <IconTarget size={18} />
                <Box>
                  <Text fw={600}>Hiệu suất KPI</Text>
                  <Text fz="xs" c="dimmed">
                    {kpiView === "total"
                      ? "Tổng hợp Livestream + Sàn thương mại"
                      : kpiView === "live"
                        ? "Chỉ số từ kênh Livestream"
                        : "Chỉ số từ kênh Sàn thương mại"}
                  </Text>
                </Box>
              </Group>

              <SegmentedControl
                value={kpiView}
                onChange={(v) => setKpiView(v as KPIView)}
                size="xs"
                data={[
                  {
                    label: (
                      <Flex align="center" gap={4}>
                        <IconDeviceDesktop size={14} />
                        <span>Live</span>
                      </Flex>
                    ),
                    value: "live"
                  },
                  {
                    label: (
                      <Flex align="center" gap={4}>
                        <IconBuilding size={14} />
                        <span>Sàn</span>
                      </Flex>
                    ),
                    value: "shop"
                  },
                  {
                    label: (
                      <Flex align="center" gap={4}>
                        <IconSum size={14} />
                        <span>Tổng</span>
                      </Flex>
                    ),
                    value: "total"
                  }
                ]}
              />
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
              <KPIBox
                label="Mục tiêu tháng"
                value={
                  goalValue !== undefined ? goalValue.toLocaleString() : "..."
                }
                unit="VNĐ"
                color="gray"
              />
              <KPIBox
                label="Doanh thu đã đạt"
                value={
                  incomeValue !== undefined
                    ? incomeValue.toLocaleString()
                    : "..."
                }
                unit="VNĐ"
                color="gray"
              />
              <KPIBox
                label="% đạt KPI"
                value={percentageDisplay}
                color={percentageColor}
              />
              <KPIBox
                label="Tổng sản phẩm"
                value={
                  quantityValue !== undefined
                    ? quantityValue.toLocaleString()
                    : "..."
                }
                unit="sp"
                color="gray"
              />
            </SimpleGrid>
          </Paper>

          {/* 2. PHÂN TÍCH THEO KÊNH (BẢNG) */}
          <Paper withBorder radius="md" p="md">
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <IconAnalyze size={18} />
                <Box>
                  <Text fw={600}>Doanh thu & chi phí</Text>
                  <Text fz="xs" c="dimmed">
                    Số liệu {mode === "afterDiscount" ? "sau" : "trước"} chiết
                    khấu
                  </Text>
                </Box>
              </Group>
            </Group>

            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Kênh</Table.Th>
                  <Table.Th ta={"center"}>Doanh thu</Table.Th>
                  <Table.Th ta={"center"}>Chi phí Ads</Table.Th>
                  <Table.Th ta={"center"}>Doanh thu (sau Ads)</Table.Th>
                  <Table.Th ta={"center"}>Tỉ lệ Ads/Doanh thu</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>
                    <Group gap="xs">
                      <Box
                        p={6}
                        style={{
                          borderRadius: 8,
                          backgroundColor: "var(--mantine-color-blue-1)"
                        }}
                      >
                        <IconVideo size={14} />
                      </Box>
                      <Box>
                        <Text fw={500}>Livestream</Text>
                        <Text fz="xs" c="dimmed">
                          Kênh trực tiếp
                        </Text>
                      </Box>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text ta="center">{fmtVnd(monthlyLiveIncome)} VNĐ</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text ta="center">{fmtVnd(monthlyLiveAdsCost)} VNĐ</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text
                      ta="center"
                      c={liveProfit < 0 ? "red.6" : "green.7"}
                      fw={500}
                    >
                      {fmtVnd(liveProfit)} VNĐ
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text ta="center">
                      {fmtPercent(
                        calculateAdsRatio(
                          monthlyLiveAdsCost || 0,
                          monthlyLiveIncome || 0
                        )
                      )}
                    </Text>
                  </Table.Td>
                </Table.Tr>

                <Table.Tr>
                  <Table.Td>
                    <Group gap="xs">
                      <Box
                        p={6}
                        style={{
                          borderRadius: 8,
                          backgroundColor: "var(--mantine-color-grape-1)"
                        }}
                      >
                        <IconShoppingBag size={14} />
                      </Box>
                      <Box>
                        <Text fw={500}>Sàn thương mại</Text>
                        <Text fz="xs" c="dimmed">
                          Marketplace
                        </Text>
                      </Box>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text ta="center">{fmtVnd(monthlyShopIncome)} VNĐ</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text ta="center">{fmtVnd(monthlyShopAdsCost)} VNĐ</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text
                      ta="center"
                      c={shopProfit < 0 ? "red.6" : "green.7"}
                      fw={500}
                    >
                      {fmtVnd(shopProfit)} VNĐ
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text ta="center">
                      {fmtPercent(
                        calculateAdsRatio(
                          monthlyShopAdsCost || 0,
                          monthlyShopIncome || 0
                        )
                      )}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Paper>

          {/* 3. TỔNG HỢP 2 KÊNH */}
          <Paper withBorder radius="md" p="md">
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <IconSum size={18} />
                <Box>
                  <Text fw={600}>Tổng hợp</Text>
                  <Text fz="xs" c="dimmed">
                    Tổng doanh thu, chi phí, và tỉ lệ Ads
                  </Text>
                </Box>
              </Group>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
              <KPIBox
                label="Tổng doanh thu"
                value={fmtVnd(totalIncome)}
                unit="VNĐ"
                color="gray"
              />
              <KPIBox
                label="Tổng chi phí Ads"
                value={fmtVnd(totalAdsCost)}
                unit="VNĐ"
                color="gray"
              />
              <KPIBox
                label="Tổng doanh thu (sau Ads)"
                value={fmtVnd(totalProfit)}
                unit="VNĐ"
                color={totalProfit < 0 ? "red" : "green"}
              />
              <KPIBox
                label="Tỉ lệ Ads/Doanh thu tổng"
                value={fmtPercent(calculateAdsRatio(totalAdsCost, totalIncome))}
                color="gray"
              />
            </SimpleGrid>
          </Paper>
        </Stack>
      }
    />
  )
}
