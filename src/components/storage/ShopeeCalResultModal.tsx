import { Box, Button, Collapse, Divider, Stack, Tabs, rem } from "@mantine/core"
import { ShopeeCalOrders } from "./ShopeeCalOrders"
import {
  IconBox,
  IconClipboardList,
  IconCalendarPlus
} from "@tabler/icons-react"
import { useDisclosure } from "@mantine/hooks"
import { ShopeeCalItems } from "./ShopeeCalItems"

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
          className="mx-2 mb-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4 shadow-sm"
        >
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <ShopeeCalOrders orders={orders} allCalItems={items} date={date} />
          </div>
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
              {/* TODO: Implement ShopeeeSaveLogDiv */}
              <div>Shopee Save Log functionality here</div>
            </Collapse>
          </Stack>
        </>
      )}
    </Box>
  )
}
