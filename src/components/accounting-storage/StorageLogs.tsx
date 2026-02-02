/* StorageLogs.tsx - DataTable expandable rows */

import { useEffect, useMemo, useState } from "react"
import { useDebouncedValue } from "@mantine/hooks"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef, Row } from "@tanstack/react-table"
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  NumberInput,
  Pagination,
  Select,
  Text,
  Tooltip,
  rem
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { modals } from "@mantine/modals"
import {
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconNote,
  IconPlus,
  IconTrash
} from "@tabler/icons-react"
import { format } from "date-fns"

import { useItems } from "../../hooks/useItems"
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

type StorageLog = {
  _id: string
  date: string | Date
  status: string
  tag?: string
  note?: string
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
  items: LogItem[]
}

const TAG_OPTIONS = [...DELIVERED_TAG_OPTIONS, ...RECEIVED_TAG_OPTION]

const toIsoStartOfDay = (d: Date) =>
  new Date(d.setHours(0, 0, 0, 0)).toISOString()
const toIsoEndOfDay = (d: Date) =>
  new Date(d.setHours(23, 59, 59, 999)).toISOString()

const sumQty = (items: LogItem[]) =>
  items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0)

export const StorageLogs = ({ activeTab }: Props) => {
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [debouncedLimit] = useDebouncedValue(limit, 300)

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [itemId, setItemId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [tag, setTag] = useState<string | null>(null)

  const { searchStorageItems } = useItems()
  const { getStorageLogs, deleteStorageLog } = useLogs()

  // Items list for filter + name map
  const { data: itemsData } = useQuery({
    queryKey: ["searchStorageItems", activeTab],
    queryFn: () => searchStorageItems({ searchText: "", deleted: false }),
    select: (res) => res.data
  })

  const itemsOptions = useMemo(() => {
    return (itemsData ?? []).map((it: any) => ({
      value: it._id,
      label: it.name
    }))
  }, [itemsData])

  const itemsMap = useMemo(() => {
    const map: Record<string, any> = {}
    for (const it of itemsData ?? []) map[it._id] = it
    return map
  }, [itemsData])

  // Logs query (server pagination)
  const {
    data: logsRes,
    isLoading,
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
      itemId ?? null
    ],
    queryFn: () =>
      getStorageLogs({
        page,
        limit: debouncedLimit,
        startDate: startDate ? toIsoStartOfDay(new Date(startDate)) : undefined,
        endDate: endDate ? toIsoEndOfDay(new Date(endDate)) : undefined,
        status: status || undefined,
        tag: tag || undefined,
        itemId: itemId || undefined
      }),
    select: (res) => res.data
  })

  const logs: StorageLog[] = logsRes?.data ?? []
  const total = Number(logsRes?.total ?? 0)

  const openModal = (log?: StorageLog) => {
    modals.open({
      size: "lg",
      title: (
        <Text fw={700} fz="md">
          {log ? "Chỉnh sửa log kho" : "Tạo log kho mới"}
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
  }

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: deleteStorageLog,
    onSuccess: () => {
      CToast.success({ title: "Xóa log kho thành công" })
      refetch()
    }
  })

  useEffect(() => {
    setPage(1)
  }, [startDate, endDate, status, tag, itemId, limit])

  const statusLabel = (v: string) =>
    STATUS_OPTIONS.find((s) => s.value === v)?.label ?? v

  const tagLabel = (v?: string) =>
    TAG_OPTIONS.find((t) => t.value === v)?.label ?? v ?? "-"

  // DataTable rows
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
        cell: ({ row }) => (
          <ActionIcon
            variant="subtle"
            onClick={(e) => {
              e.stopPropagation()
              row.toggleExpanded()
            }}
            aria-label={row.getIsExpanded() ? "Thu gọn" : "Mở rộng"}
          >
            {row.getIsExpanded() ? (
              <IconChevronDown size={16} />
            ) : (
              <IconChevronRight size={16} />
            )}
          </ActionIcon>
        )
      },
      {
        id: "date",
        header: "Ngày",
        cell: ({ row }) => (
          <Text fz="sm" fw={600}>
            {format(new Date(row.original.date), "dd/MM/yyyy")}
          </Text>
        )
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge variant="light" color="gray">
            {statusLabel(row.original.status)}
          </Badge>
        )
      },
      {
        id: "items",
        header: "Mặt hàng",
        cell: ({ row }) => {
          const its = row.original.items
          if (!its.length) return <Text c="dimmed">-</Text>

          const pairs = its.map((it) => ({
            name: itemsMap[it._id]?.name ?? "Unknown",
            qty: Number(it.quantity) || 0
          }))

          const preview = pairs
            .slice(0, 2)
            .map((p) => `${p.name} ×${p.qty}`)
            .join(", ")
          const rest = Math.max(0, pairs.length - 2)

          return (
            <Group gap={8} wrap="nowrap">
              <Text fz="sm" lineClamp={1}>
                {preview}
              </Text>
              {rest > 0 && (
                <Badge variant="light" color="indigo">
                  +{rest}
                </Badge>
              )}
            </Group>
          )
        }
      },
      {
        id: "totalQty",
        header: "Tổng SL",
        cell: ({ row }) => (
          <Text fw={700}>
            {row.original.items.length ? sumQty(row.original.items) : "-"}
          </Text>
        )
      },
      {
        id: "tag",
        header: "Phân loại",
        cell: ({ row }) => (
          <Badge variant="light" color="indigo">
            {tagLabel(row.original.tag)}
          </Badge>
        )
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const log = row.original
          return (
            <Group gap={8} justify="flex-end" wrap="nowrap">
              {log.note && (
                <Tooltip label={log.note} withArrow>
                  <ActionIcon variant="light" color="gray" aria-label="Ghi chú">
                    <IconNote size={16} />
                  </ActionIcon>
                </Tooltip>
              )}

              <Can roles={["admin", "accounting-emp"]}>
                <Button
                  variant="light"
                  color="yellow"
                  size="xs"
                  radius="xl"
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
                {log.tag === "deliver-tiktokshop" ||
                log.tag === "deliver-shopee" ? (
                  <Tooltip
                    label="Xoá log xuất của TiktokShop/Shopee bằng cách hoàn tác yêu cầu xuất hàng"
                    withArrow
                  >
                    <Button
                      variant="light"
                      color="red"
                      size="xs"
                      radius="xl"
                      leftSection={<IconTrash size={16} />}
                      disabled
                      onClick={(e) => e.stopPropagation()}
                    >
                      Xóa
                    </Button>
                  </Tooltip>
                ) : (
                  <Button
                    variant="light"
                    color="red"
                    size="xs"
                    radius="xl"
                    leftSection={<IconTrash size={16} />}
                    loading={isDeleting}
                    onClick={(e) => {
                      e.stopPropagation()
                      remove(log.logId)
                    }}
                  >
                    Xóa
                  </Button>
                )}
              </Can>
            </Group>
          )
        }
      }
    ],
    [itemsMap, isDeleting, remove, logs]
  )

  // Expanded content (accordion body) per row
  const renderRowSubComponent = ({ row }: { row: Row<LogRow> }) => {
    const its = row.original.items
    if (!its.length) {
      return (
        <Box px={16} py={12}>
          <Text c="dimmed" fz="sm">
            Log này không có mặt hàng.
          </Text>
        </Box>
      )
    }

    return (
      <Box px={16} py={12} w={"50%"}>
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
                    {itemsMap[it._id]?.name ?? "Unknown"}
                  </Text>
                  <Text fz="xs" c="dimmed">
                    {itemsMap[it._id]?.code ?? it._id}
                  </Text>
                </Box>
                <Text fw={800}>{Number(it.quantity) || 0}</Text>
              </Flex>
            ))}
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      mt={40}
      mx="auto"
      px={{ base: 8, md: 0 }}
      w="100%"
      style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: rem(20),
        boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
        border: "1px solid #ececec"
      }}
    >
      {/* Header */}
      <Flex
        align="flex-start"
        justify="space-between"
        pt={32}
        pb={8}
        px={{ base: 8, md: 28 }}
        gap={8}
      >
        <Box>
          <Text fw={700} fz="xl" mb={2}>
            Nhật ký kho
          </Text>
          <Text c="dimmed" fz="sm">
            Mỗi log một dòng. Bấm mũi tên để xem chi tiết mặt hàng.
          </Text>
        </Box>

        <Can roles={["admin", "accounting-emp"]}>
          <Button
            color="indigo"
            leftSection={<IconPlus size={18} />}
            radius="xl"
            size="md"
            px={18}
            onClick={() => openModal()}
            style={{ fontWeight: 600, letterSpacing: 0.1 }}
          >
            Thêm log kho
          </Button>
        </Can>
      </Flex>

      {/* Filters */}
      <Group
        gap={12}
        align="flex-end"
        justify="flex-start"
        px={{ base: 8, md: 28 }}
        py={10}
        wrap="wrap"
      >
        <DatePickerInput
          value={startDate}
          onChange={setStartDate}
          placeholder="Từ ngày"
          label="Từ"
          valueFormat="DD/MM/YYYY"
          size="sm"
          radius="md"
          clearable
          w={140}
        />
        <DatePickerInput
          value={endDate}
          onChange={setEndDate}
          placeholder="Đến ngày"
          label="Đến"
          valueFormat="DD/MM/YYYY"
          size="sm"
          radius="md"
          clearable
          w={140}
        />

        <Select
          data={[{ value: "", label: "Tất cả" }, ...STATUS_OPTIONS]}
          value={status ?? ""}
          onChange={setStatus}
          placeholder="Trạng thái"
          label="Trạng thái"
          size="sm"
          radius="md"
          w={160}
        />

        <Select
          data={[{ value: "", label: "Tất cả" }, ...TAG_OPTIONS]}
          value={tag ?? ""}
          onChange={setTag}
          placeholder="Phân loại"
          label="Phân loại"
          size="sm"
          radius="md"
          w={190}
        />

        <Select
          data={itemsOptions}
          value={itemId ?? ""}
          onChange={setItemId}
          placeholder="Chọn mặt hàng"
          label="Mặt hàng"
          clearable
          searchable
          size="sm"
          radius="md"
          w={260}
        />

        <Group gap={8} ml="auto">
          <NumberInput
            label="Dòng/trang"
            value={limit}
            onChange={(val) => setLimit(Number(val) || 10)}
            min={1}
            max={100}
            w={140}
            size="sm"
            radius="md"
          />
        </Group>
      </Group>

      <Divider my={0} />

      {/* DataTable */}
      <Box px={{ base: 4, md: 28 }} py={18}>
        <CDataTable<LogRow, any>
          key={`${page}-${debouncedLimit}-${rows.length}-${itemId}-${status}-${tag}-${startDate?.toISOString() ?? ""}-${endDate?.toISOString() ?? ""}`}
          columns={columns}
          data={rows}
          isLoading={isLoading}
          loadingText="Đang tải log..."
          enableGlobalFilter={false}
          enableRowSelection={false}
          getRowId={(r) => r._rowId}
          // important: allow expansion
          enableExpanding
          hidePagination
          hidePaginationInformation
          hideColumnToggle
          renderRowSubComponent={renderRowSubComponent}
          onRowClick={(row) => row.toggleExpanded()}
          className="min-w-[980px]"
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
    </Box>
  )
}
