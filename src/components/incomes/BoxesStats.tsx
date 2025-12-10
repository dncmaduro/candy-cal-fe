import { useMemo } from "react"
import { Text } from "@mantine/core"
import { ColumnDef } from "@tanstack/react-table"
import { CDataTable } from "../common/CDataTable"
import { IconBoxSeam } from "@tabler/icons-react"
import { DashboardSectionCard } from "./DashboardSectionCard"

interface BoxRow {
  box: string
  quantity: number
}

export const BoxesStats = ({
  boxes
}: {
  boxes: Array<{ box: string; quantity: number }>
}) => {
  const data: BoxRow[] = useMemo(
    () =>
      boxes.map((b) => ({
        box: b.box || "-",
        quantity: b.quantity || 0
      })),
    [boxes]
  )

  if (!data.length) return null

  const total = data.reduce((s, it) => s + it.quantity, 0)

  const columns: ColumnDef<BoxRow>[] = useMemo(
    () => [
      {
        accessorKey: "box",
        header: "Quy cách đóng hộp",
        size: 200,
        cell: ({ getValue }) => <Text fw={500}>{getValue<string>()}</Text>
      },
      {
        accessorKey: "quantity",
        header: "Số lượng",
        size: 100,
        cell: ({ getValue }) => (
          <Text>{getValue<number>().toLocaleString()}</Text>
        )
      }
    ],
    []
  )

  return (
    <DashboardSectionCard
      title="Quy cách đóng hộp"
      subtitle={`Tổng: ${total.toLocaleString()} đơn vị`}
      icon={<IconBoxSeam size={18} />}
      accentColor="gray"
    >
      <CDataTable
        columns={columns}
        data={data}
        enableGlobalFilter={false}
        enableRowSelection={false}
        initialPageSize={10}
        pageSizeOptions={[10, 20, 50]}
        hideSearch={true}
      />
    </DashboardSectionCard>
  )
}
