import { Alert, Box, Button, Paper, Skeleton, Stack, Text, rem } from "@mantine/core"
import {
  IconAlertCircle,
  IconBroadcast,
  IconCash,
  IconChartBar,
  IconPercentage,
  IconRefresh,
  IconReceipt2,
  IconTargetArrow
} from "@tabler/icons-react"
import { LineChart } from "@mantine/charts"
import { format as formatDate } from "date-fns"
import { parseDateInputValue } from "./performanceTimeUtils"
import type { ShopeeDashboardSummaryItem } from "../../../hooks/models"
import type {
  RangeMetricsViewModel,
  RangeNormalizedMetricItem
} from "../../../hooks/useShopeePerformanceMetrics"
import { MetricStatCard } from "../analytics/MetricStatCard"
import { formatCurrency } from "../analytics/formatters"

const createResponsiveGridStyle = (minColumnWidth: number) => ({
  display: "grid",
  gap: rem(16),
  gridTemplateColumns: `repeat(auto-fit, minmax(min(${rem(minColumnWidth)}, 100%), 1fr))`
})

const formatDecimal = (value: number) => {
  return value.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

const formatSummaryValue = (item: ShopeeDashboardSummaryItem) => {
  if (item.format === "currency") return formatCurrency(item.value)
  if (item.format === "percentage") return `${formatDecimal(item.value)}%`
  if (item.format === "decimal") return formatDecimal(item.value)
  return `${Math.round(item.value).toLocaleString("vi-VN")} đơn`
}

const formatNormalizedValue = (item: RangeNormalizedMetricItem) => {
  if (item.format === "currency") return formatCurrency(item.value)
  if (item.format === "percentage") return `${formatDecimal(item.value)}%`
  if (item.format === "integer") return Math.round(item.value).toLocaleString("vi-VN")
  return formatDecimal(item.value)
}

const formatDateLabel = (value: string) => {
  const parsed = parseDateInputValue(value)
  if (!parsed) return value

  return formatDate(parsed, "dd/MM")
}

const RangeDashboardSkeleton = () => (
  <Stack gap="lg">
    <Box style={createResponsiveGridStyle(280)}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} height={154} radius="xl" />
      ))}
    </Box>

    <Box style={createResponsiveGridStyle(280)}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} height={154} radius="xl" />
      ))}
    </Box>

    <Box style={createResponsiveGridStyle(360)}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} height={280} radius="xl" />
      ))}
    </Box>
  </Stack>
)

const RangeErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <Alert
    color="red"
    variant="light"
    radius="lg"
    icon={<IconAlertCircle size={18} />}
  >
    <Stack gap="sm">
      <Text fw={700}>Không tải được dữ liệu phân tích theo ngày</Text>
      <Text size="sm">
        Hệ thống chưa lấy được summary hoặc timeseries cho khoảng ngày đã chọn.
      </Text>
      <Button
        variant="white"
        color="red"
        leftSection={<IconRefresh size={16} />}
        onClick={onRetry}
      >
        Thử lại
      </Button>
    </Stack>
  </Alert>
)

const RangeEmptyState = ({ onRetry }: { onRetry: () => void }) => (
  <Paper
    withBorder
    radius={24}
    p="xl"
    style={{
      borderColor: "#dbe4f0",
      background: "#ffffff",
      boxShadow: "0 12px 34px rgba(15, 23, 42, 0.05)"
    }}
  >
    <Stack gap="sm" align="center" py="xl">
      <Text fw={700} fz="lg">
        Chưa có dữ liệu trong khoảng ngày này
      </Text>
      <Text c="dimmed" ta="center" maw={520}>
        Thử điều chỉnh khoảng ngày hoặc kênh Shopee để xem dữ liệu chi tiết hơn.
      </Text>
      <Button
        mt="sm"
        variant="light"
        leftSection={<IconRefresh size={16} />}
        onClick={onRetry}
      >
        Tải lại
      </Button>
    </Stack>
  </Paper>
)

