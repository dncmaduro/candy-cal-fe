import {
  Alert,
  Box,
  Button,
  Group,
  Paper,
  Progress,
  Skeleton,
  Stack,
  Text,
  rem
} from "@mantine/core"
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
import type {
  MonthlyChannelComparisonViewModel,
  MonthlyMetricsViewModel
} from "../../../hooks/useShopeePerformanceMetrics"
import { formatCurrency, formatPercent } from "../analytics/formatters"
import { MonthlyChannelComparisonTable } from "./MonthlyChannelComparisonTable"

const metricSummaryKeys = new Set<ShopeeDashboardMetricViewModel["key"]>([
  "revenue",
  "adsCost",
  "roas"
])

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

const clampPercentage = (value: number) => {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

const SummaryProgressCard = ({
  label,
  value,
  icon,
  tone,
  kpiLabel,
  progressLabel,
  progressValue,
  auxiliary
}: {
  label: string
  value: string
  icon?: JSX.Element
  tone: string
  kpiLabel?: string
  progressLabel?: string
  progressValue?: number
  auxiliary?: string
}) => {
  const toneStyles: Record<
    string,
    {
      background: string
      color: string
      progress: string
    }
  > = {
    blue: {
      background: "#eff6ff",
      color: "#3b82f6",
      progress: "#60a5fa"
    },
    cyan: {
      background: "#ecfeff",
      color: "#06b6d4",
      progress: "#2dd4bf"
    },
    teal: {
      background: "#ecfdf5",
      color: "#10b981",
      progress: "#cbd5e1"
    },
    grape: {
      background: "#faf5ff",
      color: "#d946ef",
      progress: "#c084fc"
    },
    orange: {
      background: "#fff7ed",
      color: "#f97316",
      progress: "#fb923c"
    }
  }

  const currentTone = toneStyles[tone] ?? toneStyles.blue
  const hasProgress = typeof progressValue === "number"

  return (
    <Paper
      withBorder
      radius={18}
      p="md"
      style={{
        height: "100%",
        borderColor: "#dbe4f0",
        boxShadow: "0 8px 28px rgba(15, 23, 42, 0.05)",
        background: "#ffffff"
      }}
    >
      <Stack gap={10} h="100%">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Text fz="sm" fw={500} c="#64748b">
            {label}
          </Text>
          {icon && (
            <Box
              style={{
                flexShrink: 0,
                width: 36,
                height: 36,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: currentTone.background,
                color: currentTone.color
              }}
            >
              {icon}
            </Box>
          )}
        </Group>

        <Text
          fw={700}
          fz="2rem"
          lh={1.05}
          c="#0f172a"
          style={{ letterSpacing: "-0.04em" }}
        >
          {value}
        </Text>

        <Stack gap={2}>
          <Text size="sm" fw={600} c="#475569">
            {kpiLabel ?? "--"}
          </Text>
          {auxiliary && (
            <Text size="sm" c="#64748b">
              {auxiliary}
            </Text>
          )}
        </Stack>

        <Stack gap={6} mt="auto">
          <Text size="sm" fw={600} c={hasProgress ? "#475569" : "#94a3b8"}>
            {progressLabel ?? "--"}
          </Text>
          <Progress
            radius="xl"
            size="sm"
            value={hasProgress ? clampPercentage(progressValue) : 0}
            color={currentTone.progress}
            styles={{
              root: {
                background: "#e5e7eb"
              }
            }}
          />
        </Stack>
      </Stack>
    </Paper>
  )
}

const SummaryCardsSkeleton = () => (
  <Box style={createResponsiveGridStyle(280)}>
    {Array.from({ length: 5 }).map((_, index) => (
      <Skeleton key={index} height={154} radius="xl" />
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
  comparisonData?: MonthlyChannelComparisonViewModel
  isLoading: boolean
  isError: boolean
  comparisonLoading: boolean
  comparisonError: boolean
  selectedChannelId?: string
  onRetry: () => void
}

export const MonthlyDashboard = ({
  data,
  comparisonData,
  isLoading,
  isError,
  comparisonLoading,
  comparisonError,
  selectedChannelId,
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
    return <SummaryCardsSkeleton />
  }

  if (!data) return null

  if (data.isEmpty && (!comparisonData || comparisonData.isEmpty)) {
    return <DashboardEmptyState onRetry={onRetry} />
  }

  const visibleSummaryItems = data.summaryItems.filter(
    (item) =>
      item.key !== "adsRevenueRatio" && item.key !== "avgRevenuePerDayVsKpi"
  )
  const adsRevenueRatioItem = data.summaryItems.find(
    (item) => item.key === "adsRevenueRatio"
  )

  return (
    <>
      <Box style={createResponsiveGridStyle(280)}>
        {visibleSummaryItems.map((item) => {
          const relatedMetric =
            item.key === "totalOrders" ||
            item.key === "liveRevenue" ||
            !metricSummaryKeys.has(
              item.key as ShopeeDashboardMetricViewModel["key"]
            )
              ? undefined
              : metricsByKey.get(item.key as ShopeeDashboardMetricViewModel["key"])

          return (
            <SummaryProgressCard
              key={item.key}
              label={item.label}
              value={formatSummaryValue(item)}
              tone={summaryTones[item.key]}
              icon={summaryIcons[item.key]}
              kpiLabel={
                relatedMetric
                  ? `KPI ${formatMetricTarget(relatedMetric)}`
                  : "--"
              }
              auxiliary={
                item.key === "roas" && adsRevenueRatioItem
                  ? `% Ads so với doanh thu: ${formatSummaryValue(adsRevenueRatioItem)}`
                  : undefined
              }
              progressLabel={
                relatedMetric
                  ? `${formatPercent(relatedMetric.achievedPercentage)} đạt kế hoạch`
                  : undefined
              }
              progressValue={
                relatedMetric
                  ? relatedMetric.achievedPercentage
                  : undefined
              }
            />
          )
        })}
      </Box>

      <MonthlyChannelComparisonTable
        data={comparisonData}
        isLoading={comparisonLoading}
        isError={comparisonError}
        selectedChannelId={selectedChannelId}
        onRetry={onRetry}
      />
    </>
  )
}
