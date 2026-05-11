import { useState } from "react"
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
import { BarChart } from "@mantine/charts"

interface ChannelData {
  channelId: string
  channelName: string
  revenue: number
  orderCount: number
}

interface ChannelMetricsChartProps {
  isLoading: boolean
  data?: ChannelData[]
}

const cardStyle = {
  border: "1px solid #E5E7EB",
  borderRadius: rem(14),
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
  background: "#fff"
}

export function ChannelMetricsChart({
  isLoading,
  data
}: ChannelMetricsChartProps) {
  const [channelMetricView, setChannelMetricView] = useState<
    "revenue" | "quantity"
  >("revenue")

  return (
    <Card padding="md" style={cardStyle}>
      <Group mb="sm" justify="space-between" wrap="wrap" align="center" gap={10}>
        <Group gap="xs">
          <IconChartBar size={18} />
          <Text fw={600}>Chỉ số theo kênh</Text>
        </Group>
        <SegmentedControl
          size="xs"
          radius="md"
          value={channelMetricView}
          onChange={(value) =>
            setChannelMetricView(value as "revenue" | "quantity")
          }
          data={[
            { label: "Theo doanh thu", value: "revenue" },
            { label: "Theo số đơn", value: "quantity" }
          ]}
        />
      </Group>

      {isLoading ? (
        <Skeleton height={220} />
      ) : data && data.length > 0 ? (
        <Box>
          <BarChart
            h={220}
            data={data.map((ch) => ({
              channelName: ch.channelName,
              value: channelMetricView === "revenue" ? ch.revenue : ch.orderCount
            }))}
            dataKey="channelName"
            series={[
              {
                name: "value",
                label: channelMetricView === "revenue" ? "Doanh thu" : "Số đơn",
                color: "blue.6"
              }
            ]}
            tickLine="y"
            withLegend={false}
            withYAxis
            yAxisProps={{ width: 80 }}
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
                          {channelMetricView === "revenue" ? "Doanh thu" : "Số đơn"}:
                        </Text>
                        <Text size="sm" fw={600}>
                          {channelMetricView === "revenue"
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
      )}
    </Card>
  )
}
