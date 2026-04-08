import { Alert, Group, Progress, SimpleGrid, Skeleton, Stack, Text } from "@mantine/core"
import {
  IconCurrentLocation,
  IconFlag3,
  IconGauge,
  IconTargetArrow,
  IconTrendingUp3
} from "@tabler/icons-react"
import { MetricStatCard } from "./MetricStatCard"
import { TrendBadge } from "./TrendBadge"
import { formatCompactCurrency, formatCurrency, formatPercent } from "./formatters"

interface DailyKpiSummaryProps {
  revenue: number
  goal?: number
  achievedPct?: number
  expectedPct: number
  deltaPct?: number
  forecastMonthRevenue?: number
  monthGoal?: number
  rangeLabel?: string
  rangeDays?: number
  isLoading?: boolean
}

export const DailyKpiSummary = ({
  revenue,
  goal,
  achievedPct,
  expectedPct,
  deltaPct,
  forecastMonthRevenue,
  monthGoal,
  rangeLabel,
  rangeDays = 1,
  isLoading = false
}: DailyKpiSummaryProps) => {
  if (isLoading) {
    return (
      <Stack gap="md">
        <Stack gap={2}>
          <Text
            fz="xs"
            fw={700}
            tt="uppercase"
            c="dimmed"
            style={{ letterSpacing: "0.16em" }}
          >
            KPI theo khoảng
          </Text>
          <Text fw={700} fz="xl">
            Tốc độ đạt KPI
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 2, xl: 5 }} spacing="md">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} radius="xl" height={154} />
          ))}
        </SimpleGrid>
      </Stack>
    )
  }

  const hasGoal = typeof goal === "number" && goal > 0
  const progressValue = Math.max(0, Math.min(100, achievedPct ?? 0))
  const rangeDaysText = rangeDays > 1 ? `${rangeDays} ngày` : "1 ngày"

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end">
        <Stack gap={2}>
          <Text
            fz="xs"
            fw={700}
            tt="uppercase"
            c="dimmed"
            style={{ letterSpacing: "0.16em" }}
          >
            KPI theo khoảng
          </Text>
          <Text fw={700} fz="xl">
            Tốc độ đạt KPI
          </Text>
          <Text fz="sm" c="dimmed">
            {rangeLabel
              ? `Bám theo khoảng ${rangeLabel} để nhìn nhanh doanh thu, KPI, kỳ vọng và độ lệch.`
              : "Bám theo đúng khoảng đang lọc để nhìn nhanh doanh thu, KPI, kỳ vọng và độ lệch."}
          </Text>
        </Stack>

        {hasGoal && (
          <Stack gap={4} align="flex-end">
            <Group gap={10}>
              <Text fw={800} fz="lg">
                {formatPercent(achievedPct)}
              </Text>
              <TrendBadge value={deltaPct} />
            </Group>
          </Stack>
        )}
      </Group>

      {!hasGoal && (
        <Alert color="yellow" variant="light" radius="lg">
          Chưa có KPI cho khoảng đang lọc. Doanh thu vẫn được hiển thị nhưng chưa
          thể tính % đạt và độ lệch kỳ vọng.
        </Alert>
      )}

      {hasGoal && (
        <Progress radius="xl" size="lg" value={progressValue} color={progressValue >= 100 ? "teal" : progressValue >= expectedPct ? "blue" : "orange"} />
      )}

      <SimpleGrid cols={{ base: 1, md: 2, xl: 5 }} spacing="md" verticalSpacing="md">
        <MetricStatCard
          label="Doanh thu"
          value={formatCurrency(revenue)}
          hint="Doanh thu đã ghi nhận trong khoảng đang lọc."
          icon={<IconCurrentLocation size={20} />}
          tone="blue"
        />
        <MetricStatCard
          label="KPI"
          value={hasGoal ? formatCurrency(goal) : "Chưa có"}
          hint={`Mốc KPI cần đạt trong ${rangeDaysText} đang lọc.`}
          icon={<IconFlag3 size={20} />}
          tone="cyan"
        />
        <MetricStatCard
          label="% Đạt KPI"
          value={hasGoal ? formatPercent(achievedPct) : "Chưa có"}
          hint="Tỷ lệ hoàn thành KPI của khoảng lọc theo doanh thu thực tế."
          icon={<IconTargetArrow size={20} />}
          tone="teal"
        />
        <MetricStatCard
          label="Tiến độ kì vọng"
          value={formatPercent(expectedPct)}
          hint="Tỷ lệ kỳ vọng theo phần thời gian đã trôi qua của khoảng lọc."
          icon={<IconGauge size={20} />}
          tone="grape"
          trailing={hasGoal ? <TrendBadge value={deltaPct} /> : undefined}
        />
        {typeof forecastMonthRevenue === "number" && (
          <MetricStatCard
            label="Dự báo cuối tháng"
            value={formatCompactCurrency(forecastMonthRevenue)}
            hint={
              typeof monthGoal === "number" && monthGoal > 0
                ? `So với mục tiêu tháng ${formatCompactCurrency(monthGoal)}`
                : "Ước tính theo tốc độ doanh thu từ đầu tháng tới nay."
            }
            icon={<IconTrendingUp3 size={20} />}
            tone="indigo"
          />
        )}
      </SimpleGrid>
    </Stack>
  )
}
