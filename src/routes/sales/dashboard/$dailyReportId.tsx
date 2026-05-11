import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  Box,
  Paper,
  Text,
  Group,
  Badge,
  Grid,
  Stack,
  Button,
  LoadingOverlay,
  Tabs,
  Progress,
  rem
} from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  IconArrowLeft,
  IconCalendar,
  IconBuildingStore,
  IconChartBar,
  IconChartPie
} from "@tabler/icons-react"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { useSalesDailyReports } from "../../../hooks/useSalesDailyReports"
import { ReactNode, useMemo } from "react"
import { DailyReportByText } from "../../../components/sales/dashboard/DailyReportByText"
import { PieChart, BarChart } from "@mantine/charts"

export const Route = createFileRoute("/sales/dashboard/$dailyReportId")({
  component: RouteComponent
})

type SectionCardProps = {
  title: string
  icon?: ReactNode
  children: ReactNode
}

const sectionCardStyle = {
  border: "1px solid #E5E7EB",
  borderRadius: rem(14),
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  background: "#fff"
}

const SectionCard = ({ title, icon, children }: SectionCardProps) => (
  <Paper p="md" style={sectionCardStyle}>
    <Group gap="xs" mb="sm">
      {icon}
      <Text fw={600}>{title}</Text>
    </Group>
    {children}
  </Paper>
)

type MetricTileProps = {
  label: string
  value: string
  valueColor?: string
}

const MetricTile = ({ label, value, valueColor }: MetricTileProps) => (
  <Paper withBorder p="sm" radius="md" bg="white" h="100%">
    <Text size="xs" c="dimmed" mb={4}>
      {label}
    </Text>
    <Text fw={700} size="xl" c={valueColor}>
      {value}
    </Text>
  </Paper>
)

