import { useQuery } from "@tanstack/react-query"
import { useItems } from "../../hooks/useItems"
import {
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  Group,
  Paper,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  rem
} from "@mantine/core"
import { SearchStorageItemResponse } from "../../hooks/models"
import {
  IconBox,
  IconChecklist,
  IconCalendarPlus
} from "@tabler/icons-react"
import { useDisclosure } from "@mantine/hooks"
import { SaveLogDiv } from "./SaveLogDiv"
import { CalItemsV2 } from "./CalItemsV2"
import { CalOrdersV2 } from "./CalOrdersV2"
import { useMemo, useState } from "react"

interface Props {
  items: {
    _id: string
    quantity: number
    storageItems: {
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
    }[]
  }[]
  orders: {
    products: {
      name: string
      quantity: number
    }[]
    quantity: number
  }[]
  readOnly?: boolean
  date?: Date
  platform?: string
  channelId?: string
  allowSaveLog?: boolean
  modalTitle?: string
  modalSubtitle?: string
}

export const CalFileResultModal = ({
  items,
  orders,
  readOnly,
  date,
  platform,
  channelId,
  allowSaveLog = true,
  modalTitle = "Kết quả tính toán gần nhất",
  modalSubtitle = "Kiểm tra mặt hàng tổng hợp và tiến hành đóng đơn theo danh sách đã chọn."
}: Props) => {
  const { searchStorageItems } = useItems()
  const [saveLogDiv, { toggle }] = useDisclosure(false)
  const [activeTab, setActiveTab] = useState<string | null>("items")
  const [selectionStats, setSelectionStats] = useState({
    selectedOrders: 0,
    requiredItemTypes: 0,
    missingItemTypes: 0
  })

  const totalOrders = useMemo(
    () => orders.reduce((sum, order) => sum + order.quantity, 0),
    [orders]
  )
  const totalItemTypes = items.length

  const { data: allItems } = useQuery({
    queryKey: ["searchStorageItems"],
    queryFn: () => searchStorageItems({ searchText: "", deleted: false }),
    select: (data) =>
      data.data.reduce(
        (acc, item) => ({ ...acc, [item._id]: item }),
        {} as Record<string, SearchStorageItemResponse>
      )
  })

  return (
    <Box
      px={{ base: 4, md: 8 }}
      pt={6}
      pb={0}
      style={{
        background: "linear-gradient(180deg, #fcfcfd 0%, #ffffff 100%)",
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
        <Group justify="space-between" align="start" wrap="nowrap">
          <Box style={{ minWidth: 0 }}>
            <Text fw={700} fz="lg" mb={2}>
              {modalTitle}
            </Text>
            <Text c="dimmed" fz="sm">
              {modalSubtitle}
            </Text>
          </Box>
        </Group>
      </Paper>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        variant="pills"
        color="indigo"
        radius="xl"
        keepMounted={false}
      >
        <Tabs.List
          mb={10}
          grow
          style={{
            gap: 8,
            background: "rgba(99, 102, 241, 0.08)",
            padding: 6,
            borderRadius: rem(12)
          }}
        >
          <Tabs.Tab
            value="items"
            leftSection={
              <ThemeIcon size={22} radius="xl" variant="light" color="indigo">
                <IconBox size={13} />
              </ThemeIcon>
            }
            fw={700}
            fz="sm"
            px={14}
          >
            Bước 1: Mặt hàng
          </Tabs.Tab>
          <Tabs.Tab
            value="orders"
            leftSection={
              <ThemeIcon size={22} radius="xl" variant="light" color="indigo">
                <IconChecklist size={13} />
              </ThemeIcon>
            }
            fw={700}
            fz="sm"
            px={14}
          >
            Bước 2: Đóng đơn
          </Tabs.Tab>
        </Tabs.List>

        <Paper
          withBorder
          radius="lg"
          p={10}
          mb={12}
          style={{ borderColor: "rgba(15, 23, 42, 0.08)" }}
        >
          <Group gap={8} wrap="wrap">
            <Badge variant="light" color="indigo">
              Tổng đơn: {totalOrders}
            </Badge>
            <Badge variant="light" color={selectionStats.selectedOrders ? "blue" : "gray"}>
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
            {activeTab === "orders" && selectionStats.requiredItemTypes > 0 && (
              <Badge variant="outline" color="indigo">
                Đang cần dùng: {selectionStats.requiredItemTypes}
              </Badge>
            )}
          </Group>
        </Paper>

        <Tabs.Panel value="items">
          <CalItemsV2 allItems={allItems} items={items} />
        </Tabs.Panel>

        <Tabs.Panel
          value="orders"
          className="mb-4"
        >
          <CalOrdersV2
            orders={orders}
            allCalItems={items}
            date={date}
            platform={platform}
            channelId={channelId}
            onSelectionStatsChange={setSelectionStats}
          />
        </Tabs.Panel>
      </Tabs>

      {!readOnly && allowSaveLog && (
        <>
          <Divider mt={24} mb={20} label={"Lưu lịch sử vận đơn"} />
          <Stack gap={16} px={4}>
            <Button
              color="indigo"
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
              Lưu log
            </Button>
            <Collapse in={saveLogDiv}>
              <SaveLogDiv
                items={items}
                orders={orders}
                platform={"tiktokshop"}
              />
            </Collapse>
          </Stack>
        </>
      )}
    </Box>
  )
}
