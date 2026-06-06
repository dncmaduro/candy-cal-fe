import { createFileRoute } from "@tanstack/react-router"
import {
  Box,
  rem,
  Text,
  Group,
  Button,
  Alert,
  Flex,
  Switch,
  Select,
  Tabs
} from "@mantine/core"
import { DatePickerInput, MonthPickerInput } from "@mantine/dates"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { IconAlertCircle, IconRefresh, IconReportAnalytics } from "@tabler/icons-react"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { useSalesDashboard } from "../../../hooks/useSalesDashboard"
import { RevenueKPICards } from "../../../components/sales/dashboard/RevenueKPICards"
import { ChannelMetricsChart } from "../../../components/sales/dashboard/ChannelMetricsChart"
import { TopProductsChart } from "../../../components/sales/dashboard/TopProductsChart"
import { UserMetricsChart } from "../../../components/sales/dashboard/UserMetricsChart"
import { RevenueTables } from "../../../components/sales/dashboard/RevenueTables"
import { MonthlyMetrics } from "../../../components/sales/dashboard/MonthlyMetrics"
import { ProvinceSalesAnalytics } from "../../../components/sales/dashboard/ProvinceSalesAnalytics"
import { modals } from "@mantine/modals"
import { CreateSalesDailyReportModal } from "../../../components/sales/dashboard/CreateSalesDailyReportModal"
import { useSalesChannels } from "../../../hooks/useSalesChannels"

export const Route = createFileRoute("/sales/dashboard/")({
  component: RouteComponent
})

