import { useQuery } from "@tanstack/react-query"
import { useProducts } from "../../hooks/useProducts"
import { ItemResponse, ProductResponse } from "../../hooks/models"
import { Checkbox, Divider, Flex, Stack, Table, Text } from "@mantine/core"
import { useEffect, useMemo, useState } from "react"
import { useItems } from "../../hooks/useItems"

interface Props {
  orders: {
    products: {
      name: string
      quantity: number
    }[]
    quantity: number
  }[]
  allCalItems: {
    _id: string
    quantity: number
  }[]
}

export const CalOrders = ({ orders, allCalItems }: Props) => {
  const { getAllProducts } = useProducts()
  const { getAllItems } = useItems()
  const [calRest, setCalRest] = useState<boolean>(false)

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

  const allProductsByName = useMemo(() => {
    return allProducts
      ? Object.values(allProducts).reduce(
          (acc, product) => ({ ...acc, [product.name]: product }),
          {} as Record<string, ProductResponse>
        )
      : {}
  }, [allProducts])

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

  const [chosenOrders, setChosenOrders] = useState<boolean[]>(
    orders.map((_) => false)
  )

  const toggleOrders = (index: number) => {
    setChosenOrders((prev) => {
      const updated = [...prev]
      updated[index] = !updated[index]
      return updated
    })
  }

  const [chosenItems, setChosenItems] = useState<Record<string, number>>()

  useEffect(() => {
    const items = chosenOrders.reduce(
      (acc, chosen, index) => {
        if (chosen) {
          const order = orders[index]
          order.products.forEach((p) => {
            const product = allProductsByName[p.name]
            product.items.forEach((item) => {
              if (acc[item._id]) {
                acc[item._id] += item.quantity * p.quantity * order.quantity
              } else {
                acc[item._id] = item.quantity * p.quantity * order.quantity
              }
            })
          })
        }

        return acc
      },
      {} as Record<string, number>
    )
    if (calRest && allCalItems) {
      const cal = allCalItems.reduce(
        (acc, item) => {
          const restQuantity = item.quantity - (items[item._id] || 0)
          if (restQuantity > 0) {
            return { ...acc, [item._id]: restQuantity }
          }

          return acc
        },
        {} as Record<string, number>
      )

      setChosenItems(cal)
    } else {
      setChosenItems(items)
    }
  }, [chosenOrders, calRest])

  return (
    <Flex gap={16}>
      <Table withTableBorder w={"60%"}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Các mã Sản phẩm</Table.Th>
            <Table.Th>Số đơn</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {allProducts &&
            orders.map((order, index) => (
              <Table.Tr
                key={index}
                onClick={() => toggleOrders(index)}
                style={{
                  cursor: "pointer",
                  backgroundColor: chosenOrders[index] ? "#dbeafe" : "white"
                }}
                className="!border-gray-300"
              >
                <Table.Td>
                  <Stack>
                    {order.products.map((product) => (
                      <Text key={product.name}>
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
      {chosenOrders.some((e) => e) && (
        <>
          <Divider orientation="vertical" />
          <Stack gap={16} pt={16} className="grow">
            <Checkbox
              label="Tính số còn lại"
              checked={calRest}
              onChange={() => setCalRest((prev) => !prev)}
            />
            <Divider w={"100%"} />
            <Stack>
              {chosenItems &&
                Object.entries(chosenItems).map(([itemId, quantity]) => (
                  <Text key={itemId}>
                    {allItems?.[itemId]?.name || "Unknown Item"}: {quantity}
                  </Text>
                ))}
            </Stack>
          </Stack>
        </>
      )}
    </Flex>
  )
}
