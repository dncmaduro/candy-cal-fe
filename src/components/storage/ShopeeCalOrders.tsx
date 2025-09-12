import { useQuery } from "@tanstack/react-query"
import { useShopeeProducts } from "../../hooks/useShopeeProducts"
import {
  SearchShopeeProductsResponse,
  StorageItemResponse
} from "../../hooks/models"
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
  rem
} from "@mantine/core"
import { useEffect, useMemo, useState } from "react"
import { useItems } from "../../hooks/useItems"

type ShopeeProduct = SearchShopeeProductsResponse["data"][0]

interface Props {
  orders: {
    products: {
      sku: string
      name?: string
      quantity: number
    }[]
    quantity: number
  }[]
  allCalItems: {
    _id: string
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
  date?: Date
}

export const ShopeeCalOrders = ({ orders, allCalItems }: Props) => {
  const { searchShopeeProducts } = useShopeeProducts()
  const { searchStorageItems } = useItems()
  const [calRest, setCalRest] = useState<boolean>(false)

  const { data: allShopeeProducts } = useQuery({
    queryKey: ["searchShopeeProducts", ""],
    queryFn: () =>
      searchShopeeProducts({ searchText: "", page: 1, limit: 1000 }),
    select: (data) => {
      return data.data.data.reduce(
        (acc, product) => ({ ...acc, [product._id]: product }),
        {} as Record<string, ShopeeProduct>
      )
    }
  })

  const allShopeeProductsBySku = useMemo(() => {
    if (!allShopeeProducts) return {}

    const byName = Object.values(allShopeeProducts).reduce(
      (acc, product) => ({ ...acc, [product.name]: product }),
      {} as Record<string, ShopeeProduct>
    )

    // Cũng index theo SKU nếu có
    const bySku = Object.values(allShopeeProducts).reduce(
      (acc, product) => {
        // name chính là SKU
        acc[product.name] = product
        return acc
      },
      {} as Record<string, ShopeeProduct>
    )

    return Object.assign({}, byName, bySku)
  }, [allShopeeProducts])

  // Fetch các mặt hàng kho (storage items)
  const { data: storageItemsData } = useQuery({
    queryKey: ["searchStorageItems"],
    queryFn: () => searchStorageItems(""),
    select: (data) => data.data
  })

  const allStorageItems = useMemo(() => {
    return storageItemsData?.reduce(
      (acc, item) => ({ ...acc, [item._id]: item }),
      {} as Record<string, StorageItemResponse>
    )
  }, [storageItemsData])

  // Quản lý state đơn được chọn (để tính mặt hàng cần dùng)
  const [chosenOrders, setChosenOrders] = useState<boolean[]>(
    orders.map(() => false)
  )

  const toggleOrders = (index: number) => {
    setChosenOrders((prev) => {
      const updated = [...prev]
      updated[index] = !updated[index]
      return updated
    })
  }

  // Tính các item cần dùng cho chosenOrders
  const [chosenItems, setChosenItems] = useState<Record<string, number>>()

  useEffect(() => {
    const items = chosenOrders.reduce(
      (acc, chosen, index) => {
        if (chosen) {
          const order = orders[index]
          order.products.forEach((p) => {
            // Tìm sản phẩm Shopee theo SKU trước, sau đó mới đến name
            const shopeeProduct =
              allShopeeProductsBySku[p.sku] ||
              allShopeeProductsBySku[p.name || ""]
            if (shopeeProduct) {
              shopeeProduct.items.forEach((item) => {
                acc[item._id] =
                  (acc[item._id] || 0) +
                  item.quantity * p.quantity * order.quantity
              })
            }
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
            acc[item._id] = restQuantity
          }
          return acc
        },
        {} as Record<string, number>
      )
      setChosenItems(cal)
    } else {
      setChosenItems(items)
    }
  }, [chosenOrders, calRest, orders, allCalItems, allShopeeProductsBySku])

  const totalOrders = useMemo(() => {
    return orders.reduce((acc, order) => acc + order.quantity, 0)
  }, [orders])

  return (
    <Stack>
      <Flex
        gap={32}
        py={8}
        px={16}
        direction={{ base: "column", md: "row" }}
        align={{ md: "flex-start", base: "stretch" }}
        style={{
          minHeight: 340,
          background: "rgba(255,245,230,0.97)",
          borderRadius: rem(16)
        }}
      >
        <Box w={{ base: "100%", md: "60%" }}>
          <Text
            fw={600}
            fz="lg"
            mb={8}
            mt={4}
            c="orange.8"
            style={{ letterSpacing: 0.2 }}
          >
            Danh sách đơn Shopee cần đóng ({totalOrders} đơn)
          </Text>
          <ScrollArea.Autosize mah={460} mx={-2}>
            <Table
              highlightOnHover
              withTableBorder
              withColumnBorders
              verticalSpacing="sm"
              horizontalSpacing="md"
              className="rounded-xl"
              miw={320}
              bg={"white"}
            >
              <Table.Thead bg="orange.0">
                <Table.Tr>
                  <Table.Th style={{ width: 220 }}>Sản phẩm Shopee</Table.Th>
                  <Table.Th>Số đơn</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {orders.map((order, index) => (
                  <Table.Tr
                    key={index}
                    onClick={() => toggleOrders(index)}
                    style={{
                      cursor: "pointer",
                      background: chosenOrders[index]
                        ? "rgba(251,146,60,0.16)"
                        : undefined,
                      transition: "background 0.15s"
                    }}
                  >
                    <Table.Td>
                      <Stack gap={2}>
                        {order.products.map((product, i) => (
                          <Text
                            key={(product.sku || product.name || "") + i}
                            fz="sm"
                            fw={500}
                            c={chosenOrders[index] ? "orange.7" : undefined}
                          >
                            {product.sku || product.name || ""}{" "}
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
                  color="orange"
                />
              </Flex>
              <Divider w="100%" />
              <Title order={6} fw={600} c="orange.8" mb={-6}>
                Danh sách mặt hàng cần dùng
              </Title>
              <Stack gap={6}>
                {chosenItems && Object.entries(chosenItems).length > 0 ? (
                  Object.entries(chosenItems).map(([itemId, quantity]) => (
                    <Text key={itemId} fz="sm" fw={500}>
                      {allStorageItems?.[itemId]?.name || (
                        <Text span c="red">
                          ?
                        </Text>
                      )}
                      :{" "}
                      <Text span c="orange.7">
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
    </Stack>
  )
}
