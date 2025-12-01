import { createFileRoute } from "@tanstack/react-router"
import {
  Box,
  Paper,
  Text,
  Group,
  Badge,
  Grid,
  Divider,
  Stack,
  Button,
  LoadingOverlay
} from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { IconArrowLeft, IconCalendar } from "@tabler/icons-react"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { useSalesDailyReports } from "../../../hooks/useSalesDailyReports"
import { useNavigate } from "@tanstack/react-router"
import { ReactNode } from "react"

export const Route = createFileRoute("/sales/dashboard/$dailyReportId")({
  component: RouteComponent
})

type SectionCardProps = {
  title: string
  badgeLabel?: string
  badgeColor?: string
  description?: ReactNode
  children: ReactNode
}

const SectionCard = ({
  title,
  badgeLabel,
  badgeColor = "gray",
  description,
  children
}: SectionCardProps) => (
  <Paper withBorder p="lg" radius="md">
    <Stack gap="sm">
      <Group justify="space-between" align="flex-start">
        <Box>
          <Text fw={600} size="md">
            {title}
          </Text>
          {description && (
            <Text size="sm" c="dimmed" mt={2}>
              {description}
            </Text>
          )}
        </Box>
        {badgeLabel && (
          <Badge size="sm" variant="outline" color={badgeColor}>
            {badgeLabel}
          </Badge>
        )}
      </Group>
      <Divider />
      {children}
    </Stack>
  </Paper>
)

type StatCardProps = {
  label: string
  value: ReactNode
  valueColor?: string
  tone?: "neutral" | "accent"
  footer?: ReactNode
}

