import { useMemo } from "react"
import { IconBoxSeam } from "@tabler/icons-react"
import { DashboardSectionCard } from "./DashboardSectionCard"
import { RankedBarList } from "./analytics/RankedBarList"

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
  const sortedData = [...data].sort((a, b) => b.quantity - a.quantity)

  return (
    <DashboardSectionCard
      title="Quy cách đóng hộp"
      subtitle={
        sortedData[0]
          ? `${sortedData[0].box} được dùng nhiều nhất`
          : `Tổng: ${total.toLocaleString()} đơn vị`
      }
      icon={<IconBoxSeam size={18} />}
      accentColor="gray"
    >
      <RankedBarList
        items={sortedData.map((item) => ({
          key: item.box,
          label: item.box,
          value: item.quantity,
          caption: `${item.quantity.toLocaleString("vi-VN")} đơn vị`
        }))}
        totalValue={total}
        color="gray"
        valueFormatter={(value) => `${value.toLocaleString("vi-VN")} đơn vị`}
      />
    </DashboardSectionCard>
  )
}
