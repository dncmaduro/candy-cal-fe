import { createFileRoute } from "@tanstack/react-router"
import { LivestreamLayout } from "../../../components/layouts/LivestreamLayout"
import { useLivestream } from "../../../hooks/useLivestream"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
  Divider,
  Flex,
  Group,
  Loader,
  rem,
  Text,
  Badge,
  Select,
  Paper,
  SimpleGrid,
  Stack,
  Card,
  ThemeIcon,
  Progress,
  Table
} from "@mantine/core"
import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconCoin,
  IconTarget,
  IconChartBar
} from "@tabler/icons-react"
import { useState, useMemo } from "react"
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths
} from "date-fns"
import { fmtCurrency } from "../../../utils/fmt"

type ViewType = "week" | "month"

export const Route = createFileRoute("/livestream/stats/")({
  component: RouteComponent
})

function RouteComponent() {
  const { getLivestreamStats, searchLivestreamEmployees } = useLivestream()

  const [viewType, setViewType] = useState<ViewType>("week")
  const [weekDate, setWeekDate] = useState<Date | null>(new Date())
  const [monthValue, setMonthValue] = useState<string>(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
  })

  // Calculate current and previous periods
  const periods = useMemo(() => {
    if (viewType === "week" && weekDate) {
      const currentStart = startOfWeek(weekDate, { weekStartsOn: 1 })
      const currentEnd = endOfWeek(weekDate, { weekStartsOn: 1 })
      const previousStart = startOfWeek(subWeeks(weekDate, 1), {
        weekStartsOn: 1
      })
      const previousEnd = endOfWeek(subWeeks(weekDate, 1), { weekStartsOn: 1 })

      return {
        current: { start: currentStart, end: currentEnd },
        previous: { start: previousStart, end: previousEnd }
      }
    } else if (viewType === "month" && monthValue) {
      const monthDate = new Date(monthValue)
      const currentStart = startOfMonth(monthDate)
      const currentEnd = endOfMonth(monthDate)
      const previousStart = startOfMonth(subMonths(monthDate, 1))
      const previousEnd = endOfMonth(subMonths(monthDate, 1))

      return {
        current: { start: currentStart, end: currentEnd },
        previous: { start: previousStart, end: previousEnd }
      }
    }
    return null
  }, [viewType, weekDate, monthValue])

  // Generate options for dropdowns
  const weeks = useMemo(() => {
    const now = new Date()
    const arr = [] as { label: string; value: string }[]
    for (let i = 0; i < 12; i++) {
      const ref = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i * 7
      )
      const s = startOfWeek(ref, { weekStartsOn: 1 })
      const e = endOfWeek(ref, { weekStartsOn: 1 })
      arr.push({
        label: `${format(s, "dd/MM")} - ${format(e, "dd/MM/yyyy")}`,
        value: s.toISOString()
      })
    }
    return arr
  }, [])

  const months = useMemo(() => {
    const now = new Date()
    const arr = [] as { label: string; value: string }[]
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      arr.push({ label: format(d, "MM/yyyy"), value: d.toISOString() })
    }
    return arr
  }, [])

  // Fetch current period stats
  const { data: currentStats, isLoading: currentLoading } = useQuery({
    queryKey: ["getLivestreamStats", "current", periods?.current],
    queryFn: async () => {
      if (!periods?.current) return null
      return await getLivestreamStats({
        startDate: format(periods.current.start, "yyyy-MM-dd"),
        endDate: format(periods.current.end, "yyyy-MM-dd")
      })
    },
    select: (data: any) => data?.data,
    enabled: !!periods?.current
  })

  // Fetch previous period stats for comparison
  const { data: previousStats, isLoading: previousLoading } = useQuery({
    queryKey: ["getLivestreamStats", "previous", periods?.previous],
    queryFn: async () => {
      if (!periods?.previous) return null
      return await getLivestreamStats({
        startDate: format(periods.previous.start, "yyyy-MM-dd"),
        endDate: format(periods.previous.end, "yyyy-MM-dd")
      })
    },
    select: (data: any) => data?.data,
    enabled: !!periods?.previous
  })

  // Fetch employees list
  const { data: employeesData } = useQuery({
    queryKey: ["searchLivestreamEmployees"],
    queryFn: () => searchLivestreamEmployees({ page: 1, limit: 100 }),
    select: (data) => data?.data?.data || []
  })

  const isLoading = currentLoading || previousLoading

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const renderStatCard = (
    title: string,
    value: string,
    icon: React.ReactNode,
    change?: number,
    color: string = "blue"
  ) => (
    <Card padding="lg" radius="md" withBorder>
      <Group justify="space-between">
        <div>
          <Text c="dimmed" size="sm" fw={500}>
            {title}
          </Text>
          <Text fw={700} size="xl">
            {value}
          </Text>
          {change !== undefined && (
            <Group gap={4} mt={4}>
              {change >= 0 ? (
                <IconTrendingUp size={16} color="green" />
              ) : (
                <IconTrendingDown size={16} color="red" />
              )}
              <Text size="sm" c={change >= 0 ? "green" : "red"} fw={500}>
                {Math.abs(change).toFixed(1)}%
              </Text>
            </Group>
          )}
        </div>
        <ThemeIcon color={color} size={60} radius="md">
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  )

  const renderProgress = (title: string, current: number, target: number) => {
    const percentage = target > 0 ? (current / target) * 100 : 0
    return (
      <Card padding="lg" radius="md" withBorder>
        <Stack gap="sm">
          <Group justify="space-between">
            <Text fw={500}>{title}</Text>
            <Badge
              color={
                percentage >= 100
                  ? "green"
                  : percentage >= 75
                    ? "yellow"
                    : "red"
              }
            >
              {percentage.toFixed(1)}%
            </Badge>
          </Group>
          <Progress value={Math.min(percentage, 100)} size="lg" radius="xl" />
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {fmtCurrency(current)} / {fmtCurrency(target)}
            </Text>
            <Text size="sm" fw={500}>
              Còn lại: {fmtCurrency(Math.max(0, target - current))}
            </Text>
          </Group>
        </Stack>
      </Card>
    )
  }

  return (
    <LivestreamLayout>
      <Box
        mt={40}
        mx="auto"
        px={{ base: 8, md: 0 }}
        w="100%"
        style={{
          background: "rgba(255,255,255,0.97)",
          borderRadius: rem(20),
          boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
          border: "1px solid #ececec"
        }}
      >
        <Flex
          align="flex-start"
          justify="space-between"
          pt={32}
          pb={8}
          px={{ base: 8, md: 28 }}
          direction="row"
          gap={8}
        >
          <Box>
            <Text fw={700} fz="xl" mb={2}>
              Thống kê Livestream
            </Text>
            <Text c="dimmed" fz="sm">
              Theo dõi hiệu suất và số liệu livestream
            </Text>
          </Box>
        </Flex>

        <Divider my={0} />

        <Box px={{ base: 4, md: 28 }} py={20}>
          {/* Filter Controls */}
          <Paper p="md" mb="lg" withBorder radius="md">
            <Group align="flex-end" gap={12}>
              <Select
                label="Hiển thị theo"
                value={viewType}
                onChange={(v) => setViewType((v as ViewType) || "week")}
                data={[
                  { label: "Tuần", value: "week" },
                  { label: "Tháng", value: "month" }
                ]}
                size="sm"
                w={140}
              />

              {viewType === "week" && (
                <Select
                  label="Tuần"
                  value={weekDate ? weekDate.toISOString() : ""}
                  onChange={(v) => setWeekDate(v ? new Date(v) : null)}
                  data={weeks}
                  size="sm"
                  w={220}
                />
              )}

              {viewType === "month" && (
                <Select
                  label="Tháng"
                  value={monthValue}
                  onChange={(v) => setMonthValue(v || "")}
                  data={months}
                  size="sm"
                  w={160}
                />
              )}
            </Group>
          </Paper>

          {/* Stats Content */}
          {isLoading ? (
            <Flex justify="center" align="center" h={400}>
              <Loader />
            </Flex>
          ) : (
            <Stack gap="lg">
              {/* Main Stats Cards */}
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {renderStatCard(
                  "Tổng doanh thu",
                  fmtCurrency(currentStats?.totalIncome || 0),
                  <IconCoin size={28} />,
                  calculateChange(
                    currentStats?.totalIncome || 0,
                    previousStats?.totalIncome || 0
                  ),
                  "green"
                )}

                {renderStatCard(
                  "Tổng đơn hàng",
                  (currentStats?.totalOrders || 0).toLocaleString(),
                  <IconChartBar size={28} />,
                  calculateChange(
                    currentStats?.totalOrders || 0,
                    previousStats?.totalOrders || 0
                  ),
                  "blue"
                )}

                {renderStatCard(
                  "Tổng chi phí",
                  fmtCurrency(currentStats?.totalExpenses || 0),
                  <IconTarget size={28} />,
                  calculateChange(
                    currentStats?.totalExpenses || 0,
                    previousStats?.totalExpenses || 0
                  ),
                  "red"
                )}
              </SimpleGrid>

              {/* Progress Cards */}
              {currentStats?.goalProgress && (
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                  {renderProgress(
                    "Tiến độ mục tiêu doanh thu",
                    currentStats.totalIncome || 0,
                    currentStats.goalProgress.revenueTarget || 0
                  )}

                  {renderProgress(
                    "Tiến độ mục tiêu đơn hàng",
                    currentStats.totalOrders || 0,
                    currentStats.goalProgress.ordersTarget || 0
                  )}
                </SimpleGrid>
              )}

              {/* Income by Host */}
              <Card padding="lg" radius="md" withBorder>
                <Text fw={600} size="lg" mb="md">
                  Doanh thu theo Host
                </Text>

                {currentStats?.incomeByHost &&
                currentStats.incomeByHost.length > 0 ? (
                  <>
                    <Box style={{ overflowX: "auto" }}>
                      <Table striped highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>STT</Table.Th>
                            <Table.Th>Tên Host</Table.Th>
                            <Table.Th ta="right">Doanh thu</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {currentStats.incomeByHost.map(
                            (host: any, index: number) => {
                              // Find employee info by hostId
                              const employee = employeesData?.find(
                                (emp) => emp._id === host.hostId
                              )

                              return (
                                <Table.Tr key={host.hostId}>
                                  <Table.Td>
                                    <Text fw={500}>{index + 1}</Text>
                                  </Table.Td>
                                  <Table.Td>
                                    <Stack gap={2}>
                                      <Text fw={500} size="sm">
                                        {employee?.name || "Không xác định"}
                                      </Text>
                                    </Stack>
                                  </Table.Td>
                                  <Table.Td ta="right">
                                    <Text
                                      fw={700}
                                      c={host.income > 0 ? "green.7" : "gray.6"}
                                      size="sm"
                                    >
                                      {fmtCurrency(host.income)}
                                    </Text>
                                  </Table.Td>
                                </Table.Tr>
                              )
                            }
                          )}
                        </Table.Tbody>
                      </Table>
                    </Box>

                    {/* Summary */}
                    <Paper mt="md" p="md" bg="gray.0" radius="md">
                      <Group justify="space-between">
                        <Text fw={500} size="sm">
                          Tổng cộng ({currentStats.incomeByHost.length} host)
                        </Text>
                        <Text fw={700} size="lg" c="green.7">
                          {fmtCurrency(currentStats.totalIncome || 0)}
                        </Text>
                      </Group>
                    </Paper>
                  </>
                ) : (
                  <Paper p="xl" radius="md" bg="gray.0">
                    <Stack align="center" gap="sm">
                      <IconUsers size={48} color="gray" />
                      <Text size="sm" c="dimmed" ta="center">
                        Chưa có dữ liệu doanh thu theo host trong khoảng thời
                        gian này
                      </Text>
                    </Stack>
                  </Paper>
                )}
              </Card>

              {/* Period Info */}
              <Paper p="md" withBorder radius="md" bg="gray.0">
                <Group justify="center">
                  <Text size="sm" c="dimmed">
                    <strong>Kỳ hiện tại:</strong>{" "}
                    {periods?.current &&
                      format(periods.current.start, "dd/MM/yyyy")}{" "}
                    -{" "}
                    {periods?.current &&
                      format(periods.current.end, "dd/MM/yyyy")}
                  </Text>
                  <Text size="sm" c="dimmed">
                    <strong>So sánh với:</strong>{" "}
                    {periods?.previous &&
                      format(periods.previous.start, "dd/MM/yyyy")}{" "}
                    -{" "}
                    {periods?.previous &&
                      format(periods.previous.end, "dd/MM/yyyy")}
                  </Text>
                </Group>
              </Paper>
            </Stack>
          )}
        </Box>
      </Box>
    </LivestreamLayout>
  )
}