function RouteComponent() {
  const { dailyReportId } = Route.useParams()
  const navigate = useNavigate()
  const { getSalesDailyReportDetail, getSalesMonthKpi } = useSalesDailyReports()

  const { data, isLoading } = useQuery({
    queryKey: ["salesDailyReportDetail", dailyReportId],
    queryFn: () => getSalesDailyReportDetail({ id: dailyReportId })
  })

  const report = data?.data

  const { data: kpiData } = useQuery({
    queryKey: ["getSalesMonthKpi", dailyReportId, report?.date, report?.channel?._id],
    queryFn: () => {
      if (!report) return Promise.resolve({ data: { kpi: 0 } })
      return getSalesMonthKpi({
        date: new Date(report.date),
        channelId: report.channel._id
      })
    },
    select: (response) => response.data.kpi ?? 0,
    enabled: !!report
  })

  const goBackToDailyReports = () => {
    if (window.history.length > 1) {
      window.history.back()
      return
    }
    navigate({ to: "/sales/daily-reports" })
  }

  const projectedRevenue =
    (report?.accumulatedRevenue ?? 0) + (report?.revenue ?? 0)

  const dailyNewRevenue =
    (report?.newFunnelRevenue.ads ?? 0) + (report?.newFunnelRevenue.other ?? 0)

  const dailyKpiPercent = useMemo(() => {
    if (!report?.dateKpi) return 0
    return (report.revenue / report.dateKpi) * 100
  }, [report?.dateKpi, report?.revenue])

  const monthlyKpiPercent = useMemo(() => {
    if (!kpiData) return 0
    return (projectedRevenue / kpiData) * 100
  }, [kpiData, projectedRevenue])

  const revenueStructureData = useMemo(
    () => [
      {
        name: "Khách cũ",
        value: report?.returningFunnelRevenue ?? 0,
        color: "blue.6"
      },
      {
        name: "Khách mới",
        value: dailyNewRevenue,
        color: "violet.6"
      }
    ],
    [report?.returningFunnelRevenue, dailyNewRevenue]
  )

  const totalStructureRevenue = useMemo(() => {
    return revenueStructureData.reduce((sum, item) => sum + item.value, 0)
  }, [revenueStructureData])

  const adsVsRevenueData = useMemo(
    () => [
      {
        label: "Báo cáo ngày",
        revenue: report?.revenue ?? 0,
        adsCost: report?.adsCost ?? 0
      }
    ],
    [report?.revenue, report?.adsCost]
  )

  return (
    <SalesLayout>
      <Box
        pos="relative"
        mih={400}
        px={{ base: 8, md: 16 }}
        py="md"
        bg="#f4f7fb"
      >
        <LoadingOverlay
          visible={isLoading}
          zIndex={1000}
          overlayProps={{ radius: "md", blur: 2 }}
        />

        {report && (
          <Stack gap="md" maw={1280} mx="auto">
            <Paper p="md" style={sectionCardStyle}>
              <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
                <Button
                  variant="subtle"
                  leftSection={<IconArrowLeft size={16} aria-hidden="true" />}
                  onClick={goBackToDailyReports}
                  aria-label="Quay lại danh sách báo cáo ngày"
                >
                  Quay lại
                </Button>
                <Badge size="md" variant="outline" color="blue">
                  {format(new Date(report.date), "dd/MM/yyyy")}
                </Badge>
              </Group>

              <Group mt="sm" gap="md" align="center" wrap="wrap">
                <Box
                  w={42}
                  h={42}
                  bg="blue.0"
                  style={{
                    borderRadius: "999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <IconCalendar size={20} color="var(--mantine-color-blue-6)" />
                </Box>
                <Box>
                  <Text size="xl" fw={700}>
                    Báo cáo ngày {format(new Date(report.date), "dd/MM/yyyy")}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Cập nhật lúc: {format(new Date(report.updatedAt), "HH:mm dd/MM/yyyy")}
                  </Text>
                </Box>
              </Group>
            </Paper>

            <Tabs defaultValue="visual">
              <Tabs.List grow>
                <Tabs.Tab value="visual" leftSection={<IconChartBar size={16} />}>
                  Biểu đồ
                </Tabs.Tab>
                <Tabs.Tab value="message" leftSection={<IconChartPie size={16} />}>
                  Tin nhắn báo cáo
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="visual" pt="md">
                <Stack gap="md">
                  <SectionCard title="Thông tin báo cáo" icon={<IconBuildingStore size={18} />}>
                    <Grid gutter="md">
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <MetricTile label="Kênh" value={report.channel.channelName} />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <MetricTile
                          label="Ngày báo cáo"
                          value={format(new Date(report.date), "dd/MM/yyyy")}
                        />
                      </Grid.Col>
                    </Grid>
                  </SectionCard>

                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                      <MetricTile
                        label="Doanh số ngày"
                        value={`${report.revenue.toLocaleString("vi-VN")}đ`}
                        valueColor="blue"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                      <MetricTile
                        label="KPI ngày"
                        value={`${report.dateKpi.toLocaleString("vi-VN")}đ`}
                        valueColor="violet"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                      <MetricTile
                        label="Tỉ lệ đạt KPI ngày"
                        value={`${dailyKpiPercent.toFixed(2)}%`}
                        valueColor="teal"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                      <Paper withBorder p="sm" radius="md" bg="white" h="100%">
                        <Text size="xs" c="dimmed" mb={4}>
                          Lũy kế tháng
                        </Text>
                        <Text fw={700} size="xl" c="orange" mb={8}>
                          {projectedRevenue.toLocaleString("vi-VN")}đ
                        </Text>
                        <Text size="xs" c="dimmed">
                          KPI tháng: {(kpiData || 0).toLocaleString("vi-VN")}đ
                        </Text>
                        <Text size="xs" c="dimmed" mb={8}>
                          Tỉ lệ hoàn thành: {monthlyKpiPercent.toFixed(2)}%
                        </Text>
                        <Progress
                          value={Math.min(monthlyKpiPercent, 100)}
                          color="orange"
                          radius="xl"
                          size="md"
                        />
                      </Paper>
                    </Grid.Col>
                  </Grid>

                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <SectionCard title="Cơ cấu doanh số">
                        <Box
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                          }}
                        >
                          <PieChart
                            data={revenueStructureData}
                            size={260}
                            withTooltip
                            tooltipDataSource="segment"
                          />
                        </Box>
                        <Stack gap={6} mt="sm">
                          {revenueStructureData.map((item) => {
                            const percent =
                              totalStructureRevenue > 0
                                ? (item.value / totalStructureRevenue) * 100
                                : 0
                            return (
                              <Group key={item.name} justify="space-between" wrap="nowrap">
                                <Group gap="xs">
                                  <Box
                                    w={10}
                                    h={10}
                                    style={{
                                      borderRadius: 999,
                                      background:
                                        item.color === "blue.6"
                                          ? "var(--mantine-color-blue-6)"
                                          : "var(--mantine-color-violet-6)"
                                    }}
                                  />
                                  <Text size="sm">{item.name}</Text>
                                </Group>
                                <Text size="sm" c="dimmed">
                                  {item.value.toLocaleString("vi-VN")}đ ({percent.toFixed(1)}%)
                                </Text>
                              </Group>
                            )
                          })}
                        </Stack>
                      </SectionCard>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <SectionCard title="Chi phí ads">
                        <Text fw={700} size="xl" c="red" mb="sm">
                          {report.adsCost.toLocaleString("vi-VN")}đ
                        </Text>
                        <BarChart
                          h={220}
                          data={adsVsRevenueData}
                          dataKey="label"
                          withLegend
                          series={[
                            { name: "revenue", label: "Doanh thu", color: "blue.6" },
                            { name: "adsCost", label: "Chi phí ads", color: "red.6" }
                          ]}
                          yAxisProps={{ width: 80 }}
                          tickLine="y"
                          gridAxis="y"
                        />
                      </SectionCard>
                    </Grid.Col>
                  </Grid>

                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="message" pt="md">
                <Paper p="md" style={sectionCardStyle}>
                  <DailyReportByText
                    report={{
                      _id: report._id,
                      date: report.date,
                      channel: report.channel._id,
                      adsCost: report.adsCost,
                      dateKpi: report.dateKpi,
                      revenue: report.revenue,
                      newFunnelRevenue: report.newFunnelRevenue,
                      returningFunnelRevenue: report.returningFunnelRevenue,
                      newOrder: report.newOrder,
                      returningOrder: report.returningOrder,
                      accumulatedRevenue: report.accumulatedRevenue,
                      accumulatedAdsCost: report.accumulatedAdsCost,
                      accumulatedNewFunnelRevenue: report.accumulatedNewFunnelRevenue,
                      createdAt: report.createdAt,
                      updatedAt: report.updatedAt
                    }}
                  />
                </Paper>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        )}
      </Box>
    </SalesLayout>
  )
}
