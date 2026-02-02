import {
  Box,
  Button,
  Collapse,
  Divider,
  Group,
  Select,
  Stack,
  Tabs,
  rem
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { ShopeeCalOrders } from "./ShopeeCalOrders"
import {
  IconBox,
  IconClipboardList,
  IconCalendarPlus
} from "@tabler/icons-react"
import { useDisclosure } from "@mantine/hooks"
import { ShopeeCalItems } from "./ShopeeCalItems"
import { useDailyLogs } from "../../hooks/useDailyLogs"
import { useLivestreamChannels } from "../../hooks/useLivestreamChannels"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { CToast } from "../common/CToast"

interface Props {
  items: {
    _id: string
    name: string
    quantity: number
    storageItem: {
      code: string
      name: string
      receivedQuantity: {
        quantity: number
        real: number
      }
      deliveredQuantity: {
        quantity: number
        real: number
      }
      restQuantity: {
        quantity: number
        real: number
      }
      note?: string
    } | null
  }[]
  orders: {
    products: {
      sku: string
      name?: string
      quantity: number
    }[]
    quantity: number
  }[]
  readOnly?: boolean
  date?: Date
}

export const ShopeeCalResultModal = ({
  items,
  orders,
  readOnly,
  date
}: Props) => {
  const [saveLogDiv, { toggle }] = useDisclosure(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    new Date(new Date().setHours(0, 0, 0, 0))
  )
  const [channelId, setChannelId] = useState<string | null>(null)

  const { createDailyLog } = useDailyLogs()
  const { searchLivestreamChannels } = useLivestreamChannels()

  const { mutate: createDaily, isPending: isCreatingDaily } = useMutation({
    mutationFn: createDailyLog,
    onSuccess: () => {
      CToast.success({
        title: "Lưu log hàng ngày thành công"
      })
    },
    onError: () => {
      CToast.error({
        title: "Lưu log hàng ngày thất bại"
      })
    }
  })

  const { data: channelsData, isLoading: isLoadingChannels } = useQuery({
    queryKey: ["searchLivestreamChannels", "all"],
    queryFn: () => searchLivestreamChannels({ page: 1, limit: 200 }),
    select: (res) => res.data.data ?? [],
    refetchOnWindowFocus: false
  })

  const channelOptions = useMemo(
    () =>
      (channelsData ?? [])
        .slice()
        .filter((c) => c.platform === "shopee")
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((ch) => ({
          value: ch._id,
          label: ch.name
        })),
    [channelsData]
  )

  const handleSave = () => {
    if (!channelId) {
      CToast.error({ title: "Vui lòng chọn kênh" })
      return
    }

    const dailyItems = items.map((item) => ({
      _id: item._id,
      quantity: item.quantity,
      storageItems: item.storageItem ? [item.storageItem] : []
    }))

    const dailyOrders = orders.map((order) => ({
      quantity: order.quantity,
      products: order.products.map((p) => ({
        name: p.sku,
        quantity: p.quantity
      }))
    }))

    createDaily({
      date: selectedDate as Date,
      items: dailyItems,
      orders: dailyOrders,
      channelId: channelId
    })
  }

  return (
    <Box
      px={{ base: 0, md: 8 }}
      pt={10}
      pb={0}
      style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: rem(16),
        minWidth: 320,
        maxWidth: "100%",
        margin: "0 auto"
      }}
    >
      <Tabs
        defaultValue="items"
        variant="pills"
        color="orange"
        radius="xl"
        keepMounted={false}
      >
        <Tabs.List mb={8} justify="flex-start" style={{ gap: 12 }}>
          <Tabs.Tab
            value="items"
            leftSection={<IconBox size={17} />}
            fw={600}
            fz="sm"
            px={18}
            style={{ letterSpacing: 0.1 }}
          >
            Mặt hàng
          </Tabs.Tab>
          <Tabs.Tab
            value="orders"
            leftSection={<IconClipboardList size={17} />}
            fw={600}
            fz="sm"
            px={18}
            style={{ letterSpacing: 0.1 }}
          >
            Đóng đơn
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="items" className="p-3">
          <ShopeeCalItems items={items} />
        </Tabs.Panel>

        <Tabs.Panel
          value="orders"
          className="mx-2 mb-4 rounded-xl border border-gray-100 p-4 shadow-sm"
        >
          <ShopeeCalOrders orders={orders} allCalItems={items} date={date} />
        </Tabs.Panel>
      </Tabs>

      {!readOnly && (
        <>
          <Divider mt={24} mb={20} label={"Lưu lịch sử Shopee"} />
          <Stack gap={16} px={4}>
            <Button
              color="orange"
              variant="outline"
              size="md"
              radius="xl"
              fw={600}
              px={22}
              onClick={() => {
                toggle()
              }}
              leftSection={<IconCalendarPlus size={16} />}
            >
              Lưu log Shopee
            </Button>
            <Collapse in={saveLogDiv}>
              <Stack>
                <Group align="flex-end">
                  <DatePickerInput
                    size="md"
                    radius={"md"}
                    label="Chọn ngày"
                    value={selectedDate}
                    w={150}
                    valueFormat="DD/MM/YYYY"
                    onChange={setSelectedDate}
                  />
                  <Select
                    data={channelOptions}
                    size="md"
                    radius={"md"}
                    label="Chọn kênh"
                    placeholder="Chọn kênh"
                    value={channelId}
                    onChange={setChannelId}
                    w={220}
                    searchable
                    clearable
                    disabled={isLoadingChannels}
                    nothingFoundMessage="Không có kênh"
                  />
                  <Button
                    color="orange"
                    size="md"
                    radius="xl"
                    fw={600}
                    px={22}
                    onClick={handleSave}
                    leftSection={<IconCalendarPlus size={16} />}
                    loading={isCreatingDaily}
                    disabled={isCreatingDaily || !channelId}
                  >
                    Lưu log
                  </Button>
                </Group>
              </Stack>
            </Collapse>
          </Stack>
        </>
      )}
    </Box>
  )
}
