import { useCallback, useMemo, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { eachDayOfInterval, format, subDays } from "date-fns"
import { modals } from "@mantine/modals"
import {
  Alert,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Paper,
  Select,
  Stack,
  Text
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import {
  IconAlertCircle,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconTrash
} from "@tabler/icons-react"
import { useLivestreamChannel } from "../../context/LivestreamChannelContext"
import {
  DailyAdsMetricsResponse,
  DeleteDailyAdsMetricsRequest,
  UpsertDailyAdsMetricsRequest
} from "../../hooks/models"
import { useDailyAds } from "../../hooks/useDailyAds"
import { Can } from "../common/Can"
import { CDataTable } from "../common/CDataTable"
import { DailyAdsMetricsModal } from "./DailyAdsMetricsModal"
import { CToast } from "../common/CToast"

type DailyAdsMetricsTableRow = DailyAdsMetricsResponse

const formatCurrency = (value: number) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`

const normalizeDate = (value: Date) => {
  const next = new Date(value)
  next.setHours(0, 0, 0, 0)
  return next
}

const toDateKey = (value: Date) => format(normalizeDate(value), "yyyy-MM-dd")

const buildInitialData = (
  row: DailyAdsMetricsTableRow
): Partial<UpsertDailyAdsMetricsRequest> => ({
  roiProtect: row.roiProtect,
  tinRefundAmount: row.tinRefundAmount,
  gmvAds: row.gmvAds,
  affiliateCost: row.affiliateCost,
  totalRevenue: row.totalRevenue,
  refundCancelRate: row.refundCancelRate
})

export function DailyAdsMetricsManager() {
  const { selectedChannelId, channels, setSelectedChannelId } =
    useLivestreamChannel()
  const { getDailyAdsMetrics, deleteAdsMetrics } = useDailyAds()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [startDate, setStartDate] = useState<Date | null>(() =>
    subDays(new Date(), 30)
  )
  const [endDate, setEndDate] = useState<Date | null>(new Date())

  const daysInRange = useMemo(() => {
    if (!startDate || !endDate) return []

    const start = normalizeDate(startDate)
    const end = normalizeDate(endDate)

    if (start > end) return []

    return eachDayOfInterval({ start, end }).reverse()
  }, [endDate, startDate])

  const {
    data: metricsRows = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [
      "daily-ads-metrics-list",
      selectedChannelId,
      startDate ? toDateKey(startDate) : null,
      endDate ? toDateKey(endDate) : null
    ],
    queryFn: async () => {
      if (!selectedChannelId || daysInRange.length === 0) {
        return []
      }

      const responses = await Promise.all(
        daysInRange.map(async (day) => {
          try {
            const response = await getDailyAdsMetrics({
              date: day,
              channelId: selectedChannelId
            })
            return response.data
          } catch {
            return null
          }
        })
      )

      return responses.filter(Boolean) as DailyAdsMetricsResponse[]
    },
    enabled: Boolean(selectedChannelId && daysInRange.length > 0)
  })

  const { mutate: deleteMetrics, isPending: isDeleting } = useMutation({
    mutationFn: async (req: DeleteDailyAdsMetricsRequest) => {
      await deleteAdsMetrics(req)
    },
    onSuccess: (_, args) => {
      CToast.success({
        title: `Đã xóa chỉ số ads ngày ${format(args.date, "dd/MM/yyyy")}`
      })
      void refetch()
    },
    onError: (error) => {
      CToast.error({
        subtitle: error.message || "Xảy ra lỗi khi xóa dữ liệu",
        title: "Xóa dữ liệu thất bại"
      })
    }
  })

  const pagedRows = useMemo(() => {
    const startIndex = (page - 1) * limit
    return metricsRows.slice(startIndex, startIndex + limit)
  }, [limit, metricsRows, page])

  const openCreateModal = () => {
    modals.open({
      title: <b>Thêm chỉ số ads theo ngày</b>,
      children: (
        <DailyAdsMetricsModal
          initialChannelId={selectedChannelId}
          refetch={() => void refetch()}
        />
      ),
      size: "1200"
    })
  }

  const openEditModal = useCallback((row: DailyAdsMetricsTableRow) => {
    modals.open({
      title: <b>Cập nhật chỉ số ads theo ngày</b>,
      children: (
        <DailyAdsMetricsModal
          initialChannelId={selectedChannelId}
          initialDate={new Date(row.date)}
          initialData={buildInitialData(row)}
          refetch={() => void refetch()}
        />
      ),
      size: 800
    })
  }, [refetch, selectedChannelId])

  const openDeleteConfirmModal = useCallback((row: DailyAdsMetricsTableRow) => {
    modals.openConfirmModal({
      title: <b>Xác nhận xóa chỉ số ads</b>,
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa chỉ số ads ngày{" "}
          <strong>{format(new Date(row.date), "dd/MM/yyyy")}</strong> không?
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red", loading: isDeleting },
      onConfirm: () => {
        deleteMetrics({
          date: new Date(row.date),
          channelId: row.channel
        })
      }
    })
  }, [deleteMetrics, isDeleting])

  const columns = useMemo<ColumnDef<DailyAdsMetricsTableRow>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Ngày lưu",
        size: 120,
        cell: ({ row }) => (
          <Text size="sm" fw={600}>
            {format(new Date(row.original.date), "dd/MM/yyyy")}
          </Text>
        )
      },
      {
        accessorKey: "gmvAds",
        header: "GMV Ads",
        size: 150,
        cell: ({ row }) => (
          <Text size="sm">{formatCurrency(row.original.gmvAds)}</Text>
        )
      },
      {
        accessorKey: "affiliateCost",
        header: "Chi phí affiliate",
        size: 160,
        cell: ({ row }) => (
          <Text size="sm">{formatCurrency(row.original.affiliateCost)}</Text>
        )
      },
      {
        accessorKey: "totalRevenue",
        header: "Doanh thu tổng",
        size: 160,
        cell: ({ row }) => (
          <Text size="sm">{formatCurrency(row.original.totalRevenue)}</Text>
        )
      },
      {
        accessorKey: "actualAdsCost",
        header: "Ads thực tế",
        size: 150,
        cell: ({ row }) => (
          <Text size="sm" fw={700}>
            {formatCurrency(row.original.actualAdsCost)}
          </Text>
        )
      },
      {
        accessorKey: "refundCancelRate",
        header: "Hoàn hủy",
        size: 110,
        cell: ({ row }) => (
          <Text size="sm">{row.original.refundCancelRate}%</Text>
        )
      },
      {
        accessorKey: "updatedAt",
        header: "Cập nhật",
        size: 170,
        cell: ({ row }) => (
          <Text size="sm" c="dimmed">
            {row.original.updatedAt
              ? format(new Date(row.original.updatedAt), "dd/MM/yyyy HH:mm")
              : "-"}
          </Text>
        )
      },
      {
        id: "actions",
        header: "",
        size: 96,
        cell: ({ row }) => (
          <Can roles={["admin", "accounting-emp"]}>
            <Flex gap={4}>
              <Button
                size="xs"
                variant="light"
                leftSection={<IconPencil size={14} />}
                onClick={() => openEditModal(row.original)}
              >
                Sửa
              </Button>
              <Button
                size="xs"
                variant="light"
                color="red"
                leftSection={<IconTrash size={14} />}
                disabled={isDeleting}
                onClick={() => openDeleteConfirmModal(row.original)}
              >
                Xóa
              </Button>
            </Flex>
          </Can>
        )
      }
    ],
    [isDeleting, openDeleteConfirmModal, openEditModal]
  )

  return (
    <Stack gap="lg">
      <Paper withBorder radius="xl" p="xl">
        <Stack gap="xs">
          <Text fw={700} fz="lg">
            Chỉ số ads qua các ngày
          </Text>

          <Divider />

          {!selectedChannelId && (
            <Alert
              color="blue"
              variant="light"
              icon={<IconAlertCircle size={16} />}
              radius="xl"
            >
              Cần chọn kênh trong phần bên trên trước khi xem danh sách ads.
            </Alert>
          )}

          {error ? (
            <Alert
              color="red"
              variant="light"
              icon={<IconAlertCircle size={16} />}
              radius="xl"
            >
              Không tải được danh sách DailyAdsMetrics đã lưu.
            </Alert>
          ) : null}

          <Box>
            <CDataTable
              columns={columns}
              data={pagedRows}
              isLoading={isLoading}
              hideSearch
              hideColumnToggle
              page={page}
              totalPages={Math.max(1, Math.ceil(metricsRows.length / limit))}
              onPageChange={setPage}
              onPageSizeChange={(value) => {
                setLimit(value)
                setPage(1)
              }}
              extraFilters={
                <>
                  <Select
                    label="Kênh"
                    value={selectedChannelId}
                    onChange={(value) => {
                      setSelectedChannelId?.(value ?? null)
                      setPage(1)
                    }}
                    data={channels.map((channel) => ({
                      label: channel.name,
                      value: channel._id
                    }))}
                    placeholder="Chọn kênh"
                    searchable
                    clearable={false}
                    size="sm"
                    radius="md"
                    style={{ width: 240 }}
                  />
                  <DatePickerInput
                    label="Từ ngày"
                    value={startDate}
                    onChange={(value) => {
                      setStartDate(value)
                      setPage(1)
                    }}
                    valueFormat="DD/MM/YYYY"
                    clearable={false}
                    size="sm"
                    radius="md"
                    maxDate={endDate ?? new Date()}
                    style={{ width: 160 }}
                  />
                  <DatePickerInput
                    label="Đến ngày"
                    value={endDate}
                    onChange={(value) => {
                      setEndDate(value)
                      setPage(1)
                    }}
                    valueFormat="DD/MM/YYYY"
                    clearable={false}
                    size="sm"
                    radius="md"
                    minDate={startDate ?? undefined}
                    maxDate={new Date()}
                    style={{ width: 160 }}
                  />
                </>
              }
              extraActions={
                <Group gap="sm">
                  <Button
                    size="sm"
                    radius="md"
                    variant="light"
                    leftSection={<IconRefresh size={16} />}
                    onClick={() => void refetch()}
                  >
                    Làm mới
                  </Button>
                  <Can roles={["admin", "accounting-emp"]}>
                    <Button
                      size="sm"
                      radius="md"
                      leftSection={<IconPlus size={16} />}
                      onClick={openCreateModal}
                      disabled={!selectedChannelId}
                    >
                      Tạo ads mới
                    </Button>
                  </Can>
                </Group>
              }
              emptyState={
                <Text c="dimmed" size="sm">
                  Chưa có DailyAdsMetrics nào được lưu trong khoảng ngày đang
                  chọn.
                </Text>
              }
            />
          </Box>
        </Stack>
      </Paper>
    </Stack>
  )
}
