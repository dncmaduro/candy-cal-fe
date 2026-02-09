import { useMemo } from "react"
import { Box, Grid } from "@mantine/core"
import { RevenueKPICards } from "./RevenueKPICards"
import { ChannelMetricsChart } from "./ChannelMetricsChart"
import { TopProductsChart } from "./TopProductsChart"
import { UserMetricsChart } from "./UserMetricsChart"
import { RevenueTables } from "./RevenueTables"

interface RevenueData {
  totalRevenue: number
  totalRevenueBeforeDiscount: number
  totalOrders: number
  revenueFromNewCustomers: number
  revenueFromReturningCustomers: number
  topItemsByRevenue: Array<{ code: string; name: string; revenue: number }>
  topItemsByQuantity: Array<{ code: string; name: string; quantity: number }>
  otherItemsRevenue: number
  revenueByChannel: Array<{
    channelId: string
    channelName: string
    revenue: number
    orderCount: number
  }>
  revenueByUser: Array<{
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
  }>
}

interface RevenueSectionProps {
  isLoading: boolean
  data?: RevenueData
}

export function RevenueSection({ isLoading, data }: RevenueSectionProps) {
  const topItemsView = "revenue" // Default, can be extracted to parent if needed

  const filteredItems = useMemo(() => {
    const itemsSource =
      topItemsView === "revenue"
        ? data?.topItemsByRevenue
        : data?.topItemsByQuantity

    if (!itemsSource) return []
    return itemsSource
  }, [data?.topItemsByRevenue, data?.topItemsByQuantity, topItemsView])

  return (
    <Box>
      {/* KPI Cards */}
      <RevenueKPICards
        isLoading={isLoading}
        totalRevenue={data?.totalRevenue}
        totalRevenueBeforeDiscount={data?.totalRevenueBeforeDiscount}
        totalOrders={data?.totalOrders}
        revenueFromNewCustomers={data?.revenueFromNewCustomers}
        revenueFromReturningCustomers={data?.revenueFromReturningCustomers}
      />

      {/* Charts */}
      <Grid gutter="md" mb="xl">
        {/* Channel Metrics */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <ChannelMetricsChart
            isLoading={isLoading}
            data={data?.revenueByChannel}
          />
        </Grid.Col>

        {/* Top Products */}
        <Grid.Col span={{ base: 12 }}>
          <TopProductsChart
            isLoading={isLoading}
            topItemsByRevenue={data?.topItemsByRevenue}
            topItemsByQuantity={data?.topItemsByQuantity}
            otherItemsRevenue={data?.otherItemsRevenue}
          />
        </Grid.Col>

        {/* User Metrics */}
        <Grid.Col span={{ base: 12 }}>
          <UserMetricsChart isLoading={isLoading} data={data?.revenueByUser} />
        </Grid.Col>
      </Grid>

      {/* Tables */}
      <RevenueTables
        isLoading={isLoading}
        items={filteredItems}
        channels={data?.revenueByChannel}
        users={data?.revenueByUser}
      />
    </Box>
  )
}
