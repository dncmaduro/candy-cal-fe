import { useQuery } from "@tanstack/react-query"
import { useShopeeProducts } from "../../hooks/useShopeeProducts"
import {
  SearchShopeeProductsResponse,
  SearchStorageItemResponse
} from "../../hooks/models"
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Group,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  Badge,
  rem
} from "@mantine/core"
import { useEffect, useMemo, useState } from "react"
import { useItems } from "../../hooks/useItems"
import { useUsers } from "../../hooks/useUsers"
import { useDeliveredRequests } from "../../hooks/useDeliveredRequests"
import { useMutation } from "@tanstack/react-query"
import { CToast } from "../common/CToast"
import { DatePickerInput } from "@mantine/dates"
import {
  DELIVERED_REQUEST_CHANNEL_PLATFORM,
  useDeliveredRequestChannels
} from "../../hooks/useDeliveredRequestChannels"
import { getDeliveredRequestChannelLabel } from "../delivered-requests/deliveredRequestChannel"

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

export const ShopeeCalOrders = ({ orders, allCalItems, date }: Props) => {
  const { searchShopeeProducts } = useShopeeProducts()
  const { searchStorageItems } = useItems()
  const { getMe } = useUsers()
  const { createDeliveredRequest } = useDeliveredRequests()
  const platform = DELIVERED_REQUEST_CHANNEL_PLATFORM.SHOPEE
  const [calRest, setCalRest] = useState<boolean>(false)
  const [requestDate, setRequestDate] = useState<Date | null>(date ?? null)
  const [channelId, setChannelId] = useState<string | null>(null)
  const { data: channels = [], isLoading: isLoadingChannels } =
    useDeliveredRequestChannels(platform)

  useEffect(() => {
    setRequestDate(date ?? null)
  }, [date])

  useEffect(() => {
    if (channelId || channels.length === 0) return
    setChannelId(channels[0]._id)
  }, [channelId, channels])

  const { data: meData } = useQuery({
    queryKey: ["getMe"],
    queryFn: getMe,
    select: (data) => data.data
  })

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
    queryFn: () => searchStorageItems({ searchText: "", deleted: false }),
    select: (data) => data.data
  })

  const allStorageItems = useMemo(() => {
    return storageItemsData?.reduce(
      (acc, item) => ({ ...acc, [item._id]: item }),
      {} as Record<string, SearchStorageItemResponse>
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

  useEffect(() => {
    setChosenOrders(orders.map(() => false))
  }, [orders])

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

  const { mutate: sendRequest, isPending } = useMutation({
    mutationFn: createDeliveredRequest,
    onSuccess: () =>
      CToast.success({ title: "Gửi yêu cầu xuất kho thành công" }),
    onError: () => CToast.error({ title: "Gửi yêu cầu xuất kho thất bại" })
  })

  const selectedCount = useMemo(
    () => chosenOrders.filter(Boolean).length,
    [chosenOrders]
  )

  const channelOptions = useMemo(
    () =>
      channels.map((channel) => ({
        value: channel._id,
        label: channel.name
      })),
    [channels]
  )

  const canSend =
    !!requestDate && !!chosenItems && !!channelId && selectedCount > 0 && !isPending

  return (
    <Box>
      <Flex
        gap={14}
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "flex-start" }}
      >
        <Paper
          withBorder
          radius="lg"
          p="md"
          style={{
            flex: 1,
            background: "rgba(255,250,245,0.92)"
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap" gap={10}>
            <Group gap={10} wrap="wrap">
              <Text fw={700} c="orange.8">
                Danh sách đơn Shopee cần đóng
              </Text>

              <Badge variant="light" color="orange">
                {totalOrders} đơn
              </Badge>

              <Badge variant="light" color={selectedCount ? "yellow" : "gray"}>
                Đã chọn: {selectedCount}
              </Badge>
            </Group>

            <Checkbox
              label="Tính số còn lại"
              checked={calRest}
              onChange={() => setCalRest((prev) => !prev)}
              color="orange"
            />
          </Group>

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
        </Paper>

        <Paper
          withBorder
          radius="lg"
          p="md"
          style={{
            width: 360,
            maxWidth: "100%",
            background: "rgba(255,255,255,0.92)"
          }}
        >
          <Group justify="space-between" align="center" mb={8}>
            <Text fw={700} c="orange.8">
              Mặt hàng cần dùng
            </Text>

            <Badge variant="light" color="orange">
              {chosenItems ? Object.keys(chosenItems).length : 0} loại
            </Badge>
          </Group>

          <Divider mb={10} />

          <ScrollArea.Autosize mah={360} offsetScrollbars>
            <Stack gap={8}>
              {chosenItems && Object.entries(chosenItems).length > 0 ? (
                Object.entries(chosenItems).map(([itemId, quantity]) => (
                  <Group
                    key={itemId}
                    justify="space-between"
                    align="flex-start"
                    wrap="nowrap"
                    p={10}
                    style={{
                      borderRadius: rem(12),
                      border: "1px solid rgba(0,0,0,0.06)",
                      background: "rgba(255,247,237,0.75)"
                    }}
                  >
                    <Box style={{ minWidth: 0 }}>
                      <Text fz="sm" fw={600} lineClamp={2}>
                        {allStorageItems?.[itemId]?.name || "?"}
                      </Text>
                      {!allStorageItems?.[itemId] && (
                        <Text fz="xs" c="red">
                          Không tìm thấy trong kho
                        </Text>
                      )}
                    </Box>

                    <Text fw={800} c="orange.7">
                      {quantity}
                    </Text>
                  </Group>
                ))
              ) : (
                <Box
                  p={14}
                  style={{
                    borderRadius: rem(12),
                    border: "1px dashed rgba(0,0,0,0.15)",
                    background: "rgba(250,250,250,0.8)"
                  }}
                >
                  <Text c="dimmed" fz="sm">
                    Chưa có mặt hàng nào. Hãy chọn ít nhất 1 đơn ở bảng bên
                    trái.
                  </Text>
                </Box>
              )}
            </Stack>
          </ScrollArea.Autosize>

          <Divider my={12} />

          <Text fw={600} fz="sm" c="dimmed" mb={8}>
            Gửi yêu cầu xuất kho
          </Text>

          {meData?.roles &&
          ["admin", "accounting-emp"].some((role) => meData.roles.includes(role)) ? (
            <Stack gap={10}>
              {!date && (
                <DatePickerInput
                  label="Chọn ngày xuất kho"
                  placeholder="DD/MM/YYYY"
                  value={requestDate}
                  onChange={setRequestDate}
                  valueFormat="DD/MM/YYYY"
                  size="sm"
                  radius="md"
                  clearable
                />
              )}

              <Select
                label={getDeliveredRequestChannelLabel(platform)}
                placeholder="Chọn kênh"
                value={channelId}
                onChange={setChannelId}
                data={channelOptions}
                searchable
                clearable={false}
                disabled={isPending}
                rightSection={isLoadingChannels ? <Text size="xs">...</Text> : null}
              />

              {channelOptions.length === 0 && !isLoadingChannels && (
                <Text c="red" fz="xs">
                  Không có kênh Shopee phù hợp để gửi yêu cầu xuất kho.
                </Text>
              )}

              <Button
                color="orange"
                radius="xl"
                fw={700}
                variant="light"
                loading={isPending}
                disabled={!canSend}
                onClick={() => {
                  if (!requestDate || !chosenItems) return
                  const body = Object.entries(chosenItems)
                    .filter(([itemId]) => !!allStorageItems?.[itemId])
                    .map(([itemId, quantity]) => ({
                      _id: itemId,
                      quantity
                    }))
                  if (body.length === 0) return
                  sendRequest({
                    items: body,
                    date: requestDate,
                    channelId: channelId || undefined
                  })
                }}
              >
                Gửi cho các đơn đã chọn
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
        </Paper>
      </Flex>
    </Box>
  )
}
