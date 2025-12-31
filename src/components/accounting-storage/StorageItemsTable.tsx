import { useMemo } from "react"
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
  const renderQty = (
    obj?: { quantity?: number; real?: number },
    mode: ShowMode = showMode
  ) => {
    if (mode === "both") {
      return (
        <Group gap={10} wrap="nowrap">
          <Text fz="sm">
            SL:{" "}
            <Text span fw={700}>
              {obj?.quantity ?? "-"}
            </Text>
          </Text>
          <Text fz="sm" c="dimmed">
            TT:{" "}
            <Text span fw={700}>
              {obj?.real ?? "-"}
            </Text>
          </Text>
        </Group>
      )
    }
    if (mode === "quantity") return <Text fw={700}>{obj?.quantity ?? "-"}</Text>
    return <Text fw={700}>{obj?.real ?? "-"}</Text>
  }

  const columns: ColumnDef<SearchStorageItemResponse>[] = useMemo(() => {
    const base: ColumnDef<SearchStorageItemResponse>[] = [
      {
        id: "name",
        header: "Mặt hàng",
        cell: ({ row }) => {
          const item = row.original
          const qpb = item.quantityPerBox ?? 1
          return (
            <Stack gap={4}>
              <Text fw={600} lineClamp={2}>
                {item.name}
              </Text>
              <Group gap={8}>
                {!showDeleted ? (
                  <Badge variant="light" color="blue" size="xs">
                    {qpb}/hộp
                  </Badge>
                ) : (
                  <Badge variant="light" color="red" size="xs">
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
        cell: ({ row }) => <Text fz="sm">{row.original.code}</Text>
      }
    ]

    if (showDeleted) {
      return [
        ...base,
        {
          id: "received",
          header: "Nhập kho",
          cell: ({ row }) => renderQty(row.original.receivedQuantity)
        },
        {
          id: "deletedAt",
          header: "Ngày xoá",
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
          cell: ({ row }) => {
            const item = row.original
            return (
              <Flex justify="flex-end" gap={8}>
                <Button
                  variant="light"
                  color="indigo"
                  size="xs"
                  radius="xl"
                  leftSection={<IconSearch size={16} />}
                  onClick={() => openDetail(item)}
                >
                  Chi tiết
                </Button>

                <Can roles={["admin", "accounting-emp"]}>
                  <Button
                    hidden={readOnly}
                    variant="light"
                    color="yellow"
                    size="xs"
                    radius="xl"
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
        cell: ({ row }) => renderQty(row.original.receivedQuantity)
      },
      {
        id: "delivered",
        header: "Xuất kho",
        cell: ({ row }) => renderQty(row.original.deliveredQuantity)
      },
      {
        id: "rest",
        header: "Tồn kho",
        cell: ({ row }) => renderQty(row.original.restQuantity)
      },
      {
        id: "boxes",
        header: "Số thùng (tồn)",
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
            <Stack gap={2}>
              <Text fz="sm" fw={800}>
                {boxes} thùng
              </Text>
              {remainder > 0 && (
                <Text fz="xs" c="dimmed">
                  + {remainder} lẻ
                </Text>
              )}
            </Stack>
          )
        }
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const item = row.original
          return (
            <Flex justify="flex-end" gap={8}>
              <Button
                variant="light"
                color="indigo"
                size="xs"
                radius="xl"
                leftSection={<IconSearch size={16} />}
                onClick={() => openDetail(item)}
              >
                Chi tiết
              </Button>

              <Can roles={["admin", "accounting-emp"]}>
                <Button
                  hidden={readOnly}
                  variant="light"
                  color="yellow"
                  size="xs"
                  radius="xl"
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
  }, [showDeleted, showMode, readOnly, refetch])

  // show all rows, hide pagination footer
  const pageSizeHuge = 100000

  return (
    <CDataTable<SearchStorageItemResponse, any>
      key={`${showDeleted}-${showMode}-${itemsData?.length ?? 0}`}
      columns={columns}
      data={itemsData ?? []}
      isLoading={isLoading}
      loadingText="Đang tải mặt hàng..."
      enableGlobalFilter={false} // vì search là server-side ở extraFilters
      enableRowSelection={false}
      getRowId={(r) => r._id}
      onRowClick={(row) => openDetail(row.original)}
      extraFilters={extraFilters}
      extraActions={extraActions}
      initialPageSize={pageSizeHuge}
      pageSizeOptions={[pageSizeHuge]}
      className="min-w-[920px] [&>div:last-child]:hidden"
    />
  )
}
