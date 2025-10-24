import { createFileRoute } from "@tanstack/react-router"
import {
  Box,
  rem,
  Text,
  Grid,
  Card,
  Group,
  Button,
  Alert,
  Skeleton,
  ScrollArea,
  Table,
  TextInput,
  RingProgress,
  Flex,
  Badge,
  Stack,
  ThemeIcon,
  Tooltip,
  Divider,
  Paper,
  Title
} from "@mantine/core"
import { DatePickerInput, MonthPickerInput } from "@mantine/dates"
import { useQuery } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import {
  IconCash,
  IconShoppingCart,
  IconUsers,
  IconUserPlus,
  IconUserCheck,
  IconTrendingUp,
  IconCalendarTime,
  IconPercentage,
  IconAlertCircle,
  IconRefresh,
  IconSearch,
  IconChartBar,
  IconChartPie
} from "@tabler/icons-react"
import { PieChart, BarChart } from "@mantine/charts"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { useSalesDashboard } from "../../../hooks/useSalesDashboard"

export const Route = createFileRoute("/sales/dashboard/")({
  component: RouteComponent
})

// Custom Tooltip Component for BarChart
interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

const CustomBarTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        px="md"
        py="sm"
        withBorder
        shadow="md"
        radius="md"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          border: "1px solid #e9ecef"
        }}
      >
        <Text size="sm" fw={600} mb={4}>
          {label}
        </Text>
        {payload.map((entry: any, index: number) => (
          <Group key={index} gap="xs">
            <Box
              w={12}
              h={12}
              style={{
                backgroundColor: entry.color,
                borderRadius: 2
              }}
            />
            <Text size="sm" c="dimmed">
              {entry.name === "revenue" ? "Doanh thu" : entry.name}:
            </Text>
            <Text size="sm" fw={600}>
              {typeof entry.value === "number"
                ? `${entry.value.toLocaleString("vi-VN")}đ`
                : entry.value}
            </Text>
          </Group>
        ))}
      </Paper>
    )
  }
  return null
}

