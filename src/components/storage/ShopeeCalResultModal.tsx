import {
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  rem
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { IconCalendarPlus } from "@tabler/icons-react"
import { useDisclosure } from "@mantine/hooks"
import { useDailyLogs } from "../../hooks/useDailyLogs"
import { useLivestreamChannels } from "../../hooks/useLivestreamChannels"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { CToast } from "../common/CToast"
import { CalOrdersV2 } from "../cal/CalOrdersV2"

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
  allowSaveLog?: boolean
  modalTitle?: string
  modalSubtitle?: string
}

export const ShopeeCalResultModal = ({
  items,
  orders,
  readOnly,
  date,
  allowSaveLog = true,
  modalTitle = "Kết quả tính toán gần nhất",
  modalSubtitle = "Kiểm tra mặt hàng tổng hợp và tiến hành đóng đơn theo danh sách đã chọn."
}: Props) => {
  const [saveLogDiv, { toggle }] = useDisclosure(false)
  const [selectionStats, setSelectionStats] = useState({
    selectedOrders: 0,
    requiredItemTypes: 0,
    missingItemTypes: 0
  })
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    new Date(new Date().setHours(0, 0, 0, 0))
  )
  const [channelId, setChannelId] = useState<string | null>(null)

  const totalOrders = useMemo(
    () => orders.reduce((sum, order) => sum + order.quantity, 0),
    [orders]
  )
  const totalItemTypes = items.length

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

  useEffect(() => {
    if (channelId) return
    if (channelOptions.length > 0) {
      setChannelId(channelOptions[0].value)
    }
  }, [channelId, channelOptions])

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
      px={{ base: 4, md: 8 }}
      pt={6}
      pb={0}
      style={{
        background: "linear-gradient(180deg, #fffdf9 0%, #ffffff 100%)",
        borderRadius: rem(18),
        minWidth: 320,
        maxWidth: "100%",
        margin: "0 auto",
        border: "1px solid rgba(15, 23, 42, 0.08)"
      }}
    >
      <Paper
        withBorder
        radius="lg"
        p="md"
        mb={12}
        style={{ borderColor: "rgba(15, 23, 42, 0.08)" }}
      >
        <Text fw={700} fz="lg" mb={2}>
          {modalTitle}
        </Text>
        <Text c="dimmed" fz="sm">
          {modalSubtitle}
        </Text>
      </Paper>

      <Paper
        withBorder
        radius="lg"
        p={10}
        mb={12}
        style={{ borderColor: "rgba(15, 23, 42, 0.08)" }}
      >
        <Group gap={8} wrap="wrap">
          <Badge variant="light" color="orange">
            Tổng đơn: {totalOrders}
          </Badge>
          <Badge
            variant="light"
            color={selectionStats.selectedOrders ? "blue" : "gray"}
          >
            Đã chọn: {selectionStats.selectedOrders}
          </Badge>
          <Badge variant="light" color="grape">
            Số loại mặt hàng: {totalItemTypes}
          </Badge>
          {selectionStats.missingItemTypes > 0 && (
            <Badge variant="light" color="yellow">
              Còn thiếu: {selectionStats.missingItemTypes}
            </Badge>
          )}
          {selectionStats.requiredItemTypes > 0 && (
            <Badge variant="outline" color="orange">
              Đang cần dùng: {selectionStats.requiredItemTypes}
            </Badge>
          )}
        </Group>
      </Paper>

      <CalOrdersV2
        orders={orders.map((order) => ({
          quantity: order.quantity,
          products: order.products.map((product) => ({
            name: product.sku || product.name || "",
            quantity: product.quantity
          }))
        }))}
        allCalItems={items.map((item) => ({
          _id: item._id,
          quantity: item.quantity
        }))}
        date={date}
        platform="shopee"
        channelId={channelId || undefined}
        enableBulkTableSelection
        onSelectionStatsChange={setSelectionStats}
      />

      {!readOnly && allowSaveLog && (
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
