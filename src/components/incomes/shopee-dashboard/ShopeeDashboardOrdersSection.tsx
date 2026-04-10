import { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text
} from "@mantine/core"
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import type {
  OrdersListResponse,
  ShopeePerformanceTimeMode
} from "../../../hooks/models"
import { SHOPEE_ALL_CHANNEL_ID } from "../../../hooks/shopeeDashboardApi"
import { useShopeeOrdersList } from "../../../hooks/useShopeePerformanceMetrics"
import { buildOrdersQueryParams } from "./performanceTimeUtils"
import { CDataTable } from "../../common/CDataTable"
import { formatCurrency } from "../analytics/formatters"

interface ShopeeDashboardOrdersSectionProps {
  mode: ShopeePerformanceTimeMode
  month: number
  year: number
  fromDate?: string
  toDate?: string
  channelId: string
}

const OrdersSectionSkeleton = () => <Skeleton height={360} radius="xl" />

const OrdersErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <Alert
    color="red"
    variant="light"
    radius="lg"
    icon={<IconAlertCircle size={18} />}
  >
    <Group justify="space-between" align="flex-start" gap="md">
      <div>
        <Text fw={700}>Không tải được danh sách đơn hàng</Text>
        <Text size="sm" mt={4}>
          Hệ thống chưa lấy được dữ liệu đơn hàng Shopee theo bộ lọc hiện tại.
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

const ProductSummaryCell = ({
  row
}: {
  row: OrdersListResponse["items"][number]
}) => (
  <Text size="sm" lineClamp={2}>
    {row.productName || "-"}
  </Text>
)

export const ShopeeDashboardOrdersSection = ({
  mode,
  month,
  year,
  fromDate,
  toDate,
  channelId
}: ShopeeDashboardOrdersSectionProps) => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => {
    setPage(1)
  }, [mode, month, year, fromDate, toDate, channelId])

  const ordersQuery = useShopeeOrdersList({
    request: buildOrdersQueryParams({
      mode,
      channel: channelId,
      month,
      year,
      fromDate,
      toDate,
      page,
      pageSize: limit
    }),
    enabled:
      mode === "month"
        ? true
        : Boolean(fromDate) && Boolean(toDate)
  })

  const columns = useMemo<ColumnDef<OrdersListResponse["items"][number]>[]>(
    () => {
      const baseColumns: ColumnDef<OrdersListResponse["items"][number]>[] = [
        {
          accessorKey: "date",
          header: "Ngày",
          size: 110,
          cell: ({ row }) => (
            <Text size="sm">
              {format(new Date(row.original.date), "dd/MM/yyyy")}
            </Text>
          )
        },
        {
          accessorKey: "orderCode",
          header: "Mã đơn hàng",
          size: 160,
          cell: ({ row }) => (
            <Text size="sm" fw={600}>
              {row.original.orderCode}
            </Text>
          )
        },
        {
          accessorKey: "customerName",
          header: "Khách hàng",
          size: 190,
          cell: ({ row }) => (
            <Text size="sm" lineClamp={1}>
              {row.original.customerName || "-"}
            </Text>
          )
        }
      ]

      if (channelId === SHOPEE_ALL_CHANNEL_ID) {
        baseColumns.push({
          accessorKey: "shop",
          header: "Shop",
          size: 160,
          cell: ({ row }) => <Text size="sm">{row.original.shop || "-"}</Text>
        })
      }

      baseColumns.push(
        {
          accessorKey: "productName",
          header: "Sản phẩm",
          size: 240,
          cell: ({ row }) => <ProductSummaryCell row={row.original} />
        },
        {
          accessorKey: "revenue",
          header: "Doanh thu đơn",
          size: 150,
          cell: ({ row }) => (
            <Stack gap={2} align="flex-end">
              <Text size="sm" fw={700} c="green.7">
                {formatCurrency(row.original.revenue)}
              </Text>
              <Text size="xs" c="dimmed">
                {row.original.productCount.toLocaleString("vi-VN")} sản phẩm
              </Text>
            </Stack>
          ),
          meta: {
            align: "right"
          }
        }
      )

      return baseColumns
    },
    [channelId]
  )

  if (ordersQuery.isLoading && !ordersQuery.data) {
    return <OrdersSectionSkeleton />
  }

  if (ordersQuery.isError && !ordersQuery.data) {
    return <OrdersErrorState onRetry={() => ordersQuery.refetch()} />
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
        <Group justify="space-between" align="flex-start" gap="md">
          <div>
            <Text fz="sm" fw={600} c="#0f172a">
              Đơn hàng
            </Text>
            <Text fw={700} fz="xl" mt={4}>
              Danh sách đơn hàng theo bộ lọc hiện tại
            </Text>
          </div>

          <Group gap="sm">
            <Badge variant="light" color="blue" radius="xl" size="lg">
              {(ordersQuery.data?.pagination.totalItems || 0).toLocaleString("vi-VN")} đơn
            </Badge>
            <Button
              variant="light"
              color="gray"
              leftSection={<IconRefresh size={16} />}
              onClick={() => ordersQuery.refetch()}
              loading={ordersQuery.isFetching}
            >
              Tải lại
            </Button>
          </Group>
        </Group>

        <CDataTable
          columns={columns}
          data={ordersQuery.data?.items || []}
          variant="default"
          hideSearch
          hideColumnToggle
          isLoading={ordersQuery.isLoading || ordersQuery.isFetching}
          loadingText="Đang tải đơn hàng..."
          page={page}
          totalPages={Math.max(
            1,
            ordersQuery.data?.pagination.totalPages || 1
          )}
          onPageChange={setPage}
          onPageSizeChange={(nextLimit) => {
            setPage(1)
            setLimit(nextLimit)
          }}
          initialPageSize={limit}
          pageSizeOptions={[10, 20, 50]}
        />
      </Stack>
    </Paper>
  )
}