const StatCard = ({
  label,
  value,
  valueColor,
  tone = "neutral",
  footer
}: StatCardProps) => (
  <Paper
    p="md"
    withBorder
    radius="sm"
    bg={tone === "accent" ? "gray.0" : "white"}
  >
    <Text size="sm" c="dimmed" mb={4} fw={500}>
      {label}
    </Text>
    <Text size="lg" fw={600} c={valueColor}>
      {value}
    </Text>
    {footer && (
      <Text size="sm" c="dimmed" mt="xs">
        {footer}
      </Text>
    )}
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

  const { data: kpiData } = useQuery({
    queryKey: ["getSalesMonthKpi", dailyReportId, data?.data],
    queryFn: () => {
      if (data?.data) {
        return getSalesMonthKpi({
          date: new Date(data.data.date),
          channelId: data.data.channel._id
        })
      }
      return Promise.resolve({ data: { kpi: 1 } })
    },
    select: (data) => data.data.kpi ?? 1
  })

  const report = data?.data

  // ====== CÁC GIÁ TRỊ DỰ BÁO (LŨY KẾ + NGÀY HIỆN TẠI) ======
  const projectedRevenue =
    (report?.accumulatedRevenue ?? 0) + (report?.revenue ?? 0)

  const projectedKpiPercent = kpiData
    ? ((projectedRevenue / kpiData) * 100).toFixed(2)
    : "0.00"

  const projectedAdsCost =
    (report?.accumulatedAdsCost ?? 0) + (report?.adsCost ?? 0)

  const projectedNewFunnelRevenueAds =
    (report?.accumulatedNewFunnelRevenue.ads ?? 0) +
    (report?.newFunnelRevenue.ads ?? 0)

  const projectedCacPercent =
    projectedNewFunnelRevenueAds > 0
      ? ((projectedAdsCost / projectedNewFunnelRevenueAds) * 100).toFixed(2)
      : "0.00"

  // const projectedRoiPercent =
  //   projectedAdsCost > 0
  //     ? ((projectedNewFunnelRevenueAds / projectedAdsCost) * 100).toFixed(2)
  //     : "0.00"

  return (
    <SalesLayout>
      <Box pos="relative" mih={400}>
        <LoadingOverlay
          visible={isLoading}
          zIndex={1000}
          overlayProps={{ radius: "md", blur: 2 }}
        />

        {/* Header */}
        <Paper p="lg" mb="lg" withBorder radius="md">
          <Group justify="space-between" align="flex-start" mb="md">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} aria-hidden="true" />}
              onClick={() => navigate({ to: "/sales/dashboard/daily-reports" })}
              aria-label="Quay lại danh sách báo cáo ngày"
            >
              Quay lại
            </Button>
            {report && (
              <Badge size="md" variant="outline" color="blue">
                {format(new Date(report.date), "dd/MM/yyyy")}
              </Badge>
            )}
          </Group>

          {report && (
            <Group gap="md" align="center">
              <Box
                w={44}
                h={44}
                className="rounded-full"
                bg="blue.0"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                aria-hidden="true"
              >
                <IconCalendar size={22} color="var(--mantine-color-blue-6)" />
              </Box>
              <Box>
                <Text size="xl" fw={700}>
                  Báo cáo ngày {format(new Date(report.date), "dd/MM/yyyy")}
                </Text>
                <Text size="sm" c="dimmed" mt={4}>
                  Cập nhật lúc:{" "}
                  {format(new Date(report.updatedAt), "HH:mm dd/MM/yyyy")}
                </Text>
              </Box>
            </Group>
          )}
        </Paper>

        {report && (
          <Stack gap="lg">
            {/* Dữ liệu doanh thu ngày */}
            <SectionCard
              title="Dữ liệu doanh thu ngày"
              badgeLabel="Dữ liệu ngày"
              badgeColor="blue"
              description="Tổng quan doanh thu và số đơn trong ngày."
            >
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <StatCard
                    label="Tổng doanh thu"
                    value={`${report.revenue.toLocaleString("vi-VN")}đ`}
                    valueColor="blue"
                    tone="accent"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <Paper p="md" withBorder radius="sm" bg="gray.0">
                    <Text size="sm" c="dimmed" mb={4} fw={500}>
                      Doanh thu khách mới
                    </Text>
                    <Text size="lg" fw={600}>
                      {(
                        report.newFunnelRevenue.ads +
                        report.newFunnelRevenue.other
                      ).toLocaleString("vi-VN")}
                      đ
                    </Text>
                    <Group gap="xs" mt="xs" wrap="wrap">
                      <Text size="sm" c="dimmed">
                        Ads:{" "}
                        {report.newFunnelRevenue.ads.toLocaleString("vi-VN")}đ
                      </Text>
                      <Text size="sm" c="dimmed">
                        • Khác:{" "}
                        {report.newFunnelRevenue.other.toLocaleString("vi-VN")}đ
                      </Text>
                    </Group>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <StatCard
                    label="Doanh thu khách quay lại"
                    value={`${report.returningFunnelRevenue.toLocaleString(
                      "vi-VN"
                    )}đ`}
                    tone="accent"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatCard
                    label="Số đơn khách mới"
                    value={report.newOrder}
                    tone="accent"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatCard
                    label="Số đơn khách cũ"
                    value={report.returningOrder}
                    tone="accent"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatCard
                    label="Chi phí quảng cáo"
                    value={`${report.adsCost.toLocaleString("vi-VN")}đ`}
                    valueColor="red"
                    tone="accent"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatCard
                    label="KPI ngày"
                    value={`${report.dateKpi.toLocaleString("vi-VN")}đ`}
                    valueColor="yellow.9"
                    tone="accent"
                  />
                </Grid.Col>
              </Grid>
            </SectionCard>

            {/* Dữ liệu lũy kế tháng */}
            <SectionCard
              title="Dữ liệu lũy kế tháng"
              badgeLabel="Dữ liệu tích lũy"
              badgeColor="grape"
              description="Tổng quan doanh thu và chi phí ads đến trước ngày hôm nay."
            >
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <StatCard
                    label="Tổng doanh thu lũy kế"
                    value={`${report.accumulatedRevenue.toLocaleString(
                      "vi-VN"
                    )}đ`}
                    valueColor="green"
                    tone="accent"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <Paper p="md" withBorder radius="sm" bg="gray.0">
                    <Text size="sm" c="dimmed" mb={4} fw={500}>
                      Doanh thu khách mới lũy kế
                    </Text>
                    <Text size="lg" fw={600}>
                      {(
                        report.accumulatedNewFunnelRevenue.ads +
                        report.accumulatedNewFunnelRevenue.other
                      ).toLocaleString("vi-VN")}
                      đ
                    </Text>
                    <Group gap="xs" mt="xs" wrap="wrap">
                      <Text size="sm" c="dimmed">
                        Ads:{" "}
                        {report.accumulatedNewFunnelRevenue.ads.toLocaleString(
                          "vi-VN"
                        )}
                        đ
                      </Text>
                      <Text size="sm" c="dimmed">
                        • Khác:{" "}
                        {report.accumulatedNewFunnelRevenue.other.toLocaleString(
                          "vi-VN"
                        )}
                        đ
                      </Text>
                    </Group>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <StatCard
                    label="Tổng chi phí ads lũy kế"
                    value={`${report.accumulatedAdsCost.toLocaleString(
                      "vi-VN"
                    )}đ`}
                    valueColor="red"
                    tone="accent"
                  />
                </Grid.Col>
              </Grid>
            </SectionCard>

            {/* Chỉ số hiệu suất */}
            <SectionCard
              title="Chỉ số hiệu suất"
              description="Các chỉ số tính trên lũy kế + ngày được báo cáo (tính đến thời điểm hiện tại)."
            >
              <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper p="md" withBorder radius="md" bg="gray.0">
                    <Stack gap="xs" align="center">
                      <Text size="sm" fw={600} c="dimmed" ta="center">
                        Đạt KPI (Tổng doanh thu / KPI Tháng)
                      </Text>
                      <Text fw={700} style={{ fontSize: 28 }} c="orange">
                        {projectedKpiPercent}%
                      </Text>
                      <Text size="sm" c="dimmed" ta="center">
                        <Text component="span" fw={600} c="orange">
                          {projectedRevenue.toLocaleString("vi-VN")}đ
                        </Text>
                        {" / "}
                        <Text component="span" fw={600}>
                          {kpiData?.toLocaleString("vi-VN")}đ
                        </Text>
                      </Text>
                      <Text size="xs" c="dimmed" ta="center">
                        Đã cộng cả chi phí & doanh thu từ Ads của ngày{" "}
                        {format(new Date(report.date), "dd/MM")}
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper p="md" withBorder radius="md" bg="gray.0">
                    <Stack gap="xs" align="center">
                      <Text size="sm" fw={600} c="dimmed" ta="center">
                        CAC (Chi phí / Doanh thu từ Ads)
                      </Text>
                      <Text fw={700} style={{ fontSize: 28 }} c="orange">
                        {projectedCacPercent}%
                      </Text>
                      <Text size="sm" c="dimmed" ta="center">
                        <Text component="span" fw={600} c="orange">
                          {projectedAdsCost.toLocaleString("vi-VN")}đ
                        </Text>
                        {" / "}
                        <Text component="span" fw={600}>
                          {projectedNewFunnelRevenueAds.toLocaleString("vi-VN")}
                          đ
                        </Text>
                      </Text>
                      <Text size="xs" c="dimmed" ta="center">
                        Đã cộng cả chi phí & doanh thu từ Ads của ngày{" "}
                        {format(new Date(report.date), "dd/MM")}
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>
            </SectionCard>
          </Stack>
        )}
      </Box>
    </SalesLayout>
  )
}
