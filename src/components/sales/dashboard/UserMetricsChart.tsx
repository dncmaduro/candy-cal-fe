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

interface UserData {
  userId: string
  userName: string
  revenue: number
  orderCount: number
  ordersByCustomerType: {
    new: number
    returning: number
  }
  revenueByCustomerType: {
    new: number
    returning: number
  }
}

interface UserMetricsChartProps {
  isLoading: boolean
  data?: UserData[]
}

export function UserMetricsChart({ isLoading, data }: UserMetricsChartProps) {
  const [userMetricView, setUserMetricView] = useState<"revenue" | "orders">(
    "revenue"
  )

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group mb="md" justify="space-between">
        <Group>
          <IconChartBar size={20} />
          <Text fw={600}>Chỉ số theo nhân viên</Text>
        </Group>
        <SegmentedControl
          value={userMetricView}
          onChange={(value) => setUserMetricView(value as "revenue" | "orders")}
          data={[
            { label: "Theo doanh thu", value: "revenue" },
            { label: "Theo số đơn", value: "orders" }
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
            data={data.map((u) => ({
              userName: u.userName,
              new:
                userMetricView === "revenue"
                  ? u.revenueByCustomerType.new
                  : u.ordersByCustomerType.new,
              returning:
                userMetricView === "revenue"
                  ? u.revenueByCustomerType.returning
                  : u.ordersByCustomerType.returning
            }))}
            dataKey="userName"
            series={[
              {
                name: "new",
                label: "Khách mới",
                color: "blue.6"
              },
              {
                name: "returning",
                label: "Khách quay lại",
                color: "teal.6"
              }
            ]}
            orientation="horizontal"
            tickLine="x"
            withLegend
            withYAxis
            yAxisProps={{ width: 100 }}
            styles={{
              legend: {
                display: "flex",
                gap: "16px",
                border: "2px solid #eee",
                padding: "8px",
                borderRadius: "8px"
              }
            }}
            legendProps={{
              layout: "horizontal",
              align: "center",
              verticalAlign: "bottom",
              wrapperStyle: {
                paddingTop: 18,
                paddingLeft: 36,
                display: "flex",
                flexDirection: "row",
                justifyContent: "left",
                gap: 24
              }
            }}
            m={{ top: 0, right: 0, bottom: 32, left: 0 }}
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
                      {payload.map((entry: any, index: number) => (
                        <Group key={index} gap="xs">
                          <Box
                            w={12}
                            h={12}
                            style={{
                              backgroundColor: entry.color,
                              borderRadius: 2
                            }}
                          />
                          <Text size="sm">
                            {entry.name === "new"
                              ? "Khách mới"
                              : "Khách quay lại"}
                            :
                          </Text>
                          <Text size="sm" fw={600}>
                            {userMetricView === "revenue"
                              ? `${entry.value.toLocaleString("vi-VN")}đ`
                              : entry.value}
                          </Text>
                        </Group>
                      ))}
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
