import { createFileRoute } from "@tanstack/react-router"
import {
  Box,
  Paper,
  Text,
  Group,
  Grid,
  Stack,
  LoadingOverlay,
  Tabs,
  Progress,
  rem,
  Divider,
  ThemeIcon,
  RingProgress,
  Center
} from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  IconCalendar,
  IconBuildingStore,
  IconChartBar,
  IconChartPie,
  IconClock,
  IconTargetArrow,
  IconTrendingUp,
  IconCoin,
  IconBroadcast
} from "@tabler/icons-react"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { useSalesDailyReports } from "../../../hooks/useSalesDailyReports"
import { ReactNode, useMemo } from "react"
import { DailyReportByText } from "../../../components/sales/dashboard/DailyReportByText"

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
  icon: ReactNode
  iconColor: string
  iconBg: string
  hint?: string
}

const MetricTile = ({
  label,
  value,
  valueColor,
  icon,
  iconColor,
  iconBg,
  hint
}: MetricTileProps) => (
  <Paper
    p="lg"
    radius="xl"
    h="100%"
    style={{
      ...sectionCardStyle,
      boxShadow: "0 12px 30px rgba(15, 23, 42, 0.05)"
    }}
  >
    <Stack gap="lg" h="100%" justify="space-between">
      <Group gap="md" align="flex-start" wrap="nowrap">
        <ThemeIcon
          size={56}
          radius="xl"
          variant="light"
          style={{ background: iconBg, color: iconColor, flexShrink: 0 }}
        >
          {icon}
        </ThemeIcon>
        <Box>
          <Text size="sm" c="#5B6476" fw={500}>
            {label}
          </Text>
          {hint && (
            <Text size="xs" c="dimmed" mt={4}>
              {hint}
            </Text>
          )}
        </Box>
      </Group>

      <Text fw={800} fz={{ base: 24, md: 32 }} c={valueColor} lh={1.1}>
        {value}
      </Text>
    </Stack>
  </Paper>
)

type InfoBadgeCardProps = {
  icon: ReactNode
  label: string
  value: string
}

const InfoBadgeCard = ({ icon, label, value }: InfoBadgeCardProps) => (
  <Paper
    p="md"
    radius="xl"
    miw={{ base: "100%", sm: 260 }}
    style={{
      border: "1px solid #E9EDF5",
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(247,250,255,0.98) 100%)",
      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)"
    }}
  >
    <Group gap="md" wrap="nowrap">
      <ThemeIcon
        size={48}
        radius="xl"
        variant="light"
        color="blue"
        style={{
          background: "rgba(59, 130, 246, 0.08)",
          color: "var(--mantine-color-blue-6)",
          flexShrink: 0
        }}
      >
        {icon}
      </ThemeIcon>
      <Box>
        <Text size="sm" c="#6B7280">
          {label}
        </Text>
        <Text fw={700} fz="md" lh={1.25}>
          {value}
        </Text>
      </Box>
    </Group>
  </Paper>
)

const formatCurrency = (value?: number) =>
  `${(value ?? 0).toLocaleString("vi-VN")}đ`

const clampPercent = (value: number) => Math.min(Math.max(value, 0), 100)

