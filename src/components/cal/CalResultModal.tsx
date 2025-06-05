import { useMutation, useQuery } from "@tanstack/react-query"
import { useItems } from "../../hooks/useItems"
import { Box, Button, Divider, Group, Table, Tabs } from "@mantine/core"
import { ItemResponse } from "../../hooks/models"
import { CalOrders } from "./CalOrders"
import { useLogs } from "../../hooks/useLogs"
import { CToast } from "../common/CToast"
import { DatePickerInput } from "@mantine/dates"
import { useEffect, useState } from "react"

interface Props {
  items: {
    _id: string
    quantity: number
  }[]
  orders: {
    products: {
      name: string
      quantity: number
    }[]
    quantity: number
  }[]
  readOnly?: boolean
}

export const CalResultModal = ({ items, orders, readOnly }: Props) => {
  const { getAllItems } = useItems()
  const { createLog } = useLogs()
  const [date, setDate] = useState<Date | null>(
    new Date(new Date().setHours(0, 0, 0, 0))
  )

  const { data: allItems } = useQuery({
    queryKey: ["getAllItems"],
    queryFn: getAllItems,
    select: (data) => {
      return data.data.reduce(
        (acc, item) => ({ ...acc, [item._id]: item }),
        {} as Record<string, ItemResponse>
      )
    }
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
    console.log(date)
  }, [date])

  return (
    <Box>
      <Tabs defaultValue={"items"}>
        <Tabs.List>
          <Tabs.Tab value="items">Mặt hàng</Tabs.Tab>
          <Tabs.Tab value="orders">Đóng đơn</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="items">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Mặt hàng</Table.Th>
                <Table.Th>Số lượng</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {allItems &&
                items.map((item) => (
                  <Table.Tr key={item._id}>
                    <Table.Td>{allItems[item._id].name}</Table.Td>
                    <Table.Td>{item.quantity}</Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="orders">
          <CalOrders orders={orders} allCalItems={items} />
        </Tabs.Panel>
      </Tabs>

      {!readOnly && (
        <>
          <Divider mt={16} mb={32} />

          <DatePickerInput
            label="Ngày vận đơn"
            value={date}
            onChange={setDate}
            maxDate={new Date()}
            valueFormat="DD/MM/YYYY"
          />

          <Group mt={16} justify="flex-end">
            <Button
              loading={isSaving}
              onClick={() => {
                if (date) {
                  saveHistory({
                    date,
                    items,
                    orders
                  })
                }
              }}
            >
              Lưu lịch sử
            </Button>
          </Group>
        </>
      )}
    </Box>
  )
}
