import {
  Alert,
  Button,
  Group,
  Paper,
  Progress,
  ScrollArea,
  Skeleton,
  Stack,
  Table,
  Text
} from "@mantine/core"
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react"
import { format } from "date-fns"
import type {
  RangeChannelComparisonMetricViewModel,
  RangeChannelComparisonRowViewModel,
  RangeChannelComparisonViewModel
} from "../../../hooks/useShopeePerformanceMetrics"
import { formatCurrency, formatPercent } from "../analytics/formatters"

const formatDecimal = (value: number) => {
  return value.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

const toneByKey = {
  revenue: {
    progress: "#3b82f6",
    background: "#dbeafe"
  },
  liveRevenue: {
    progress: "#cbd5e1",
    background: "#e2e8f0"
  },
  adsCost: {
    progress: "#f97316",
    background: "#ffedd5"
  },
  roas: {
    progress: "#a855f7",
    background: "#f3e8ff"
  }
} as const

const clampProgress = (value?: number | null) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, value))
}

const formatDateLabel = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return format(parsed, "dd/MM/yyyy")
}

const formatMetricValue = (metric: RangeChannelComparisonMetricViewModel) => {
  return metric.format === "currency"
    ? formatCurrency(metric.actual)
    : formatDecimal(metric.actual)
}

const formatMetricTarget = (metric: RangeChannelComparisonMetricViewModel) => {
  if (metric.target === null) return "--"

  return metric.format === "currency"
    ? formatCurrency(metric.target)
    : formatDecimal(metric.target)
}

const formatExpectedValue = (metric: RangeChannelComparisonMetricViewModel) => {
  if (metric.expectedValue === null) return "--"

  return metric.format === "currency"
    ? formatCurrency(metric.expectedValue)
    : formatDecimal(metric.expectedValue)
}

const MetricTableCell = ({
  metric,
  tone,
  beforeValue
}: {
  metric: RangeChannelComparisonMetricViewModel
  tone: keyof typeof toneByKey
  beforeValue?: number
}) => {
  const hasKpi =
    metric.target !== null &&
    metric.target > 0 &&
    metric.achievedPercentage !== null &&
    metric.expectedPercentage !== null &&
    metric.expectedValue !== null

  return (
    <Stack gap={6} miw={148}>
      <Text fw={700} fz="md" c="#0f172a">
        Sau hủy: {formatMetricValue(metric)} / {formatExpectedValue(metric)}
      </Text>
      {typeof beforeValue === "number" ? (
        <Text size="xs" fw={600} c="#64748b">
          Trước hủy: {metric.format === "currency" ? formatCurrency(beforeValue) : formatDecimal(beforeValue)}
        </Text>
      ) : null}
      {hasKpi ? (
        <>
          <Group justify="space-between" gap={8} mt={12} wrap="nowrap">
            <Text></Text>
            <Text size="xs" fw={700} c="#1d2844">
              Tiến độ: {formatPercent(metric.achievedPercentage ?? undefined)} /{" "}
              {formatPercent(metric.expectedPercentage ?? undefined)}
            </Text>
          </Group>
          <Progress
            value={clampProgress(metric.achievedPercentage)}
            size={5}
            radius="xl"
            color={toneByKey[tone].progress}
            styles={{
              root: {
                background: toneByKey[tone].background
              }
            }}
          />
          <Group justify="space-between" gap={8} wrap="nowrap">
            <Text size="xs" c="#5e6773" style={{ whiteSpace: "nowrap" }}>
              KPI khoảng chọn: {formatMetricTarget(metric)}
            </Text>
          </Group>
        </>
      ) : (
        <Text size="xs" c="#94a3b8">
          KPI --
        </Text>
      )}
    </Stack>
  )
}

