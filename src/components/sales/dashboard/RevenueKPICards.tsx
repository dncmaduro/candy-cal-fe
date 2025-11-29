import { Grid, Card, Group, Text, ThemeIcon, Skeleton } from "@mantine/core"
import {
  IconCash,
  IconShoppingCart,
  IconUserPlus,
  IconUserCheck
} from "@tabler/icons-react"

interface RevenueKPICardsProps {
  isLoading: boolean
  totalRevenue?: number
  totalOrders?: number
  revenueFromNewCustomers?: number
  revenueFromReturningCustomers?: number
}

export function RevenueKPICards({
  isLoading,
  totalRevenue,
  totalOrders,
  revenueFromNewCustomers,
  revenueFromReturningCustomers
}: RevenueKPICardsProps) {
  return (
    <Grid gutter="md" mb="xl">
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          {isLoading ? (
            <Skeleton height={100} />
          ) : (
            <>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Tổng doanh thu
                </Text>
                <ThemeIcon variant="light" size="lg" color="blue">
                  <IconCash size={20} />
                </ThemeIcon>
              </Group>
              <Text fw={700} fz="xl">
                {totalRevenue?.toLocaleString("vi-VN")}đ
              </Text>
            </>
          )}
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          {isLoading ? (
            <Skeleton height={100} />
          ) : (
            <>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Tổng đơn hàng
                </Text>
                <ThemeIcon variant="light" size="lg" color="green">
                  <IconShoppingCart size={20} />
                </ThemeIcon>
              </Group>
              <Text fw={700} fz="xl">
                {totalOrders}
              </Text>
            </>
          )}
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          {isLoading ? (
            <Skeleton height={100} />
          ) : (
            <>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  DT Khách mới
                </Text>
                <ThemeIcon variant="light" size="lg" color="cyan">
                  <IconUserPlus size={20} />
                </ThemeIcon>
              </Group>
              <Text fw={700} fz="xl">
                {revenueFromNewCustomers?.toLocaleString("vi-VN")}đ
              </Text>
            </>
          )}
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          {isLoading ? (
            <Skeleton height={100} />
          ) : (
            <>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  DT Khách quay lại
                </Text>
                <ThemeIcon variant="light" size="lg" color="teal">
                  <IconUserCheck size={20} />
                </ThemeIcon>
              </Group>
              <Text fw={700} fz="xl">
                {revenueFromReturningCustomers?.toLocaleString("vi-VN")}đ
              </Text>
            </>
          )}
        </Card>
      </Grid.Col>
    </Grid>
  )
}
