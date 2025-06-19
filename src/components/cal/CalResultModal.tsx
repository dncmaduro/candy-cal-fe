import { useMutation, useQuery } from "@tanstack/react-query"
import { useItems } from "../../hooks/useItems"
import {
  Box,
  Button,
  Divider,
  Group,
  Table,
  Tabs,
  Text,
  rem
} from "@mantine/core"
import { ItemResponse } from "../../hooks/models"
import { CalOrders } from "./CalOrders"
import { useLogs } from "../../hooks/useLogs"
import { CToast } from "../common/CToast"
import { DatePickerInput } from "@mantine/dates"
import { useEffect, useState } from "react"
import {
  IconBox,
  IconClipboardList,
  IconCalendarPlus
} from "@tabler/icons-react"

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
  total: number
  readOnly?: boolean
  viewSingleDate?: boolean
  singleDate?: Date
}

export const CalResultModal = ({
  items,
  orders,
  readOnly,
  total,
  viewSingleDate,
  singleDate
}: Props) => {
  const { searchItems } = useItems()
  const { createLog } = useLogs()
  const [date, setDate] = useState<Date | null>(
    new Date(new Date().setHours(0, 0, 0, 0))
  )

  const { data: allItems } = useQuery({
    queryKey: ["searchItems"],
    queryFn: () => searchItems(""),
    select: (data) =>
      data.data.reduce(
        (acc, item) => ({ ...acc, [item._id]: item }),
        {} as Record<string, ItemResponse>
      )
  })

  const { mutate: saveHistory, isPending: isSaving } = useMutation({
    mutationFn: createLog,
    onSuccess: () => {
      CToast.success({
        title: "Lưu lịch sử thành công"
      })
    },
    onError: () => {
      CToast.error({
        title: "Lưu lịch sử thất bại"
      })
    }
  })

  useEffect(() => {
    // (dev debug) console.log(date)
  }, [date])

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
          <CalOrders
            orders={orders}
            allCalItems={items}
            total={total}
            viewSingleDate={viewSingleDate}
            singleDate={singleDate}
          />
        </Tabs.Panel>
      </Tabs>

      {!readOnly && (
        <>
          <Divider mt={24} mb={20} label={"Lưu lịch sử vận đơn"} />
          <Group align="end" gap={16} px={4} wrap="wrap">
            <DatePickerInput
              label="Ngày vận đơn"
              value={date}
              onChange={setDate}
              maxDate={new Date()}
              valueFormat="DD/MM/YYYY"
              radius="md"
              size="md"
              leftSection={<IconCalendarPlus size={18} />}
              style={{ minWidth: 180, fontWeight: 500 }}
            />
            <Button
              loading={isSaving}
              color="indigo"
              size="md"
              radius="xl"
              fw={600}
              px={22}
              disabled={!date}
              onClick={() => {
                if (date) {
                  saveHistory({
                    date,
                    items,
                    orders
                  })
                }
              }}
              leftSection={<IconClipboardList size={17} />}
            >
              Lưu lịch sử
            </Button>
          </Group>
        </>
      )}
    </Box>
  )
}
