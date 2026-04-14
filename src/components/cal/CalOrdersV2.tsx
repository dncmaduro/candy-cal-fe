import { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"

import { useProducts } from "../../hooks/useProducts"
import { useShopeeProducts } from "../../hooks/useShopeeProducts"
import { useItems } from "../../hooks/useItems"
import { useUsers } from "../../hooks/useUsers"
import { useDeliveredRequests } from "../../hooks/useDeliveredRequests"

import type {
  SearchStorageItemResponse,
  ProductResponse,
  GetAllShopeeProductsResponse
} from "../../hooks/models"

import {
  Badge,
  Box,
  Checkbox,
  Divider,
  Flex,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Switch,
  Table,
  Text,
  ThemeIcon,
  rem,
  Button
} from "@mantine/core"
import { IconAlertTriangle, IconClipboardList } from "@tabler/icons-react"

import { CToast } from "../common/CToast"

interface Props {
  orders: {
    products: { name: string; quantity: number }[]
    quantity: number
  }[]
  allCalItems: { _id: string; quantity: number }[]
  date?: Date
  platform?: string
  channelId?: string
  enableBulkTableSelection?: boolean
  onSelectionStatsChange?: (stats: {
    selectedOrders: number
    requiredItemTypes: number
    missingItemTypes: number
  }) => void
}

export const CalOrdersV2 = ({
  orders,
  allCalItems,
  date,
  platform,
  channelId,
  enableBulkTableSelection = false,
  onSelectionStatsChange
}: Props) => {
  const { getAllProducts } = useProducts()
  const { getAllShopeeProducts } = useShopeeProducts()
  const { searchStorageItems } = useItems()
  const { getMe } = useUsers()
  const { createDeliveredRequest } = useDeliveredRequests()

  const [calRest, setCalRest] = useState(false)

  const { data: meData } = useQuery({
    queryKey: ["getMe"],
    queryFn: getMe,
    select: (data) => data.data
  })

  const normalizedPlatform = (platform || "tiktokshop").toLowerCase()
  const isShopee = normalizedPlatform === "shopee"

  type ProductLike = {
    _id: string
    name: string
    items: { _id: string; quantity: number }[]
  }

  const { data: allProducts } = useQuery({
    queryKey: ["getAllProducts", normalizedPlatform],
    queryFn: isShopee ? getAllShopeeProducts : getAllProducts,
    select: (data) => {
      const products = isShopee
        ? ((data.data as unknown as GetAllShopeeProductsResponse).products ??
          [])
        : (data.data as ProductResponse[])

      return products.reduce(
        (acc, product) => ({ ...acc, [product._id]: product }),
        {} as Record<string, ProductLike>
      )
    }
  })

  const allProductsByName = useMemo(() => {
    return allProducts
      ? Object.values(allProducts).reduce(
          (acc, product) => ({ ...acc, [product.name]: product }),
          {} as Record<string, ProductLike>
        )
      : {}
  }, [allProducts])

  const { data: allStorageItems } = useQuery({
    queryKey: ["searchStorageItems"],
    queryFn: () => searchStorageItems({ searchText: "", deleted: false }),
    select: (data) => data.data
  })

  const allStorageItemsMap = useMemo(() => {
    return allStorageItems
      ? allStorageItems.reduce(
          (acc, si: SearchStorageItemResponse) => ({ ...acc, [si._id]: si }),
          {} as Record<string, SearchStorageItemResponse>
        )
      : {}
  }, [allStorageItems])

  const [chosenOrders, setChosenOrders] = useState<boolean[]>(
    orders.map(() => false)
  )
  const [selectedOrderIndexes, setSelectedOrderIndexes] = useState<Set<number>>(
    new Set()
  )

  const ordersSelectionKey = useMemo(
    () =>
      orders
        .map(
          (order) =>
            `${order.quantity}:${order.products
              .map((p) => `${p.name}-${p.quantity}`)
              .join("|")}`
        )
        .join("||"),
    [orders]
  )

  useEffect(() => {
    setChosenOrders(orders.map(() => false))
    setSelectedOrderIndexes(new Set())
  }, [ordersSelectionKey])

  const isOrderSelected = (index: number) => {
    if (enableBulkTableSelection) return selectedOrderIndexes.has(index)
    return !!chosenOrders[index]
  }

  const setOrderSelected = (index: number, checked: boolean) => {
    if (enableBulkTableSelection) {
      setSelectedOrderIndexes((prev) => {
        const next = new Set(prev)
        if (checked) {
          next.add(index)
        } else {
          next.delete(index)
        }
        return next
      })
      return
    }

    setChosenOrders((prev) => {
      const updated = [...prev]
      updated[index] = checked
      return updated
    })
  }

  const selectedCount = useMemo(() => {
    if (enableBulkTableSelection) return selectedOrderIndexes.size
    return chosenOrders.filter(Boolean).length
  }, [enableBulkTableSelection, selectedOrderIndexes, chosenOrders])

  const totalOrders = useMemo(() => {
    return orders.reduce((acc, order) => acc + order.quantity, 0)
  }, [orders])

  const allSelected = useMemo(() => {
    if (orders.length === 0) return false
    return orders.every((_, index) => isOrderSelected(index))
  }, [orders, chosenOrders, selectedOrderIndexes, enableBulkTableSelection])

  const hasSomeSelected = useMemo(() => {
    return orders.some((_, index) => isOrderSelected(index))
  }, [orders, chosenOrders, selectedOrderIndexes, enableBulkTableSelection])

  const toggleAllSelected = (checked: boolean) => {
    if (enableBulkTableSelection) {
      if (checked) {
        setSelectedOrderIndexes(new Set(orders.map((_, index) => index)))
      } else {
        setSelectedOrderIndexes(new Set())
      }
      return
    }

    setChosenOrders(orders.map(() => checked))
  }

  const [chosenItems, setChosenItems] = useState<Record<string, number>>()

  useEffect(() => {
    const items = chosenOrders.reduce(
      (acc, chosen, index) => {
        const isSelected = enableBulkTableSelection
          ? selectedOrderIndexes.has(index)
          : chosen
        if (!isSelected) return acc
        const order = orders[index]
        if (!order) return acc

        order.products.forEach((p) => {
          const product = allProductsByName[p.name]
          product?.items?.forEach((item) => {
            acc[item._id] =
              (acc[item._id] || 0) + item.quantity * p.quantity * order.quantity
          })
        })
        return acc
      },
      {} as Record<string, number>
    )

    if (calRest && allCalItems) {
      const cal = allCalItems.reduce(
        (acc, item) => {
          const restQuantity = item.quantity - (items[item._id] || 0)
          if (restQuantity > 0) acc[item._id] = restQuantity
          return acc
        },
        {} as Record<string, number>
      )
      setChosenItems(cal)
    } else {
      setChosenItems(items)
    }
  }, [
    chosenOrders,
    selectedOrderIndexes,
    enableBulkTableSelection,
    calRest,
    orders,
    allCalItems,
    allProductsByName
  ])

  const { mutate: sendRequest, isPending } = useMutation({
    mutationFn: createDeliveredRequest,
    onSuccess: () =>
      CToast.success({ title: "Gửi yêu cầu xuất kho thành công" }),
    onError: () => CToast.error({ title: "Gửi yêu cầu xuất kho thất bại" })
  })

  const canSend = !!date && !!chosenItems && selectedCount > 0 && !isPending
  const missingItemTypes = useMemo(() => {
    if (!chosenItems) return 0
    return Object.keys(chosenItems).filter(
      (itemId) => !allStorageItemsMap[itemId]
    ).length
  }, [chosenItems, allStorageItemsMap])

  useEffect(() => {
    onSelectionStatsChange?.({
      selectedOrders: selectedCount,
      requiredItemTypes: chosenItems ? Object.keys(chosenItems).length : 0,
      missingItemTypes
    })
  }, [selectedCount, chosenItems, missingItemTypes, onSelectionStatsChange])

  const tableControls = (
    <Switch
      label="Tính số còn lại"
      size="sm"
      checked={calRest}
      onChange={(e) => setCalRest(e.currentTarget.checked)}
      color="indigo"
    />
  )

  return (
    <Box>
      <Flex
        gap={16}
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "start" }}
      >
        <Paper withBorder radius="lg" p="md" style={{ flex: 1 }}>
          <Group
            justify="space-between"
            align="start"
            mb={10}
            wrap="wrap"
            gap={12}
          >
            <Box>
              <Text fw={700} fz="sm">
                Danh sách đơn cần đóng
              </Text>
              <Text c="dimmed" fz="xs" mt={2}>
                Chọn các dòng cần xử lý. Danh sách mặt hàng sẽ tổng hợp tự động.
              </Text>
            </Box>
            <Group gap={8} wrap="wrap">
              <Badge variant="light" color="indigo">
                Tổng đơn: {totalOrders}
              </Badge>
              <Badge variant="light" color={selectedCount ? "blue" : "gray"}>
                Đã chọn: {selectedCount}
              </Badge>
            </Group>
          </Group>
          <Divider mb={12} />

          {tableControls}

          <ScrollArea mt={12}>
            <Table
              withTableBorder
              withColumnBorders
              highlightOnHover
              verticalSpacing="sm"
              horizontalSpacing="md"
              miw={420}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={52}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={hasSomeSelected && !allSelected}
                      onChange={(e) =>
                        toggleAllSelected(e.currentTarget.checked)
                      }
                    />
                  </Table.Th>
                  <Table.Th>Sản phẩm</Table.Th>
                  <Table.Th ta="right">Số đơn</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {orders.map((order, index) => {
                  const checked = isOrderSelected(index)

                  return (
                    <Table.Tr
                      key={`${index}-${order.quantity}-${order.products.map((p) => p.name).join("|")}`}
                      bg={checked ? "indigo.0" : undefined}
                    >
                      <Table.Td>
                        <Checkbox
                          checked={checked}
                          onChange={(e) => {
                            const nextChecked = e.currentTarget.checked
                            setOrderSelected(index, nextChecked)
                          }}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          {order.products.map((product, i) => (
                            <Text
                              key={product.name + i}
                              fz="sm"
                              fw={500}
                              c={checked ? "indigo.7" : undefined}
                            >
                              {product.name}{" "}
                              <Text span c="dimmed" fz="xs">
                                ×{product.quantity}
                              </Text>
                            </Text>
                          ))}
                        </Stack>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text fw={600} fz="sm">
                          {order.quantity}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )
                })}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>

        <Paper
          withBorder
          radius="lg"
          p="md"
          style={{
            width: 360,
            maxWidth: "100%",
            background: "rgba(255,255,255,0.95)",
            position: "sticky",
            top: 8
          }}
        >
          <Group justify="space-between" align="center" mb={6}>
            <Text fw={700} c="indigo.8" fz="sm">
              Mặt hàng cần dùng
            </Text>

            <Badge variant="light" color="indigo">
              {chosenItems ? Object.keys(chosenItems).length : 0} loại
            </Badge>
          </Group>
          <Text c="dimmed" fz="xs" mb={10}>
            Đây là danh sách tổng hợp từ các đơn đã chọn ở bên trái.
          </Text>

          <Divider mb={10} />

          <ScrollArea.Autosize mah={360} offsetScrollbars>
            <Stack gap={8}>
              {chosenItems && Object.entries(chosenItems).length > 0 ? (
                Object.entries(chosenItems).map(([itemId, quantity]) => {
                  const si = allStorageItemsMap?.[itemId]
                  const isDeleted = !!si?.deletedAt

                  return (
                    <Group
                      key={itemId}
                      justify="space-between"
                      align="flex-start"
                      wrap="nowrap"
                      p={10}
                      style={{
                        borderRadius: rem(12),
                        border: "1px solid rgba(0,0,0,0.06)",
                        background: "rgba(248,250,255,0.65)"
                      }}
                    >
                      <Box style={{ minWidth: 0 }}>
                        <Text
                          fz="sm"
                          fw={600}
                          c={isDeleted ? "red" : undefined}
                          lineClamp={2}
                        >
                          {si ? si.name : "?"}
                        </Text>
                        {!si && (
                          <Text fz="xs" c="red">
                            Không tìm thấy trong kho
                          </Text>
                        )}
                        {isDeleted && (
                          <Text fz="xs" c="red">
                            Mặt hàng đã bị xoá
                          </Text>
                        )}
                      </Box>

                      <Text fw={800} c="indigo.7">
                        {quantity}
                      </Text>
                    </Group>
                  )
                })
              ) : (
                <Box
                  p={16}
                  style={{
                    borderRadius: rem(12),
                    border: "1px dashed rgba(0,0,0,0.15)",
                    background: "rgba(250,250,250,0.8)"
                  }}
                >
                  <Group gap={10} align="start" wrap="nowrap">
                    <ThemeIcon
                      variant="light"
                      color="gray"
                      size={30}
                      radius="xl"
                    >
                      <IconClipboardList size={16} />
                    </ThemeIcon>
                    <Text c="dimmed" fz="sm">
                      Chưa có mặt hàng nào. Hãy chọn ít nhất 1 đơn để xem phần
                      tổng hợp và gửi yêu cầu.
                    </Text>
                  </Group>
                </Box>
              )}
            </Stack>
          </ScrollArea.Autosize>

          {date && (
            <>
              <Divider my={12} />

              <Text fw={600} fz="sm" c="dimmed" mb={8}>
                Gửi yêu cầu xuất kho
              </Text>

              {meData?.roles &&
              ["admin", "order-emp"].some((role) =>
                meData.roles.includes(role)
              ) ? (
                <Stack gap={10}>
                  {missingItemTypes > 0 && (
                    <Group gap={8} align="center" wrap="nowrap">
                      <ThemeIcon
                        variant="light"
                        color="yellow"
                        radius="xl"
                        size={26}
                      >
                        <IconAlertTriangle size={14} />
                      </ThemeIcon>
                      <Text fz="xs" c="yellow.9">
                        Có {missingItemTypes} mặt hàng không còn trong kho và sẽ
                        bị bỏ qua khi gửi.
                      </Text>
                    </Group>
                  )}
                  <Button
                    color="indigo"
                    radius="xl"
                    fw={700}
                    size="md"
                    loading={isPending}
                    disabled={!canSend}
                    onClick={() => {
                      if (!date || !chosenItems) return
                      const body = Object.entries(chosenItems)
                        .filter(([itemId]) => !!allStorageItemsMap[itemId])
                        .map(([itemId, quantity]) => ({
                          _id: itemId,
                          quantity
                        }))
                      if (body.length === 0) return
                      sendRequest({
                        items: body,
                        date,
                        channelId: channelId || undefined
                      })
                    }}
                  >
                    Gửi yêu cầu cho các đơn đã chọn
                  </Button>

                  <Text c="dimmed" fz="xs">
                    Hệ thống sẽ tự loại các item không còn trong kho.
                  </Text>
                </Stack>
              ) : (
                <Text c="dimmed" fz="sm">
                  Bạn không có quyền gửi yêu cầu xuất kho.
                </Text>
              )}
            </>
          )}
        </Paper>
      </Flex>
    </Box>
  )
}
