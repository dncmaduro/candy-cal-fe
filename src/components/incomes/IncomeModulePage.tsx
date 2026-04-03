import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
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
import {
  IconBrandYoutube,
  IconShoppingBag
} from "@tabler/icons-react"
import { Helmet } from "react-helmet-async"
import { AppLayout } from "../layouts/AppLayout"
import { useAuthGuard } from "../../hooks/useAuthGuard"
import { useLivestreamChannels } from "../../hooks/useLivestreamChannels"
import { LivestreamChannelProvider } from "../../context/LivestreamChannelContext"
import { Dashboard } from "./Dashboard"
import { RangeStats } from "./RangeStats"
import { Incomes } from "./Incomes"
import { MonthGoals } from "./MonthGoals"
import { PackingRules } from "./PackingRules"
import { ShopeeDashboard } from "./ShopeeDashboard"
import { ShopeeIncomes } from "./ShopeeIncomes"
import type { AppNavItem } from "../../constants/navs"

type IncomePlatformScope = "all" | "tiktokshop" | "shopee"

type IncomeChannel = {
  _id: string
  name: string
  username: string
  platform: string
  link: string
}

type Props = {
  roles: string[]
  navs: AppNavItem[]
  basePath: string
  tab: string
  channel?: string
  incomeDetailRoute?: string
  scope?: IncomePlatformScope
}

const filterChannelsByScope = (
  channels: IncomeChannel[],
  scope: IncomePlatformScope
) => {
  if (scope === "shopee") {
    return channels.filter((item) => item.platform === "shopee")
  }

  if (scope === "tiktokshop") {
    return channels.filter((item) => item.platform !== "shopee")
  }

  return channels
}

export const IncomeModulePage = ({
  roles,
  navs,
  basePath,
  tab,
  channel,
  incomeDetailRoute,
  scope = "all"
}: Props) => {
  useAuthGuard(roles)

  const navigate = useNavigate()
  const { searchLivestreamChannels } = useLivestreamChannels()

  const [channels, setChannels] = useState<IncomeChannel[]>([])
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

  const scopeTitle = useMemo(() => {
    switch (scope) {
      case "shopee":
        return {
          title: "Các kênh Shopee",
          subtitle: "Chọn kênh Shopee để xem thống kê",
          emptyText: "Không có kênh Shopee nào",
          icon: <IconShoppingBag size={20} />
        }
      case "tiktokshop":
        return {
          title: "Các kênh Tiktok Shop",
          subtitle: "Chọn kênh Tiktok Shop để xem thống kê",
          emptyText: "Không có kênh Tiktok Shop nào",
          icon: <IconBrandYoutube size={20} />
        }
      default:
        return {
          title: "Các kênh bán hàng",
          subtitle: "Chọn kênh để xem thống kê",
          emptyText: "Không có kênh bán hàng nào",
          icon: <IconBrandYoutube size={20} />
        }
    }
  }, [scope])

  useEffect(() => {
    const loadChannels = async () => {
      try {
        setIsLoadingChannels(true)
        const response = await searchLivestreamChannels({
          page: 1,
          limit: 100
        })
        const filteredChannels = filterChannelsByScope(
          response.data.data,
          scope
        )

        setChannels(filteredChannels)

        const hasRequestedChannel = channel
          ? filteredChannels.some((item) => item._id === channel)
          : false

        const nextSelectedChannelId = hasRequestedChannel
          ? channel!
          : filteredChannels[0]?._id ?? null

        setSelectedChannelId(nextSelectedChannelId)

        if (
          nextSelectedChannelId !== (channel ?? null) ||
          !tab ||
          tab.length === 0
        ) {
          navigate({
            to: basePath,
            search: {
              channel: nextSelectedChannelId ?? undefined,
              tab: tab || "dashboard"
            },
            replace: true
          })
        }
      } catch (error) {
        console.error("Failed to load channels:", error)
      } finally {
        setIsLoadingChannels(false)
      }
    }

    loadChannels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath, channel, scope, tab])

  const handleTabChange = (value: string | null) => {
    navigate({
      to: basePath,
      search: {
        channel: selectedChannelId ?? undefined,
        tab: value ?? "dashboard"
      }
    })
  }

  const handleChannelChange = (value: string) => {
    setSelectedChannelId(value)
    navigate({
      to: basePath,
      search: { channel: value, tab }
    })
  }

  const currentChannel = channels.find((item) => item._id === selectedChannelId)

  return (
    <>
      <Helmet>
        <title>{`Bán hàng - ${tab === "dashboard" ? "Dashboard" : tab === "kpi" ? "KPI Tháng" : tab === "packing-rules" ? "Quy cách đóng hộp" : "Doanh thu"} | MyCandy`}</title>
      </Helmet>
      <AppLayout navs={navs}>
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
              <Text c="dimmed">{scopeTitle.emptyText}</Text>
            </Box>
          ) : (
            <Stack gap="md" mt={16}>
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
                    {scopeTitle.icon}
                  </ThemeIcon>
                  <Box>
                    <Text size="sm" fw={700} c="white" opacity={0.9}>
                      {scopeTitle.title}
                    </Text>
                    <Text size="xs" c="white" opacity={0.7}>
                      {scopeTitle.subtitle}
                    </Text>
                  </Box>
                </Group>
                <SegmentedControl
                  value={selectedChannelId ?? ""}
                  onChange={handleChannelChange}
                  data={channels.map((item) => ({
                    label: item.name,
                    value: item._id
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

              <Tabs
                orientation="horizontal"
                value={tab}
                onChange={handleTabChange}
                h={"80vh"}
              >
                <Tabs.List>
                  {tabOptions.map((item) => (
                    <Tabs.Tab value={item.value} key={item.value}>
                      {item.label}
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
                      <Incomes incomeDetailRoute={incomeDetailRoute} />
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
