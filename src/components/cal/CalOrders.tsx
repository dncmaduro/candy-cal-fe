import { useQuery } from "@tanstack/react-query"
import { useProducts } from "../../hooks/useProducts"
import { ItemResponse, ProductResponse } from "../../hooks/models"
import {
  Box,
  Checkbox,
  Divider,
  Flex,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
  rem,
  Tooltip
} from "@mantine/core"
import { useEffect, useMemo, useState } from "react"
import { useItems } from "../../hooks/useItems"
import { IconCalculator } from "@tabler/icons-react"

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
    <Flex
      gap={32}
      py={8}
      px={0}
      direction={{ base: "column", md: "row" }}
      align={{ md: "flex-start", base: "stretch" }}
      style={{
        minHeight: 340,
        background: "rgba(248,250,255,0.97)",
        borderRadius: rem(16)
      }}
    >
      <Box w={{ base: "100%", md: "60%" }}>
        <Text
          fw={600}
          fz="lg"
          mb={8}
          mt={4}
          c="indigo.8"
          style={{ letterSpacing: 0.2 }}
        >
          Danh sách đơn cần đóng
        </Text>
        <ScrollArea.Autosize mah={460} mx={-2}>
          <Table
            striped
            highlightOnHover
            withTableBorder
            withColumnBorders
            verticalSpacing="sm"
            horizontalSpacing="md"
            className="rounded-xl"
            miw={320}
          >
            <Table.Thead bg="indigo.0">
              <Table.Tr>
                <Table.Th style={{ width: 220 }}>Sản phẩm</Table.Th>
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
                      background: chosenOrders[index]
                        ? "rgba(129,140,248,0.16)"
                        : undefined,
                      transition: "background 0.15s"
                    }}
                  >
                    <Table.Td>
                      <Stack gap={2}>
                        {order.products.map((product, i) => (
                          <Text
                            key={product.name + i}
                            fz="sm"
                            fw={500}
                            c={chosenOrders[index] ? "indigo.7" : undefined}
                          >
                            {product.name}{" "}
                            <Text span c="dimmed" fz="xs">
                              ×{product.quantity}
                            </Text>
                          </Text>
                        ))}
                      </Stack>
                    </Table.Td>
                    <Table.Td>{order.quantity}</Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea.Autosize>
      </Box>

      {chosenOrders.some((e) => e) && (
        <>
          <Divider orientation="vertical" visibleFrom="md" />
          <Stack
            gap={16}
            pt={12}
            className="grow"
            px={{ base: 0, md: 14 }}
            w={{ base: "100%", md: 320 }}
            align="stretch"
          >
            <Flex align="center" gap={8}>
              <Checkbox
                label="Tính số còn lại"
                checked={calRest}
                onChange={() => setCalRest((prev) => !prev)}
                color="indigo"
              />
              <Tooltip label="Hiển thị số lượng còn dư sau khi đóng đơn">
                <IconCalculator size={17} color="#6366f1" />
              </Tooltip>
            </Flex>
            <Divider w="100%" />
            <Title order={6} fw={600} c="indigo.8" mb={-6}>
              Danh sách mặt hàng cần dùng
            </Title>
            <Stack gap={6}>
              {chosenItems && Object.entries(chosenItems).length > 0 ? (
                Object.entries(chosenItems).map(([itemId, quantity]) => (
                  <Text key={itemId} fz="sm" fw={500}>
                    {allItems?.[itemId]?.name || (
                      <Text span c="red">
                        ?
                      </Text>
                    )}
                    :{" "}
                    <Text span c="indigo.7">
                      {quantity}
                    </Text>
                  </Text>
                ))
              ) : (
                <Text c="dimmed" fz="sm">
                  Không có mặt hàng nào
                </Text>
              )}
            </Stack>
          </Stack>
        </>
      )}
    </Flex>
  )
}
