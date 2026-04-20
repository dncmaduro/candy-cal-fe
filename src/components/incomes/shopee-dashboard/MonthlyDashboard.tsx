import { Alert, Box, Button, Group, Paper, Skeleton, Stack, Text, rem } from "@mantine/core"
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
import type { ShopeeDashboardMetricViewModel, ShopeeDashboardSummaryItem } from "../../../hooks/models"
import type { MonthlyMetricsViewModel } from "../../../hooks/useShopeePerformanceMetrics"
import { MetricStatCard } from "../analytics/MetricStatCard"
import { formatCurrency } from "../analytics/formatters"
import { ShopeeDashboardMetricCard } from "./ShopeeDashboardMetricCard"

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

const formatMetricTarget = (metric?: ShopeeDashboardMetricViewModel) => {
  if (!metric) return undefined

  return metric.format === "currency"
    ? formatCurrency(metric.target)
    : formatDecimal(metric.target)
}

const SummaryCardsSkeleton = () => (
  <Box style={createResponsiveGridStyle(280)}>
    {Array.from({ length: 7 }).map((_, index) => (
      <Skeleton key={index} height={154} radius="xl" />
    ))}
  </Box>
)

const MetricCardsSkeleton = () => (
  <Box style={createResponsiveGridStyle(360)}>
    {Array.from({ length: 3 }).map((_, index) => (
      <Skeleton key={index} height={320} radius="xl" />
    ))}
  </Box>
)

const DashboardEmptyState = ({ onRetry }: { onRetry: () => void }) => (
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
        Chưa có dữ liệu dashboard cho bộ lọc hiện tại
      </Text>
      <Text c="dimmed" ta="center" maw={520}>
        Tất cả KPI và số liệu thực tế hiện đang bằng 0. Kiểm tra lại tháng, năm
        hoặc shop Shopee rồi tải lại dữ liệu.
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

const DashboardErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <Alert
    color="red"
    variant="light"
    radius="lg"
    icon={<IconAlertCircle size={18} />}
  >
    <Group justify="space-between" align="flex-start" gap="md">
      <div>
        <Text fw={700}>Không tải được dashboard Shopee</Text>
        <Text size="sm" mt={4}>
          Hệ thống chưa lấy được dữ liệu tổng quan tháng. Thử tải lại để đồng
          bộ lại trạng thái.
        </Text>
      </div>

      <Button
        variant="white"
        color="red"
        leftSection={<IconRefresh size={16} />}
        onClick={onRetry}
      >
        Thử lại
      </Button>
    </Group>
  </Alert>
)

interface MonthlyDashboardProps {
  data?: MonthlyMetricsViewModel
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export const MonthlyDashboard = ({
  data,
  isLoading,
  isError,
  onRetry
}: MonthlyDashboardProps) => {
  const metricsByKey = new Map<
    ShopeeDashboardMetricViewModel["key"],
    ShopeeDashboardMetricViewModel
  >()
  data?.metrics.forEach((metric) => {
    metricsByKey.set(metric.key, metric)
  })

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
    return <DashboardErrorState onRetry={onRetry} />
  }

  if (isLoading && !data) {
    return (
      <>
        <SummaryCardsSkeleton />
        <MetricCardsSkeleton />
      </>
    )
  }

  if (!data) return null

  if (data.isEmpty) {
    return <DashboardEmptyState onRetry={onRetry} />
  }

  const revenueTarget = Number.isFinite(data.revenueTarget)
    ? data.revenueTarget
    : 0

  return (
    <>
      <Box style={createResponsiveGridStyle(280)}>
        {data.summaryItems.map((item) => {
          const relatedMetric =
            item.key === "totalOrders" ||
            item.key === "liveRevenue" ||
            item.key === "adsRevenueRatio" ||
            item.key === "avgRevenuePerDayVsKpi"
              ? undefined
              : metricsByKey.get(item.key)

          return (
            <MetricStatCard
              key={item.key}
              label={item.label}
              value={formatSummaryValue(item)}
              tone={summaryTones[item.key]}
              icon={summaryIcons[item.key]}
              trailing={
                item.key === "avgRevenuePerDayVsKpi" ? (
                  <Text size="sm" fw={700} c="#475569">
                    KPI tháng {formatCurrency(revenueTarget)}
                  </Text>
                ) : relatedMetric ? (
                  <Text size="sm" fw={700} c="#475569">
                    KPI {formatMetricTarget(relatedMetric)}
                  </Text>
                ) : undefined
              }
            />
          )
        })}
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
            <Text fz="sm" fw={600} c="#0f172a">
              KPI và tiến độ
            </Text>
            <Text fw={700} fz="xl" mt={4}>
              Theo dõi chỉ tiêu và tiến độ theo từng chỉ số
            </Text>
          </div>

          <Box style={createResponsiveGridStyle(360)}>
            {data.metrics.map((metric) => (
              <ShopeeDashboardMetricCard key={metric.key} metric={metric} />
            ))}
          </Box>
        </Stack>
      </Paper>
    </>
  )
}
