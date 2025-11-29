import { createFileRoute } from "@tanstack/react-router"
import {
  Box,
  rem,
  Text,
  Paper,
  Grid,
  Stack,
  Divider,
  Badge,
  Loader,
  Flex
} from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { useSalesDailyReports } from "../../../hooks/useSalesDailyReports"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { IconChartBar } from "@tabler/icons-react"

export const Route = createFileRoute("/sales/dashboard/$kpiId")({
  component: RouteComponent
})

function RouteComponent() {
  const { kpiId } = Route.useParams()
  const { getMonthKpiDetail } = useSalesDailyReports()

  const { data: kpiData, isLoading } = useQuery({
    queryKey: ["monthKpiDetail", kpiId],
    queryFn: () => getMonthKpiDetail({ id: kpiId }),
    select: (data) => data.data
  })

  const channel = kpiData?.channel

  if (isLoading) {
    return (
      <SalesLayout>
        <Box
          mt={40}
          mx="auto"
          px={{ base: 8, md: 0 }}
          w="100%"
          style={{
            background: "rgba(255,255,255,0.97)",
            borderRadius: rem(20),
            boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
            border: "1px solid #ececec"
          }}
        >
          <Flex justify="center" align="center" h={400}>
            <Loader size="lg" />
          </Flex>
        </Box>
      </SalesLayout>
    )
  }

  if (!kpiData) {
    return (
      <SalesLayout>
        <Box
          mt={40}
          mx="auto"
          px={{ base: 8, md: 0 }}
          w="100%"
          style={{
            background: "rgba(255,255,255,0.97)",
            borderRadius: rem(20),
            boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
            border: "1px solid #ececec"
          }}
        >
          <Box p={40}>
            <Text c="dimmed" ta="center">
              Không tìm thấy KPI
            </Text>
          </Box>
        </Box>
      </SalesLayout>
    )
  }

  return (
    <SalesLayout>
      <Box
        mt={40}
        mx="auto"
        px={{ base: 8, md: 0 }}
        w="100%"
        style={{
          background: "rgba(255,255,255,0.97)",
          borderRadius: rem(20),
          boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
          border: "1px solid #ececec"
        }}
      >
        {/* Header */}
        <Box
          pt={32}
          pb={16}
          px={{ base: 8, md: 28 }}
          style={{
            background:
              "linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.05) 100%)",
            borderTopLeftRadius: rem(20),
            borderTopRightRadius: rem(20)
          }}
        >
          <Flex align="center" gap={16}>
            <Box
              style={{
                background: "linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)",
                borderRadius: rem(12),
                padding: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <IconChartBar size={28} color="white" />
            </Box>
            <Box>
              <Text fw={700} fz="xl" mb={2}>
                Chi tiết KPI - Tháng {kpiData.month}/{kpiData.year}
              </Text>
              <Text c="dimmed" fz="sm">
                {channel?.channelName || "Kênh không xác định"}
              </Text>
            </Box>
          </Flex>
        </Box>

        <Divider />

        {/* Content */}
        <Box px={{ base: 8, md: 28 }} py={32}>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="lg" withBorder>
                <Stack gap="md">
                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Tháng
                    </Text>
                    <Badge size="lg" variant="light" color="blue">
                      Tháng {kpiData.month}
                    </Badge>
                  </div>

                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Năm
                    </Text>
                    <Badge size="lg" variant="light" color="cyan">
                      {kpiData.year}
                    </Badge>
                  </div>

                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Kênh bán hàng
                    </Text>
                    <Text fw={500}>
                      {channel?.channelName || "Không xác định"}
                    </Text>
                  </div>

                  <Divider my="xs" />

                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Mục tiêu KPI
                    </Text>
                    <Text fw={700} fz="xl" c="blue">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND"
                      }).format(kpiData.kpi)}
                    </Text>
                  </div>
                </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="lg" withBorder>
                <Text fw={600} mb="md">
                  Thông tin bổ sung
                </Text>
                <Text c="dimmed" size="sm">
                  Tại đây bạn có thể thêm các thông tin chi tiết khác về KPI này
                  như: biểu đồ theo dõi tiến độ, doanh số thực tế, tỷ lệ hoàn
                  thành, v.v.
                </Text>
              </Paper>
            </Grid.Col>
          </Grid>
        </Box>
      </Box>
    </SalesLayout>
  )
}
