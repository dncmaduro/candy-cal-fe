import { useQuery } from "@tanstack/react-query"
import { useItems } from "../../hooks/useItems"
import { Table, Tabs } from "@mantine/core"
import { ItemResponse } from "../../hooks/models"
import { CalOrders } from "./CalOrders"

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
}

export const CalResultModal = ({ items, orders }: Props) => {
  const { getAllItems } = useItems()

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

  return (
    <Tabs>
      <Tabs.List defaultValue="items">
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
  )
}