function RouteComponent() {
  const {
    getSalesRevenue,
    getProvinceSalesStats,
    getMonthlyMetrics,
    getMonthlyTopCustomers
  } = useSalesDashboard()
  const { searchSalesChannels } = useSalesChannels()

  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(new Date())

  const [channel, setChannel] = useState<string>()
  const [monthlyMetricsChannel, setMonthlyMetricsChannel] = useState<string>()

  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date())

  const [isRange, setIsRange] = useState(false)

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
    data: provinceSalesData,
    isLoading: provinceSalesLoading,
    error: provinceSalesError,
    refetch: refetchProvinceSales
  } = useQuery({
    queryKey: ["provinceSalesStats", startDate, endDate, isRange, channel],
    queryFn: () =>
      getProvinceSalesStats(
        isRange
          ? {
              startDate: startDate || startOfMonth(new Date()),
              endDate: endDate || endOfMonth(new Date()),
              channel
            }
          : {
              date: startDate || new Date(),
              channel
            }
      ),
    enabled: isRange ? !!startDate && !!endDate : !!startDate
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
    setChannel(undefined)
    refetchRevenue()
    refetchProvinceSales()
  }

  const handleApplyRevenue = () => {
    refetchRevenue()
    refetchProvinceSales()
  }

  const handleResetMetrics = () => {
    setSelectedMonth(new Date())
    setMonthlyMetricsChannel(undefined)
    refetchMetrics()
    refetchTopCustomers()
  }

  const handleApplyMetrics = () => {
    refetchMetrics()
    refetchTopCustomers()
  }

  const revenue = revenueData?.data
  const provinceSales = provinceSalesData?.data
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
      <Box mt={28} mb={28} px={{ base: 8, md: 16 }} w="100%" bg="#f8fafc">
        <Box mx="auto" maw={1280}>
          <Flex
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap="md"
            mb="md"
            px={{ base: 6, md: 2 }}
          >
            <Box>
              <Text fw={700} fz={{ base: 26, md: 30 }} lh={1.2} mb={4}>
                Dashboard Doanh Số
              </Text>
              <Text c="dimmed" fz="sm">
                Phân tích và theo dõi hiệu suất bán hàng
              </Text>
            </Box>
            <Button
              color="yellow"
              h={42}
              radius={12}
              px="md"
              leftSection={<IconReportAnalytics size={16} />}
              onClick={() => createSalesDailyReport()}
            >
              Tạo báo cáo hàng ngày
            </Button>
          </Flex>

          <Tabs defaultValue="revenue">
            <Tabs.List mb="md">
              <Tabs.Tab value="revenue">Theo ngày / khoảng ngày</Tabs.Tab>
              <Tabs.Tab value="monthly">Theo tháng</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="revenue">
              {revenueError && (
                <Alert
                  color="red"
                  title="Có lỗi xảy ra"
                  icon={<IconAlertCircle />}
                  mb="md"
                  radius="md"
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

              {provinceSalesError && (
                <Alert
                  color="red"
                  title="Có lỗi xảy ra"
                  icon={<IconAlertCircle />}
                  mb="md"
                  radius="md"
                >
                  <Group>
                    <Text size="sm">
                      {(provinceSalesError as any)?.message || "Không thể tải dữ liệu"}
                    </Text>
                    <Button
                      size="xs"
                      leftSection={<IconRefresh size={14} />}
                      onClick={() => refetchProvinceSales()}
                    >
                      Thử lại
                    </Button>
                  </Group>
                </Alert>
              )}

              <Box mb="md">
                <Text fw={600} fz="md" mb="sm">
                  Tổng quan doanh số
                </Text>
                <Box
                  p={{ base: 14, md: 18 }}
                  mb="md"
                  style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: rem(14),
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)"
                  }}
                >
                  <Box
                    style={{
                      display: "grid",
                      gap: 12,
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
                    }}
                  >
                    <Box>
                      <Text size="sm" fw={500} mb={8}>
                        Chế độ xem
                      </Text>
                      <Box h={40} style={{ display: "flex", alignItems: "center" }}>
                        <Switch
                          label="Xem theo khoảng ngày"
                          checked={isRange}
                          onChange={(e) => setIsRange(e.currentTarget.checked)}
                          styles={{ label: { fontSize: 14, fontWeight: 500 } }}
                        />
                      </Box>
                    </Box>

                    <Box>
                      {isRange ? (
                        <DatePickerInput
                          type="range"
                          label="Khoảng ngày"
                          placeholder="Chọn khoảng ngày"
                          value={[startDate, endDate]}
                          onChange={([start, end]) => {
                            setStartDate(start)
                            setEndDate(end)
                          }}
                          valueFormat="DD/MM/YYYY"
                          clearable
                          h={40}
                        />
                      ) : (
                        <DatePickerInput
                          label="Ngày báo cáo"
                          placeholder="Chọn ngày"
                          value={startDate}
                          onChange={(value) => {
                            setStartDate(value)
                            setEndDate(value)
                          }}
                          valueFormat="DD/MM/YYYY"
                          clearable
                          h={40}
                        />
                      )}
                    </Box>

                    <Box>
                      <Select
                        label="Kênh bán hàng"
                        data={channelsData || []}
                        value={channel}
                        onChange={(e) => setChannel(e ?? undefined)}
                        placeholder="Tất cả kênh"
                        clearable
                      />
                    </Box>

                    <Group align="flex-end" gap={10} wrap="nowrap">
                      <Button h={40} radius={10} onClick={handleApplyRevenue}>
                        Áp dụng
                      </Button>
                      <Button
                        h={40}
                        radius={10}
                        variant="light"
                        onClick={handleResetRevenue}
                      >
                        Reset
                      </Button>
                    </Group>
                  </Box>
                </Box>
                <RevenueKPICards
                  isLoading={revenueLoading}
                  totalRevenue={revenue?.totalRevenue}
                  totalRevenueBeforeDiscount={revenue?.totalRevenueBeforeDiscount}
                  totalOrders={revenue?.totalOrders}
                  totalQuantity={revenue?.totalQuantity}
                  totalTax={revenue?.totalTax}
                  totalShippingCost={revenue?.totalShippingCost}
                  revenueFromNewCustomers={revenue?.revenueFromNewCustomers}
                  revenueFromReturningCustomers={revenue?.revenueFromReturningCustomers}
                />
              </Box>

              <Box mb="md">
                <Text fw={600} fz="md" mb="sm">
                  Doanh số theo tỉnh/thành
                </Text>
                <ProvinceSalesAnalytics
                  isLoading={provinceSalesLoading}
                  data={provinceSales}
                />
              </Box>

              <Box mb="md">
                <Text fw={600} fz="md" mb="sm">
                  Nhóm phân tích nhanh
                </Text>
                <Box
                  style={{
                    display: "grid",
                    gap: 16,
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))"
                  }}
                >
                  <ChannelMetricsChart
                    isLoading={revenueLoading}
                    data={revenue?.revenueByChannel}
                  />
                  <TopProductsChart
                    isLoading={revenueLoading}
                    topItemsByRevenue={revenue?.topItemsByRevenue}
                    topItemsByQuantity={revenue?.topItemsByQuantity}
                    otherItemsRevenue={revenue?.otherItemsRevenue}
                  />
                  <UserMetricsChart
                    isLoading={revenueLoading}
                    data={revenue?.revenueByUser}
                  />
                </Box>
              </Box>

              <Box mb="sm">
                <Text fw={600} fz="md" mb="sm">
                  Nhóm bảng / danh sách chi tiết
                </Text>
                <RevenueTables
                  isLoading={revenueLoading}
                  items={revenue?.topItemsByRevenue}
                  channels={revenue?.revenueByChannel}
                  users={revenue?.revenueByUser}
                />
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="monthly">
              {metricsError && (
                <Alert
                  color="red"
                  title="Có lỗi xảy ra"
                  icon={<IconAlertCircle />}
                  mb="md"
                  radius="md"
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

              <Box mb="md">
                <Text fw={600} fz="md" mb="sm">
                  Hiệu suất tháng {selectedMonth ? format(selectedMonth, "MM/yyyy") : ""}
                </Text>
                <Box
                  p={{ base: 14, md: 18 }}
                  mb="md"
                  style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: rem(14),
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)"
                  }}
                >
                  <Box
                    style={{
                      display: "grid",
                      gap: 12,
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
                    }}
                  >
                    <Box>
                      <MonthPickerInput
                        label="Tháng"
                        placeholder="Chọn tháng"
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        valueFormat="MM/YYYY"
                        clearable
                        h={40}
                      />
                    </Box>

                    <Box>
                      <Select
                        label="Kênh theo tháng"
                        data={channelsData || []}
                        value={monthlyMetricsChannel}
                        onChange={(e) => setMonthlyMetricsChannel(e ?? undefined)}
                        placeholder="Tất cả kênh"
                        clearable
                      />
                    </Box>

                    <Group align="flex-end" gap={10} wrap="nowrap">
                      <Button h={40} radius={10} onClick={handleApplyMetrics}>
                        Áp dụng
                      </Button>
                      <Button
                        h={40}
                        radius={10}
                        variant="light"
                        onClick={handleResetMetrics}
                      >
                        Reset
                      </Button>
                    </Group>
                  </Box>
                </Box>
                <MonthlyMetrics
                  isLoading={metricsLoading}
                  data={metrics}
                  topCustomersData={topCustomers}
                  topCustomersLoading={topCustomersLoading}
                />
              </Box>
            </Tabs.Panel>
          </Tabs>
        </Box>
      </Box>
    </SalesLayout>
  )
}
