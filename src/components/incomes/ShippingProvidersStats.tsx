import { useMemo } from "react"
import { Text, Badge } from "@mantine/core"
import { ColumnDef } from "@tanstack/react-table"
import { CDataTable } from "../common/CDataTable"
import { DashboardSectionCard } from "./DashboardSectionCard"
import { IconTruckDelivery } from "@tabler/icons-react"

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
      shippingProviders.map((sp) => ({
        provider: sp.provider || "-",
        orders: sp.orders || 0,
        percentage:
          Math.round(
            (((sp.orders || 0) / totalOrders) * 100 + Number.EPSILON) * 100
          ) / 100
      })),
    [shippingProviders, totalOrders]
  )

  if (!data.length) return null

  const columns: ColumnDef<ShippingProviderRow>[] = useMemo(
    () => [
      {
        accessorKey: "provider",
        header: "Đơn vị",
        size: 200,
        cell: ({ getValue }) => <Text fw={500}>{getValue<string>()}</Text>
      },
      {
        accessorKey: "orders",
        header: "Số đơn",
        size: 120,
        cell: ({ getValue }) => (
          <Text>{getValue<number>().toLocaleString()}</Text>
        )
      },
      {
        accessorKey: "percentage",
        header: "Tỉ lệ",
        size: 100,
        cell: ({ getValue }) => (
          <Badge variant="light" color="cyan" size="sm">
            {getValue<number>()}%
          </Badge>
        )
      }
    ],
    []
  )

  return (
    <DashboardSectionCard
      title="Theo đơn vị vận chuyển"
      subtitle={`Tổng: ${totalOrders.toLocaleString()} đơn`}
      icon={<IconTruckDelivery size={18} />}
      accentColor="teal"
    >
      <CDataTable
        columns={columns}
        data={data}
        enableGlobalFilter={false}
        enableRowSelection={false}
        initialPageSize={10}
        pageSizeOptions={[10, 20]}
        hideSearch={true}
      />
    </DashboardSectionCard>
  )
}
