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
  Button,
  Group,
  Select
} from "@mantine/core"
import { useEffect, useMemo, useState } from "react"
import { useItems } from "../../hooks/useItems"
import { modals } from "@mantine/modals"
import { SendDeliveredRequestModal } from "./SendDeliveredRequestModal"

interface Props {
  orders: {
    products: {
      name: string
      quantity: number
      isReady: boolean
    }[]
    quantity: number
  }[]
  allCalItems: {
    _id: string
    quantity: number
  }[]
  viewSingleDate?: boolean
  singleDate?: Date
}

const VIEW_MODES = [
  { value: "all", label: "Tất cả sản phẩm" },
  { value: "ready", label: "Chỉ sản phẩm đã đóng sẵn" },
  { value: "not-ready", label: "Chỉ sản phẩm chưa đóng sẵn" }
]

export const CalOrders = ({
  orders,
  allCalItems,
  viewSingleDate,
  singleDate
}: Props) => {
  const { getAllProducts } = useProducts()
  const { searchItems, searchStorageItems } = useItems()
  const [calRest, setCalRest] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<"all" | "ready" | "not-ready">("all")

  const notReadyOrders = useMemo(() => {
    return orders
      .map((order) => ({
        products: order.products.filter((product) => product.isReady === false),
        quantity: order.quantity
      }))
      .filter((order) => order.products.length > 0)
  }, [orders])

  // Filter orders theo view mode
  const filteredOrders = useMemo(() => {
    if (viewMode === "all") return orders
    const isReadyValue = viewMode === "ready"
    return orders
      .map((order) => ({
        products: order.products.filter(
          (product) => product.isReady === isReadyValue
        ),
        quantity: order.quantity
      }))
      .filter((order) => order.products.length > 0)
  }, [orders, viewMode])

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

  const notReadyItems = useMemo(() => {
    if (!notReadyOrders.length || !allProducts) return {}
    const allProductsByName = Object.values(allProducts).reduce(
      (acc, product) => ({ ...acc, [product.name]: product }),
      {} as Record<string, ProductResponse>
    )
    return notReadyOrders.reduce(
      (acc, order) => {
        order.products.forEach((p) => {
          const product = allProductsByName[p.name]
          product?.items.forEach((item) => {
            if (acc[item._id]) {
              acc[item._id] += item.quantity * p.quantity * order.quantity
            } else {
              acc[item._id] = item.quantity * p.quantity * order.quantity
            }
          })
        })
        return acc
      },
      {} as Record<string, number>
    )
  }, [notReadyOrders, allProducts])

  const { data: allStorageItems } = useQuery({
    queryKey: ["searchStorageItems"],
    queryFn: () => searchStorageItems(""),
    select: (data) => {
      return data.data
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

  const { data: itemsData } = useQuery({
    queryKey: ["searchItems"],
    queryFn: () => searchItems(""),
    select: (data) => {
      return data.data
    }
  })

  const allItems = useMemo(() => {
    return itemsData?.reduce(
      (acc, item) => ({ ...acc, [item._id]: item }),
      {} as Record<string, ItemResponse>
    )
  }, [itemsData])

  const [chosenOrders, setChosenOrders] = useState<boolean[]>(
    orders.map((_) => false)
  )

  // Reset chọn đơn khi đổi view mode
  useEffect(() => {
    setChosenOrders(filteredOrders.map((_) => false))
  }, [viewMode, orders])

  const toggleOrders = (index: number) => {
    setChosenOrders((prev) => {
      const updated = [...prev]
      updated[index] = !updated[index]
      return updated
    })
  }

  // Tính các item cần dùng theo view mode và chosenOrders
  const [chosenItems, setChosenItems] = useState<Record<string, number>>()

  useEffect(() => {
    const items = chosenOrders.reduce(
      (acc, chosen, index) => {
        if (chosen) {
          const order = filteredOrders[index]
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
  }, [chosenOrders, calRest, filteredOrders, allCalItems, allProductsByName])

  const filteredTotalOrders = useMemo(() => {
    return filteredOrders.reduce((acc, order) => acc + order.quantity, 0)
  }, [filteredOrders])

  return (
    <Stack>
      <Group justify="space-between" align="center" mb={-10} mt={10} mx={4}>
        <Select
          data={VIEW_MODES}
          value={viewMode}
          onChange={(val) => setViewMode(val as "all" | "ready" | "not-ready")}
          size="sm"
          w={260}
          allowDeselect={false}
        />
        {/* Cái này nếu muốn giữ lại tính năng cũ */}
        {/* <Checkbox
          label="Tính số còn lại"
          checked={calRest}
          onChange={() => setCalRest((prev) => !prev)}
          color="indigo"
        /> */}
      </Group>

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
            Danh sách đơn cần đóng ({filteredTotalOrders} đơn)
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
              <Table.Thead bg="indigo.0">
                <Table.Tr>
                  <Table.Th style={{ width: 220 }}>Sản phẩm</Table.Th>
                  <Table.Th>Số đơn</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {allProducts &&
                  filteredOrders.map((order, index) => (
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

      {viewSingleDate && singleDate && (
        <>
          <Divider mt={24} mb={20} label={"Gửi yêu cầu xuất kho cho kế toán"} />
          <Group>
            <Button
              color="indigo"
              size="md"
              radius="xl"
              fw={600}
              px={22}
              className="flex-1"
              variant="light"
              disabled={!chosenOrders.some((e) => e) || !chosenItems}
              onClick={() => {
                modals.open({
                  title: "Gửi yêu cầu xuất kho",
                  size: "xl",
                  children: (
                    <SendDeliveredRequestModal
                      date={singleDate}
                      allItems={itemsData || []}
                      items={
                        chosenItems
                          ? Object.entries(chosenItems).map(
                              ([itemId, quantity]) => {
                                const item = allItems?.[itemId]
                                return {
                                  _id: itemId,
                                  quantity: quantity,
                                  storageItems:
                                    allStorageItems?.filter((si) =>
                                      item?.variants.includes(si._id)
                                    ) ?? []
                                }
                              }
                            )
                          : []
                      }
                    />
                  )
                })
              }}
            >
              Gửi yêu cầu xuất kho ({chosenOrders.length} đơn)
            </Button>
            <Button
              color="indigo"
              className="flex-1"
              size="md"
              radius="xl"
              fw={600}
              px={22}
              variant="outline"
              onClick={() => {
                modals.open({
                  title: "Gửi yêu cầu cho đơn không sẵn",
                  size: "xl",
                  children: (
                    <SendDeliveredRequestModal
                      date={singleDate}
                      allItems={itemsData || []}
                      items={
                        notReadyItems &&
                        Object.entries(notReadyItems).length > 0
                          ? Object.entries(notReadyItems).map(
                              ([itemId, quantity]) => {
                                const item = allItems?.[itemId]
                                return {
                                  _id: itemId,
                                  quantity: quantity,
                                  storageItems:
                                    allStorageItems?.filter((si) =>
                                      item?.variants.includes(si._id)
                                    ) ?? []
                                }
                              }
                            )
                          : []
                      }
                    />
                  )
                })
              }}
            >
              Gửi yêu cầu cho đơn không sẵn
            </Button>
          </Group>
        </>
      )}
    </Stack>
  )
}