function RouteComponent() {
  const { dailyReportId } = Route.useParams()
  const { getSalesDailyReportDetail, getSalesMonthKpi } = useSalesDailyReports()

  const { data, isLoading } = useQuery({
    queryKey: ["salesDailyReportDetail", dailyReportId],
    queryFn: () => getSalesDailyReportDetail({ id: dailyReportId })
  })

  const report = data?.data

  const { data: kpiData } = useQuery({
    queryKey: [
      "getSalesMonthKpi",
      dailyReportId,
      report?.date,
      report?.channel?._id
    ],
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

  const monthlyCompletionValue = clampPercent(monthlyKpiPercent)
  const newCustomerPercent =
    totalStructureRevenue > 0
      ? (dailyNewRevenue / totalStructureRevenue) * 100
      : 0
  const returningCustomerPercent =
    totalStructureRevenue > 0
      ? ((report?.returningFunnelRevenue ?? 0) / totalStructureRevenue) * 100
      : 0
  const adsCostRatio =
    report?.revenue && report.revenue > 0
      ? ((report.adsCost ?? 0) / report.revenue) * 100
      : 0

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
            <Paper
              p={{ base: "md", md: "xl" }}
              radius={24}
              style={{
                ...sectionCardStyle,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,255,0.98) 100%)"
              }}
            >
              <Stack gap="lg">
                <Group
                  justify="space-between"
                  align="stretch"
                  wrap="wrap"
                  gap="lg"
                >
                  <Box flex={1} miw={280}>
                    <Text
                      fw={800}
                      fz={{ base: 28, md: 44 }}
                      lh={1.08}
                      c="#111827"
                    >
                      Báo cáo ngày {format(new Date(report.date), "dd/MM/yyyy")}
                    </Text>
                    <Group gap="xs" mt="md">
                      <IconClock size={18} color="#6B7280" />
                      <Text size="md" c="#6B7280">
                        Cập nhật lúc:{" "}
                        {format(new Date(report.updatedAt), "HH:mm dd/MM/yyyy")}
                      </Text>
                    </Group>
                  </Box>

                  <Group gap="md" align="stretch" wrap="wrap">
                    <InfoBadgeCard
                      icon={<IconBuildingStore size={24} />}
                      label="Kênh"
                      value={report.channel.channelName}
                    />
                    <InfoBadgeCard
                      icon={<IconCalendar size={24} />}
                      label="Ngày báo cáo"
                      value={format(new Date(report.date), "dd/MM/yyyy")}
                    />
                  </Group>
                </Group>
              </Stack>
            </Paper>

            <Tabs defaultValue="visual">
              <Tabs.List grow>
                <Tabs.Tab
                  value="visual"
                  leftSection={<IconChartBar size={16} />}
                >
                  Biểu đồ
                </Tabs.Tab>
                <Tabs.Tab
                  value="message"
                  leftSection={<IconChartPie size={16} />}
                >
                  Tin nhắn báo cáo
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="visual" pt="md">
                <Stack gap="md">
                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                      <MetricTile
                        label="Doanh số ngày"
                        value={formatCurrency(report.revenue)}
                        valueColor="#1D7AF3"
                        icon={<IconChartBar size={26} />}
                        iconColor="#1D4ED8"
                        iconBg="rgba(59, 130, 246, 0.10)"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                      <MetricTile
                        label="KPI ngày"
                        value={formatCurrency(report.dateKpi)}
                        valueColor="#7C3AED"
                        icon={<IconTargetArrow size={26} />}
                        iconColor="#6D28D9"
                        iconBg="rgba(124, 58, 237, 0.10)"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                      <MetricTile
                        label="Tỉ lệ đạt KPI ngày"
                        value={`${dailyKpiPercent.toFixed(2)}%`}
                        valueColor="#16A34A"
                        icon={<IconTrendingUp size={26} />}
                        iconColor="#15803D"
                        iconBg="rgba(34, 197, 94, 0.10)"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                      <MetricTile
                        label="Lũy kế tháng"
                        value={formatCurrency(projectedRevenue)}
                        valueColor="#F97316"
                        icon={<IconCoin size={26} />}
                        iconColor="#EA580C"
                        iconBg="rgba(249, 115, 22, 0.10)"
                      />
                    </Grid.Col>
                  </Grid>

                  <Paper
                    p={{ base: "md", md: "lg" }}
                    radius="xl"
                    style={{
                      ...sectionCardStyle,
                      boxShadow: "0 12px 30px rgba(15, 23, 42, 0.04)"
                    }}
                  >
                    <Grid align="center" gutter="lg">
                      <Grid.Col span={{ base: 12, md: 4 }}>
                        <Stack gap={6}>
                          <Text size="sm" c="#5B6476" fw={500}>
                            KPI tháng
                          </Text>
                          <Text fw={800} fz={{ base: 22, md: 30 }} lh={1.1}>
                            {formatCurrency(kpiData)}
                          </Text>
                        </Stack>
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, md: 8 }}>
                        <Group align="center" gap="lg" wrap="nowrap">
                          <Divider orientation="vertical" visibleFrom="md" />
                          <Stack gap={8} flex={1}>
                            <Text size="sm" c="#5B6476" fw={500}>
                              Tỉ lệ hoàn thành tháng
                            </Text>
                            <Text
                              fw={800}
                              fz={{ base: 22, md: 32 }}
                              c="#1D7AF3"
                              lh={1.1}
                            >
                              {monthlyKpiPercent.toFixed(2)}%
                            </Text>
                            <Progress
                              value={monthlyCompletionValue}
                              color="#1D7AF3"
                              radius="xl"
                              size="xl"
                              style={{
                                background: "#E8EEF7"
                              }}
                            />
                          </Stack>
                        </Group>
                      </Grid.Col>
                    </Grid>
                  </Paper>

                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <SectionCard title="Cơ cấu doanh số">
                        <Grid align="center">
                          <Grid.Col span={{ base: 12, lg: 5 }}>
                            <Center>
                              <RingProgress
                                size={220}
                                thickness={34}
                                roundCaps
                                rootColor="#EEF2FF"
                                sections={[
                                  {
                                    value: newCustomerPercent,
                                    color: "#1D7AF3"
                                  },
                                  {
                                    value: returningCustomerPercent,
                                    color: "#DDE3F0"
                                  }
                                ]}
                                label={
                                  <Text
                                    ta="center"
                                    fw={800}
                                    fz={28}
                                    c="#1D7AF3"
                                  >
                                    {Math.round(newCustomerPercent)}%
                                  </Text>
                                }
                              />
                            </Center>
                          </Grid.Col>

                          <Grid.Col span={{ base: 12, lg: 7 }}>
                            <Stack gap="xl">
                              <Group justify="space-between" wrap="nowrap">
                                <Group gap="sm" wrap="nowrap">
                                  <Box
                                    w={14}
                                    h={14}
                                    style={{
                                      borderRadius: 999,
                                      background: "#1D7AF3",
                                      flexShrink: 0
                                    }}
                                  />
                                  <Text size="md">Khách mới</Text>
                                </Group>
                                <Text size="md" c="#111827">
                                  {formatCurrency(dailyNewRevenue)} (
                                  {newCustomerPercent.toFixed(1)}%)
                                </Text>
                              </Group>

                              <Group justify="space-between" wrap="nowrap">
                                <Group gap="sm" wrap="nowrap">
                                  <Box
                                    w={14}
                                    h={14}
                                    style={{
                                      borderRadius: 999,
                                      background: "#DDE3F0",
                                      flexShrink: 0
                                    }}
                                  />
                                  <Text size="md">Khách cũ</Text>
                                </Group>
                                <Text size="md" c="#111827">
                                  {formatCurrency(
                                    report.returningFunnelRevenue
                                  )}{" "}
                                  ({returningCustomerPercent.toFixed(1)}%)
                                </Text>
                              </Group>
                            </Stack>
                          </Grid.Col>
                        </Grid>
                      </SectionCard>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <SectionCard title="Chi phí ads">
                        <Stack
                          align="center"
                          justify="center"
                          mih={320}
                          gap="md"
                        >
                          <ThemeIcon
                            size={92}
                            radius="xl"
                            variant="light"
                            style={{
                              background: "rgba(148, 163, 184, 0.10)",
                              color: "#94A3B8"
                            }}
                          >
                            <IconBroadcast size={42} />
                          </ThemeIcon>

                          <Text
                            fw={800}
                            fz={{ base: 28, md: 40 }}
                            lh={1}
                            c="#0F172A"
                          >
                            {formatCurrency(report.adsCost)}
                          </Text>

                          {report.adsCost > 0 ? (
                            <Stack gap={6} align="center">
                              <Text size="md" c="#6B7280" ta="center">
                                Chiếm {adsCostRatio.toFixed(2)}% doanh số ngày
                              </Text>
                              <Text size="sm" c="dimmed" ta="center">
                                So với doanh số {formatCurrency(report.revenue)}
                              </Text>
                            </Stack>
                          ) : (
                            <Text size="md" c="#6B7280" ta="center">
                              Chưa phát sinh chi phí ads
                            </Text>
                          )}
                        </Stack>
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
                      accumulatedNewFunnelRevenue:
                        report.accumulatedNewFunnelRevenue,
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
