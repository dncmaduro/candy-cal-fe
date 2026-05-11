import { Grid, Card, Group, Text, ThemeIcon, Skeleton, rem } from "@mantine/core"
import {
  IconCash,
  IconShoppingCart,
  IconUserPlus,
  IconUserCheck,
  IconPackageExport
} from "@tabler/icons-react"

interface RevenueKPICardsProps {
  isLoading: boolean
  totalRevenue?: number
  totalRevenueBeforeDiscount?: number
  totalOrders?: number
  totalQuantity?: number
  totalTax?: number
  totalShippingCost?: number
  revenueFromNewCustomers?: number
  revenueFromReturningCustomers?: number
}

type KpiItem = {
  label: string
  value: string | number | undefined
  icon: React.ReactNode
  iconColor: string
}

const cardStyle = {
  border: "1px solid #E5E7EB",
  borderRadius: rem(14),
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
  background: "#fff"
}

export function RevenueKPICards({
  isLoading,
  totalRevenue,
  totalRevenueBeforeDiscount,
  totalOrders,
  totalQuantity,
  totalTax,
  totalShippingCost,
  revenueFromNewCustomers,
  revenueFromReturningCustomers
}: RevenueKPICardsProps) {
  const items: KpiItem[] = [
    {
      label: "Tổng doanh thu",
      value: `${(totalRevenue ?? 0).toLocaleString("vi-VN")}đ`,
      icon: <IconCash size={18} />,
      iconColor: "blue"
    },
    {
      label: "DT trước chiết khấu",
      value: `${(totalRevenueBeforeDiscount ?? 0).toLocaleString("vi-VN")}đ`,
      icon: <IconCash size={18} />,
      iconColor: "indigo"
    },
    {
      label: "Tổng thuế",
      value: `${(totalTax ?? 0).toLocaleString("vi-VN")}đ`,
      icon: <IconCash size={18} />,
      iconColor: "orange"
    },
    {
      label: "Tổng chi phí vận chuyển",
      value: `${(totalShippingCost ?? 0).toLocaleString("vi-VN")}đ`,
      icon: <IconShoppingCart size={18} />,
      iconColor: "red"
    },
    {
      label: "Tổng số lượng",
      value: totalQuantity ?? 0,
      icon: <IconPackageExport size={18} />,
      iconColor: "yellow"
    },
    {
      label: "Tổng đơn hàng",
      value: totalOrders ?? 0,
      icon: <IconShoppingCart size={18} />,
      iconColor: "green"
    },
    {
      label: "DT Khách mới",
      value: `${(revenueFromNewCustomers ?? 0).toLocaleString("vi-VN")}đ`,
      icon: <IconUserPlus size={18} />,
      iconColor: "cyan"
    },
    {
      label: "DT Khách quay lại",
      value: `${(revenueFromReturningCustomers ?? 0).toLocaleString("vi-VN")}đ`,
      icon: <IconUserCheck size={18} />,
      iconColor: "teal"
    }
  ]

  return (
    <Grid gutter={14}>
      {items.map((item) => (
        <Grid.Col key={item.label} span={{ base: 12, sm: 6, lg: 3 }}>
          <Card padding="md" style={cardStyle}>
            {isLoading ? (
              <Skeleton height={72} />
            ) : (
              <>
                <Group justify="space-between" mb={8}>
                  <Text size="xs" c="dimmed" fw={500}>
                    {item.label}
                  </Text>
                  <ThemeIcon variant="light" size={34} radius={10} color={item.iconColor}>
                    {item.icon}
                  </ThemeIcon>
                </Group>
                <Text fw={700} fz={{ base: "xl", md: 28 }}>
                  {item.value}
                </Text>
              </>
            )}
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  )
}
