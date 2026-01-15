import { createFileRoute } from "@tanstack/react-router"
import {
  Box,
  rem,
  Text,
  Group,
  Button,
  Alert,
  Flex,
  Divider,
  Title,
  Switch,
  Select
} from "@mantine/core"
import { DatePickerInput, MonthPickerInput } from "@mantine/dates"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import {
  IconAlertCircle,
  IconRefresh,
  IconChartBar,
  IconTrendingUp,
  IconReportAnalytics
} from "@tabler/icons-react"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { useSalesDashboard } from "../../../hooks/useSalesDashboard"
import { RevenueKPICards } from "../../../components/sales/dashboard/RevenueKPICards"
import { ChannelMetricsChart } from "../../../components/sales/dashboard/ChannelMetricsChart"
import { TopProductsChart } from "../../../components/sales/dashboard/TopProductsChart"
import { UserMetricsChart } from "../../../components/sales/dashboard/UserMetricsChart"
import { RevenueTables } from "../../../components/sales/dashboard/RevenueTables"
import { MonthlyMetrics } from "../../../components/sales/dashboard/MonthlyMetrics"
import { modals } from "@mantine/modals"
import { CreateSalesDailyReportModal } from "../../../components/sales/dashboard/CreateSalesDailyReportModal"
import { useSalesChannels } from "../../../hooks/useSalesChannels"

export const Route = createFileRoute("/sales/dashboard/")({
  component: RouteComponent
})

function RouteComponent() {
  const { getSalesRevenue, getMonthlyMetrics, getMonthlyTopCustomers } =
    useSalesDashboard()
  const { searchSalesChannels } = useSalesChannels()

  // Date range for revenue stats
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(new Date())

  const [channel, setChannel] = useState<string>()
  const [monthlyMetricsChannel, setMonthlyMetricsChannel] = useState<string>()

  // Month for monthly metrics
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date())

  const [isRange, setIsRange] = useState(false)

  // Queries
  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
    refetch: refetchRevenue
  } = useQuery({
    queryKey: ["salesRevenue", startDate, endDate, isRange, channel],
    queryFn: () =>
      getSalesRevenue({
        startDate: startDate || startOfMonth(new Date()),
        endDate: endDate || endOfMonth(new Date()),
        channel
      }),
    enabled: !!startDate && !!endDate
  })

  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ["monthlyMetrics", selectedMonth, monthlyMetricsChannel],
    queryFn: () =>
      getMonthlyMetrics({
        month: (selectedMonth || new Date()).getMonth() + 1,
        year: (selectedMonth || new Date()).getFullYear(),
        channel: monthlyMetricsChannel
      }),
    enabled: !!selectedMonth
  })

  const {
    data: topCustomersData,
    isLoading: topCustomersLoading,
    refetch: refetchTopCustomers
  } = useQuery({
    queryKey: ["monthlyTopCustomers", selectedMonth, monthlyMetricsChannel],
    queryFn: () =>
      getMonthlyTopCustomers({
        month: (selectedMonth || new Date()).getMonth() + 1,
        year: (selectedMonth || new Date()).getFullYear(),
        page: 1,
        limit: 999,
        channel: monthlyMetricsChannel
      }),
    enabled: !!selectedMonth
  })

  const { data: channelsData } = useQuery({
    queryKey: ["salesChannels", "all"],
    queryFn: () => searchSalesChannels({ page: 1, limit: 999 }),
    select: (data) => {
      return data.data.data.map((channel) => ({
        value: channel._id,
        label: channel.channelName
      }))
    }
  })

  const handleResetRevenue = () => {
    setStartDate(new Date())
    setEndDate(new Date())
    refetchRevenue()
  }

  const handleResetMetrics = () => {
    setSelectedMonth(new Date())
    setMonthlyMetricsChannel(undefined)
    refetchMetrics()
    refetchTopCustomers()
  }

  // Processed data
  const revenue = revenueData?.data
  const metrics = metricsData?.data
  const topCustomers = topCustomersData?.data

  const createSalesDailyReport = () => {
    modals.open({
      id: "create-sales-daily-report",
      title: <b>Tạo báo cáo hàng ngày</b>,
      children: <CreateSalesDailyReportModal />,
      size: 960
    })
  }

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
            borderRadius: rem(20),
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid #e9ecef"
          }}
        >
          <Group justify="space-between">
            <Box>
              <Text fw={700} fz="xl" mb={4}>
                Dashboard Doanh Số
              </Text>
              <Text c="dimmed" fz="sm">
                Phân tích và theo dõi hiệu suất bán hàng
              </Text>
            </Box>
            <Button
              color="yellow"
              leftSection={<IconReportAnalytics size={16} />}
              onClick={() => createSalesDailyReport()}
            >
              Tạo báo cáo hàng ngày
            </Button>
          </Group>
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
                <Switch
                  label="Xem theo khoảng ngày"
                  checked={isRange}
                  onChange={(e) => setIsRange(e.currentTarget.checked)}
                />
                {isRange ? (
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
                ) : (
                  <DatePickerInput
                    placeholder="Chọn ngày"
                    value={startDate}
                    onChange={(value) => {
                      setStartDate(value)
                      setEndDate(value)
                    }}
                    valueFormat="DD/MM/YYYY"
                    style={{ width: 180 }}
                    clearable
                  />
                )}
                <Select
                  data={channelsData || []}
                  value={channel}
                  onChange={(e) => setChannel(e ?? undefined)}
                  placeholder="Tất cả kênh"
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
            <RevenueKPICards
              isLoading={revenueLoading}
              totalRevenue={revenue?.totalRevenue}
              totalOrders={revenue?.totalOrders}
              totalQuantity={revenue?.totalQuantity}
              totalTax={revenue?.totalTax}
              totalShippingCost={revenue?.totalShippingCost}
              revenueFromNewCustomers={revenue?.revenueFromNewCustomers}
              revenueFromReturningCustomers={
                revenue?.revenueFromReturningCustomers
              }
            />

            {/* Revenue Charts */}
            <ChannelMetricsChart
              isLoading={revenueLoading}
              data={revenue?.revenueByChannel}
            />

            <Box mt="md">
              <TopProductsChart
                isLoading={revenueLoading}
                topItemsByRevenue={revenue?.topItemsByRevenue}
                topItemsByQuantity={revenue?.topItemsByQuantity}
                otherItemsRevenue={revenue?.otherItemsRevenue}
              />
            </Box>

            <Box mt="md">
              <UserMetricsChart
                isLoading={revenueLoading}
                data={revenue?.revenueByUser}
              />
            </Box>

            {/* Revenue Tables */}
            <Box mt="xl">
              <RevenueTables
                isLoading={revenueLoading}
                items={revenue?.topItemsByRevenue}
                channels={revenue?.revenueByChannel}
                users={revenue?.revenueByUser}
              />
            </Box>
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
                <Select
                  data={channelsData || []}
                  value={monthlyMetricsChannel}
                  onChange={(e) => setMonthlyMetricsChannel(e ?? undefined)}
                  placeholder="Tất cả kênh"
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

            {/* Monthly Metrics */}
            <MonthlyMetrics
              isLoading={metricsLoading}
              data={metrics}
              topCustomersData={topCustomers}
              topCustomersLoading={topCustomersLoading}
            />
          </Box>
        </Box>
      </Box>
    </SalesLayout>
  )
}
