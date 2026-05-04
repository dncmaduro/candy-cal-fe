/* StorageLogs.tsx - DataTable expandable rows */

import { useCallback, useEffect, useMemo, useState } from "react"
import { useDebouncedValue } from "@mantine/hooks"
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient
} from "@tanstack/react-query"
import type { ColumnDef, Row } from "@tanstack/react-table"
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  NumberInput,
  Pagination,
  Paper,
  Select,
  SimpleGrid,
  Text,
  Tooltip
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { modals } from "@mantine/modals"
import {
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconInfoCircle,
  IconNote,
  IconPlus,
  IconTrash
} from "@tabler/icons-react"
import { format } from "date-fns"

import { useItems } from "../../hooks/useItems"
import { useDeliveredRequests } from "../../hooks/useDeliveredRequests"
import { useLivestreamChannels } from "../../hooks/useLivestreamChannels"
import { useLogs } from "../../hooks/useLogs"
import { StorageLogModal } from "./StorageLogModal"

import {
  DELIVERED_TAG_OPTIONS,
  RECEIVED_TAG_OPTION
} from "../../constants/tags"
import { STATUS_OPTIONS } from "../../constants/status"

import { CToast } from "../common/CToast"
import { Can } from "../common/Can"
import { CDataTable } from "../common/CDataTable"

interface Props {
  activeTab: string
}

type LogItem = { _id: string; quantity: number }

type StorageItemOption = {
  _id: string
  name: string
  code?: string
}

type ChannelOption = {
  _id: string
  name: string
}

type StorageLog = {
  _id: string
  date: string | Date
  status: string
  tag?: string
  note?: string
  deliveredRequestId?: string
  item?: LogItem
  items?: LogItem[]
}

type LogRow = {
  _rowId: string
  logId: string
  date: string | Date
  status: string
  tag?: string
  note?: string
  deliveredRequestId?: string
  items: LogItem[]
}

const TAG_OPTIONS = [...DELIVERED_TAG_OPTIONS, ...RECEIVED_TAG_OPTION]

const STATUS_DISPLAY: Record<
  string,
  { label: string; color: "green" | "orange" | "blue" | "gray" | "red" }
> = {
  received: { label: "NHẬP KHO", color: "green" },
  delivered: { label: "XUẤT KHO", color: "orange" },
  returned: { label: "ĐIỀU CHỈNH", color: "blue" }
}

const TAG_DISPLAY: Record<string, string> = {
  receive: "Nhập kho",
  "deliver-tiktokshop": "Xuất TikTok Shop",
  "deliver-shopee": "Xuất Shopee",
  "deliver-single": "Xuất kho lẻ",
  "deliver-marketing": "Xuất Marketing",
  "deliver-error": "Xuất hàng lỗi",
  "deliver-employee": "Xuất nhân viên",
  "return-tiktokshop": "Điều chỉnh TikTok Shop",
  "return-shopee": "Điều chỉnh Shopee",
  "return-other": "Điều chỉnh khác"
}

const NON_DELETABLE_TAGS = new Set(["deliver-tiktokshop", "deliver-shopee"])

const toIsoStartOfDay = (d: Date) =>
  new Date(d.setHours(0, 0, 0, 0)).toISOString()
const toIsoEndOfDay = (d: Date) =>
  new Date(d.setHours(23, 59, 59, 999)).toISOString()

const sumQty = (items: LogItem[]) =>
  items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0)

const formatNumber = (value: number) => value.toLocaleString("vi-VN")

