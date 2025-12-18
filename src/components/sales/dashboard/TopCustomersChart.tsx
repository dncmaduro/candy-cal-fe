import { Box, Group, Paper, Skeleton, Text, Title } from "@mantine/core"
import { BarChart } from "@mantine/charts"
import { IconCrown } from "@tabler/icons-react"

type TopCustomer = {
  funnelId: string
  customerName: string
  customerPhone: string
  revenue: number
  orderCount: number
}

type TopCustomersChartProps = {
  isLoading: boolean
  data?: TopCustomer[]
}

export const TopCustomersChart = ({
  isLoading,
  data
}: TopCustomersChartProps) => {
  if (isLoading) {
    return (
      <Paper p="md" withBorder>
        <Skeleton height={30} width="60%" mb="md" />
        <Skeleton height={300} />
      </Paper>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconCrown size={20} color="var(--mantine-color-yellow-6)" />
          <Title order={4}>Top khách hàng theo doanh thu</Title>
        </Group>
        <Text c="dimmed" ta="center" py={60}>
          Không có dữ liệu
        </Text>
      </Paper>
    )
  }

  // Take top 10 customers
  const topCustomers = data.slice(0, 10)

  // Prepare chart data
  const chartData = topCustomers.map((customer) => ({
    customer: customer.customerName,
    "Doanh thu": customer.revenue,
    phone: customer.customerPhone,
    orders: customer.orderCount
  }))

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <IconCrown size={20} color="var(--mantine-color-yellow-6)" />
          <Title order={4}>Top khách hàng theo doanh thu</Title>
        </Group>
      </Group>
      (
      <Box>
        <BarChart
          h={400}
          data={chartData}
          dataKey="customer"
          series={[{ name: "Doanh thu", color: "yellow.6" }]}
          tickLine="y"
          gridAxis="y"
          withLegend
          tooltipProps={{
            content: ({ label, payload }) => {
              if (!payload || payload.length === 0) return null
              const data = payload[0].payload
              return (
                <Paper px="md" py="sm" withBorder shadow="md" radius="md">
                  <Text fw={600} mb={4}>
                    {label}
                  </Text>
                  <Text size="sm" c="dimmed" mb={8}>
                    {data.phone}
                  </Text>
                  <Text size="sm" mb={4}>
                    <strong>Doanh thu:</strong>{" "}
                    {data["Doanh thu"].toLocaleString("vi-VN")}đ
                  </Text>
                  <Text size="sm">
                    <strong>Số đơn:</strong> {data.orders}
                  </Text>
                </Paper>
              )
            }
          }}
        />
      </Box>
      )
    </Paper>
  )
}
