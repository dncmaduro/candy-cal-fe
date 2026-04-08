import { useMemo } from "react"
import { DashboardSectionCard } from "./DashboardSectionCard"
import { IconTruckDelivery } from "@tabler/icons-react"
import { RankedBarList } from "./analytics/RankedBarList"

interface ShippingProviderRow {
  provider: string
  orders: number
  percentage: number
}

export const ShippingProvidersStats = ({
  shippingProviders
}: {
  shippingProviders: Array<{ provider: string; orders: number }>
}) => {
  const totalOrders = useMemo(
    () => shippingProviders.reduce((s, it) => s + (it?.orders ?? 0), 0) || 1,
    [shippingProviders]
  )

  const data: ShippingProviderRow[] = useMemo(
    () =>
      shippingProviders
        .map((sp) => ({
          provider: sp.provider || "-",
          orders: sp.orders || 0,
          percentage:
            Math.round(
              (((sp.orders || 0) / totalOrders) * 100 + Number.EPSILON) * 100
            ) / 100
        }))
        .sort((a, b) => b.orders - a.orders),
    [shippingProviders, totalOrders]
  )

  if (!data.length) return null

  return (
    <DashboardSectionCard
      title="Đơn vị vận chuyển"
      subtitle={
        data[0]
          ? `${data[0].provider} chiếm ${data[0].percentage}% số đơn`
          : `Tổng: ${totalOrders.toLocaleString()} đơn`
      }
      icon={<IconTruckDelivery size={18} />}
      accentColor="teal"
    >
      <RankedBarList
        items={data.map((item) => ({
          key: item.provider,
          label: item.provider,
          value: item.orders,
          caption: `${item.orders.toLocaleString("vi-VN")} đơn`
        }))}
        totalValue={totalOrders}
        color="teal"
        valueFormatter={(value) => `${value.toLocaleString("vi-VN")} đơn`}
      />
    </DashboardSectionCard>
  )
}
