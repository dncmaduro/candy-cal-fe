import { useMemo } from "react"
import { Badge, Box, Divider, Group, Paper, ScrollArea, Text } from "@mantine/core"
import type { ColumnDef } from "@tanstack/react-table"
import { CDataTable } from "../common/CDataTable"
import type { SearchStorageItemResponse } from "../../hooks/models"

type CalItemRow = {
  _id: string
  quantity: number
}

interface Props {
  allItems?: Record<string, SearchStorageItemResponse>
  items: CalItemRow[]
}

export const CalItemsV2 = ({ allItems, items }: Props) => {
  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const columns: ColumnDef<CalItemRow>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Mặt hàng",
        meta: {
          align: "left"
        },
        cell: ({ row }) => {
          const id = row.original._id
          const it = allItems?.[id]

          if (!it) return <Text c="dimmed">?</Text>

          if (it.deletedAt) {
            return (
              <Text c="red" fw={500} fz="sm" style={{ whiteSpace: "normal" }}>
                {it.name}
              </Text>
            )
          }

          return (
            <Text fw={500} fz="sm" style={{ whiteSpace: "normal" }}>
              {it.name}
            </Text>
          )
        }
      },
      {
        accessorKey: "quantity",
        header: "Số lượng",
        meta: {
          align: "right",
          headerClassName: "w-[120px]",
          cellClassName: "font-semibold"
        },
        cell: ({ row }) => row.original.quantity
      }
    ],
    [allItems]
  )

  return (
    <Paper withBorder radius="lg" p="md">
      <Group justify="space-between" align="start" mb={10} wrap="wrap" gap={8}>
        <Box>
          <Text fw={700} fz="sm">
            Tổng hợp mặt hàng cần xử lý
          </Text>
          <Text c="dimmed" fz="xs" mt={2}>
            Kiểm tra nhanh số lượng trước khi chuyển sang bước đóng đơn.
          </Text>
        </Box>
        <Badge variant="light" color="indigo">
          {items.length} loại
        </Badge>
      </Group>
      <Divider mb={10} />

      <ScrollArea.Autosize mah={460}>
        <CDataTable<CalItemRow, any>
          columns={columns}
          data={items}
          initialPageSize={1000}
          enableGlobalFilter={false}
          enableRowSelection={false}
          isLoading={!allItems}
          loadingText="Đang tải mặt hàng..."
          hidePagination
          hideColumnToggle
          variant="compact"
          getRowId={(r) => r._id}
          className="min-w-[320px]"
        />
      </ScrollArea.Autosize>

      <Divider my={10} />
      <Group justify="space-between" align="center">
        <Text fz="sm" c="dimmed">
          Tổng số lượng
        </Text>
        <Text fw={700}>{totalQuantity}</Text>
      </Group>
    </Paper>
  )
}