function RouteComponent() {
  const { getSalesRevenue, getMonthlyMetrics } = useSalesDashboard()

  // Date range for revenue stats
  const [startDate, setStartDate] = useState<Date | null>(
    startOfMonth(new Date())
  )
  const [endDate, setEndDate] = useState<Date | null>(endOfMonth(new Date()))

  // Month for monthly metrics
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date())

  // Table filters
  const [itemsFilter, setItemsFilter] = useState("")
  const [channelFilter, setChannelFilter] = useState("")
  const [userFilter, setUserFilter] = useState("")

  // Queries
  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
    refetch: refetchRevenue
  } = useQuery({
    queryKey: ["salesRevenue", startDate, endDate],
    queryFn: () =>
      getSalesRevenue({
        startDate: startDate || startOfMonth(new Date()),
        endDate: endDate || endOfMonth(new Date())
      }),
    enabled: !!startDate && !!endDate
  })

  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ["monthlyMetrics", selectedMonth],
    queryFn: () =>
      getMonthlyMetrics({
        month: (selectedMonth || new Date()).getMonth() + 1,
        year: (selectedMonth || new Date()).getFullYear()
      }),
    enabled: !!selectedMonth
  })

  const handleResetRevenue = () => {
    setStartDate(startOfMonth(new Date()))
    setEndDate(endOfMonth(new Date()))
    refetchRevenue()
  }

  const handleResetMetrics = () => {
    setSelectedMonth(new Date())
    refetchMetrics()
  }

  // Processed data
  const revenue = revenueData?.data
  const metrics = metricsData?.data

  // Pie chart data
  const revenueDistribution = useMemo(() => {
    if (!revenue) return []
    return [
      {
        name: "Khách mới",
        value: revenue.revenueFromNewCustomers,
        color: "blue.6"
      },
      {
        name: "Khách quay lại",
        value: revenue.revenueFromReturningCustomers,
        color: "green.6"
      }
    ]
  }, [revenue])

  // Filtered tables
  const filteredItems = useMemo(() => {
    if (!revenue?.itemsSold) return []
    return revenue.itemsSold
      .filter(
        (item) =>
          item.code.toLowerCase().includes(itemsFilter.toLowerCase()) ||
          item.name.toLowerCase().includes(itemsFilter.toLowerCase())
      )
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }, [revenue?.itemsSold, itemsFilter])

  const filteredChannels = useMemo(() => {
    if (!revenue?.revenueByChannel) return []
    return revenue.revenueByChannel.filter((ch) =>
      ch.channelName.toLowerCase().includes(channelFilter.toLowerCase())
    )
  }, [revenue?.revenueByChannel, channelFilter])

  const filteredUsers = useMemo(() => {
    if (!revenue?.revenueByUser) return []
    return revenue.revenueByUser.filter((u) =>
      u.userName.toLowerCase().includes(userFilter.toLowerCase())
    )
  }, [revenue?.revenueByUser, userFilter])

  // Stage transition percentages
  const stagePercentages = useMemo(() => {
    if (!metrics?.stageTransitions) return null
    const total = metrics.stageTransitions.lead || 1
    return {
      lead: 100,
      contacted: (metrics.stageTransitions.contacted / total) * 100,
      customer: (metrics.stageTransitions.customer / total) * 100,
      closed: (metrics.stageTransitions.closed / total) * 100
    }
  }, [metrics?.stageTransitions])

  return (
    <SalesLayout>
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
        {/* Header */}
        <Box
          pt={32}
          pb={16}
          px={{ base: 8, md: 28 }}
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid #e9ecef"
          }}
        >
          <Text fw={700} fz="xl" mb={4}>
            Dashboard Doanh Số
          </Text>
          <Text c="dimmed" fz="sm">
            Phân tích và theo dõi hiệu suất bán hàng
          </Text>
        </Box>

        {/* Content */}
        <Box px={{ base: 8, md: 28 }} py={20}>
          {/* ============= REVENUE SECTION ============= */}
          <Box mb="xl">
            <Flex
              justify="space-between"
              align="flex-start"
              wrap="wrap"
              gap="md"
              mb="lg"
            >
              <Box>
                <Group gap="xs" mb={4}>
                  <IconChartBar size={24} color="var(--mantine-color-blue-6)" />
                  <Title order={3}>Báo cáo doanh thu</Title>
                </Group>
                <Text c="dimmed" fz="sm">
                  {startDate && endDate
                    ? `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`
                    : "Chọn khoảng thời gian"}
                </Text>
              </Box>

              <Group gap="sm">
                <DatePickerInput
                  type="range"
                  placeholder="Chọn khoảng ngày"
                  value={[startDate, endDate]}
                  onChange={([start, end]) => {
                    setStartDate(start)
                    setEndDate(end)
                  }}
                  valueFormat="DD/MM/YYYY"
                  style={{ width: 280 }}
                  clearable
                />
                <Button onClick={() => refetchRevenue()} variant="filled">
                  Áp dụng
                </Button>
                <Button onClick={handleResetRevenue} variant="light">
                  Reset
                </Button>
              </Group>
            </Flex>

            {/* Revenue Error */}
            {revenueError && (
              <Alert
                color="red"
                title="Có lỗi xảy ra"
                icon={<IconAlertCircle />}
                mb="lg"
              >
                <Group>
                  <Text size="sm">
                    {(revenueError as any)?.message || "Không thể tải dữ liệu"}
                  </Text>
                  <Button
                    size="xs"
                    leftSection={<IconRefresh size={14} />}
                    onClick={() => refetchRevenue()}
                  >
                    Thử lại
                  </Button>
                </Group>
              </Alert>
            )}

            {/* Revenue KPI Cards */}
            <Grid gutter="md" mb="xl">
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  {revenueLoading ? (
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
                        {revenue?.totalRevenue.toLocaleString("vi-VN")}đ
                      </Text>
                    </>
                  )}
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  {revenueLoading ? (
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
                        {revenue?.totalOrders}
                      </Text>
                    </>
                  )}
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  {revenueLoading ? (
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
                        {revenue?.revenueFromNewCustomers.toLocaleString(
                          "vi-VN"
                        )}
                        đ
                      </Text>
                    </>
                  )}
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  {revenueLoading ? (
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
                        {revenue?.revenueFromReturningCustomers.toLocaleString(
                          "vi-VN"
                        )}
                        đ
                      </Text>
                    </>
                  )}
                </Card>
              </Grid.Col>
            </Grid>

            {/* Revenue Charts */}
            <Grid gutter="md" mb="xl">
              {/* Pie Chart */}
              <Grid.Col span={{ base: 12, md: 5 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group mb="md">
                    <IconChartPie size={20} />
                    <Text fw={600}>Phân bổ doanh thu</Text>
                  </Group>
                  {revenueLoading ? (
                    <Skeleton height={300} />
                  ) : revenue && revenueDistribution.length > 0 ? (
                    <PieChart
                      data={revenueDistribution}
                      withLabels
                      withTooltip
                      size={250}
                      tooltipDataSource="segment"
                      valueFormatter={(value: number) =>
                        `${value.toLocaleString("vi-VN")}đ`
                      }
                    />
                  ) : (
                    <Alert color="yellow" icon={<IconAlertCircle />}>
                      Không có dữ liệu
                    </Alert>
                  )}
                </Card>
              </Grid.Col>

              {/* Bar Chart - Revenue by Channel */}
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group mb="md">
                    <IconChartBar size={20} />
                    <Text fw={600}>Doanh thu theo kênh</Text>
                  </Group>
                  {revenueLoading ? (
                    <Skeleton height={300} />
                  ) : revenue && revenue.revenueByChannel.length > 0 ? (
                    <Box
                      style={{
                        "& .recharts-bar-rectangle:hover": {
                          opacity: 0.8
                        },
                        "& .recharts-active-bar": {
                          filter: "none"
                        }
                      }}
                    >
                      <BarChart
                        h={300}
                        data={revenue.revenueByChannel.map((ch) => ({
                          channelName: ch.channelName,
                          revenue: ch.revenue
                        }))}
                        dataKey="channelName"
                        series={[
                          {
                            name: "revenue",
                            label: "Doanh thu",
                            color: "blue.6"
                          }
                        ]}
                        tickLine="y"
                        withLegend={false}
                        withYAxis
                        yAxisProps={{ width: 100 }}
                        tooltipProps={{
                          content: (props: any) => (
                            <CustomBarTooltip {...props} />
                          ),
                          cursor: {
                            fill: "transparent"
                          }
                        }}
                      />
                    </Box>
                  ) : (
                    <Alert color="yellow" icon={<IconAlertCircle />}>
                      Không có dữ liệu
                    </Alert>
                  )}
                </Card>
              </Grid.Col>

              {/* Bar Chart - Top Products */}
              <Grid.Col span={{ base: 12 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group mb="md">
                    <IconChartBar size={20} />
                    <Text fw={600}>Top 10 sản phẩm bán chạy</Text>
                  </Group>
                  {revenueLoading ? (
                    <Skeleton height={400} />
                  ) : revenue && filteredItems.length > 0 ? (
                    <Box
                      style={{
                        "& .recharts-bar-rectangle:hover": {
                          opacity: 0.8
                        },
                        "& .recharts-active-bar": {
                          filter: "none"
                        }
                      }}
                    >
                      <BarChart
                        h={400}
                        data={filteredItems.map((item) => ({
                          name: `${item.code} - ${item.name}`,
                          revenue: item.revenue
                        }))}
                        dataKey="name"
                        series={[
                          {
                            name: "revenue",
                            label: "Doanh thu",
                            color: "violet.6"
                          }
                        ]}
                        orientation="horizontal"
                        tickLine="x"
                        withLegend={false}
                        withYAxis
                        yAxisProps={{ width: 100 }}
                        tooltipProps={{
                          content: (props: any) => (
                            <CustomBarTooltip {...props} />
                          ),
                          cursor: {
                            fill: "transparent"
                          }
                        }}
                      />
                    </Box>
                  ) : (
                    <Alert color="yellow" icon={<IconAlertCircle />}>
                      Không có dữ liệu
                    </Alert>
                  )}
                </Card>
              </Grid.Col>

              {/* Bar Chart - Revenue by User */}
              <Grid.Col span={{ base: 12 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group mb="md">
                    <IconChartBar size={20} />
                    <Text fw={600}>Doanh thu theo nhân viên</Text>
                  </Group>
                  {revenueLoading ? (
                    <Skeleton height={300} />
                  ) : revenue && revenue.revenueByUser.length > 0 ? (
                    <Box
                      style={{
                        "& .recharts-bar-rectangle:hover": {
                          opacity: 0.8
                        },
                        "& .recharts-active-bar": {
                          filter: "none"
                        }
                      }}
                    >
                      <BarChart
                        h={300}
                        data={revenue.revenueByUser.map((u) => ({
                          userName: u.userName,
                          revenue: u.revenue
                        }))}
                        dataKey="userName"
                        series={[
                          {
                            name: "revenue",
                            label: "Doanh thu",
                            color: "teal.6"
                          }
                        ]}
                        orientation="horizontal"
                        tickLine="x"
                        withLegend={false}
                        withYAxis
                        yAxisProps={{ width: 100 }}
                        tooltipProps={{
                          content: (props: any) => (
                            <CustomBarTooltip {...props} />
                          ),
                          cursor: {
                            fill: "transparent"
                          }
                        }}
                      />
                    </Box>
                  ) : (
                    <Alert color="yellow" icon={<IconAlertCircle />}>
                      Không có dữ liệu
                    </Alert>
                  )}
                </Card>
              </Grid.Col>
            </Grid>

            {/* Revenue Tables */}
            <Grid gutter="md">
              {/* Items Table */}
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group mb="md" justify="space-between">
                    <Text fw={600}>Sản phẩm bán chạy</Text>
                    <TextInput
                      placeholder="Tìm kiếm..."
                      size="xs"
                      leftSection={<IconSearch size={14} />}
                      value={itemsFilter}
                      onChange={(e) => setItemsFilter(e.currentTarget.value)}
                      style={{ width: 200 }}
                    />
                  </Group>
                  <ScrollArea h={400}>
                    {revenueLoading ? (
                      <Skeleton height={400} />
                    ) : filteredItems.length > 0 ? (
                      <Table striped highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Mã SP</Table.Th>
                            <Table.Th>Tên</Table.Th>
                            <Table.Th ta="right">SL</Table.Th>
                            <Table.Th ta="right">DT</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {filteredItems.map((item, idx) => (
                            <Table.Tr key={idx}>
                              <Table.Td>
                                <Text fw={500} size="sm">
                                  {item.code}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text size="sm" lineClamp={1}>
                                  {item.name}
                                </Text>
                              </Table.Td>
                              <Table.Td ta="right">
                                <Badge size="sm">{item.quantity}</Badge>
                              </Table.Td>
                              <Table.Td ta="right">
                                <Text size="sm" fw={500}>
                                  {item.revenue.toLocaleString("vi-VN")}đ
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    ) : (
                      <Alert color="yellow" icon={<IconAlertCircle />}>
                        Không có dữ liệu
                      </Alert>
                    )}
                  </ScrollArea>
                </Card>
              </Grid.Col>

              {/* Channels Table */}
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group mb="md" justify="space-between">
                    <Text fw={600}>Theo kênh</Text>
                    <TextInput
                      placeholder="Tìm kiếm..."
                      size="xs"
                      leftSection={<IconSearch size={14} />}
                      value={channelFilter}
                      onChange={(e) => setChannelFilter(e.currentTarget.value)}
                      style={{ width: 200 }}
                    />
                  </Group>
                  <ScrollArea h={400}>
                    {revenueLoading ? (
                      <Skeleton height={400} />
                    ) : filteredChannels.length > 0 ? (
                      <Table striped highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Kênh</Table.Th>
                            <Table.Th ta="right">Đơn</Table.Th>
                            <Table.Th ta="right">DT</Table.Th>
                            <Table.Th ta="right">ARPU</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {filteredChannels.map((ch, idx) => (
                            <Table.Tr key={idx}>
                              <Table.Td>
                                <Text fw={500} size="sm">
                                  {ch.channelName}
                                </Text>
                              </Table.Td>
                              <Table.Td ta="right">
                                <Badge size="sm">{ch.orderCount}</Badge>
                              </Table.Td>
                              <Table.Td ta="right">
                                <Text size="sm" fw={500}>
                                  {ch.revenue.toLocaleString("vi-VN")}đ
                                </Text>
                              </Table.Td>
                              <Table.Td ta="right">
                                <Text size="sm" c="dimmed">
                                  {ch.orderCount > 0
                                    ? (
                                        ch.revenue / ch.orderCount
                                      ).toLocaleString("vi-VN")
                                    : "0"}
                                  đ
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    ) : (
                      <Alert color="yellow" icon={<IconAlertCircle />}>
                        Không có dữ liệu
                      </Alert>
                    )}
                  </ScrollArea>
                </Card>
              </Grid.Col>

              {/* Users Table */}
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group mb="md" justify="space-between">
                    <Text fw={600}>Theo nhân viên</Text>
                    <TextInput
                      placeholder="Tìm kiếm..."
                      size="xs"
                      leftSection={<IconSearch size={14} />}
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.currentTarget.value)}
                      style={{ width: 200 }}
                    />
                  </Group>
                  <ScrollArea h={400}>
                    {revenueLoading ? (
                      <Skeleton height={400} />
                    ) : filteredUsers.length > 0 ? (
                      <Table striped highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Nhân viên</Table.Th>
                            <Table.Th ta="right">Đơn</Table.Th>
                            <Table.Th ta="right">DT</Table.Th>
                            <Table.Th ta="right">ARPU</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {filteredUsers.map((u, idx) => (
                            <Table.Tr key={idx}>
                              <Table.Td>
                                <Text fw={500} size="sm">
                                  {u.userName}
                                </Text>
                              </Table.Td>
                              <Table.Td ta="right">
                                <Badge size="sm">{u.orderCount}</Badge>
                              </Table.Td>
                              <Table.Td ta="right">
                                <Text size="sm" fw={500}>
                                  {u.revenue.toLocaleString("vi-VN")}đ
                                </Text>
                              </Table.Td>
                              <Table.Td ta="right">
                                <Text size="sm" c="dimmed">
                                  {u.orderCount > 0
                                    ? (u.revenue / u.orderCount).toLocaleString(
                                        "vi-VN"
                                      )
                                    : "0"}
                                  đ
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    ) : (
                      <Alert color="yellow" icon={<IconAlertCircle />}>
                        Không có dữ liệu
                      </Alert>
                    )}
                  </ScrollArea>
                </Card>
              </Grid.Col>
            </Grid>
          </Box>

          <Divider my="xl" size="sm" />

          {/* ============= MONTHLY METRICS SECTION ============= */}
          <Box>
            <Flex
              justify="space-between"
              align="flex-start"
              wrap="wrap"
              gap="md"
              mb="lg"
            >
              <Box>
                <Group gap="xs" mb={4}>
                  <IconTrendingUp
                    size={24}
                    color="var(--mantine-color-green-6)"
                  />
                  <Title order={3}>Chỉ số hiệu suất tháng</Title>
                </Group>
                <Text c="dimmed" fz="sm">
                  {selectedMonth
                    ? format(selectedMonth, "MM/yyyy")
                    : "Chọn tháng"}
                </Text>
              </Box>

              <Group gap="sm">
                <MonthPickerInput
                  placeholder="Chọn tháng"
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  valueFormat="MM/YYYY"
                  style={{ width: 180 }}
                  clearable
                />
                <Button onClick={() => refetchMetrics()} variant="filled">
                  Áp dụng
                </Button>
                <Button onClick={handleResetMetrics} variant="light">
                  Reset
                </Button>
              </Group>
            </Flex>

            {/* Metrics Error */}
            {metricsError && (
              <Alert
                color="red"
                title="Có lỗi xảy ra"
                icon={<IconAlertCircle />}
                mb="lg"
              >
                <Group>
                  <Text size="sm">
                    {(metricsError as any)?.message || "Không thể tải dữ liệu"}
                  </Text>
                  <Button
                    size="xs"
                    leftSection={<IconRefresh size={14} />}
                    onClick={() => refetchMetrics()}
                  >
                    Thử lại
                  </Button>
                </Group>
              </Alert>
            )}

            {/* Metrics KPI Cards */}
            <Grid gutter="md" mb="xl">
              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  {metricsLoading ? (
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
                          {metrics?.cac.toLocaleString("vi-VN")}đ
                        </Text>
                      </Box>
                    </Tooltip>
                  )}
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  {metricsLoading ? (
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
                          {metrics?.crr.toFixed(1)}%
                        </Text>
                      </Box>
                    </Tooltip>
                  )}
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  {metricsLoading ? (
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
                          {metrics?.conversionRate.toFixed(1)}%
                        </Text>
                      </Box>
                    </Tooltip>
                  )}
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  {metricsLoading ? (
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
                          {metrics?.avgDealSize.toLocaleString("vi-VN")}đ
                        </Text>
                      </Box>
                    </Tooltip>
                  )}
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  {metricsLoading ? (
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
                          {metrics?.salesCycleLength.toFixed(0)} ngày
                        </Text>
                      </Box>
                    </Tooltip>
                  )}
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  {metricsLoading ? (
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
                          {metrics?.churnRate.toFixed(1)}%
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
              {metricsLoading ? (
                <Skeleton height={200} />
              ) : metrics && stagePercentages ? (
                <Grid gutter="xl">
                  <Grid.Col span={3}>
                    <Stack align="center" gap="xs">
                      <RingProgress
                        size={140}
                        thickness={14}
                        sections={[{ value: 100, color: "blue" }]}
                        label={
                          <Text ta="center" fw={700} size="xl">
                            {metrics.stageTransitions.lead}
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
                            {metrics.stageTransitions.contacted}
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
                            {metrics.stageTransitions.customer}
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
                        sections={[
                          { value: stagePercentages.closed, color: "gray" }
                        ]}
                        label={
                          <Text ta="center" fw={700} size="xl">
                            {metrics.stageTransitions.closed}
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
          </Box>
        </Box>
      </Box>
    </SalesLayout>
  )
}
