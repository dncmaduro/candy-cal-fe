import { useQuery } from "@tanstack/react-query"
import { useItems } from "../../hooks/useItems"
import { Box, Button, Collapse, Divider, Stack, Tabs, rem } from "@mantine/core"
import { SearchStorageItemResponse } from "../../hooks/models"
import { CalOrdersV2 } from "./CalOrdersV2"
import {
  IconBox,
  IconClipboardList,
  IconCalendarPlus
} from "@tabler/icons-react"
import { useDisclosure } from "@mantine/hooks"
import { SaveLogDiv } from "./SaveLogDiv"
import { CalItemsV2 } from "./CalItemsV2"

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
}

export const CalFileResultModalV2 = ({
  items,
  orders,
  readOnly,
  date
}: Props) => {
  const { searchStorageItems } = useItems()
  const [saveLogDiv, { toggle }] = useDisclosure(false)
  const { data: allItems } = useQuery({
    queryKey: ["searchStorageItems", "all"],
    queryFn: async () => {
      const [activeRes, deletedRes] = await Promise.all([
        searchStorageItems({ searchText: "", deleted: false }),
        searchStorageItems({ searchText: "", deleted: true })
      ])
      return [...activeRes.data, ...deletedRes.data]
    },
    select: (data) =>
      data.reduce(
        (acc, item) => ({ ...acc, [item._id]: item }),
        {} as Record<string, SearchStorageItemResponse>
      )
  })

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
        color="indigo"
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
          <CalItemsV2 allItems={allItems} items={items} />
        </Tabs.Panel>

        <Tabs.Panel
          value="orders"
          className="mx-2 mb-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4 shadow-sm"
        >
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <CalOrdersV2 orders={orders} allCalItems={items} date={date} />
          </div>
        </Tabs.Panel>
      </Tabs>

      {!readOnly && (
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
              <SaveLogDiv items={items} orders={orders} />
            </Collapse>
          </Stack>
        </>
      )}
    </Box>
  )
}
