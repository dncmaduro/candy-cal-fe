import { useState, useMemo } from "react"
import {
  Card,
  Group,
  Text,
  Box,
  Alert,
  Skeleton,
  SegmentedControl,
  Paper,
  rem
} from "@mantine/core"
import { IconChartBar, IconAlertCircle } from "@tabler/icons-react"
import { BarChart, PieChart } from "@mantine/charts"

interface TopProductsChartProps {
  isLoading: boolean
  topItemsByRevenue?: Array<{ code: string; name: string; revenue: number }>
  topItemsByQuantity?: Array<{ code: string; name: string; quantity: number }>
  otherItemsRevenue?: number
}

const cardStyle = {
  border: "1px solid #E5E7EB",
  borderRadius: rem(14),
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
  background: "#fff"
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
    }

    if (topItemsView === "quantity" && topItemsByQuantity) {
      return topItemsByQuantity.map((item, index) => ({
        name: `${item.code} - ${item.name}`,
        value: item.quantity,
        color: colors[index % colors.length]
      }))
    }

    return []
  }, [topItemsByRevenue, topItemsByQuantity, otherItemsRevenue, topItemsView])

  return (
    <Card padding="md" style={cardStyle}>
      <Group mb="sm" justify="space-between" wrap="wrap" gap={10}>
        <Group gap="xs">
          <IconChartBar size={18} />
          <Text fw={600}>Top 10 sản phẩm bán chạy</Text>
        </Group>

        <Group gap={8} wrap="wrap">
          <SegmentedControl
            size="xs"
            radius="md"
            value={topItemsView}
            onChange={(value) => setTopItemsView(value as "revenue" | "quantity")}
            data={[
              { label: "Theo doanh thu", value: "revenue" },
              { label: "Theo số lượng", value: "quantity" }
            ]}
          />
          <SegmentedControl
            size="xs"
            radius="md"
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
        <Skeleton height={260} />
      ) : topItemsChartType === "bar" ? (
        filteredItems.length > 0 ? (
          <Box>
            <BarChart
              h={260}
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
              yAxisProps={{ width: 96 }}
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
                            {topItemsView === "revenue" ? "Doanh thu" : "Số lượng"}:
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
                cursor: { fill: "transparent" }
              }}
            />
          </Box>
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
            Không có dữ liệu
          </Alert>
        )
      ) : topItemsPieData.length > 0 ? (
        <Box
          w="100%"
          h={260}
          mx="auto"
          style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          <PieChart
            data={topItemsPieData}
            withLabels
            withTooltip
            styles={{ root: { width: "100%" } }}
            size={220}
            tooltipDataSource="segment"
            valueFormatter={(value: number) =>
              topItemsView === "revenue"
                ? `${value.toLocaleString("vi-VN")}đ`
                : value.toString()
            }
          />
        </Box>
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
          Không có dữ liệu
        </Alert>
      )}
    </Card>
  )
}
