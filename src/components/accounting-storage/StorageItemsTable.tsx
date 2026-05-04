import type { ColumnDef } from "@tanstack/react-table"
import { Badge, Button, Flex, Group, Stack, Text } from "@mantine/core"
import { modals } from "@mantine/modals"
import { IconPencil, IconSearch } from "@tabler/icons-react"
import { format } from "date-fns"

import type { SearchStorageItemResponse } from "../../hooks/models"
import { Can } from "../common/Can"
import { CDataTable } from "../common/CDataTable"
import { StorageItemDetailModal } from "./StorageItemDetailModal"
import { StorageItemModal } from "./StorageItemModal"

type ShowMode = "both" | "quantity" | "real"

interface Props {
  itemsData: SearchStorageItemResponse[]
  isLoading: boolean
  showMode: ShowMode
  showDeleted: boolean
  readOnly?: boolean
  refetch: () => void

  // NEW: move controls to DataTable toolbar
  extraFilters?: React.ReactNode
  extraActions?: React.ReactNode
}

const calcBoxes = (quantity: number, quantityPerBox: number) => {
  if (!quantity || !quantityPerBox || quantityPerBox <= 0) {
    return { boxes: 0, remainder: 0 }
  }
  const boxes = Math.floor(quantity / quantityPerBox)
  const remainder = quantity % quantityPerBox
  return { boxes, remainder }
}

const formatNumber = (value?: number) => {
  if (typeof value !== "number") return "-"
  return value.toLocaleString("vi-VN")
}

const openDetail = (item: SearchStorageItemResponse) => {
  modals.open({
    size: "lg",
    title: (
      <Text fw={700} fz="md">
        Chi tiết mặt hàng
      </Text>
    ),
    children: <StorageItemDetailModal item={item} />
  })
}

const openEdit = (item: SearchStorageItemResponse, refetch: () => void) => {
  modals.open({
    size: "lg",
    title: (
      <Text fw={700} fz="md">
        Chỉnh sửa mặt hàng
      </Text>
    ),
    children: <StorageItemModal item={item} refetch={refetch} />
  })
}

