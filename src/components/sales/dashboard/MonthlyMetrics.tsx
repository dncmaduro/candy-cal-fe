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
  Badge
} from "@mantine/core"
import {
  IconCash,
  IconUserCheck,
  IconPercentage,
  IconTrendingUp,
  IconCalendarTime,
  IconUsers,
  IconAlertCircle
} from "@tabler/icons-react"

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
}

interface MonthlyMetricsProps {
  isLoading: boolean
  data?: MonthlyMetricsData
}

export function MonthlyMetrics({ isLoading, data }: MonthlyMetricsProps) {
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
      {/* Metrics KPI Cards */}
      <Grid gutter="md" mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            {isLoading ? (
              <Skeleton height={100} />
            ) : (
              <Tooltip label="Chi phí thu hút khách hàng">
                <Box>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="dimmed">
                      CAC
                    </Text>
                    <ThemeIcon variant="light" size="lg" color="orange">
                      <IconCash size={20} />
                    </ThemeIcon>
                  </Group>
                  <Text fw={700} fz="xl">
                    {data?.cac.toLocaleString("vi-VN")}đ
                  </Text>
                </Box>
              </Tooltip>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            {isLoading ? (
              <Skeleton height={100} />
            ) : (
              <Tooltip label="Tỷ lệ khách hàng quay lại">
                <Box>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="dimmed">
                      CRR
                    </Text>
                    <ThemeIcon variant="light" size="lg" color="grape">
                      <IconUserCheck size={20} />
                    </ThemeIcon>
                  </Group>
                  <Text fw={700} fz="xl">
                    {data?.crr.toFixed(1)}%
                  </Text>
                </Box>
              </Tooltip>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            {isLoading ? (
              <Skeleton height={100} />
            ) : (
              <Tooltip label="Tỷ lệ chuyển đổi">
                <Box>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="dimmed">
                      Conversion Rate
                    </Text>
                    <ThemeIcon variant="light" size="lg" color="violet">
                      <IconPercentage size={20} />
                    </ThemeIcon>
                  </Group>
                  <Text fw={700} fz="xl">
                    {data?.conversionRate.toFixed(1)}%
                  </Text>
                </Box>
              </Tooltip>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            {isLoading ? (
              <Skeleton height={100} />
            ) : (
              <Tooltip label="Giá trị đơn hàng trung bình">
                <Box>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="dimmed">
                      Avg Deal Size
                    </Text>
                    <ThemeIcon variant="light" size="lg" color="pink">
                      <IconTrendingUp size={20} />
                    </ThemeIcon>
                  </Group>
                  <Text fw={700} fz="xl">
                    {data?.avgDealSize.toLocaleString("vi-VN")}đ
                  </Text>
                </Box>
              </Tooltip>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            {isLoading ? (
              <Skeleton height={100} />
            ) : (
              <Tooltip label="Thời gian chu kỳ bán hàng">
                <Box>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="dimmed">
                      Sales Cycle
                    </Text>
                    <ThemeIcon variant="light" size="lg" color="indigo">
                      <IconCalendarTime size={20} />
                    </ThemeIcon>
                  </Group>
                  <Text fw={700} fz="xl">
                    {data?.salesCycleLength.toFixed(0)} ngày
                  </Text>
                </Box>
              </Tooltip>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            {isLoading ? (
              <Skeleton height={100} />
            ) : (
              <Tooltip label="Tỷ lệ rời bỏ">
                <Box>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="dimmed">
                      Churn Rate
                    </Text>
                    <ThemeIcon variant="light" size="lg" color="red">
                      <IconUsers size={20} />
                    </ThemeIcon>
                  </Group>
                  <Text fw={700} fz="xl">
                    {data?.churnRate.toFixed(1)}%
                  </Text>
                </Box>
              </Tooltip>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      {/* Stage Transitions */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group mb="md">
          <IconTrendingUp size={20} />
          <Text fw={600}>Chuyển đổi giai đoạn</Text>
        </Group>
        {isLoading ? (
          <Skeleton height={200} />
        ) : data && stagePercentages ? (
          <Grid gutter="xl">
            <Grid.Col span={3}>
              <Stack align="center" gap="xs">
                <RingProgress
                  size={140}
                  thickness={14}
                  sections={[{ value: 100, color: "blue" }]}
                  label={
                    <Text ta="center" fw={700} size="xl">
                      {data.stageTransitions.lead}
                    </Text>
                  }
                />
                <Badge size="lg" color="blue">
                  Lead
                </Badge>
                <Text size="sm" c="dimmed" fw={600}>
                  100%
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={3}>
              <Stack align="center" gap="xs">
                <RingProgress
                  size={140}
                  thickness={14}
                  sections={[
                    {
                      value: stagePercentages.contacted,
                      color: "cyan"
                    }
                  ]}
                  label={
                    <Text ta="center" fw={700} size="xl">
                      {data.stageTransitions.contacted}
                    </Text>
                  }
                />
                <Badge size="lg" color="cyan">
                  Đã liên hệ
                </Badge>
                <Text size="sm" c="dimmed" fw={600}>
                  {stagePercentages.contacted.toFixed(1)}%
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={3}>
              <Stack align="center" gap="xs">
                <RingProgress
                  size={140}
                  thickness={14}
                  sections={[
                    { value: stagePercentages.customer, color: "green" }
                  ]}
                  label={
                    <Text ta="center" fw={700} size="xl">
                      {data.stageTransitions.customer}
                    </Text>
                  }
                />
                <Badge size="lg" color="green">
                  Khách hàng
                </Badge>
                <Text size="sm" c="dimmed" fw={600}>
                  {stagePercentages.customer.toFixed(1)}%
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={3}>
              <Stack align="center" gap="xs">
                <RingProgress
                  size={140}
                  thickness={14}
                  sections={[{ value: stagePercentages.closed, color: "gray" }]}
                  label={
                    <Text ta="center" fw={700} size="xl">
                      {data.stageTransitions.closed}
                    </Text>
                  }
                />
                <Badge size="lg" color="gray">
                  Đã đóng
                </Badge>
                <Text size="sm" c="dimmed" fw={600}>
                  {stagePercentages.closed.toFixed(1)}%
                </Text>
              </Stack>
            </Grid.Col>
          </Grid>
        ) : (
          <Alert color="yellow" icon={<IconAlertCircle />}>
            Không có dữ liệu
          </Alert>
        )}
      </Card>
    </>
  )
}
