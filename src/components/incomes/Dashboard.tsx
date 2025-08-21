import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useIncomes } from "../../hooks/useIncomes"
import {
  Box,
  Flex,
  Text,
  Group,
  Button,
  Select,
  Stack,
  Paper
} from "@mantine/core"
import { modals } from "@mantine/modals"
import { IconBox, IconStars } from "@tabler/icons-react"
import { useMonthGoals } from "../../hooks/useMonthGoals"
import { KPIBox } from "./KPIBox"
import { DailyStatsModal } from "./DailyStatsModal"
import { TopCreatorsModal } from "./TopCreatorsModal"

export const Dashboard = () => {
  const [kpiView, setKpiView] = useState<"live" | "shop" | "total">("live")

  const {
    getKPIPercentageByMonth,
    getTotalIncomesByMonth,
    getTotalQuantityByMonth,
    getLiveVideoIncomeByMonth,
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
    queryKey: ["getLiveVideoIncomeByMonth", currentMonth, currentYear],
    queryFn: () =>
      getLiveVideoIncomeByMonth({ month: currentMonth, year: currentYear }),
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

  // Derived KPI values based on selected view
  const goalValue = monthGoalData
    ? kpiView === "live"
      ? monthGoalData.liveStreamGoal
      : kpiView === "shop"
        ? monthGoalData.shopGoal
        : (monthGoalData.liveStreamGoal || 0) + (monthGoalData.shopGoal || 0)
    : undefined

  const incomeValue = totalIncomesData
    ? kpiView === "live"
      ? totalIncomesData.totalIncome?.live
      : kpiView === "shop"
        ? totalIncomesData.totalIncome?.shop
        : (totalIncomesData.totalIncome?.live || 0) +
          (totalIncomesData.totalIncome?.shop || 0)
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
        (totalIncomesData?.totalIncome?.live || 0) +
        (totalIncomesData?.totalIncome?.shop || 0)
      return (totalIncome / totalGoal) * 100
    }
    const split = KPIPercentageData?.KPIPercentage
    if (!split) return undefined
    return split[kpiView]
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

  const monthlyLiveIncome = liveVideoIncomeMonthData?.totalIncome?.live
  const monthlyVideoIncome = liveVideoIncomeMonthData?.totalIncome?.video

  const monthlyLiveAdsCost = adsCostSplitMonthData?.liveAdsCost
  const monthlyVideoAdsCost = adsCostSplitMonthData?.videoAdsCost

  const fmtVnd = (n?: number) =>
    typeof n === "number" ? n.toLocaleString() : "..."

  return (
    <Box
      mt={40}
      mx="auto"
      px={{ base: 8, md: 0 }}
      w="100%"
      style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: 20,
        boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
        border: "1px solid #ececec"
      }}
    >
      {/* Header Section */}
      <Flex
        align="center"
        justify="space-between"
        pt={32}
        pb={16}
        px={{ base: 8, md: 28 }}
        direction={{ base: "column", sm: "row" }}
        gap={12}
      >
        <Box>
          <Text fw={700} fz="xl" mb={2}>
            Dashboard Doanh Thu
          </Text>
          <Text c="dimmed" fz="sm">
            Tổng quan số liệu và hiệu suất KPI
          </Text>
        </Box>

        {/* Quick Actions */}
        <Group gap={8} align="center" w={{ base: "100%", sm: "auto" }}>
          <Button
            color="blue"
            variant="light"
            size="md"
            radius="xl"
            leftSection={<IconBox size={16} />}
            onClick={() => {
              modals.open({
                title: <b>Chỉ số ngày</b>,
                children: <DailyStatsModal />,
                size: "xl"
              })
            }}
          >
            Chỉ số ngày
          </Button>
          <Button
            color="grape"
            variant="light"
            size="md"
            radius="xl"
            leftSection={<IconStars size={16} />}
            onClick={() => {
              modals.open({
                title: <b>Top nhà sáng tạo</b>,
                children: <TopCreatorsModal />,
                size: "xl"
              })
            }}
          >
            Top creator
          </Button>
        </Group>
      </Flex>

      {/* Dashboard Content */}
      <Box pt={16} pb={32} px={{ base: 8, md: 28 }} w="100%">
        <Group justify="space-between" align="center" mb={16}>
          <Text fw={600} fz="lg">
            Số liệu theo tháng (tháng hiện tại)
          </Text>
          <Select
            value={kpiView}
            onChange={(v) => setKpiView((v as any) ?? "live")}
            data={[
              { label: "Livestream", value: "live" },
              { label: "Shop", value: "shop" },
              { label: "Tổng", value: "total" }
            ]}
            size="sm"
            w={140}
            radius="md"
          />
        </Group>

        {/* KPI Performance Section */}
        <Paper
          w={"100%"}
          p="lg"
          withBorder
          radius="lg"
          mb={16}
          bg="rgba(59, 130, 246, 0.02)"
        >
          <Text fw={600} mb={12} c="blue.7">
            Hiệu suất KPI -{" "}
            {kpiView === "total"
              ? "Tổng hợp"
              : kpiView === "live"
                ? "Livestream"
                : "Shop"}
          </Text>
          <Group w={"100%"} justify="space-between" align="stretch" gap={12}>
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
                incomeValue !== undefined ? incomeValue.toLocaleString() : "..."
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

        {/* Revenue & Costs Breakdown */}
        <Paper withBorder p="lg" radius="lg" mb={16}>
          <Text fw={600} mb={12} c="gray.7">
            Chi tiết doanh thu & chi phí
          </Text>
          <Stack gap={16}>
            {/* Revenue Row */}
            <Group justify="space-between" align="stretch" gap={12}>
              <KPIBox
                label="Doanh thu Livestream"
                value={fmtVnd(monthlyLiveIncome)}
                unit="VNĐ"
                color="teal"
              />
              <KPIBox
                label="Doanh thu Video"
                value={fmtVnd(monthlyVideoIncome)}
                unit="VNĐ"
                color="grape"
              />
            </Group>

            {/* Costs Row */}
            <Group justify="space-between" align="stretch" gap={12}>
              <KPIBox
                label="Chi phí Ads Live"
                value={fmtVnd(monthlyLiveAdsCost)}
                unit="VNĐ"
                color="red"
              />
              <KPIBox
                label="Chi phí Ads Video"
                value={fmtVnd(monthlyVideoAdsCost)}
                unit="VNĐ"
                color="pink"
              />
            </Group>
          </Stack>
        </Paper>

        {/* Ads Performance Ratios */}
        {adsCostSplitMonthData?.percentages && (
          <Paper withBorder p="lg" radius="lg" bg="rgba(16, 185, 129, 0.02)">
            <Text fw={600} mb={12} c="teal.7">
              Hiệu suất quảng cáo
            </Text>
            <Group justify="space-between" align="stretch" gap={12}>
              <KPIBox
                label="Tỉ lệ Ads/Doanh thu Live"
                value={`${Math.round((adsCostSplitMonthData.percentages.liveAdsToLiveIncome + Number.EPSILON) * 100) / 100}%`}
                color={
                  adsCostSplitMonthData.percentages.liveAdsToLiveIncome > 30
                    ? "red"
                    : adsCostSplitMonthData.percentages.liveAdsToLiveIncome > 20
                      ? "yellow"
                      : "green"
                }
              />
              <KPIBox
                label="Tỉ lệ Ads/Doanh thu Video"
                value={`${Math.round((adsCostSplitMonthData.percentages.videoAdsToVideoIncome + Number.EPSILON) * 100) / 100}%`}
                color={
                  adsCostSplitMonthData.percentages.videoAdsToVideoIncome > 30
                    ? "red"
                    : adsCostSplitMonthData.percentages.videoAdsToVideoIncome >
                        20
                      ? "yellow"
                      : "green"
                }
              />
              <KPIBox
                label="Lợi nhuận Live (sau ads)"
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
                label="Lợi nhuận Video (sau ads)"
                value={fmtVnd(
                  (monthlyVideoIncome || 0) - (monthlyVideoAdsCost || 0)
                )}
                unit="VNĐ"
                color={
                  (monthlyVideoIncome || 0) - (monthlyVideoAdsCost || 0) > 0
                    ? "green"
                    : "red"
                }
              />
            </Group>
          </Paper>
        )}
      </Box>
    </Box>
  )
}