export const StorageItemsTable = ({
  itemsData,
  isLoading,
  showMode,
  showDeleted,
  readOnly,
  refetch,
  extraFilters,
  extraActions
}: Props) => {
  const tableMetaNumeric = {
    isNumeric: true,
    align: "right" as const,
    headerClassName: "min-w-[130px]",
    cellClassName: "[font-variant-numeric:tabular-nums]"
  }

  const renderQty = (
    obj?: { quantity?: number; real?: number },
    mode: ShowMode = showMode
  ) => {
    if (mode === "both") {
      return (
        <Group gap={14} wrap="nowrap" justify="flex-end">
          <Text fz="sm" style={{ fontVariantNumeric: "tabular-nums" }}>
            SL:{" "}
            <Text span fw={700} c="dark.8">
              {formatNumber(obj?.quantity)}
            </Text>
          </Text>
          <Text
            fz="sm"
            c="dimmed"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            TT:{" "}
            <Text span fw={700} c="dark.8">
              {formatNumber(obj?.real)}
            </Text>
          </Text>
        </Group>
      )
    }
    if (mode === "quantity") {
      return (
        <Text fw={700} c="dark.8" style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatNumber(obj?.quantity)}
        </Text>
      )
    }
    return (
      <Text fw={700} c="dark.8" style={{ fontVariantNumeric: "tabular-nums" }}>
        {formatNumber(obj?.real)}
      </Text>
    )
  }

  const columns: ColumnDef<SearchStorageItemResponse>[] = (() => {
    const base: ColumnDef<SearchStorageItemResponse>[] = [
      {
        id: "name",
        header: "Mặt hàng",
        meta: {
          headerClassName: "min-w-[270px]"
        },
        enableSorting: false,
        cell: ({ row }) => {
          const item = row.original
          const qpb = item.quantityPerBox ?? 1
          return (
            <Stack gap={4}>
              <Text fw={700} c="dark.8" lineClamp={2}>
                {item.name}
              </Text>
              <Group gap={8}>
                {!showDeleted ? (
                  <Badge variant="light" color="gray" size="sm" radius="sm">
                    Quy cách: {qpb}/hộp
                  </Badge>
                ) : (
                  <Badge variant="light" color="red" size="sm" radius="sm">
                    Đã xoá
                  </Badge>
                )}
              </Group>
            </Stack>
          )
        }
      },
      {
        accessorKey: "code",
        header: "Mã",
        meta: {
          headerClassName: "min-w-[140px]"
        },
        cell: ({ row }) => (
          <Text fz="sm" c="gray.7" fw={500} style={{ fontVariantNumeric: "tabular-nums" }}>
            {row.original.code}
          </Text>
        )
      }
    ]

    if (showDeleted) {
      return [
        ...base,
        {
          id: "received",
          header: "Nhập kho",
          meta: tableMetaNumeric,
          enableSorting: false,
          cell: ({ row }) => renderQty(row.original.receivedQuantity)
        },
        {
          id: "deletedAt",
          header: "Ngày xoá",
          meta: {
            headerClassName: "min-w-[170px]"
          },
          enableSorting: false,
          cell: ({ row }) => {
            const d = row.original.deletedAt
            return (
              <Text fz="sm" c="red">
                {d ? format(new Date(d), "dd/MM/yyyy HH:mm") : "-"}
              </Text>
            )
          }
        },
        {
          id: "actions",
          header: "",
          enableSorting: false,
          meta: { align: "right" as const, headerClassName: "w-[190px]" },
          cell: ({ row }) => {
            const item = row.original
            return (
              <Flex justify="flex-end" gap={8}>
                <Button
                  variant="default"
                  color="gray"
                  size="xs"
                  radius="md"
                  miw={84}
                  justify="center"
                  leftSection={<IconSearch size={16} />}
                  onClick={() => openDetail(item)}
                >
                  Chi tiết
                </Button>

                <Can roles={["admin", "accounting-emp"]}>
                  <Button
                    hidden={readOnly}
                    variant="light"
                    color="orange"
                    size="xs"
                    radius="md"
                    miw={84}
                    justify="center"
                    leftSection={<IconPencil size={16} />}
                    onClick={() => openEdit(item, refetch)}
                  >
                    Sửa
                  </Button>
                </Can>
              </Flex>
            )
          }
        }
      ]
    }

    return [
      ...base,
      {
        id: "received",
        header: "Nhập kho",
        meta: tableMetaNumeric,
        enableSorting: false,
        cell: ({ row }) => renderQty(row.original.receivedQuantity)
      },
      {
        id: "delivered",
        header: "Xuất kho",
        meta: tableMetaNumeric,
        enableSorting: false,
        cell: ({ row }) => renderQty(row.original.deliveredQuantity)
      },
      {
        id: "rest",
        header: "Tồn kho",
        meta: tableMetaNumeric,
        enableSorting: false,
        cell: ({ row }) => renderQty(row.original.restQuantity)
      },
      {
        id: "boxes",
        header: "Tồn theo thùng",
        meta: tableMetaNumeric,
        enableSorting: false,
        cell: ({ row }) => {
          const item = row.original
          const restQuantity =
            showMode === "real"
              ? (item.restQuantity?.real ?? 0)
              : (item.restQuantity?.quantity ?? 0)

          const { boxes, remainder } = calcBoxes(
            restQuantity,
            item.quantityPerBox ?? 1
          )

          return (
            <Stack gap={2} align="flex-end">
              <Text
                fz="sm"
                fw={800}
                c="dark.8"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatNumber(boxes)} thùng
              </Text>
              <Text
                fz="xs"
                c="dimmed"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatNumber(remainder)} đơn vị lẻ
              </Text>
            </Stack>
          )
        }
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        meta: { align: "right" as const, headerClassName: "w-[190px]" },
        cell: ({ row }) => {
          const item = row.original
          return (
            <Flex justify="flex-end" gap={8}>
              <Button
                variant="default"
                color="gray"
                size="xs"
                radius="md"
                miw={84}
                justify="center"
                leftSection={<IconSearch size={16} />}
                onClick={() => openDetail(item)}
              >
                Chi tiết
              </Button>

              <Can roles={["admin", "accounting-emp"]}>
                <Button
                  hidden={readOnly}
                  variant="light"
                  color="orange"
                  size="xs"
                  radius="md"
                  miw={84}
                  justify="center"
                  leftSection={<IconPencil size={16} />}
                  onClick={() => openEdit(item, refetch)}
                >
                  Sửa
                </Button>
              </Can>
            </Flex>
          )
        }
      }
    ]
  })()

  // show all rows, hide pagination footer
  const pageSizeHuge = 100000

  return (
    <CDataTable<SearchStorageItemResponse, unknown>
      key={`${showDeleted}-${showMode}-${itemsData?.length ?? 0}`}
      columns={columns}
      data={itemsData ?? []}
      isLoading={isLoading}
      loadingText="Đang tải dữ liệu mặt hàng..."
      skeletonRowCount={10}
      enableGlobalFilter={false} // vì search là server-side ở extraFilters
      enableRowSelection={false}
      columnToggleLabel="Tùy chỉnh cột"
      getRowId={(r) => r._id}
      onRowClick={(row) => openDetail(row.original)}
      extraFilters={extraFilters}
      extraActions={extraActions}
      emptyState={
        <Stack gap={4} align="center">
          <Text fw={600}>Không có mặt hàng</Text>
          <Text c="dimmed">Điều chỉnh từ khóa hoặc bộ lọc để xem dữ liệu</Text>
        </Stack>
      }
      tableContainerClassName="max-h-[64vh] overflow-y-auto"
      stickyHeaderOffset={0}
      initialPageSize={pageSizeHuge}
      pageSizeOptions={[pageSizeHuge]}
      className="min-w-[980px] [&>div:last-child]:hidden"
    />
  )
}
