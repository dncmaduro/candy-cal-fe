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

const cardStyle = {
  border: "1px solid #E5E7EB",
  borderRadius: rem(14),
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
  background: "#fff"
}

export function UserMetricsChart({ isLoading, data }: UserMetricsChartProps) {
  const [userMetricView, setUserMetricView] = useState<"revenue" | "orders">(
    "revenue"
  )

  return (
    <Card padding="md" style={cardStyle}>
      <Group mb="sm" justify="space-between" wrap="wrap" gap={10}>
        <Group gap="xs">
          <IconChartBar size={18} />
          <Text fw={600}>Chỉ số theo nhân viên</Text>
        </Group>
        <SegmentedControl
          size="xs"
          radius="md"
          value={userMetricView}
          onChange={(value) => setUserMetricView(value as "revenue" | "orders")}
          data={[
            { label: "Theo doanh thu", value: "revenue" },
            { label: "Theo số đơn", value: "orders" }
          ]}
        />
      </Group>

      {isLoading ? (
        <Skeleton height={220} />
      ) : data && data.length > 0 ? (
        <Box>
          <BarChart
            h={220}
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
              { name: "new", label: "Khách mới", color: "blue.6" },
              { name: "returning", label: "Khách quay lại", color: "teal.6" }
            ]}
            orientation="horizontal"
            tickLine="x"
            withLegend
            withYAxis
            yAxisProps={{ width: 96 }}
            legendProps={{
              layout: "horizontal",
              align: "left",
              verticalAlign: "bottom",
              wrapperStyle: {
                paddingTop: 10,
                display: "flex",
                gap: 16,
                flexWrap: "wrap"
              }
            }}
            m={{ top: 0, right: 0, bottom: 24, left: 0 }}
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
                            {entry.name === "new" ? "Khách mới" : "Khách quay lại"}:
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
