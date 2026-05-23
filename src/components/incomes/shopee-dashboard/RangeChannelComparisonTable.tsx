import {
  Alert,
  Button,
  Group,
  Paper,
  ScrollArea,
  Skeleton,
  Stack,
  Table,
  Text
} from "@mantine/core"
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react"
import { format } from "date-fns"
import type {
  RangeChannelComparisonRowViewModel,
  RangeChannelComparisonViewModel
} from "../../../hooks/useShopeePerformanceMetrics"
import { formatCurrency } from "../analytics/formatters"

const formatDecimal = (value: number) => {
  return value.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

const formatDateLabel = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return format(parsed, "dd/MM/yyyy")
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
      <Table.Td miw={156}>
        <Text fw={700} c="#0f172a">
          {formatCurrency(row.revenue)}
        </Text>
      </Table.Td>
      <Table.Td miw={156}>
        <Text fw={700} c="#0f172a">
          {formatCurrency(row.liveRevenue)}
        </Text>
      </Table.Td>
      <Table.Td miw={156}>
        <Text fw={700} c="#0f172a">
          {formatCurrency(row.adsCost)}
        </Text>
      </Table.Td>
      <Table.Td miw={120}>
        <Text fw={700} c="#0f172a">
          {formatDecimal(row.roas)}
        </Text>
      </Table.Td>
      <Table.Td miw={112}>
        <Text fw={700} c="#0f172a">
          {Math.round(row.totalOrders).toLocaleString("vi-VN")} đơn
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
            Chi tiết 5 chỉ số theo từng shop
          </Text>
          <Text size="sm" c="#64748b" mt={4}>
            Tổng hợp {data.shopCount.toLocaleString("vi-VN")} kênh Shopee từ{" "}
            {formatDateLabel(data.orderFrom)} đến {formatDateLabel(data.orderTo)}.
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
              minWidth: 920,
              borderColor: "#e2e8f0"
            }}
          >
            <Table.Thead>
              <Table.Tr style={{ background: "#f8fafc" }}>
                <Table.Th miw={160}>Shop</Table.Th>
                <Table.Th miw={156}>Tổng doanh thu</Table.Th>
                <Table.Th miw={156}>Tổng doanh thu live</Table.Th>
                <Table.Th miw={156}>Tổng chi phí ads</Table.Th>
                <Table.Th miw={120}>ROAS</Table.Th>
                <Table.Th miw={112}>Tổng số đơn hàng</Table.Th>
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
