import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { useEffect, useState } from "react"
import { AppLayout } from "../../../components/layouts/AppLayout"
import {
  Tabs,
  ScrollArea,
  SegmentedControl,
  Stack,
  Loader,
  Text,
  Box,
  Paper,
  Group,
  ThemeIcon
} from "@mantine/core"
import { IconBrandYoutube } from "@tabler/icons-react"
import { NAVS_URL } from "../../../constants/navs"
import { Incomes } from "../../../components/incomes/Incomes"
import { Dashboard } from "../../../components/incomes/Dashboard"
import { Helmet } from "react-helmet-async"
import { MonthGoals } from "../../../components/incomes/MonthGoals"
import { PackingRules } from "../../../components/incomes/PackingRules"
import { RangeStats } from "../../../components/incomes/RangeStats"
import { useLivestreamChannels } from "../../../hooks/useLivestreamChannels"
import { LivestreamChannelProvider } from "../../../context/LivestreamChannelContext"
import { ShopeeDashboard } from "../../../components/incomes/ShopeeDashboard"
import { ShopeeIncomes } from "../../../components/incomes/ShopeeIncomes"

type Subtab = {
  tab: string
  channel?: string
}

export const Route = createFileRoute("/marketing-storage/incomes/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): Subtab => {
    return {
      tab: String(search.tab ?? "dashboard"),
      channel: search.channel ? String(search.channel) : undefined
    }
  }
})

function RouteComponent() {
  useAuthGuard(["admin", "accounting-emp", "order-emp", "system-emp"])
  const { tab, channel } = Route.useSearch()
  const navigate = useNavigate()
  const { searchLivestreamChannels } = useLivestreamChannels()

  const [channels, setChannels] = useState<
    Array<{
      _id: string
      name: string
      username: string
      platform: string
      link: string
    }>
  >([])
  const [isLoadingChannels, setIsLoadingChannels] = useState(true)
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    channel ?? null
  )

  const tabOptions = [
    {
      label: "Dashboard tháng hiện tại",
      value: "dashboard"
    },
    {
      label: "Chỉ số ngày/tuần/tháng",
      value: "daily-stats"
    },
    {
      label: "Báo cáo doanh số",
      value: "incomes"
    },
    {
      label: "KPI tháng",
      value: "kpi"
    },
    {
      label: "Quy cách đóng hộp",
      value: "packing-rules"
    }
  ]

  // Load channels
  useEffect(() => {
    const loadChannels = async () => {
      try {
        setIsLoadingChannels(true)
        const response = await searchLivestreamChannels({
          page: 1,
          limit: 100
        })
        const channelsList = response.data.data
        setChannels(channelsList)

        // Auto-select first channel if no channel param
        if (!channel && channelsList.length > 0) {
          const firstChannelId = channelsList[0]._id
          setSelectedChannelId(firstChannelId)
          navigate({
            to: `${NAVS_URL}/incomes`,
            search: { channel: firstChannelId, tab: tab ?? "dashboard" },
            replace: true
          })
        } else if (channel) {
          setSelectedChannelId(channel)
        }
      } catch (error) {
        console.error("Failed to load channels:", error)
      } finally {
        setIsLoadingChannels(false)
      }
    }

    loadChannels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTabChange = (value: string | null) => {
    navigate({
      to: `${NAVS_URL}/incomes`,
      search: {
        channel: selectedChannelId ?? undefined,
        tab: value ?? "dashboard"
      }
    })
  }

  const handleChannelChange = (value: string) => {
    setSelectedChannelId(value)
    navigate({
      to: `${NAVS_URL}/incomes`,
      search: { channel: value, tab } // Reset to dashboard when changing channel
    })
  }

  const currentChannel = channels.find((c) => c._id === selectedChannelId)

  return (
    <>
      <Helmet>
        <title>{`Bán hàng - ${tab === "dashboard" ? "Dashboard" : tab === "kpi" ? "KPI Tháng" : tab === "packing-rules" ? "Quy cách đóng hộp" : "Doanh thu"} | MyCandy`}</title>
      </Helmet>
      <AppLayout>
        <LivestreamChannelProvider
          value={{
            selectedChannelId,
            channels,
            isLoading: isLoadingChannels
          }}
        >
          {isLoadingChannels ? (
            <Box
              mt={16}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh"
              }}
            >
              <Stack align="center" gap="md">
                <Loader size="lg" />
                <Text>Đang tải danh sách kênh...</Text>
              </Stack>
            </Box>
          ) : channels.length === 0 ? (
            <Box
              mt={16}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh"
              }}
            >
              <Text c="dimmed">Không có kênh livestream nào</Text>
            </Box>
          ) : (
            <Stack gap="md" mt={16}>
              {/* Channel Selector */}
              <Paper
                shadow="sm"
                p="lg"
                radius="md"
                withBorder
                style={{
                  background:
                    "linear-gradient(135deg, #8592cbff 0%, #cba3f2ff 100%)",
                  borderColor: "#96a1d1ff"
                }}
              >
                <Group gap="sm" mb="md">
                  <ThemeIcon
                    size="lg"
                    radius="md"
                    variant="white"
                    color="grape"
                  >
                    <IconBrandYoutube size={20} />
                  </ThemeIcon>
                  <Box>
                    <Text size="sm" fw={700} c="white" opacity={0.9}>
                      Các kênh TTS
                    </Text>
                    <Text size="xs" c="white" opacity={0.7}>
                      Chọn kênh để xem thống kê
                    </Text>
                  </Box>
                </Group>
                <SegmentedControl
                  value={selectedChannelId ?? ""}
                  onChange={handleChannelChange}
                  data={channels.map((ch) => ({
                    label: ch.name,
                    value: ch._id
                  }))}
                  fullWidth
                  size="md"
                  color="violet.4"
                  styles={{
                    root: {
                      background: "rgba(255, 255, 255, 0.95)",
                      padding: "4px"
                    },
                    label: {
                      padding: "10px 20px",
                      fontWeight: 600
                    }
                  }}
                />
              </Paper>

              {/* Tabs */}
              <Tabs
                orientation="horizontal"
                value={tab}
                onChange={handleTabChange}
                h={"80vh"}
              >
                <Tabs.List>
                  {tabOptions.map((tabOption) => (
                    <Tabs.Tab value={tabOption.value} key={tabOption.value}>
                      {tabOption.label}
                    </Tabs.Tab>
                  ))}
                </Tabs.List>

                <ScrollArea.Autosize mah={"95%"} className="panels-scroll-area">
                  <Tabs.Panel value="dashboard">
                    {currentChannel?.platform === "shopee" ? (
                      <ShopeeDashboard />
                    ) : (
                      <Dashboard />
                    )}
                  </Tabs.Panel>

                  <Tabs.Panel value="daily-stats">
                    <RangeStats />
                  </Tabs.Panel>

                  <Tabs.Panel value="incomes">
                    {currentChannel?.platform === "shopee" ? (
                      <ShopeeIncomes />
                    ) : (
                      <Incomes />
                    )}
                  </Tabs.Panel>

                  <Tabs.Panel value="kpi">
                    <MonthGoals />
                  </Tabs.Panel>

                  <Tabs.Panel value="packing-rules">
                    <PackingRules />
                  </Tabs.Panel>
                </ScrollArea.Autosize>
              </Tabs>
            </Stack>
          )}
        </LivestreamChannelProvider>
      </AppLayout>
    </>
  )
}
