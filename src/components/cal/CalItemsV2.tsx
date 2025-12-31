import { useMemo } from "react"
import { ScrollArea, Text } from "@mantine/core"
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
  const columns: ColumnDef<CalItemRow>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Mặt hàng",
        cell: ({ row }) => {
          const id = row.original._id
          const it = allItems?.[id]

          if (!it) return <Text c="dimmed">?</Text>

          if (it.deletedAt) {
            return (
              <Text c="red" fw={500}>
                {it.name}
              </Text>
            )
          }

          return <Text fw={500}>{it.name}</Text>
        }
      },
      {
        accessorKey: "quantity",
        header: "Số lượng",
        cell: ({ row }) => row.original.quantity
      }
    ],
    [allItems]
  )

  return (
    <ScrollArea.Autosize mah={500}>
      <CDataTable<CalItemRow, any>
        columns={columns}
        data={items}
        initialPageSize={1000}
        enableGlobalFilter={false}
        enableRowSelection={false}
        isLoading={!allItems} // tuỳ: nếu mày muốn hiện overlay khi chưa load allItems
        loadingText="Đang tải mặt hàng..."
        hidePagination
        hideColumnToggle
        getRowId={(r) => r._id}
        className="min-w-[320px]"
      />
    </ScrollArea.Autosize>
  )
}
