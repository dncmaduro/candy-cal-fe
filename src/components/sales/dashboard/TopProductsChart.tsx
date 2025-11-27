import { useState, useMemo } from "react"
import {
  Card,
  Group,
  Text,
  Box,
  Alert,
  Skeleton,
  SegmentedControl,
  Paper
} from "@mantine/core"
import { IconChartBar, IconAlertCircle } from "@tabler/icons-react"
import { BarChart, PieChart } from "@mantine/charts"

interface TopProductsChartProps {
  isLoading: boolean
  topItemsByRevenue?: Array<{ code: string; name: string; revenue: number }>
  topItemsByQuantity?: Array<{ code: string; name: string; quantity: number }>
  otherItemsRevenue?: number
}

export function TopProductsChart({
  isLoading,
  topItemsByRevenue,
  topItemsByQuantity,
  otherItemsRevenue
}: TopProductsChartProps) {
  const [topItemsView, setTopItemsView] = useState<"revenue" | "quantity">(
    "revenue"
  )
  const [topItemsChartType, setTopItemsChartType] = useState<"bar" | "pie">(
    "bar"
  )

  const filteredItems = useMemo(() => {
    const itemsSource =
      topItemsView === "revenue" ? topItemsByRevenue : topItemsByQuantity

    if (!itemsSource) return []
    return itemsSource
  }, [topItemsByRevenue, topItemsByQuantity, topItemsView])

  const topItemsPieData = useMemo(() => {
    const colors = [
      "violet.6",
      "blue.6",
      "cyan.6",
      "teal.6",
      "green.6",
      "lime.6",
      "yellow.6",
      "orange.6",
      "red.6",
      "pink.6"
    ]

    if (topItemsView === "revenue" && topItemsByRevenue) {
      const items = topItemsByRevenue.map((item, index) => ({
        name: `${item.code} - ${item.name}`,
        value: item.revenue,
        color: colors[index % colors.length]
      }))

      if (otherItemsRevenue && otherItemsRevenue > 0) {
        items.push({
          name: "Các sản phẩm khác",
          value: otherItemsRevenue,
          color: "gray.5"
        })
      }

      return items
    } else if (topItemsView === "quantity" && topItemsByQuantity) {
      return topItemsByQuantity.map((item, index) => ({
        name: `${item.code} - ${item.name}`,
        value: item.quantity,
        color: colors[index % colors.length]
      }))
    }

    return []
  }, [topItemsByRevenue, topItemsByQuantity, otherItemsRevenue, topItemsView])

  console.log(topItemsPieData)

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group mb="md" justify="space-between" wrap="wrap">
        <Group>
          <IconChartBar size={20} />
          <Text fw={600}>Top 10 sản phẩm bán chạy</Text>
        </Group>
        <Group gap="sm">
          <SegmentedControl
            value={topItemsView}
            onChange={(value) =>
              setTopItemsView(value as "revenue" | "quantity")
            }
            data={[
              { label: "Theo doanh thu", value: "revenue" },
              { label: "Theo số lượng", value: "quantity" }
            ]}
          />
          <SegmentedControl
            value={topItemsChartType}
            onChange={(value) => setTopItemsChartType(value as "bar" | "pie")}
            data={[
              { label: "Biểu đồ cột", value: "bar" },
              { label: "Biểu đồ tròn", value: "pie" }
            ]}
          />
        </Group>
      </Group>

      {isLoading ? (
        <Skeleton height={400} />
      ) : topItemsChartType === "bar" ? (
        filteredItems.length > 0 ? (
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
                value:
                  topItemsView === "revenue"
                    ? (item as any).revenue
                    : (item as any).quantity
              }))}
              dataKey="name"
              series={[
                {
                  name: "value",
                  label: topItemsView === "revenue" ? "Doanh thu" : "Số lượng",
                  color: "violet.6"
                }
              ]}
              orientation="horizontal"
              tickLine="x"
              withLegend={false}
              withYAxis
              yAxisProps={{ width: 100 }}
              tooltipProps={{
                content: ({ active, payload, label }: any) => {
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
                        <Group gap="xs">
                          <Box
                            w={12}
                            h={12}
                            style={{
                              backgroundColor: payload[0].color,
                              borderRadius: 2
                            }}
                          />
                          <Text size="sm">
                            {topItemsView === "revenue"
                              ? "Doanh thu"
                              : "Số lượng"}
                            :
                          </Text>
                          <Text size="sm" fw={600}>
                            {topItemsView === "revenue"
                              ? `${payload[0].value.toLocaleString("vi-VN")}đ`
                              : payload[0].value}
                          </Text>
                        </Group>
                      </Paper>
                    )
                  }
                  return null
                },
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
        )
      ) : topItemsPieData.length > 0 ? (
        <Box
          w={"100%"}
          h={380}
          mx="auto"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <PieChart
            data={topItemsPieData}
            withLabels
            withTooltip
            styles={{
              root: {
                width: "100%"
              }
            }}
            size={320}
            tooltipDataSource="segment"
            valueFormatter={(value: number) =>
              topItemsView === "revenue"
                ? `${value.toLocaleString("vi-VN")}đ`
                : value.toString()
            }
          />
        </Box>
      ) : (
        <Alert color="yellow" icon={<IconAlertCircle />}>
          Không có dữ liệu
        </Alert>
      )}
    </Card>
  )
}
