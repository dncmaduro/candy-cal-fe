import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  Badge,
  Group,
  Box,
  rem,
  Text,
  Stack,
  Paper,
  Grid,
  Title,
  Divider,
  ActionIcon,
  Tooltip,
  Button
} from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  IconArrowLeft,
  IconEdit,
  IconTruck,
  IconTrash,
  IconPrinter,
  IconRefresh
} from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { useCallback, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { useMutation } from "@tanstack/react-query"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { CDataTable } from "../../../components/common/CDataTable"
import { useSalesOrders } from "../../../hooks/useSalesOrders"
import { UpdateShippingCodeModal } from "../../../components/sales/UpdateShippingCodeModal"
import { UpdateOrderItemsModal } from "../../../components/sales/UpdateOrderItemsModal"
import { ConvertToOfficialModal } from "../../../components/sales/ConvertToOfficialModal"
import { CToast } from "../../../components/common/CToast"
import { Can } from "../../../components/common/Can"
import { QuotationModal } from "../../../components/sales/QuotationModal"

export const Route = createFileRoute("/sales/orders/$orderId")({
  component: RouteComponent
})

const STAGE_BADGE_COLOR: Record<string, string> = {
  lead: "green",
  contacted: "cyan",
  customer: "blue",
  closed: "gray"
}

const STAGE_LABEL: Record<string, string> = {
  lead: "Lead",
  contacted: "Đã liên hệ",
  customer: "Khách hàng",
  closed: "Đã đóng"
}

function RouteComponent() {
  const { orderId } = Route.useParams()
  const navigate = useNavigate()
  const { getSalesOrderById, deleteSalesOrder, updateSalesOrderItems } =
    useSalesOrders()

  // No longer need state for editable fields - now read-only from API

  const { data, refetch } = useQuery({
    queryKey: ["salesOrder", orderId],
    queryFn: () => getSalesOrderById(orderId)
  })

  const order = data?.data

  const { mutate: sync, isPending: isSyncing } = useMutation({
    mutationFn: () =>
      updateSalesOrderItems(orderId, {
        items: order?.items.map((si) => ({
          code: si.code,
          quantity: si.quantity
        }))
      }),
    onSuccess: () => {
      CToast.success({ title: "Đồng bộ sản phẩm thành công" })
      refetch()
    },
    onError: (error: any) => {
      CToast.error({
        title:
          error?.response?.data?.message || "Có lỗi xảy ra khi đồng bộ sản phẩm"
      })
    }
  })

  // No longer need mutation for mass and area - now read-only from API

  const factoryDisplay = useCallback((factory: string) => {
    const factories: Record<string, string> = {
      candy: "Xưởng kẹo mút",
      manufacturing: "Xưởng gia công",
      position_MongCai: "Kho Móng Cái",
      jelly: "Xưởng thạch",
      import: "Hàng nhập khẩu"
    }
    return factories[factory] || factory
  }, [])

  type OrderItem = {
    code: string
    name: string
    price: number
    quantity: number
    source?: "inside" | "outside"
    factory?:
      | "candy"
      | "manufacturing"
      | "position_MongCai"
      | "jelly"
      | "import"
    note?: string
  }

  type ExtendedOrderItem = OrderItem & {
    weight: number
    totalWeight: number
    squareMetersPerItem: number
    totalSquareMeters: number
    specification: string
  }

  // Process items with extended data from API
  const extendedItems = useMemo((): ExtendedOrderItem[] => {
    if (!order?.items) return []

    return order.items.map((item) => {
      // Now all values come directly from API
      const weight = item.mass ?? 0
      const squareMetersPerItem = item.area ?? 0
      const specification = item.specification ?? ""

      return {
        ...item,
        weight,
        totalWeight: weight * item.quantity,
        squareMetersPerItem,
        totalSquareMeters: squareMetersPerItem * item.quantity,
        specification
      }
    })
  }, [order?.items])

  // Calculate enhanced totals including shipping
  const enhancedCalculations = useMemo(() => {
    const totalQuantity = extendedItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    )
    const totalWeight = extendedItems.reduce(
      (sum, item) => sum + item.totalWeight,
      0
    )
    const totalSquareMeters = extendedItems.reduce(
      (sum, item) => sum + item.totalSquareMeters,
      0
    )
    const subtotal = extendedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    const orderDiscount = order?.orderDiscount || 0
    const otherDiscount = order?.otherDiscount || 0
    const totalDiscount = orderDiscount + otherDiscount
    const subtotalAfterDiscount = subtotal - totalDiscount

    const shippingCost = order?.shippingCost || 0
    const tax = order?.tax || 0
    const deposit = order?.deposit || 0

    const totalAmount = subtotalAfterDiscount + tax + shippingCost
    const remainingAmount = totalAmount - deposit

    return {
      totalQuantity,
      totalWeight,
      totalSquareMeters,
      subtotal,
      orderDiscount,
      otherDiscount,
      totalDiscount,
      subtotalAfterDiscount,
      shippingCost,
      tax,
      deposit,
      totalAmount,
      remainingAmount
    }
  }, [
    extendedItems,
    order?.orderDiscount,
    order?.otherDiscount,
    order?.tax,
    order?.deposit,
    order?.shippingCost
  ])

  const itemColumns = useMemo<ColumnDef<ExtendedOrderItem>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Mã SP",
        cell: ({ row }) => (
          <Text fw={500} size="sm">
            {row.original.code}
          </Text>
        )
      },
      {
        accessorKey: "name",
        header: "Tên sản phẩm",
        cell: ({ row }) => <Text size="sm">{row.original.name}</Text>
      },
      {
        accessorKey: "quantity",
        header: "Số lượng",
        cell: ({ row }) => <Text size="sm">{row.original.quantity}</Text>
      },
      {
        id: "squareMetersPerItem",
        header: "m³/sp",
        cell: ({ row }) => (
          <Text size="sm">
            {row.original.squareMetersPerItem > 0
              ? `${row.original.squareMetersPerItem} m³`
              : "-"}
          </Text>
        )
      },
      {
        id: "totalSquareMeters",
        header: "Tổng m³",
        cell: ({ row }) => (
          <Text size="sm">
            {row.original.totalSquareMeters > 0
              ? `${row.original.totalSquareMeters.toFixed(2)} m³`
              : "-"}
          </Text>
        )
      },
      {
        id: "specification",
        header: "Quy cách",
        cell: ({ row }) => (
          <Text size="sm">{row.original.specification || "-"}</Text>
        )
      },
      {
        accessorKey: "price",
        header: "Đơn giá",
        cell: ({ row }) => (
          <Text size="sm">{row.original.price.toLocaleString("vi-VN")}đ</Text>
        )
      },
      {
        id: "total",
        header: "Thành tiền",
        cell: ({ row }) => (
          <Text fw={500} size="sm">
            {(row.original.price * row.original.quantity).toLocaleString(
              "vi-VN"
            )}
            đ
          </Text>
        )
      },
      {
        id: "weight",
        header: "kg/sp",
        cell: ({ row }) => (
          <Text size="sm">
            {row.original.weight > 0 ? `${row.original.weight} kg` : "-"}
          </Text>
        )
      },
      {
        id: "totalWeight",
        header: "Tổng kg",
        cell: ({ row }) => (
          <Text size="sm">
            {row.original.totalWeight > 0
              ? `${row.original.totalWeight.toFixed(2)} kg`
              : "-"}
          </Text>
        )
      },
      {
        accessorKey: "factory",
        header: "Xưởng/Kho",
        cell: ({ row }) => (
          <Text size="sm">{factoryDisplay(row.original.factory || "")}</Text>
        )
      },
      {
        accessorKey: "source",
        header: "Nguồn hàng",
        cell: ({ row }) => (
          <Badge
            variant="light"
            color={row.original.source === "inside" ? "green" : "orange"}
          >
            {row.original.source === "inside"
              ? "Hàng trong nhà máy"
              : "Hàng ngoài nhà máy"}
          </Badge>
        )
      },
      {
        accessorKey: "note",
        header: "Ghi chú",
        cell: ({ row }) => <Text size="sm">{row.original.note || "-"}</Text>
      }
    ],
    [factoryDisplay]
  )

  const handleUpdateShippingInfo = () => {
    if (!order) return
    modals.open({
      title: <b>Cập nhật thông tin vận chuyển & thuế</b>,
      children: (
        <UpdateShippingCodeModal
          orderId={order._id}
          currentShippingCode={order.shippingCode}
          currentShippingType={order.shippingType}
          currentTax={order.tax}
          currentShippingCost={order.shippingCost}
          currentReceivedDate={
            order.receivedDate ? new Date(order.receivedDate) : undefined
          }
          total={order.total}
          weight={enhancedCalculations.totalWeight}
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "lg"
    })
  }

  const handleUpdateItems = () => {
    if (!order) return
    modals.open({
      title: <b>Cập nhật sản phẩm, chiết khấu & tiền cọc</b>,
      children: (
        <UpdateOrderItemsModal
          orderId={order._id}
          currentItems={order.items.map((si) => ({
            code: si.code,
            quantity: si.quantity,
            note: si.note
          }))}
          currentOrderDiscount={order.orderDiscount}
          currentOtherDiscount={order.otherDiscount}
          currentDeposit={order.deposit}
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "xl"
    })
  }

  const handleConvertToOfficial = () => {
    if (!order) return
    modals.open({
      title: <b>Chuyển đơn hàng sang chính thức</b>,
      children: (
        <ConvertToOfficialModal
          orderId={order._id}
          currentShippingCode={order.shippingCode}
          currentShippingType={order.shippingType}
          currentTax={order.tax}
          currentShippingCost={order.shippingCost}
          currentReceivedDate={
            order.receivedDate ? new Date(order.receivedDate) : undefined
          }
          total={order.total}
          weight={enhancedCalculations.totalWeight}
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "lg"
    })
  }

  const handleDeleteAndCreateNew = async () => {
    if (!order) return

    try {
      await deleteSalesOrder({ id: order._id })
      CToast.success({ title: "Đã xóa đơn hàng" })

      // Navigate to orders page with state to trigger create modal
      navigate({
        to: "/sales/orders",
        search: {
          createNew: "true",
          channelId: order.salesFunnelId.channel._id,
          funnelId: order.salesFunnelId._id,
          items: JSON.stringify(
            order.items.map((item) => ({
              code: item.code,
              quantity: item.quantity
            }))
          ),
          orderDiscount: order.orderDiscount?.toString(),
          otherDiscount: order.otherDiscount?.toString(),
          deposit: order.deposit?.toString()
        }
      })
    } catch (error: any) {
      CToast.error({
        title:
          error?.response?.data?.message || "Có lỗi xảy ra khi xóa đơn hàng"
      })
    }
  }

  const handleDeleteOrder = () => {
    if (!order) return
    modals.open({
      title: <b>Xác nhận xóa</b>,
      children: (
        <Stack gap="md">
          <Text>Bạn có chắc chắn muốn xóa đơn hàng này?</Text>
          <Text size="sm" c="dimmed">
            Hoặc bạn có thể xóa và tạo đơn mới với cùng thông tin khách hàng và
            sản phẩm.
          </Text>

          <Group justify="space-between" mt="md">
            <Button
              variant="outline"
              color="blue"
              onClick={() => {
                modals.closeAll()
                handleDeleteAndCreateNew()
              }}
            >
              Xóa & Tạo đơn mới
            </Button>

            <Group gap="xs">
              <Button variant="default" onClick={() => modals.closeAll()}>
                Hủy
              </Button>
              <Button
                color="red"
                onClick={async () => {
                  try {
                    await deleteSalesOrder({ id: order._id })
                    CToast.success({ title: "Xóa đơn hàng thành công" })
                    modals.closeAll()
                    navigate({ to: "/sales/orders" })
                  } catch (error: any) {
                    CToast.error({
                      title:
                        error?.response?.data?.message ||
                        "Có lỗi xảy ra khi xóa đơn hàng"
                    })
                  }
                }}
              >
                Xóa
              </Button>
            </Group>
          </Group>
        </Stack>
      )
    })
  }

  if (!order) {
    return (
      <SalesLayout>
        <Box p="xl">
          <Text>Đang tải...</Text>
        </Box>
      </SalesLayout>
    )
  }

  const handleSyncItems = () => {
    sync()
  }

  return (
    <SalesLayout>
      <Box
        mt={40}
        mx="auto"
        px={{ base: 8, md: 0 }}
        w="100%"
        style={{
          background: "rgba(255,255,255,0.97)",
          borderRadius: rem(20),
          boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
          border: "1px solid #ececec"
        }}
      >
        {/* Header Section */}
        <Box pt={32} pb={16} px={{ base: 8, md: 28 }}>
          <Group justify="space-between" mb="lg">
            <Group>
              <ActionIcon
                variant="subtle"
                onClick={() => navigate({ to: "/sales/orders" })}
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
              <div>
                <Title order={2}>Chi tiết đơn hàng</Title>
                <Text c="dimmed" size="sm">
                  Thông tin chi tiết đơn hàng và sản phẩm
                </Text>
              </div>
            </Group>
            <Can roles={["admin", "sales-leader", "sales-emp"]}>
              <Group>
                <Button
                  color="gray"
                  leftSection={<IconPrinter size={18} />}
                  onClick={() =>
                    modals.open({
                      title: <b>Báo giá cho khách</b>,
                      children: (
                        <QuotationModal
                          orderId={order._id}
                          shippingCost={order.shippingCost}
                        />
                      ),
                      size: "70vw"
                    })
                  }
                >
                  Báo giá cho khách
                </Button>
                <Tooltip label="Cập nhật vận chuyển & thuế" withArrow>
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="lg"
                    onClick={handleUpdateShippingInfo}
                  >
                    <IconTruck size={20} />
                  </ActionIcon>
                </Tooltip>
                {order.status === "draft" && (
                  <>
                    <Button
                      variant="light"
                      color="green"
                      leftSection={<IconTruck size={18} />}
                      onClick={handleConvertToOfficial}
                    >
                      Chuyển sang chính thức
                    </Button>

                    <Tooltip label="Cập nhật sản phẩm" withArrow>
                      <ActionIcon
                        variant="light"
                        color="indigo"
                        size="lg"
                        onClick={handleUpdateItems}
                      >
                        <IconEdit size={20} />
                      </ActionIcon>
                    </Tooltip>
                  </>
                )}

                <Tooltip label="Xóa đơn hàng" withArrow>
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="lg"
                    onClick={handleDeleteOrder}
                  >
                    <IconTrash size={20} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Can>
          </Group>
        </Box>

        {/* Content */}
        <Box px={{ base: 8, md: 28 }} pb={32}>
          <Grid>
            {/* Customer Information */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="lg" withBorder>
                <Title order={4} mb="md">
                  Thông tin khách hàng
                </Title>
                <Divider mb="md" />
                <Grid gutter="md">
                  <Grid.Col span={6}>
                    <Stack gap={12}>
                      <div>
                        <Text size="sm" c="dimmed">
                          Tên khách hàng
                        </Text>
                        <Group>
                          <Text fw={500}>{order.salesFunnelId.name}</Text>
                          <Badge
                            variant="light"
                            size="sm"
                            color={order.returning ? "violet" : "green"}
                          >
                            {order.returning ? "Khách cũ" : "Khách mới"}
                          </Badge>
                        </Group>
                      </div>
                      <div>
                        <Text size="sm" c="dimmed">
                          Địa chỉ
                        </Text>
                        <Text>{order.address || "N/A"}</Text>
                      </div>
                      <div>
                        <Text size="sm" c="dimmed" mb={0}>
                          Kênh bán hàng
                        </Text>
                        <Text>
                          {order.salesFunnelId.channel?.channelName || "N/A"}
                        </Text>
                      </div>
                      <div>
                        <Text size="sm" c="dimmed">
                          Giai đoạn khách hàng
                        </Text>
                        <Badge
                          color={STAGE_BADGE_COLOR[order.salesFunnelId.stage]}
                          size="lg"
                        >
                          {STAGE_LABEL[order.salesFunnelId.stage]}
                        </Badge>
                      </div>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Stack gap={12}>
                      <div>
                        <Text size="sm" c="dimmed">
                          Số điện thoại
                        </Text>
                        <Text>{order.salesFunnelId.phoneNumber || "N/A"}</Text>
                      </div>
                      <div>
                        <Text size="sm" c="dimmed">
                          Tỉnh/Thành phố
                        </Text>
                        <Text>
                          {order.province ? order.province.name : "N/A"}
                        </Text>
                      </div>
                      <div>
                        <Text size="sm" c="dimmed">
                          Nhân viên phụ trách
                        </Text>
                        <Text>{order.salesFunnelId.user?.name || "N/A"}</Text>
                      </div>
                      {order.salesFunnelId.cost && (
                        <div>
                          <Text size="sm" c="dimmed">
                            Chi phí marketing
                          </Text>
                          <Text fw={500} c="orange">
                            {order.salesFunnelId.cost.toLocaleString("vi-VN")}đ
                          </Text>
                        </div>
                      )}
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Paper>
            </Grid.Col>

            {/* Order Information */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="lg" withBorder>
                <Title order={4} mb="md">
                  Thông tin đơn hàng
                </Title>
                <Divider mb="md" />
                <Grid gutter="md">
                  <Grid.Col span={6}>
                    <Stack gap={12}>
                      <div>
                        <Text size="sm" c="dimmed">
                          Trạng thái
                        </Text>
                        <Badge
                          color={order.status === "official" ? "green" : "gray"}
                          size="lg"
                        >
                          {order.status === "official"
                            ? "Chính thức"
                            : "Báo giá"}
                        </Badge>
                      </div>
                      <div>
                        <Text size="sm" c="dimmed">
                          Mã vận đơn
                        </Text>
                        <Text fw={500}>{order.shippingCode || "Chưa có"}</Text>
                      </div>
                      <div>
                        <Text size="sm" c="dimmed">
                          Kho xuất hàng
                        </Text>
                        <Text>
                          {order.storage === "position_HaNam"
                            ? "Kho Hà Nội"
                            : "Kho MKT"}
                        </Text>
                      </div>

                      <div>
                        <Text size="sm" c="dimmed">
                          Ngày đặt hàng
                        </Text>
                        <Text>
                          {format(new Date(order.date), "dd/MM/yyyy")}
                        </Text>
                      </div>

                      <div>
                        <Text size="sm" c="dimmed">
                          Số điện thoại
                        </Text>
                        <Text>{order.phoneNumber || "Chưa có"}</Text>
                      </div>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Stack gap={12}>
                      <div>
                        <Text size="sm" c="dimmed">
                          Đơn vị vận chuyển
                        </Text>
                        <Text>
                          {order.shippingType === "shipping_vtp"
                            ? "Viettel Post"
                            : order.shippingType === "shipping_cargo"
                              ? "Shipcode lên chành"
                              : "Chưa có"}
                        </Text>
                      </div>
                      {order.tax !== undefined && (
                        <div>
                          <Text size="sm" c="dimmed">
                            Thuế
                          </Text>
                          <Text fw={500}>
                            {order.tax.toLocaleString("vi-VN")}đ
                          </Text>
                        </div>
                      )}
                      {order.shippingCost !== undefined && (
                        <div>
                          <Text size="sm" c="dimmed">
                            Phí vận chuyển
                          </Text>
                          <Text fw={500}>
                            {order.shippingCost.toLocaleString("vi-VN")}đ
                          </Text>
                        </div>
                      )}
                      <div>
                        <Text size="sm" c="dimmed">
                          Ngày tạo
                        </Text>
                        <Text>
                          {format(
                            new Date(order.createdAt),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </Text>
                      </div>
                      <div>
                        <Text size="sm" c="dimmed">
                          Cập nhật lần cuối
                        </Text>
                        <Text>
                          {format(
                            new Date(order.updatedAt),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </Text>
                      </div>
                      {order.receivedDate && (
                        <div>
                          <Text size="sm" c={"dimmed"}>
                            Ngày thu tiền
                          </Text>
                          <Text>
                            {format(new Date(order.receivedDate), "dd/MM/yyyy")}
                          </Text>
                        </div>
                      )}
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Paper>
            </Grid.Col>

            {/* Order Items */}
            <Grid.Col span={12}>
              <Paper p="lg" withBorder>
                <Title order={4} mb="md">
                  Chi tiết sản phẩm
                </Title>
                <Divider mb="md" />
                <CDataTable
                  columns={itemColumns}
                  data={extendedItems}
                  enableGlobalFilter={false}
                  pageSizeOptions={[10, 20, 50]}
                  initialPageSize={10}
                  extraActions={
                    <Group>
                      <Button
                        onClick={handleSyncItems}
                        color="indigo"
                        leftSection={<IconRefresh size={16} />}
                        loading={isSyncing}
                        disabled={isSyncing}
                        variant="light"
                      >
                        Đồng bộ sản phẩm
                      </Button>
                    </Group>
                  }
                />
                {/* Enhanced Summary Section */}
                <Box
                  mt="md"
                  p="xs"
                  style={{
                    border: "1px solid #dee2e6",
                    borderRadius: "4px"
                  }}
                >
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm">Tổng tiền hàng:</Text>
                      <Text size="sm" fw={500}>
                        {enhancedCalculations.subtotal.toLocaleString("vi-VN")}đ
                      </Text>
                    </Group>

                    {enhancedCalculations.orderDiscount > 0 && (
                      <Group justify="space-between">
                        <Text size="sm">Chiết khấu đơn hàng:</Text>
                        <Text size="sm" c="orange" fw={500}>
                          -
                          {enhancedCalculations.orderDiscount.toLocaleString(
                            "vi-VN"
                          )}
                          đ
                        </Text>
                      </Group>
                    )}

                    {enhancedCalculations.otherDiscount > 0 && (
                      <Group justify="space-between">
                        <Text size="sm">Chiết khấu 2:</Text>
                        <Text size="sm" c="pink" fw={500}>
                          -
                          {enhancedCalculations.otherDiscount.toLocaleString(
                            "vi-VN"
                          )}
                          đ
                        </Text>
                      </Group>
                    )}

                    <Group justify="space-between">
                      <Text size="sm">
                        Phí vận chuyển (
                        {enhancedCalculations.totalWeight < 10
                          ? "45k"
                          : `5k/kg`}
                        ):
                      </Text>
                      <Text size="sm">
                        {order.shippingCost?.toLocaleString("vi-VN")}đ
                      </Text>
                    </Group>

                    {enhancedCalculations.tax > 0 && (
                      <Group justify="space-between">
                        <Text size="sm">Thuế:</Text>
                        <Text size="sm">
                          {enhancedCalculations.tax.toLocaleString("vi-VN")}đ
                        </Text>
                      </Group>
                    )}

                    <Divider />
                    <Group justify="space-between">
                      <Text fw={600} size="md">
                        Tổng cộng:
                      </Text>
                      <Text fw={600} size="md">
                        {enhancedCalculations.totalAmount.toLocaleString(
                          "vi-VN"
                        )}
                        đ
                      </Text>
                    </Group>

                    {enhancedCalculations.deposit > 0 && (
                      <>
                        <Group justify="space-between">
                          <Text size="sm">Tiền cọc:</Text>
                          <Text size="sm">
                            {enhancedCalculations.deposit.toLocaleString(
                              "vi-VN"
                            )}
                            đ
                          </Text>
                        </Group>
                        <Divider />
                        <Group justify="space-between">
                          <Text
                            fw={700}
                            size="lg"
                            style={{
                              backgroundColor: "#f8f9fa",
                              padding: "4px 8px",
                              borderRadius: "4px"
                            }}
                          >
                            Còn phải trả:
                          </Text>
                          <Text
                            fw={700}
                            size="lg"
                            style={{
                              backgroundColor: "#f8f9fa",
                              padding: "4px 8px",
                              borderRadius: "4px"
                            }}
                          >
                            {enhancedCalculations.remainingAmount.toLocaleString(
                              "vi-VN"
                            )}
                            đ
                          </Text>
                        </Group>
                      </>
                    )}
                  </Stack>
                </Box>
              </Paper>
            </Grid.Col>
          </Grid>
        </Box>
      </Box>
    </SalesLayout>
  )
}
