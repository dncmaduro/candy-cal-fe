import { useQuery } from "@tanstack/react-query"
import { useItems } from "../../hooks/useItems"
import {
  Box,
  Button,
  Collapse,
  Divider,
  Stack,
  Table,
  Tabs,
  Text,
  rem
} from "@mantine/core"
import { ItemResponse } from "../../hooks/models"
import { CalOrders } from "./CalOrders"
import {
  IconBox,
  IconClipboardList,
  IconCalendarPlus
} from "@tabler/icons-react"
import { useDisclosure } from "@mantine/hooks"
import { SaveLogDiv } from "./SaveLogDiv"

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

export const CalFileResultModal = ({
  items,
  orders,
  readOnly,
  date
}: Props) => {
  const { searchItems } = useItems()
  const [saveLogDiv, { toggle }] = useDisclosure(false)
  const { data: allItems } = useQuery({
    queryKey: ["searchItems"],
    queryFn: () => searchItems(""),
    select: (data) =>
      data.data.reduce(
        (acc, item) => ({ ...acc, [item._id]: item }),
        {} as Record<string, ItemResponse>
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
        maxWidth: 860,
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

        <Tabs.Panel value="items">
          <Table
            striped
            verticalSpacing="sm"
            horizontalSpacing="md"
            withTableBorder
            withColumnBorders
            className="rounded-xl"
            miw={320}
          >
            <Table.Thead bg="indigo.0">
              <Table.Tr>
                <Table.Th style={{ width: 180 }}>Mặt hàng</Table.Th>
                <Table.Th>Số lượng</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {allItems &&
                items.map((item) => (
                  <Table.Tr key={item._id}>
                    <Table.Td fw={500}>
                      {allItems[item._id]?.name ?? <Text c="dimmed">?</Text>}
                    </Table.Td>
                    <Table.Td>{item.quantity}</Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="orders">
          <CalOrders orders={orders} allCalItems={items} date={date} />
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
