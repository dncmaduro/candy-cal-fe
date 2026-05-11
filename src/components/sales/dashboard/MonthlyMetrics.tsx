import { useMemo } from "react"
import {
  Grid,
  Card,
  Group,
  Text,
  Alert,
  Skeleton,
  Tooltip,
  Box,
  ThemeIcon,
  RingProgress,
  Stack,
  Badge,
  rem
} from "@mantine/core"
import {
  IconTrendingUp,
  IconAlertCircle,
  IconTargetArrow
} from "@tabler/icons-react"
import { TopCustomersChart } from "./TopCustomersChart"

interface MonthlyMetricsData {
  cac: number
  crr: number
  conversionRate: number
  avgDealSize: number
  salesCycleLength: number
  churnRate: number
  stageTransitions: {
    lead: number
    contacted: number
    customer: number
    closed: number
  }
  monthlyGoal: number
  goalCompletionPercentage: number
}

interface TopCustomersData {
  data: {
    funnelId: string
    customerName: string
    customerPhone: string
    revenue: number
    orderCount: number
  }[]
  total: number
}

interface MonthlyMetricsProps {
  isLoading: boolean
  data?: MonthlyMetricsData
  topCustomersData?: TopCustomersData
  topCustomersLoading: boolean
}

const sectionCardStyle = {
  border: "1px solid #E5E7EB",
  borderRadius: rem(14),
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
  background: "#fff"
}

export function MonthlyMetrics({
  isLoading,
  data,
  topCustomersData,
  topCustomersLoading
}: MonthlyMetricsProps) {
  const stagePercentages = useMemo(() => {
    if (!data?.stageTransitions) return null
    const total = data.stageTransitions.lead || 1
    return {
      lead: 100,
      contacted: (data.stageTransitions.contacted / total) * 100,
      customer: (data.stageTransitions.customer / total) * 100,
      closed: (data.stageTransitions.closed / total) * 100
    }
  }, [data?.stageTransitions])

  return (
    <>
      <Grid gutter={14} mb="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card padding="md" style={sectionCardStyle}>
            {isLoading ? (
              <Skeleton height={72} />
            ) : (
              <Tooltip label="Giá trị đơn hàng trung bình">
                <Box>
                  <Group justify="space-between" mb={8}>
                    <Text size="xs" c="dimmed" fw={500}>
                      Giá trị đơn hàng trung bình
                    </Text>
                    <ThemeIcon variant="light" size={34} radius={10} color="pink">
                      <IconTrendingUp size={18} />
                    </ThemeIcon>
                  </Group>
                  <Text fw={700} fz={{ base: "xl", md: 28 }}>
                    {(data?.avgDealSize ?? 0).toLocaleString("vi-VN")}đ
                  </Text>
                </Box>
              </Tooltip>
            )}
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card padding="md" style={sectionCardStyle}>
            {isLoading ? (
              <Skeleton height={72} />
            ) : (
              <Tooltip label="KPI tháng">
                <Box>
                  <Group justify="space-between" mb={8}>
                    <Text size="xs" c="dimmed" fw={500}>
                      KPI
                    </Text>
                    <ThemeIcon variant="light" size={34} radius={10} color="red">
                      <IconTargetArrow size={18} />
                    </ThemeIcon>
                  </Group>
                  <Text fw={700} fz={{ base: "xl", md: 28 }}>
                    {(data?.monthlyGoal ?? 0).toLocaleString("vi-VN")}đ (
                    {(data?.goalCompletionPercentage ?? 0).toFixed(2)}%)
                  </Text>
                </Box>
              </Tooltip>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      <Card padding="md" style={sectionCardStyle} mb="md">
        <TopCustomersChart
          isLoading={topCustomersLoading}
          data={topCustomersData?.data}
          total={topCustomersData?.total}
        />
      </Card>

      <Card padding="md" style={sectionCardStyle}>
        <Group mb="md" gap="xs">
          <IconTrendingUp size={18} />
          <Text fw={600}>Chuyển đổi giai đoạn</Text>
        </Group>

        {isLoading ? (
          <Skeleton height={210} />
        ) : data && stagePercentages ? (
          <Grid gutter={10} align="center">
            <Grid.Col span={{ base: 6, sm: 6, lg: 3 }}>
              <Stack align="center" gap={6}>
                <RingProgress
                  size={112}
                  thickness={11}
                  sections={[{ value: 100, color: "blue" }]}
                  label={
                    <Text ta="center" fw={700} size="xl">
                      {data.stageTransitions.lead}
                    </Text>
                  }
                />
                <Badge size="md" color="blue" radius="xl" tt="uppercase">
                  Lead
                </Badge>
                <Text size="sm" c="dimmed" fw={600}>
                  100%
                </Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 6, sm: 6, lg: 3 }}>
              <Stack align="center" gap={6}>
                <RingProgress
                  size={112}
                  thickness={11}
                  sections={[{ value: stagePercentages.contacted, color: "cyan" }]}
                  label={
                    <Text ta="center" fw={700} size="xl">
                      {data.stageTransitions.contacted}
                    </Text>
                  }
                />
                <Badge size="md" color="cyan" radius="xl" tt="uppercase">
                  Đã liên hệ
                </Badge>
                <Text size="sm" c="dimmed" fw={600}>
                  {stagePercentages.contacted.toFixed(1)}%
                </Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 6, sm: 6, lg: 3 }}>
              <Stack align="center" gap={6}>
                <RingProgress
                  size={112}
                  thickness={11}
                  sections={[{ value: stagePercentages.customer, color: "green" }]}
                  label={
                    <Text ta="center" fw={700} size="xl">
                      {data.stageTransitions.customer}
                    </Text>
                  }
                />
                <Badge size="md" color="green" radius="xl" tt="uppercase">
                  Khách hàng
                </Badge>
                <Text size="sm" c="dimmed" fw={600}>
                  {stagePercentages.customer.toFixed(1)}%
                </Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 6, sm: 6, lg: 3 }}>
              <Stack align="center" gap={6}>
                <RingProgress
                  size={112}
                  thickness={11}
                  sections={[{ value: stagePercentages.closed, color: "gray" }]}
                  label={
                    <Text ta="center" fw={700} size="xl">
                      {data.stageTransitions.closed}
                    </Text>
                  }
                />
                <Badge size="md" color="gray" radius="xl" tt="uppercase">
                  Đã đóng
                </Badge>
                <Text size="sm" c="dimmed" fw={600}>
                  {stagePercentages.closed.toFixed(1)}%
                </Text>
              </Stack>
            </Grid.Col>
          </Grid>
        ) : (
          <Alert color="yellow" icon={<IconAlertCircle />} radius="md" p="sm">
            Không có dữ liệu
          </Alert>
        )}
      </Card>
    </>
  )
}