export const StorageLogs = ({ activeTab }: Props) => {
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [debouncedLimit] = useDebouncedValue(limit, 300)

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [itemId, setItemId] = useState<string | null>(null)
  const [channelId, setChannelId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [tag, setTag] = useState<string | null>(null)

  const { searchStorageItems } = useItems()
  const { getStorageLogs, deleteStorageLog } = useLogs()
  const { getDeliveredRequest } = useDeliveredRequests()
  const { searchLivestreamChannels } = useLivestreamChannels()

  const { data: itemsData } = useQuery({
    queryKey: ["searchStorageItems", activeTab],
    queryFn: () => searchStorageItems({ searchText: "", deleted: false }),
    select: (res) => (res.data ?? []) as StorageItemOption[]
  })

  const itemsOptions = useMemo(
    () =>
      (itemsData ?? []).map((it) => ({
        value: it._id,
        label: it.name
      })),
    [itemsData]
  )

  const itemsMap = useMemo(() => {
    const map: Record<string, StorageItemOption> = {}
    for (const it of itemsData ?? []) map[it._id] = it
    return map
  }, [itemsData])

  const { data: channelsData } = useQuery({
    queryKey: ["livestreamChannels", activeTab],
    queryFn: async () => {
      const response = await searchLivestreamChannels({ page: 1, limit: 200 })
      return (response.data.data ?? []) as ChannelOption[]
    }
  })

  const channelOptions = useMemo(
    () =>
      (channelsData ?? []).map((channel) => ({
        value: channel._id,
        label: channel.name
      })),
    [channelsData]
  )

  const {
    data: logsRes,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: [
      "storageLogs",
      page,
      debouncedLimit,
      startDate?.toISOString() ?? null,
      endDate?.toISOString() ?? null,
      status ?? null,
      tag ?? null,
      itemId ?? null,
      channelId ?? null
    ],
    queryFn: () =>
      getStorageLogs({
        page,
        limit: debouncedLimit,
        startDate: startDate ? toIsoStartOfDay(new Date(startDate)) : undefined,
        endDate: endDate ? toIsoEndOfDay(new Date(endDate)) : undefined,
        status: status || undefined,
        tag: tag || undefined,
        itemId: itemId || undefined,
        channelId: channelId || undefined
      }),
    select: (res) => res.data
  })

  const logs: StorageLog[] = useMemo(() => logsRes?.data ?? [], [logsRes?.data])
  const total = Number(logsRes?.total ?? 0)

  const deliveredRequestIds = useMemo(
    () =>
      Array.from(
        new Set(
          logs
            .map((log) => log.deliveredRequestId)
            .filter((requestId): requestId is string => Boolean(requestId))
        )
      ),
    [logs]
  )

  const deliveredRequestsLookup = useQueries({
    queries: deliveredRequestIds.map((requestId) => ({
      queryKey: ["deliveredRequest", requestId],
      queryFn: async () => (await getDeliveredRequest({ requestId })).data,
      staleTime: 5 * 60 * 1000
    })),
    combine: (results) => ({
      channelsByRequestId: results.reduce<Record<string, string | undefined>>(
        (acc, result, index) => {
          const requestId = deliveredRequestIds[index]
          if (!requestId) return acc

          acc[requestId] = result.data?.channel?.name
          return acc
        },
        {}
      ),
      loadingRequestIds: new Set(
        results
          .map((result, index) =>
            result.isPending ? deliveredRequestIds[index] : null
          )
          .filter((requestId): requestId is string => Boolean(requestId))
      )
    })
  })

  const openModal = useCallback((log?: StorageLog) => {
    modals.open({
      size: "lg",
      title: (
        <Text fw={700} fz="md">
          {log ? "Chỉnh sửa giao dịch kho" : "Thêm giao dịch kho"}
        </Text>
      ),
      children: (
        <StorageLogModal
          itemsList={itemsData || []}
          log={log}
          onSuccess={() => {
            modals.closeAll()
            refetch()
            queryClient.invalidateQueries({ queryKey: ["searchItems"] })
          }}
        />
      )
    })
  }, [itemsData, queryClient, refetch])

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: deleteStorageLog,
    onSuccess: () => {
      CToast.success({ title: "Xóa giao dịch kho thành công" })
      refetch()
    }
  })

  useEffect(() => {
    setPage(1)
  }, [startDate, endDate, status, tag, itemId, channelId, limit])

  const statusDisplay = (value: string) =>
    STATUS_DISPLAY[value] ?? { label: value.toUpperCase(), color: "gray" as const }

  const tagDisplay = (value?: string) =>
    (value && TAG_DISPLAY[value]) ||
    TAG_OPTIONS.find((t) => t.value === value)?.label ||
    value ||
    "-"

  const rows: LogRow[] = useMemo(() => {
    return logs.map((log) => {
      const its = (log.item ? [log.item] : log.items) ?? []
      return {
        _rowId: log._id,
        logId: log._id,
        date: log.date,
        status: log.status,
        tag: log.tag,
        note: log.note,
        deliveredRequestId: log.deliveredRequestId,
        items: its
      }
    })
  }, [logs])

  const columns: ColumnDef<LogRow>[] = useMemo(
    () => [
      {
        id: "expander",
        header: "",
        size: 40,
        meta: {
          align: "center" as const,
          headerClassName: "w-[42px]",
          cellClassName: "w-[42px]"
        },
        enableSorting: false,
        cell: ({ row }) => (
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              row.toggleExpanded()
            }}
            aria-label={row.getIsExpanded() ? "Thu gọn" : "Mở rộng"}
          >
            {row.getIsExpanded() ? (
              <IconChevronDown size={14} />
            ) : (
              <IconChevronRight size={14} />
            )}
          </ActionIcon>
        )
      },
      {
        id: "date",
        header: "Ngày",
        meta: { headerClassName: "min-w-[120px]" },
        cell: ({ row }) => (
          <Text fz="sm" fw={600} c="dark.8" style={{ fontVariantNumeric: "tabular-nums" }}>
            {format(new Date(row.original.date), "dd/MM/yyyy")}
          </Text>
        )
      },
      {
        id: "status",
        header: "Trạng thái",
        meta: { headerClassName: "min-w-[130px]" },
        cell: ({ row }) => {
          const info = statusDisplay(row.original.status)
          return (
            <Badge variant="light" color={info.color} size="sm" radius="sm">
              {info.label}
            </Badge>
          )
        }
      },
      {
        id: "items",
        header: "Mặt hàng",
        meta: { headerClassName: "min-w-[280px]" },
        cell: ({ row }) => {
          const its = row.original.items
          if (!its.length) return <Text c="dimmed">-</Text>

          const pairs = its.map((it) => ({
            name: itemsMap[it._id]?.name ?? "Không xác định",
            qty: Number(it.quantity) || 0
          }))

          const firstItem = pairs[0]
          const rest = Math.max(0, pairs.length - 1)

          return (
            <Group gap={8} wrap="nowrap" align="flex-start">
              <Box miw={0}>
                <Text fz="sm" fw={600} c="dark.8" lineClamp={1}>
                  {firstItem?.name ?? "-"}
                </Text>
                <Text fz="xs" c="dimmed" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {formatNumber(firstItem?.qty ?? 0)} đơn vị
                </Text>
              </Box>
              {rest > 0 && (
                <Tooltip label={`${rest} mặt hàng khác`} withArrow>
                  <Badge variant="light" color="gray" size="sm" radius="sm">
                    +{rest} mặt hàng khác
                  </Badge>
                </Tooltip>
              )}
            </Group>
          )
        }
      },
      {
        id: "totalQty",
        header: "Số lượng",
        meta: {
          isNumeric: true,
          align: "right" as const,
          headerClassName: "min-w-[110px]",
          cellClassName: "[font-variant-numeric:tabular-nums]"
        },
        cell: ({ row }) => (
          <Text fw={700} c="dark.8" style={{ fontVariantNumeric: "tabular-nums" }}>
            {row.original.items.length
              ? formatNumber(sumQty(row.original.items))
              : "-"}
          </Text>
        )
      },
      {
        id: "tag",
        header: "Phân loại",
        meta: { headerClassName: "min-w-[170px]" },
        cell: ({ row }) => (
          <Badge variant="light" color="indigo" size="sm" radius="sm">
            {tagDisplay(row.original.tag)}
          </Badge>
        )
      },
      {
        id: "channel",
        header: "Kênh",
        meta: { headerClassName: "min-w-[160px]" },
        cell: ({ row }) => {
          const requestId = row.original.deliveredRequestId

          if (!requestId) {
            return (
              <Text fz="sm" c="dimmed">
                -
              </Text>
            )
          }

          if (deliveredRequestsLookup.loadingRequestIds.has(requestId)) {
            return (
              <Text fz="sm" c="dimmed">
                Đang tải...
              </Text>
            )
          }

          const channelName =
            deliveredRequestsLookup.channelsByRequestId[requestId]

          return channelName ? (
            <Text fz="sm">{channelName}</Text>
          ) : (
            <Text fz="sm" c="dimmed">
              -
            </Text>
          )
        }
      },
      {
        id: "note",
        header: "Ghi chú",
        meta: {
          align: "center" as const,
          headerClassName: "w-[90px]",
          cellClassName: "w-[90px]"
        },
        enableSorting: false,
        cell: ({ row }) => {
          if (!row.original.note) return null
          return (
            <Tooltip label="Có ghi chú" withArrow>
              <ActionIcon variant="light" color="gray" aria-label="Có ghi chú" title="Có ghi chú">
                <IconNote size={15} />
              </ActionIcon>
            </Tooltip>
          )
        }
      },
      {
        id: "actions",
        header: "Thao tác",
        meta: {
          align: "right" as const,
          headerClassName:
            "w-[180px] sticky right-0 z-[2] bg-gray-50 border-l border-gray-100",
          cellClassName:
            "w-[180px] sticky right-0 z-[1] bg-white border-l border-gray-100"
        },
        enableSorting: false,
        cell: ({ row }) => {
          const log = row.original
          const canDelete = !NON_DELETABLE_TAGS.has(log.tag ?? "")

          return (
            <Group gap={8} justify="flex-end" wrap="nowrap">
              <Can roles={["admin", "accounting-emp"]}>
                <Button
                  variant="light"
                  color="orange"
                  size="xs"
                  radius="md"
                  miw={78}
                  justify="center"
                  leftSection={<IconEdit size={16} />}
                  onClick={(e) => {
                    e.stopPropagation()
                    openModal(logs.find((x) => x._id === log.logId))
                  }}
                >
                  Sửa
                </Button>
              </Can>

              <Can roles={["admin", "accounting-emp"]}>
                <Tooltip
                  label="Không thể xóa giao dịch này"
                  withArrow
                  disabled={canDelete}
                >
                  <Button
                    variant="light"
                    color="red"
                    size="xs"
                    radius="md"
                    miw={78}
                    justify="center"
                    leftSection={<IconTrash size={16} />}
                    loading={isDeleting}
                    disabled={!canDelete}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!canDelete) return
                      remove(log.logId)
                    }}
                  >
                    Xóa
                  </Button>
                </Tooltip>
              </Can>
            </Group>
          )
        }
      }
    ],
    [deliveredRequestsLookup, itemsMap, isDeleting, remove, logs, openModal]
  )

  const renderRowSubComponent = ({ row }: { row: Row<LogRow> }) => {
    const its = row.original.items
    if (!its.length) {
      return (
        <Box px={16} py={12}>
          <Text c="dimmed" fz="sm">
            Giao dịch này không có mặt hàng.
          </Text>
        </Box>
      )
    }

    return (
      <Box px={16} py={12} w={{ base: "100%", md: "60%" }}>
        <Box className="rounded-lg border border-gray-200 bg-white">
          <Box p={12} className="border-b border-gray-100 bg-gray-50">
            <Text fw={700} fz="sm">
              Chi tiết mặt hàng ({its.length})
            </Text>
          </Box>

          <Box px={12} pr={20} py={10}>
            {its.map((it, idx) => (
              <Flex
                key={`${row.original.logId}_${it._id}_${idx}`}
                justify="space-between"
                align="flex-start"
                py={8}
                className={
                  idx === its.length - 1 ? "" : "border-b border-gray-100"
                }
              >
                <Box>
                  <Text fz="sm" fw={600} lineClamp={2}>
                    {itemsMap[it._id]?.name ?? "Không xác định"}
                  </Text>
                  <Text fz="xs" c="dimmed">
                    {itemsMap[it._id]?.code ?? it._id}
                  </Text>
                </Box>
                <Text fw={800} style={{ fontVariantNumeric: "tabular-nums" }}>
                  {formatNumber(Number(it.quantity) || 0)}
                </Text>
              </Flex>
            ))}
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Paper
      mt={30}
      mx="auto"
      px={{ base: 8, md: 0 }}
      py={0}
      w="100%"
      maw={1640}
      radius="lg"
      style={{
        background: "rgba(255,255,255,0.97)",
        boxShadow: "0 4px 24px 0 rgba(50, 64, 117, 0.06)",
        border: "1px solid #ececec"
      }}
    >
      <Flex
        align="flex-start"
        justify="space-between"
        pt={24}
        pb={12}
        px={{ base: 12, md: 28 }}
        gap={12}
        wrap="wrap"
      >
        <Box>
          <Text fw={800} fz="xl" mb={4}>
            Lịch sử xuất/nhập kho
          </Text>
          <Text c="dimmed" fz="sm">
            Theo dõi toàn bộ biến động nhập, xuất và điều chỉnh kho
          </Text>
        </Box>

        <Can roles={["admin", "accounting-emp"]}>
          <Button
            color="indigo"
            leftSection={<IconPlus size={18} />}
            radius="md"
            size="md"
            px={18}
            onClick={() => openModal()}
            style={{ fontWeight: 600, letterSpacing: 0.1 }}
          >
            Thêm giao dịch kho
          </Button>
        </Can>
      </Flex>

      <Box px={{ base: 8, md: 28 }} py={10}>
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 4, xl: 7 }}
          spacing={12}
          verticalSpacing={12}
        >
          <DatePickerInput
            value={startDate}
            onChange={setStartDate}
            placeholder="Chọn ngày bắt đầu"
            label="Từ ngày"
            valueFormat="DD/MM/YYYY"
            size="sm"
            radius="md"
            clearable
            w="100%"
          />

          <DatePickerInput
            value={endDate}
            onChange={setEndDate}
            placeholder="Chọn ngày kết thúc"
            label="Đến ngày"
            valueFormat="DD/MM/YYYY"
            size="sm"
            radius="md"
            clearable
            w="100%"
          />

          <Select
            data={[{ value: "", label: "Tất cả" }, ...STATUS_OPTIONS]}
            value={status ?? ""}
            onChange={setStatus}
            placeholder="Trạng thái"
            label="Trạng thái"
            size="sm"
            radius="md"
            w="100%"
          />

          <Select
            data={[{ value: "", label: "Tất cả" }, ...TAG_OPTIONS]}
            value={tag ?? ""}
            onChange={setTag}
            placeholder="Phân loại"
            label="Phân loại"
            size="sm"
            radius="md"
            w="100%"
          />

          <Select
            data={[{ value: "", label: "Tất cả" }, ...itemsOptions]}
            value={itemId ?? ""}
            onChange={setItemId}
            placeholder="Chọn mặt hàng"
            label="Mặt hàng"
            clearable
            searchable
            size="sm"
            radius="md"
            w="100%"
          />

          <Select
            data={[{ value: "", label: "Tất cả" }, ...channelOptions]}
            value={channelId ?? ""}
            onChange={setChannelId}
            placeholder="Chọn kênh"
            label="Kênh"
            clearable
            searchable
            size="sm"
            radius="md"
            w="100%"
          />

          <NumberInput
            label="Số dòng"
            value={limit}
            onChange={(val) => setLimit(Number(val) || 10)}
            min={1}
            max={100}
            w="100%"
            size="sm"
            radius="md"
          />
        </SimpleGrid>
      </Box>

      <Divider my={0} />

      <Box px={{ base: 4, md: 28 }} py={18}>
        {isError && (
          <Alert
            mb={12}
            variant="light"
            color="red"
            icon={<IconInfoCircle size={16} />}
            title="Không tải được lịch sử kho"
          >
            Vui lòng thử lại hoặc kiểm tra kết nối.
          </Alert>
        )}

        <CDataTable<LogRow, unknown>
          key={`${page}-${debouncedLimit}-${rows.length}-${itemId}-${channelId}-${status}-${tag}-${startDate?.toISOString() ?? ""}-${endDate?.toISOString() ?? ""}`}
          columns={columns}
          data={rows}
          isLoading={isLoading}
          loadingText="Đang tải lịch sử kho..."
          skeletonRowCount={10}
          enableGlobalFilter={false}
          enableRowSelection={false}
          getRowId={(r) => r._rowId}
          enableExpanding
          hidePagination
          hidePaginationInformation
          hideColumnToggle
          emptyState={
            <Box>
              <Text fw={600}>Chưa có giao dịch kho</Text>
              <Text c="dimmed" fz="sm">
                Thêm giao dịch kho hoặc thay đổi bộ lọc để xem dữ liệu.
              </Text>
            </Box>
          }
          tableContainerClassName="max-h-[64vh] overflow-y-auto"
          stickyHeaderOffset={0}
          renderRowSubComponent={renderRowSubComponent}
          onRowClick={(row) => row.toggleExpanded()}
          className="min-w-[1120px]"
        />

        <Flex justify="space-between" mt={14} align="center">
          <Text c="dimmed">Tổng số dòng: {total}</Text>

          <Pagination
            total={Math.max(1, Math.ceil((total || 1) / debouncedLimit))}
            value={page}
            onChange={setPage}
          />

          <Text c="dimmed">
            Hiển thị {rows.length} / {total}
          </Text>
        </Flex>
      </Box>
    </Paper>
  )
}
