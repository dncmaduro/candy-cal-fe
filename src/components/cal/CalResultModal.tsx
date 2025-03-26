import { useQuery } from "@tanstack/react-query"
import { useItems } from "../../hooks/useItems"
import { Stack, Table, Tabs, Text } from "@mantine/core"
import { ItemResponse, ProductResponse } from "../../hooks/models"
import { useProducts } from "../../hooks/useProducts"

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
  const { getAllProducts } = useProducts()

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

  const { data: allProducts } = useQuery({
    queryKey: ["getAllProducts"],
    queryFn: getAllProducts,
    select: (data) => {
      return data.data.reduce(
        (acc, product) => ({ ...acc, [product._id]: product }),
        {} as Record<string, ProductResponse>
      )
    }
  })

  return (
    <Tabs>
      <Tabs.List defaultValue={"items"}>
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
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Các mã Sản phẩm</Table.Th>
              <Table.Th>Số đơn</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {allProducts &&
              orders.map((order, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    <Stack>
                      {order.products.map((product) => (
                        <Text>
                          {product.name} - {product.quantity}
                        </Text>
                      ))}
                    </Stack>
                  </Table.Td>
                  <Table.Td>{order.quantity}</Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </Tabs.Panel>
    </Tabs>
  )
}
