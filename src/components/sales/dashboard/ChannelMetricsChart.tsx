import { useState } from "react"
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

export function ChannelMetricsChart({
  isLoading,
  data
}: ChannelMetricsChartProps) {
  const [channelMetricView, setChannelMetricView] = useState<
    "revenue" | "quantity"
  >("revenue")

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group mb="md" justify="space-between">
        <Group>
          <IconChartBar size={20} />
          <Text fw={600}>Chỉ số theo kênh</Text>
        </Group>
        <SegmentedControl
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
        <Skeleton height={300} />
      ) : data && data.length > 0 ? (
        <Box
          style={{
            "& .rechartsBarRectangle:hover": {
              opacity: 0.8
            },
            "& .rechartsActiveBar": {
              filter: "none"
            }
          }}
        >
          <BarChart
            h={300}
            data={data.map((ch) => ({
              channelName: ch.channelName,
              value:
                channelMetricView === "revenue" ? ch.revenue : ch.orderCount
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
                          {channelMetricView === "revenue"
                            ? "Doanh thu"
                            : "Số đơn"}
                          :
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
  )
}
