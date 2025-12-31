import { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { isEqual } from "lodash"

import { useProducts } from "../../hooks/useProducts"
import { useItems } from "../../hooks/useItems"
import { useReadyCombos } from "../../hooks/useReadyCombos"
import { useUsers } from "../../hooks/useUsers"
import { useDeliveredRequests } from "../../hooks/useDeliveredRequests"

import type {
  SearchStorageItemResponse,
  ProductResponse,
  ReadyComboResponse
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
  SegmentedControl,
  Stack,
  Text,
  Title,
  rem,
  Button
} from "@mantine/core"

import { CToast } from "../common/CToast"
import { CDataTable } from "../common/CDataTable"

interface Props {
  orders: {
    products: { name: string; quantity: number }[]
    quantity: number
  }[]
  allCalItems: { _id: string; quantity: number }[]
  date?: Date
}

const normalizeProducts = (products: { _id: string; quantity: number }[]) =>
  [...products].sort((a, b) => a._id.localeCompare(b._id))

type ViewMode = "all" | "ready" | "not-ready"

type OrderRow = {
  _rowId: string
  orderIndex: number
  products: { name: string; quantity: number }[]
  quantity: number
}

export const CalOrdersV2 = ({ orders, allCalItems, date }: Props) => {
  const { getAllProducts } = useProducts()
  const { searchStorageItems } = useItems()
  const { getMe } = useUsers()
  const { createDeliveredRequest } = useDeliveredRequests()
  const { searchCombos } = useReadyCombos()

  const [calRest, setCalRest] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("all")

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
    select: (data) =>
      data.data.reduce(
        (acc, product) => ({ ...acc, [product._id]: product }),
        {} as Record<string, ProductResponse>
      )
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

  const filteredOrders = useMemo(() => {
    if (!allProductsByName) return []
    if (viewMode === "ready") return orders.filter(isOrderReady)
    if (viewMode === "not-ready") return orders.filter((o) => !isOrderReady(o))
    return orders
  }, [orders, allProductsByName, normalizedCombos, viewMode])

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

  const notReadyItems = useMemo(() => {
    if (!notReadyOrders.length || !allProductsByName) return {}
    return notReadyOrders.reduce(
      (acc, order) => {
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
  }, [notReadyOrders, allProductsByName])

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

  // selection state (index theo filteredOrders)
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

  const selectedCount = useMemo(
    () => chosenOrders.filter(Boolean).length,
    [chosenOrders]
  )

  const filteredTotalOrders = useMemo(() => {
    return filteredOrders.reduce((acc, order) => acc + order.quantity, 0)
  }, [filteredOrders])

  const [chosenItems, setChosenItems] = useState<Record<string, number>>()

  useEffect(() => {
    const items = chosenOrders.reduce(
      (acc, chosen, index) => {
        if (!chosen) return acc
        const order = filteredOrders[index]
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
  }, [chosenOrders, calRest, filteredOrders, allCalItems, allProductsByName])

  const { mutate: sendRequest, isPending } = useMutation({
    mutationFn: createDeliveredRequest,
    onSuccess: () =>
      CToast.success({ title: "Gửi yêu cầu xuất kho thành công" }),
    onError: () => CToast.error({ title: "Gửi yêu cầu xuất kho thất bại" })
  })

  // ===== DataTable rows/columns =====
  const orderRows: OrderRow[] = useMemo(
    () =>
      filteredOrders.map((o, idx) => ({
        _rowId: `${idx}-${o.quantity}-${o.products.map((p) => p.name).join("|")}`,
        orderIndex: idx,
        products: o.products,
        quantity: o.quantity
      })),
    [filteredOrders]
  )

  const orderColumns: ColumnDef<OrderRow>[] = useMemo(
    () => [
      {
        id: "products",
        header: "Sản phẩm",
        cell: ({ row }) => {
          const r = row.original
          const isChosen = chosenOrders[r.orderIndex]
          return (
            <Stack gap={2}>
              {r.products.map((product, i) => (
                <Text
                  key={product.name + i}
                  fz="sm"
                  fw={500}
                  c={isChosen ? "indigo.7" : undefined}
                >
                  {product.name}{" "}
                  <Text span c="dimmed" fz="xs">
                    ×{product.quantity}
                  </Text>
                </Text>
              ))}
            </Stack>
          )
        }
      },
      {
        accessorKey: "quantity",
        header: "Số đơn",
        cell: ({ row }) => (
          <Text fw={600} fz="sm">
            {row.original.quantity}
          </Text>
        )
      }
    ],
    [chosenOrders]
  )

  // ===== UI helpers =====
  const canSend = !!date && !!chosenItems && selectedCount > 0 && !isPending
  const canSendNotReady =
    !!date &&
    !isPending &&
    notReadyItems &&
    Object.keys(notReadyItems).length > 0

  const pageSizeHuge = 100000

  return (
    <Box>
      {/* Toolbar */}
      <Paper>
        <Group justify="space-between" align="center" wrap="wrap" gap={10}>
          <Group gap={10} wrap="wrap">
            <Title order={6} style={{ marginRight: 6 }}>
              Danh sách đơn cần đóng
            </Title>

            <Badge variant="light" color="indigo">
              {filteredTotalOrders} đơn
            </Badge>

            <Badge variant="light" color={selectedCount ? "blue" : "gray"}>
              Đã chọn: {selectedCount}
            </Badge>
          </Group>

          <Group gap={10} wrap="wrap">
            <SegmentedControl
              value={viewMode}
              onChange={(val) => setViewMode(val as ViewMode)}
              data={[
                { value: "all", label: "Tất cả" },
                { value: "ready", label: "Đã sẵn" },
                { value: "not-ready", label: "Chưa sẵn" }
              ]}
              radius="xl"
              size="sm"
            />

            <Checkbox
              label="Chọn tất cả"
              size="sm"
              checked={chosenOrders.length > 0 && chosenOrders.every(Boolean)}
              indeterminate={
                chosenOrders.some(Boolean) && !chosenOrders.every(Boolean)
              }
              onChange={(e) => {
                const checked = e.currentTarget.checked
                setChosenOrders(filteredOrders.map(() => checked))
              }}
            />

            <Checkbox
              label="Tính số còn lại"
              size="sm"
              checked={calRest}
              onChange={() => setCalRest((p) => !p)}
              color="indigo"
            />
          </Group>
        </Group>

        <Text c="dimmed" fz="xs" mt={6}>
          Tip: click vào một dòng để chọn/bỏ chọn. Panel bên phải sẽ tự cập nhật
          danh sách mặt hàng cần dùng.
        </Text>
      </Paper>

      {/* Main 2-column layout */}
      <Flex
        gap={14}
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "flex-start" }}
      >
        {/* Left: Orders table */}
        <Paper withBorder radius="lg" p="md" style={{ flex: 1 }}>
          <CDataTable<OrderRow, any>
            key={`${viewMode}-${orderRows.length}`} // remount để pageSize ăn khi viewMode đổi
            columns={orderColumns}
            data={orderRows}
            enableGlobalFilter={false}
            enableRowSelection={false}
            initialPageSize={pageSizeHuge}
            pageSizeOptions={[pageSizeHuge]}
            getRowId={(r) => r._rowId}
            onRowClick={(row) => toggleOrders(row.original.orderIndex)}
            getRowClassName={(row) =>
              chosenOrders[row.original.orderIndex]
                ? "bg-indigo-50/70 hover:bg-indigo-50/70"
                : ""
            }
            className="min-w-[320px] [&>div:last-child]:hidden"
          />
        </Paper>

        {/* Right: Items panel */}
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
            <Text fw={700} c="indigo.8">
              Mặt hàng cần dùng
            </Text>

            <Badge variant="light" color="indigo">
              {chosenItems ? Object.keys(chosenItems).length : 0} loại
            </Badge>
          </Group>

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
                  <Button
                    color="indigo"
                    radius="xl"
                    fw={700}
                    variant="light"
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
                      sendRequest({ items: body, date })
                    }}
                  >
                    Gửi cho các đơn đã chọn
                  </Button>

                  <Button
                    color="indigo"
                    radius="xl"
                    fw={700}
                    variant="outline"
                    loading={isPending}
                    disabled={!canSendNotReady}
                    onClick={() => {
                      if (!date || !notReadyItems) return
                      const body = Object.entries(notReadyItems)
                        .filter(([itemId]) => !!allStorageItemsMap[itemId])
                        .map(([itemId, quantity]) => ({
                          _id: itemId,
                          quantity
                        }))
                      if (body.length === 0) return
                      sendRequest({ items: body, date })
                    }}
                  >
                    Gửi cho đơn chưa sẵn
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
