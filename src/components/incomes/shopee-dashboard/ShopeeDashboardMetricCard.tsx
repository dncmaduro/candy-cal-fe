import {
  Badge,
  Box,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  rem
} from "@mantine/core"
import type { ShopeeDashboardMetricViewModel } from "../../../hooks/shopeeDashboardApi"
import {
  formatCurrency,
  formatPercent,
  formatSignedPercent
} from "../analytics/formatters"

const clampPercentage = (value: number) => {
  return Math.min(100, Math.max(0, value))
}

const formatDecimal = (value: number) => {
  return value.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

const formatMetricValue = (
  value: number,
  format: ShopeeDashboardMetricViewModel["format"]
) => {
  return format === "currency" ? formatCurrency(value) : formatDecimal(value)
}

const formatPaceRatio = (value: number) => {
  return `${formatDecimal(value)}x`
}

const getPaceMeta = (status: ShopeeDashboardMetricViewModel["paceStatus"]) => {
  switch (status) {
    case "ahead":
      return {
        color: "teal",
        label: "Vượt tiến độ"
      }
    case "on-track":
      return {
        color: "blue",
        label: "Đúng tiến độ"
      }
    case "behind":
      return {
        color: "orange",
        label: "Chậm tiến độ"
      }
    default:
      return {
        color: "gray",
        label: "Chưa có tiến độ"
      }
  }
}

const getProgressColor = (
  status: ShopeeDashboardMetricViewModel["paceStatus"]
) => {
  if (status === "ahead") return "teal"
  if (status === "on-track") return "blue"
  if (status === "behind") return "orange"
  return "gray"
}

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      borderRadius: 16,
      border: "1px solid #dbe4f0",
      background: "#f8fafc",
      padding: "12px 14px"
    }}
  >
    <Text fz="sm" fw={600} c="#0f172a">
      {label}
    </Text>
    <Text mt={6} fw={700} c="#0f172a">
      {value}
    </Text>
  </div>
)

export const ShopeeDashboardMetricCard = ({
  metric
}: {
  metric: ShopeeDashboardMetricViewModel
}) => {
  const paceMeta = getPaceMeta(metric.paceStatus)
  const detailGridStyle = {
    display: "grid",
    gap: rem(12),
    gridTemplateColumns: `repeat(auto-fit, minmax(min(${rem(132)}, 100%), 1fr))`
  } as const

  return (
    <Paper
      withBorder
      radius={24}
      p="lg"
      style={{
        height: "100%",
        borderColor: "#dbe4f0",
        boxShadow: "0 12px 34px rgba(15, 23, 42, 0.05)",
        background: "#ffffff"
      }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
          <div>
            <Text fz="sm" fw={600} c="#0f172a">
              {metric.label}
            </Text>
            <Text fw={700} fz="2rem" lh={1.05} mt={10} c="#0f172a">
              {formatMetricValue(metric.actual, metric.format)}
            </Text>
            <Text size="sm" c="dimmed" mt={6}>
              KPI {formatMetricValue(metric.target, metric.format)}
            </Text>
            {metric.isAdjusted &&
              typeof metric.originalActual === "number" &&
              metric.originalActual !== metric.actual && (
                <Text size="sm" c="blue.7" mt={6}>
                  Gốc {formatMetricValue(metric.originalActual, metric.format)}
                </Text>
              )}
          </div>

          <Badge color={paceMeta.color} variant="light" radius="xl" size="lg">
            {paceMeta.label}
          </Badge>
        </Group>

        <Stack gap={8}>
          <Group justify="space-between" gap="sm">
            <Text size="sm" fw={600} c="#0f172a">
              % đạt kế hoạch
            </Text>
            <Text fw={700}>{formatPercent(metric.achievedPercentage)}</Text>
          </Group>
          <Progress
            radius="xl"
            size="md"
            color={getProgressColor(metric.paceStatus)}
            value={clampPercentage(metric.achievedPercentage)}
          />
        </Stack>

        <Box style={detailGridStyle}>
          <DetailItem
            label="% kỳ vọng"
            value={formatPercent(metric.expectedPercentage)}
          />
          <DetailItem
            label="Chênh lệch"
            value={formatSignedPercent(metric.gapPercentage)}
          />
          <DetailItem
            label="Tốc độ"
            value={formatPaceRatio(metric.paceRatio)}
          />
        </Box>
      </Stack>
    </Paper>
  )
}
