import { Box, Center, Loader, Text, Paper, Stack } from "@mantine/core"
import { BarChart } from "@mantine/charts"
import { GetHostRevenueRankingsResponse } from "../../hooks/models"

interface HostRevenueRankingsChartProps {
  isLoadingRankings: boolean
  rankingsData?: GetHostRevenueRankingsResponse | null
}

export const HostRevenueRankingsChart = ({
  isLoadingRankings,
  rankingsData
}: HostRevenueRankingsChartProps) => {
  return (
    <Box>
      {isLoadingRankings ? (
        <Center h={400}>
          <Loader />
        </Center>
      ) : !rankingsData || rankingsData.rankings.length === 0 ? (
        <Center h={400}>
          <Text c="dimmed">Không có dữ liệu xếp hạng</Text>
        </Center>
      ) : (
        <Paper p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Text size="lg" fw={600}>
              Xếp hạng Host theo Doanh thu
            </Text>
            <BarChart
              h={Math.max(400, rankingsData.rankings.length * 60)}
              data={rankingsData.rankings.map((r) => ({
                hostName: r.hostName,
                "Doanh thu": r.totalRevenue,
                "Chi phí Ads": r.totalAdsCost
              }))}
              dataKey="hostName"
              series={[
                {
                  name: "Doanh thu",
                  color: "blue.6"
                },
                {
                  name: "Chi phí Ads",
                  color: "red.6"
                }
              ]}
              orientation="horizontal"
              yAxisProps={{ width: 120 }}
              valueFormatter={(value) =>
                new Intl.NumberFormat("vi-VN").format(value)
              }
            />
          </Stack>
        </Paper>
      )}
    </Box>
  )
}
