import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useIncomes } from "../../hooks/useIncomes"
import {
  Box,
  Flex,
  Text,
  Group,
  Button,
  Stack,
  Paper,
  Divider
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
  IconTrophy
} from "@tabler/icons-react"
import { useMonthGoals } from "../../hooks/useMonthGoals"
import { KPIBox } from "./KPIBox"
import { TopCreatorsModal } from "./TopCreatorsModal"
import { fmtPercent } from "../../utils/fmt"
import { SegmentedControl } from "@mantine/core"
import { CDashboardLayout } from "../common/CDashboardLayout"

export const Dashboard = () => {
  const [kpiView, setKpiView] = useState<"live" | "shop" | "total">("live")
  type DiscountMode = "beforeDiscount" | "afterDiscount"
  const [mode, setMode] = useState<DiscountMode>("afterDiscount")

  const {
    getKPIPercentageByMonth,
    getTotalIncomesByMonth,
    getTotalQuantityByMonth,
    getLiveShopIncomeByMonth,
    getAdsCostSplitByMonth
  } = useIncomes()

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const { getGoal } = useMonthGoals()

  const { data: KPIPercentageData } = useQuery({
    queryKey: ["getKPIPercentageByMonth", currentMonth, currentYear],
    queryFn: () =>
      getKPIPercentageByMonth({ month: currentMonth, year: currentYear }),
    select: (data) => data.data
  })

  const { data: totalQuantityData } = useQuery({
    queryKey: ["getTotalQuantityByMonth", currentMonth, currentYear],
    queryFn: () =>
      getTotalQuantityByMonth({ month: currentMonth, year: currentYear }),
    select: (data) => data.data
  })

  const { data: totalIncomesData } = useQuery({
    queryKey: ["getTotalIncomesByMonth", currentMonth, currentYear],
    queryFn: () =>
      getTotalIncomesByMonth({ month: currentMonth, year: currentYear }),
    select: (data) => data.data
  })

  const { data: liveVideoIncomeMonthData } = useQuery({
    queryKey: ["getLiveShopIncomeByMonth", currentMonth, currentYear],
    queryFn: () =>
      getLiveShopIncomeByMonth({ month: currentMonth, year: currentYear }),
    select: (data) => data.data
  })

  const { data: adsCostSplitMonthData } = useQuery({
    queryKey: ["getAdsCostSplitByMonth", currentMonth, currentYear],
    queryFn: () =>
      getAdsCostSplitByMonth({ month: currentMonth, year: currentYear }),
    select: (data) => data.data
  })

  const { data: monthGoalData } = useQuery({
    queryKey: ["getGoal", currentMonth, currentYear],
    queryFn: () => getGoal({ month: currentMonth, year: currentYear }),
    select: (data) => data.data
  })

  // helper: pick mode-specific part if response has beforeDiscount/afterDiscount
  const pickMode = <T,>(
    obj: any,
    mode: "beforeDiscount" | "afterDiscount"
  ): T | undefined => {
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
        : (totalIncomesSelected.live || 0) + (totalIncomesSelected.shop || 0)
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
    const splitSelected = pickMode<{ live: number; shop: number }>(
      KPIPercentageData?.KPIPercentage,
      mode
    )
    if (!splitSelected) return undefined
    return splitSelected[kpiView]
  })()

  const percentageDisplay =
    percentageValue !== undefined && percentageValue !== null
      ? `${Math.round((percentageValue + Number.EPSILON) * 100) / 100}%`
      : "..."

  const percentageColor = (() => {
    if (percentageValue === undefined || percentageValue === null) return "red"
    if (percentageValue >= 100) return "green"
    if (percentageValue >= 70) return "yellow"
    return "red"
  })()

  const liveVideoSelected = pickMode<{ live: number; shop: number }>(
    liveVideoIncomeMonthData?.totalIncome,
    mode
  )

  // For ads ratio calculation, always use beforeDiscount values
  const liveVideoBeforeDiscount = pickMode<{ live: number; shop: number }>(
    liveVideoIncomeMonthData?.totalIncome,
    "beforeDiscount"
  )

  // Only use the selected mode values — the backend now nests live/video under beforeDiscount/afterDiscount
  const monthlyLiveIncome = liveVideoSelected?.live
  const monthlyShopIncome = liveVideoSelected?.shop
  const monthlyLiveIncomeBeforeDiscount = liveVideoBeforeDiscount?.live
  const monthlyShopIncomeBeforeDiscount = liveVideoBeforeDiscount?.shop

  const adsCostSelected = pickMode<{
    liveAdsCost: number
    shopAdsCost: number
  }>(adsCostSplitMonthData, mode)
  const monthlyLiveAdsCost = adsCostSelected?.liveAdsCost
  const monthlyShopAdsCost = adsCostSelected?.shopAdsCost

  const fmtVnd = (n?: number) =>
    typeof n === "number" ? n.toLocaleString() : "..."

  // Calculate ads ratio based on beforeDiscount revenue
  const calculateAdsRatio = (
    adsCost: number,
    revenueBeforeDiscount: number
  ) => {
    if (!revenueBeforeDiscount || revenueBeforeDiscount <= 0) return 0
    return (adsCost / revenueBeforeDiscount) * 100
  }

  return (
    <CDashboardLayout
      icon={<IconChartBar size={28} color="#1971c2" />}
      title="Dashboard Analytics"
      subheader="Tổng quan hiệu suất kinh doanh theo thời gian thực"
      rightHeader={
        <>
          <Button
            color="grape"
            variant="gradient"
            gradient={{ from: "grape.5", to: "pink.5", deg: 45 }}
            size="md"
            radius="xl"
            leftSection={<IconStars size={18} />}
            onClick={() => {
              modals.open({
                title: (
                  <Flex align="center" gap="xs">
                    <IconTrophy size={20} />
                    <b>Top nhà sáng tạo</b>
                  </Flex>
                ),
                children: <TopCreatorsModal />,
                size: "60vw"
              })
            }}
            style={{
              boxShadow: "0 4px 12px rgba(190, 24, 93, 0.25)",
              transition: "all 0.2s ease"
            }}
          >
            Top creator
          </Button>
          <Box
            style={{
              padding: "4px",
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >
            <SegmentedControl
              value={mode}
              onChange={(v) => setMode(v as DiscountMode)}
              data={[
                { label: "Sau CK", value: "afterDiscount" },
                { label: "Trước CK", value: "beforeDiscount" }
              ]}
              size="sm"
              color="blue"
            />
          </Box>
        </>
      }
      content={
        <>
          <Flex align="center" mb={24} gap="md">
            <IconCalendar size={24} color="#364fc7" />
            <Text
              fw={700}
              fz="xl"
              variant="gradient"
              gradient={{ from: "blue.7", to: "indigo.6", deg: 45 }}
            >
              Số liệu tháng hiện tại
            </Text>
            <Text
              fz="sm"
              c="dimmed"
              px="sm"
              py="xs"
              bg="rgba(59, 130, 246, 0.1)"
              style={{ borderRadius: "20px" }}
            >
              {new Date().toLocaleDateString("vi-VN", {
                month: "long",
                year: "numeric"
              })}
            </Text>
          </Flex>

          {/* KPI Performance Section */}
          <Paper
            w={"100%"}
            p="lg"
            withBorder
            radius="lg"
            mb={20}
            style={{
              background:
                "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)",
              borderColor: "rgba(59, 130, 246, 0.15)"
            }}
          >
            <Flex justify="space-between" align="center" mb={16}>
              <Box style={{ flex: 1 }}>
                <Flex align="center" gap="xs" mb={4}>
                  <IconTarget size={20} color="#1971c2" />
                  <Text fw={700} c="blue.8" fz="xl">
                    Hiệu suất KPI
                  </Text>
                </Flex>
                <Text fz="sm" c="blue.6" mt={4}>
                  {kpiView === "total"
                    ? "Tổng hợp toàn bộ kênh bán hàng"
                    : kpiView === "live"
                      ? "Chỉ số từ kênh Livestream"
                      : "Chỉ số từ kênh Sàn thương mại"}
                </Text>
              </Box>
              <Box style={{ flexShrink: 0 }}>
                <SegmentedControl
                  value={kpiView}
                  onChange={(v) => setKpiView(v as "live" | "shop" | "total")}
                  data={[
                    {
                      label: (
                        <Flex align="center" gap="xs">
                          <IconDeviceDesktop size={14} />
                          <span>Live</span>
                        </Flex>
                      ),
                      value: "live"
                    },
                    {
                      label: (
                        <Flex align="center" gap="xs">
                          <IconBuilding size={14} />
                          <span>Sàn</span>
                        </Flex>
                      ),
                      value: "shop"
                    },
                    {
                      label: (
                        <Flex align="center" gap="xs">
                          <IconSum size={14} />
                          <span>Tổng</span>
                        </Flex>
                      ),
                      value: "total"
                    }
                  ]}
                  size="sm"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                />
              </Box>
            </Flex>
            <Group justify="space-between" align="stretch" gap={12}>
              <KPIBox
                label="Mục tiêu KPI"
                value={
                  goalValue !== undefined ? goalValue.toLocaleString() : "..."
                }
                unit="VNĐ"
                color="indigo"
              />
              <KPIBox
                label="Doanh thu đã đạt"
                value={
                  incomeValue !== undefined
                    ? incomeValue.toLocaleString()
                    : "..."
                }
                unit="VNĐ"
                color="teal"
              />
              <KPIBox
                label="Tỉ lệ đạt KPI"
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
                color="cyan"
              />
            </Group>
          </Paper>

          {/* Revenue & Costs Analysis */}
          <Paper
            withBorder
            p="lg"
            radius="lg"
            bg="rgba(16, 185, 129, 0.02)"
            style={{
              background:
                "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.01) 100%)"
            }}
          >
            <Flex justify="space-between" align="center" mb={20}>
              <Flex align="center" gap="sm">
                <IconAnalyze size={20} color="#0ca678" />
                <Text fw={700} fz="lg" c="teal.8">
                  Phân tích chi tiết theo kênh
                </Text>
              </Flex>
              <Text fz="xs" c="dimmed" fw={500}>
                Doanh thu tính theo {mode === "afterDiscount" ? "sau" : "trước"}{" "}
                chiết khấu
              </Text>
            </Flex>

            <Stack gap={24}>
              {/* Livestream Section */}
              <Box
                p="md"
                style={{
                  backgroundColor: "rgba(25, 113, 194, 0.05)",
                  borderRadius: "12px",
                  border: "1px solid rgba(25, 113, 194, 0.1)"
                }}
              >
                <Flex align="center" justify="space-between" mb={16}>
                  <Flex align="center" gap={10}>
                    <Box
                      p={8}
                      style={{
                        backgroundColor: "#1971c2",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <IconVideo size={16} color="white" />
                    </Box>
                    <Text fw={700} c="blue.8" fz="lg">
                      Livestream
                    </Text>
                  </Flex>
                  <Text fz="xs" c="blue.6" fw={500}>
                    Kênh trực tiếp
                  </Text>
                </Flex>
                <Group justify="space-between" align="stretch" gap={12}>
                  <KPIBox
                    label="Doanh thu"
                    value={fmtVnd(monthlyLiveIncome)}
                    unit="VNĐ"
                    color="blue"
                  />
                  <KPIBox
                    label="Chi phí Ads"
                    value={fmtVnd(monthlyLiveAdsCost)}
                    unit="VNĐ"
                    color="orange"
                  />
                  <KPIBox
                    label="Lợi nhuận (sau ads)"
                    value={fmtVnd(
                      (monthlyLiveIncome || 0) - (monthlyLiveAdsCost || 0)
                    )}
                    unit="VNĐ"
                    color={
                      (monthlyLiveIncome || 0) - (monthlyLiveAdsCost || 0) > 0
                        ? "green"
                        : "red"
                    }
                  />
                  <KPIBox
                    label="Tỉ lệ Ads/Doanh thu"
                    value={fmtPercent(
                      calculateAdsRatio(
                        monthlyLiveAdsCost || 0,
                        monthlyLiveIncomeBeforeDiscount || 0
                      )
                    )}
                    color="indigo"
                  />
                </Group>
              </Box>

              <Divider size="xs" color="gray.2" style={{ margin: "8px 0" }} />

              {/* Shop Section */}
              <Box
                p="md"
                style={{
                  backgroundColor: "rgba(174, 62, 201, 0.05)",
                  borderRadius: "12px",
                  border: "1px solid rgba(174, 62, 201, 0.1)"
                }}
              >
                <Flex align="center" justify="space-between" mb={16}>
                  <Flex align="center" gap={10}>
                    <Box
                      p={8}
                      style={{
                        backgroundColor: "#ae3ec9",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <IconShoppingBag size={16} color="white" />
                    </Box>
                    <Text fw={700} c="grape.8" fz="lg">
                      Sàn thương mại
                    </Text>
                  </Flex>
                  <Text fz="xs" c="grape.6" fw={500}>
                    Marketplace
                  </Text>
                </Flex>
                <Group justify="space-between" align="stretch" gap={12}>
                  <KPIBox
                    label="Doanh thu"
                    value={fmtVnd(monthlyShopIncome)}
                    unit="VNĐ"
                    color="violet"
                  />
                  <KPIBox
                    label="Chi phí Ads"
                    value={fmtVnd(monthlyShopAdsCost)}
                    unit="VNĐ"
                    color="orange"
                  />
                  <KPIBox
                    label="Lợi nhuận (sau ads)"
                    value={fmtVnd(
                      (monthlyShopIncome || 0) - (monthlyShopAdsCost || 0)
                    )}
                    unit="VNĐ"
                    color={
                      (monthlyShopIncome || 0) - (monthlyShopAdsCost || 0) > 0
                        ? "green"
                        : "red"
                    }
                  />
                  <KPIBox
                    label="Tỉ lệ Ads/Doanh thu"
                    value={fmtPercent(
                      calculateAdsRatio(
                        monthlyShopAdsCost || 0,
                        monthlyShopIncomeBeforeDiscount || 0
                      )
                    )}
                    color="grape"
                  />
                </Group>
              </Box>

              <Divider
                size="md"
                color="gray.3"
                label="Tổng hợp"
                labelPosition="center"
                style={{ margin: "16px 0" }}
              />

              {/* Total Section */}
              <Box
                p="md"
                style={{
                  backgroundColor: "rgba(73, 80, 87, 0.05)",
                  borderRadius: "12px",
                  border: "2px solid rgba(73, 80, 87, 0.15)",
                  position: "relative"
                }}
              >
                <Box
                  style={{
                    position: "absolute",
                    top: -1,
                    left: -1,
                    right: -1,
                    height: "4px",
                    background:
                      "linear-gradient(90deg, #1971c2 0%, #ae3ec9 100%)",
                    borderRadius: "12px 12px 0 0"
                  }}
                />
                <Flex align="center" justify="space-between" mb={16}>
                  <Flex align="center" gap={10}>
                    <Box
                      p={8}
                      style={{
                        backgroundColor: "#495057",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <IconSum size={16} color="white" />
                    </Box>
                    <Text fw={700} c="dark.8" fz="lg">
                      Tổng hợp
                    </Text>
                  </Flex>
                  <Text
                    fz="xs"
                    c="dark.5"
                    fw={600}
                    style={{
                      background: "linear-gradient(45deg, #1971c2, #ae3ec9)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}
                  >
                    Tổng cộng 2 kênh
                  </Text>
                </Flex>
                <Group justify="space-between" align="stretch" gap={12}>
                  <KPIBox
                    label="Tổng doanh thu"
                    value={fmtVnd(
                      (monthlyLiveIncome || 0) + (monthlyShopIncome || 0)
                    )}
                    unit="VNĐ"
                    color="teal"
                  />
                  <KPIBox
                    label="Tổng chi phí Ads"
                    value={fmtVnd(
                      (monthlyLiveAdsCost || 0) + (monthlyShopAdsCost || 0)
                    )}
                    unit="VNĐ"
                    color="orange"
                  />
                  <KPIBox
                    label="Tổng lợi nhuận (sau ads)"
                    value={fmtVnd(
                      (monthlyLiveIncome || 0) +
                        (monthlyShopIncome || 0) -
                        (monthlyLiveAdsCost || 0) -
                        (monthlyShopAdsCost || 0)
                    )}
                    unit="VNĐ"
                    color={
                      (monthlyLiveIncome || 0) +
                        (monthlyShopIncome || 0) -
                        (monthlyLiveAdsCost || 0) -
                        (monthlyShopAdsCost || 0) >
                      0
                        ? "green"
                        : "red"
                    }
                  />
                  <KPIBox
                    label="Tỉ lệ Ads/Doanh thu tổng"
                    value={fmtPercent(
                      calculateAdsRatio(
                        (monthlyLiveAdsCost || 0) + (monthlyShopAdsCost || 0),
                        (monthlyLiveIncomeBeforeDiscount || 0) +
                          (monthlyShopIncomeBeforeDiscount || 0)
                      )
                    )}
                    color="dark"
                  />
                </Group>
              </Box>
            </Stack>
          </Paper>
        </>
      }
    />
  )
}
