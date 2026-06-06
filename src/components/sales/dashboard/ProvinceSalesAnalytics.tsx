import { useMemo, useState } from "react"
import { BarChart } from "@mantine/charts"
import {
  Alert,
  Badge,
  Box,
  Card,
  Grid,
  Group,
  Paper,
  ScrollArea,
  SegmentedControl,
  Skeleton,
  Table,
  Text,
  rem
} from "@mantine/core"
import { IconAlertCircle, IconTrendingUp } from "@tabler/icons-react"
import { GetProvinceSalesStatsResponse } from "../../../hooks/models"

interface ProvinceSalesAnalyticsProps {
  isLoading: boolean
  data?: GetProvinceSalesStatsResponse
}

type ProvinceMetricView = "revenue" | "orders"

const cardStyle = {
  border: "1px solid #E5E7EB",
  borderRadius: rem(14),
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
  background: "#fff"
}

// const summaryCardStyle = {
//   ...cardStyle,
//   height: "100%"
// }

const CHART_LIMIT = 10

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")}đ`

export function ProvinceSalesAnalytics({
  isLoading,
  data
}: ProvinceSalesAnalyticsProps) {
  const [metricView, setMetricView] = useState<ProvinceMetricView>("revenue")

  const provinces = data?.provinces || []

  const sortedProvinces = useMemo(() => {
    return [...provinces].sort((a, b) =>
      metricView === "revenue"
        ? b.revenue - a.revenue
        : b.orderCount - a.orderCount
    )
  }, [metricView, provinces])

  const chartData = useMemo(() => {
    return sortedProvinces.slice(0, CHART_LIMIT).map((province) => ({
      provinceName: province.provinceName,
      value: metricView === "revenue" ? province.revenue : province.orderCount,
      revenue: province.revenue,
      orderCount: province.orderCount
    }))
  }, [metricView, sortedProvinces])

  // const summaryItems = [
  //   {
  //     label: "Tổng doanh thu",
  //     value: formatCurrency(data?.totalRevenue ?? 0),
  //     icon: <IconCash size={18} />,
  //     color: "blue"
  //   },
  //   {
  //     label: "Tổng số đơn",
  //     value: (data?.totalOrders ?? 0).toLocaleString("vi-VN"),
  //     icon: <IconShoppingCart size={18} />,
  //     color: "green"
  //   },
  //   {
  //     label: "Tỉnh/thành có đơn",
  //     value: provinces.length.toLocaleString("vi-VN"),
  //     icon: <IconMap2 size={18} />,
  //     color: "orange"
  //   }
  // ]

  return (
    <Box>
      {/* <Grid gutter={14} mb="md">
        {summaryItems.map((item) => (
          <Grid.Col key={item.label} span={{ base: 12, md: 4 }}>
            <Card padding="md" style={summaryCardStyle}>
              {isLoading ? (
                <Skeleton height={72} />
              ) : (
                <>
                  <Group justify="space-between" mb={8}>
                    <Text size="xs" c="dimmed" fw={500}>
                      {item.label}
                    </Text>
                    <ThemeIcon variant="light" size={34} radius={10} color={item.color}>
                      {item.icon}
                    </ThemeIcon>
                  </Group>
                  <Text fw={700} fz={{ base: "xl", md: 28 }}>
                    {item.value}
                  </Text>
                </>
              )}
            </Card>
          </Grid.Col>
        ))}
      </Grid> */}

      <Grid gutter={14}>
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Card padding="md" style={cardStyle}>
            <Group justify="space-between" wrap="wrap" gap={10} mb="sm">
              <Group gap="xs">
                <IconTrendingUp size={18} />
                <Text fw={600}>Biểu đồ theo tỉnh/thành</Text>
                {!isLoading && provinces.length > 0 && (
                  <Badge variant="light" radius="sm">
                    Top {Math.min(CHART_LIMIT, provinces.length)}
                  </Badge>
                )}
              </Group>

              <SegmentedControl
                size="xs"
                radius="md"
                value={metricView}
                onChange={(value) => setMetricView(value as ProvinceMetricView)}
                data={[
                  { label: "Doanh thu", value: "revenue" },
                  { label: "Số đơn", value: "orders" }
                ]}
              />
            </Group>

            {isLoading ? (
              <Skeleton height={320} />
            ) : chartData.length > 0 ? (
              <BarChart
                h={320}
                data={chartData}
                dataKey="provinceName"
                series={[
                  {
                    name: "value",
                    label: metricView === "revenue" ? "Doanh thu" : "Số đơn",
                    color: metricView === "revenue" ? "blue.6" : "teal.6"
                  }
                ]}
                orientation="horizontal"
                tickLine="x"
                withLegend={false}
                withYAxis
                yAxisProps={{ width: 110 }}
                tooltipProps={{
                  content: ({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const point = payload[0].payload

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
                          <Text size="sm" mb={4}>
                            Doanh thu: <b>{formatCurrency(point.revenue)}</b>
                          </Text>
                          <Text size="sm">
                            Số đơn:{" "}
                            <b>{point.orderCount.toLocaleString("vi-VN")}</b>
                          </Text>
                        </Paper>
                      )
                    }

                    return null
                  },
                  cursor: { fill: "transparent" }
                }}
              />
            ) : (
              <Alert
                color="yellow"
                icon={<IconAlertCircle size={14} />}
                radius="md"
                p="sm"
                styles={{
                  root: { background: "#fff7e8", borderColor: "#fde7c2" },
                  message: { fontSize: 13 }
                }}
              >
                Chưa có dữ liệu tỉnh/thành phát sinh đơn trong khoảng thời gian
                này
              </Alert>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Card padding="md" style={cardStyle}>
            <Group justify="space-between" wrap="wrap" gap={10} mb="sm">
              <Text fw={600}>Xếp hạng tỉnh/thành</Text>
              {!isLoading && provinces.length > 0 && (
                <Badge variant="light" radius="sm">
                  {metricView === "revenue" ? "Theo doanh thu" : "Theo số đơn"}
                </Badge>
              )}
            </Group>

            <ScrollArea mah={320}>
              {isLoading ? (
                <Skeleton height={260} />
              ) : sortedProvinces.length > 0 ? (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th ta="center">#</Table.Th>
                      <Table.Th>Tỉnh/thành</Table.Th>
                      <Table.Th ta="right">
                        {metricView === "revenue" ? "Doanh thu" : "Số đơn"}
                      </Table.Th>
                      <Table.Th ta="right">
                        {metricView === "revenue" ? "Số đơn" : "Doanh thu"}
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {sortedProvinces.map((province, index) => (
                      <Table.Tr key={`${province.provinceName}-${index}`}>
                        <Table.Td ta="center">
                          <Badge
                            size="sm"
                            variant={index < 3 ? "filled" : "light"}
                            color={index < 3 ? "yellow" : "gray"}
                          >
                            {index + 1}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={500} size="sm">
                            {province.provinceName}
                          </Text>
                        </Table.Td>
                        <Table.Td ta="right">
                          <Text size="sm" fw={600}>
                            {metricView === "revenue"
                              ? formatCurrency(province.revenue)
                              : province.orderCount.toLocaleString("vi-VN")}
                          </Text>
                        </Table.Td>
                        <Table.Td ta="right">
                          <Text size="sm" c="dimmed">
                            {metricView === "revenue"
                              ? province.orderCount.toLocaleString("vi-VN")
                              : formatCurrency(province.revenue)}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              ) : (
                <Alert
                  color="yellow"
                  icon={<IconAlertCircle size={14} />}
                  radius="md"
                  p="sm"
                  styles={{
                    root: { background: "#fff7e8", borderColor: "#fde7c2" },
                    message: { fontSize: 13 }
                  }}
                >
                  Không có tỉnh/thành nào phát sinh đơn
                </Alert>
              )}
            </ScrollArea>
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  )
}