const createTableRow = ({
  row
}: {
  row: RangeChannelComparisonRowViewModel
}) => {
  const isSummaryRow = row.channelId === "total"

  return (
    <Table.Tr key={`row-${row.channelId}`} style={{ background: "#ffffff" }}>
      <Table.Td miw={160}>
        <Text fw={isSummaryRow ? 700 : 600} c="#0f172a">
          {row.channelName}
        </Text>
      </Table.Td>
      <Table.Td>
        <MetricTableCell
          metric={row.revenue}
          tone="revenue"
          beforeValue={row.cancellation.before.revenue}
        />
      </Table.Td>
      <Table.Td>
        <MetricTableCell metric={row.liveRevenue} tone="liveRevenue" />
      </Table.Td>
      <Table.Td>
        <MetricTableCell
          metric={row.adsCost}
          tone="adsCost"
          beforeValue={row.cancellation.before.adsCost}
        />
      </Table.Td>
      <Table.Td>
        <MetricTableCell metric={row.roas} tone="roas" />
      </Table.Td>
      <Table.Td miw={112}>
        <Stack gap={2}>
          <Text fw={700} c="#0f172a">
            Sau hủy: {Math.round(row.cancellation.after.totalOrders).toLocaleString("vi-VN")} đơn
          </Text>
          <Text size="xs" fw={600} c="#64748b">
            Trước hủy: {Math.round(row.cancellation.before.totalOrders).toLocaleString("vi-VN")} đơn
          </Text>
        </Stack>
      </Table.Td>
      <Table.Td miw={90}>
        <Text fw={700} c="#0f172a">
          {formatPercent(row.adsRevenueRatio)}
        </Text>
      </Table.Td>
    </Table.Tr>
  )
}

const TableSkeleton = () => (
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
        <Skeleton height={16} width={260} radius="xl" />
        <Skeleton height={12} width={220} radius="xl" mt={10} />
      </div>
      <Skeleton height={320} radius="xl" />
    </Stack>
  </Paper>
)

export const RangeChannelComparisonTable = ({
  data,
  isLoading,
  isError,
  onRetry
}: {
  data?: RangeChannelComparisonViewModel
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}) => {
  if (isLoading && !data) {
    return <TableSkeleton />
  }

  if (isError && !data) {
    return (
      <Alert
        color="red"
        variant="light"
        radius="lg"
        icon={<IconAlertCircle size={18} />}
      >
        <Group justify="space-between" align="flex-start" gap="md">
          <div>
            <Text fw={700}>Không tải được bảng chi tiết theo shop</Text>
            <Text size="sm" mt={4}>
              Hệ thống chưa lấy được dữ liệu range của các kênh Shopee trong
              khoảng ngày đã chọn.
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
  }

  if (!data || data.rows.length === 0 || data.isEmpty) {
    return null
  }

  return (
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
          <Text fz="sm" fw={600} c="#475569">
            Chi tiết chỉ số theo từng shop
          </Text>
          <Text size="sm" c="#64748b" mt={4}>
            Tổng hợp {data.shopCount.toLocaleString("vi-VN")} kênh Shopee từ{" "}
            {formatDateLabel(data.orderFrom)} đến {formatDateLabel(data.orderTo)}.
            {" "}Các dòng chính là sau hủy, dòng phụ là trước hủy.
          </Text>
        </div>

        <ScrollArea>
          <Table
            verticalSpacing="md"
            horizontalSpacing="md"
            striped={false}
            highlightOnHover={false}
            withTableBorder
            withColumnBorders
            style={{
              minWidth: 1210,
              borderColor: "#e2e8f0"
            }}
          >
            <Table.Thead>
              <Table.Tr style={{ background: "#f8fafc" }}>
                <Table.Th miw={160}>Shop</Table.Th>
                <Table.Th miw={156}>Doanh thu (sau / trước hủy)</Table.Th>
                <Table.Th miw={156}>Tổng doanh thu live</Table.Th>
                <Table.Th miw={156}>Ads (sau / trước hủy)</Table.Th>
                <Table.Th miw={120}>ROAS</Table.Th>
                <Table.Th miw={112}>Đơn (sau / trước hủy)</Table.Th>
                <Table.Th miw={90}>%Ads/DT</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.rows.map((row) => createTableRow({ row }))}
              {createTableRow({ row: data.totals })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Stack>
    </Paper>
  )
}
