import { useQuery } from "@tanstack/react-query"
import { useProducts } from "../../hooks/useProducts"
import {
  ProductResponse,
  ReadyComboResponse,
  SearchStorageItemResponse
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
  rem,
  Button,
  Group,
  Select
} from "@mantine/core"
import { useEffect, useMemo, useState } from "react"
import { useItems } from "../../hooks/useItems"
import { modals } from "@mantine/modals"
import { SendDeliveredRequestModal } from "./SendDeliveredRequestModal"
import { useReadyCombos } from "../../hooks/useReadyCombos"
import { isEqual } from "lodash"
import { useUsers } from "../../hooks/useUsers"

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
  date?: Date
}

const VIEW_MODES = [
  { value: "all", label: "Tất cả sản phẩm" },
  { value: "ready", label: "Chỉ sản phẩm đã đóng sẵn" },
  { value: "not-ready", label: "Chỉ sản phẩm chưa đóng sẵn" }
]

const normalizeProducts = (products: { _id: string; quantity: number }[]) =>
  [...products].sort((a, b) => a._id.localeCompare(b._id))

export const CalOrders = ({ orders, allCalItems, date }: Props) => {
  const { getAllProducts } = useProducts()
  const { searchStorageItems } = useItems()
  const { getMe } = useUsers()
  const [calRest, setCalRest] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<"all" | "ready" | "not-ready">("all")
  const { searchCombos } = useReadyCombos()

  const { data: meData } = useQuery({
    queryKey: ["getMe"],
    queryFn: getMe,
    select: (data) => data.data
  })

  const { data: readyCombosData } = useQuery({
    queryKey: ["searchCombos"],
    queryFn: () => searchCombos({ isReady: true }),
    select: (data) => data.data as ReadyComboResponse[]
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

  const allProductsByName = useMemo(() => {
    return allProducts
      ? Object.values(allProducts).reduce(
          (acc, product) => ({ ...acc, [product.name]: product }),
          {} as Record<string, ProductResponse>
        )
      : {}
  }, [allProducts])

  const normalizedCombos = useMemo(
    () =>
      readyCombosData
        ? readyCombosData.map((combo) => normalizeProducts(combo.products))
        : [],
    [readyCombosData]
  )

  const isOrderReady = (order: Props["orders"][0]) => {
    if (!allProductsByName) return false
    const normalizedOrderProducts = normalizeProducts(
      order.products.map((p) => ({
        _id: allProductsByName[p.name]?._id ?? "UNKNOWN",
        quantity: p.quantity
      }))
    )
    return normalizedCombos.some((comboProducts) =>
      isEqual(comboProducts, normalizedOrderProducts)
    )
  }

  // Lọc lại orders theo viewMode
  const filteredOrders = useMemo(() => {
    if (!allProductsByName) return []

    if (viewMode === "ready") return orders.filter(isOrderReady)
    if (viewMode === "not-ready") return orders.filter((o) => !isOrderReady(o))
    return orders
  }, [orders, allProductsByName, normalizedCombos, viewMode])

  // Lọc ra notReadyOrders (order nào chưa "ready")
  const notReadyOrders = useMemo(() => {
    if (!allProductsByName) return []
    return orders
      .map((order) => ({
        ...order,
        products: order.products.filter(
          (p) =>
            !isOrderReady({
              ...order,
              products: [p]
            })
        )
      }))
      .filter((order) => order.products.length > 0)
  }, [orders, allProductsByName, normalizedCombos])

  // Tính các storage item cần dùng cho notReadyOrders (product.items now point to storageItems directly)
  const notReadyItems = useMemo(() => {
    if (!notReadyOrders.length || !allProductsByName) return {}
    return notReadyOrders.reduce(
      (acc, order) => {
        order.products.forEach((p) => {
          const product = allProductsByName[p.name]
          product?.items.forEach((si) => {
            // si._id is storageItemId now
            acc[si._id] =
              (acc[si._id] || 0) + si.quantity * p.quantity * order.quantity
          })
        })
        return acc
      },
      {} as Record<string, number>
    )
  }, [notReadyOrders, allProductsByName])

  // Fetch item trong kho
  const { data: allStorageItems } = useQuery({
    queryKey: ["searchStorageItems"],
    queryFn: () => searchStorageItems({ searchText: "", deleted: false }),
    select: (data) => data.data
  })

  const allStorageItemsMap = useMemo(() => {
    return (allStorageItems || []).reduce(
      (acc, si) => ({ ...acc, [si._id]: si }),
      {} as Record<string, SearchStorageItemResponse>
    )
  }, [allStorageItems])

  // Quản lý state đơn được chọn
  const [chosenOrders, setChosenOrders] = useState<boolean[]>(
    orders.map(() => false)
  )

  useEffect(() => {
    setChosenOrders(filteredOrders.map(() => false))
  }, [viewMode, orders, filteredOrders])

  const toggleOrders = (index: number) => {
    setChosenOrders((prev) => {
      const updated = [...prev]
      updated[index] = !updated[index]
      return updated
    })
  }

  // Tính các storage item cần dùng cho chosenOrders
  const [chosenItems, setChosenItems] = useState<Record<string, number>>()

  useEffect(() => {
    const items = chosenOrders.reduce(
      (acc, chosen, index) => {
        if (chosen) {
          const order = filteredOrders[index]
          order.products.forEach((p) => {
            const product = allProductsByName[p.name]
            product.items.forEach((si) => {
              // si._id is storageItemId now
              acc[si._id] =
                (acc[si._id] || 0) + si.quantity * p.quantity * order.quantity
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
                  Object.entries(chosenItems).map(
                    ([storageItemId, quantity]) => (
                      <Text key={storageItemId} fz="sm" fw={500}>
                        {allStorageItemsMap?.[storageItemId]?.name || (
                          <Text span c="red">
                            ?
                          </Text>
                        )}
                        :{" "}
                        <Text span c="indigo.7">
                          {quantity}
                        </Text>
                      </Text>
                    )
                  )
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

      {date && (
        <>
          <Divider mt={24} mb={20} label={"Gửi yêu cầu xuất kho cho kế toán"} />
          {meData?.roles &&
            ["admin", "order-emp"].some((role) =>
              meData.roles.includes(role)
            ) && (
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
                          date={date}
                          items={
                            chosenItems
                              ? Object.entries(chosenItems).map(
                                  ([storageItemId, quantity]) => {
                                    const si = allStorageItems?.find(
                                      (s) => s._id === storageItemId
                                    )
                                    return {
                                      _id: storageItemId,
                                      quantity,
                                      storageItems: si ? [si] : []
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
                          date={date}
                          items={
                            notReadyItems &&
                            Object.entries(notReadyItems).length > 0
                              ? Object.entries(notReadyItems).map(
                                  ([storageItemId, quantity]) => {
                                    const si = allStorageItems?.find(
                                      (s) => s._id === storageItemId
                                    )
                                    return {
                                      _id: storageItemId,
                                      quantity,
                                      storageItems: si ? [si] : []
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
            )}
        </>
      )}
    </Stack>
  )
}