interface DailyAnalyticsDashboardProps {
  data?: RangeMetricsViewModel
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export const DailyAnalyticsDashboard = ({
  data,
  isLoading,
  isError,
  onRetry
}: DailyAnalyticsDashboardProps) => {
  const summaryTones: Record<ShopeeDashboardSummaryItem["key"], string> = {
    revenue: "blue",
    liveRevenue: "cyan",
    adsCost: "orange",
    roas: "grape",
    totalOrders: "teal",
    adsRevenueRatio: "orange",
    avgRevenuePerDayVsKpi: "lime"
  }

  const summaryIcons = {
    revenue: <IconCash size={20} />,
    liveRevenue: <IconBroadcast size={20} />,
    adsCost: <IconChartBar size={20} />,
    roas: <IconTargetArrow size={20} />,
    totalOrders: <IconReceipt2 size={20} />,
    adsRevenueRatio: <IconPercentage size={20} />,
    avgRevenuePerDayVsKpi: <IconPercentage size={20} />
  } satisfies Record<ShopeeDashboardSummaryItem["key"], JSX.Element>

  if (isError && !data) {
    return <RangeErrorState onRetry={onRetry} />
  }

  if (isLoading && !data) {
    return <RangeDashboardSkeleton />
  }

  if (!data) return null

  if (data.isEmpty) {
    return <RangeEmptyState onRetry={onRetry} />
  }

  const chartData = data.series.map((item) => ({
    label: formatDateLabel(item.orderDate),
    revenue: item.revenue,
    orders: item.orders,
    adsCost: item.adsCost,
    roas: item.roas
  }))

  return (
    <Stack gap="lg">
      <Box style={createResponsiveGridStyle(280)}>
        {data.summaryItems.map((item) => (
          <MetricStatCard
            key={item.key}
            label={item.label}
            value={formatSummaryValue(item)}
            tone={summaryTones[item.key]}
            icon={summaryIcons[item.key]}
            hint={item.description}
          />
        ))}
      </Box>

      <Paper
        withBorder
        radius={24}
        p="lg"
        style={{
          borderColor: "#dbe4f0",
          background: "#ffffff",
          boxShadow: "0 12px 34px rgba(15, 23, 42, 0.05)"
        }}
      >
        <Stack gap="md">
          <div>
            <Text fw={700} fz="xl" mt={4}>
              Trung bình theo ngày và hiệu quả đơn hàng
            </Text>
          </div>

          <Box style={createResponsiveGridStyle(280)}>
            {data.normalizedItems.map((item) => (
              <MetricStatCard
                key={item.key}
                label={item.label}
                value={formatNormalizedValue(item)}
                tone="indigo"
                hint={item.description}
              />
            ))}
          </Box>
        </Stack>
      </Paper>

      <Paper
        withBorder
        radius={24}
        p="lg"
        style={{
          borderColor: "#dbe4f0",
          background: "#ffffff",
          boxShadow: "0 12px 34px rgba(15, 23, 42, 0.05)"
        }}
      >
        <Stack gap="md">
          <div>
            <Text fz="sm" fw={600} c="#0f172a">
              Xu hướng theo ngày
            </Text>
            <Text fw={700} fz="xl" mt={4}>
              Doanh thu, đơn hàng, ads cost và ROAS
            </Text>
          </div>

          <Box style={createResponsiveGridStyle(360)}>
            <Paper withBorder radius={20} p="md" style={{ borderColor: "#e2e8f0" }}>
              <Text fw={600} size="sm" mb="sm">
                Doanh thu theo ngày
              </Text>
              <LineChart
                h={220}
                data={chartData}
                dataKey="label"
                withLegend={false}
                series={[{ name: "revenue", color: "blue.6" }]}
                curveType="monotone"
                yAxisProps={{
                  width: 72
                }}
              />
            </Paper>

            <Paper withBorder radius={20} p="md" style={{ borderColor: "#e2e8f0" }}>
              <Text fw={600} size="sm" mb="sm">
                Đơn hàng theo ngày
              </Text>
              <LineChart
                h={220}
                data={chartData}
                dataKey="label"
                withLegend={false}
                series={[{ name: "orders", color: "teal.6" }]}
                curveType="monotone"
              />
            </Paper>

            <Paper withBorder radius={20} p="md" style={{ borderColor: "#e2e8f0" }}>
              <Text fw={600} size="sm" mb="sm">
                Ads cost theo ngày
              </Text>
              <LineChart
                h={220}
                data={chartData}
                dataKey="label"
                withLegend={false}
                series={[{ name: "adsCost", color: "orange.6" }]}
                curveType="monotone"
                yAxisProps={{
                  width: 72
                }}
              />
            </Paper>

            <Paper withBorder radius={20} p="md" style={{ borderColor: "#e2e8f0" }}>
              <Text fw={600} size="sm" mb="sm">
                ROAS theo ngày
              </Text>
              <LineChart
                h={220}
                data={chartData}
                dataKey="label"
                withLegend={false}
                series={[{ name: "roas", color: "grape.6" }]}
                curveType="monotone"
              />
            </Paper>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  )
}
