import { useQuery } from "@tanstack/react-query"
import { useSalesOrders } from "../../hooks/useSalesOrders"
import {
  Group,
  Text,
  Table,
  Stack,
  Title,
  Divider,
  Box,
  Button,
  Image,
  Paper
} from "@mantine/core"
import { format } from "date-fns"
import { useMemo, useState, useRef } from "react"
import html2canvas from "html2canvas"
import { IconCamera } from "@tabler/icons-react"
import { CToast } from "../common/CToast"
import { useSalesChannels } from "../../hooks/useSalesChannels"

interface ItemWithExtendedData {
  code: string
  name: string
  quantity: number
  price: number
  weight: number
  totalWeight: number
  squareMetersPerItem: number
  totalSquareMeters: number
  specification: string
  note?: string
}

interface Calculations {
  totalQuantity: number
  totalWeight: number
  totalIndividualWeight: number
  totalSquareMeters: number
  shippingCost: number
  subtotal: number
  orderDiscount: number
  otherDiscount: number
  totalDiscount: number
  subtotalAfterDiscount: number
  tax: number
  deposit: number
  totalAmount: number
  remainingAmount: number
}

interface Props {
  orderId: string
  shippingCost?: number
}

/* =========================
 *  CAPTURE COMPONENT: BÁO GIÁ (PHIẾU XUẤT HÀNG DỰ KIẾN)
 *  Layout = giống contentRef cũ nhưng tách riêng, table nổi bật
 * ======================= */

interface QuotationCaptureContentProps {
  order: any
  channel: any
  items: ItemWithExtendedData[]
  calculations: Calculations
}

const QuotationCaptureContent = ({
  order,
  channel,
  items,
  calculations
}: QuotationCaptureContentProps) => {
  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      w={1300}
      bg="white"
      shadow="xs"
      style={{ boxSizing: "border-box" }}
    >
      {/* HEADER NGANG KIỂU EXCEL */}
      <Group justify="space-between" align="flex-start" mb="sm">
        <Group>
          <Text size="sm" fw={700} c="red">
            Phiếu xuất hàng dự kiến - {channel?.channel.channelName}
          </Text>
          <Image
            src={channel?.channel.avatarUrl}
            alt={channel?.channel.channelName}
            h={20}
          />
        </Group>

        <Text size="sm" fw={600}>
          {format(new Date(order.date), "dd/MM/yyyy")}
        </Text>

        <Text size="sm" fw={700} c="red" ta="right">
          {order.salesFunnelId.name} - {order.address} -{" "}
          {order.salesFunnelId.phoneNumber}
        </Text>
      </Group>

      {/* BẢNG MẶT HÀNG – NỀN TRẮNG, NỔI BẬT */}
      <Box
        p="sm"
        style={{
          border: "2px solid #343a40",
          borderRadius: 8,
          backgroundColor: "#ffffff"
        }}
      >
        <Table
          withTableBorder
          withColumnBorders
          verticalSpacing="sm"
          horizontalSpacing="sm"
          style={{ fontSize: "14px" }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th ta="center" fw={700}>
                STT
              </Table.Th>
              <Table.Th ta="center" fw={700}>
                Mã SP
              </Table.Th>
              <Table.Th ta="center" fw={700}>
                Sản phẩm
              </Table.Th>
              <Table.Th ta="center" fw={700}>
                Số lượng
              </Table.Th>
              <Table.Th ta="center" fw={700}>
                Số m³ / 1 thùng
              </Table.Th>
              <Table.Th ta="center" fw={700}>
                Tổng m³
              </Table.Th>
              <Table.Th ta="center" fw={700}>
                Quy cách
              </Table.Th>
              <Table.Th ta="center" fw={700}>
                Đơn giá
              </Table.Th>
              <Table.Th ta="center" fw={700}>
                Thành tiền
              </Table.Th>
              <Table.Th ta="center" fw={700}>
                Cân nặng (kg/sp)
              </Table.Th>
              <Table.Th ta="center" fw={700}>
                Tổng trọng lượng
              </Table.Th>
              <Table.Th ta="center" fw={700}>
                Ghi chú
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {items.map((item, index) => (
              <Table.Tr key={item.code}>
                <Table.Td ta="center">
                  <Text fw={600}>{index + 1}</Text>
                </Table.Td>
                <Table.Td ta="center">
                  <Text fw={600}>{item.code}</Text>
                </Table.Td>
                <Table.Td>
                  <Text>{item.name}</Text>
                </Table.Td>
                <Table.Td ta="center">
                  <Text fw={600}>{item.quantity}</Text>
                </Table.Td>
                <Table.Td ta="center">
                  <Text>
                    {item.squareMetersPerItem > 0
                      ? item.squareMetersPerItem.toFixed(3)
                      : "-"}
                  </Text>
                </Table.Td>
                <Table.Td ta="center">
                  <Text>{item.totalSquareMeters.toFixed(3)}</Text>
                </Table.Td>
                <Table.Td ta="center">
                  <Text>{item.specification || "-"}</Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text>{item.price.toLocaleString("vi-VN")}</Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text fw={600}>
                    {(item.price * item.quantity).toLocaleString("vi-VN")}
                  </Text>
                </Table.Td>
                <Table.Td ta="center">
                  <Text>{item.weight > 0 ? item.weight.toFixed(2) : "-"}</Text>
                </Table.Td>
                <Table.Td ta="center">
                  <Text>{item.totalWeight.toFixed(2)}</Text>
                </Table.Td>
                <Table.Td ta="center">
                  <Text>{item.note || "-"}</Text>
                </Table.Td>
              </Table.Tr>
            ))}

            {/* HÀNG TỔNG */}
            <Table.Tr>
              <Table.Td />
              <Table.Td />
              <Table.Td c="red" fw={700}>
                Tổng
              </Table.Td>
              <Table.Td />
              <Table.Td ta="center" fw={700} c="red">
                {calculations.totalQuantity}
              </Table.Td>
              <Table.Td />
              <Table.Td ta="center" fw={700} c="red">
                {calculations.totalSquareMeters.toFixed(3)}
              </Table.Td>
              <Table.Td />
              <Table.Td />
              <Table.Td ta="right" fw={700} c="red">
                {calculations.subtotal.toLocaleString("vi-VN")}
              </Table.Td>
              <Table.Td />
              <Table.Td ta="center" fw={700} c="red">
                {calculations.totalWeight.toFixed(2)}
              </Table.Td>
              <Table.Td />
            </Table.Tr>

            {/* HÀNG PHÍ SHIP */}
            <Table.Tr>
              <Table.Td />
              <Table.Td />
              <Table.Td colSpan={5}>
                <Text size="xs">
                  Phí ship ({calculations.totalWeight < 10 ? "45k" : `5k/kg`})
                </Text>
              </Table.Td>
              <Table.Td />
              <Table.Td ta="right">
                <Text size="xs">
                  {calculations.shippingCost > 0
                    ? calculations.totalWeight < 10
                      ? "45.000"
                      : "5.000"
                    : ""}
                </Text>
              </Table.Td>
              <Table.Td ta="right">
                <Text fw={600}>
                  {calculations.shippingCost.toLocaleString("vi-VN")}
                </Text>
              </Table.Td>
              <Table.Td />
              <Table.Td />
              <Table.Td />
            </Table.Tr>

            {/* HÀNG CHIẾT KHẤU ĐƠN HÀNG */}
            {calculations.orderDiscount > 0 && (
              <Table.Tr>
                <Table.Td />
                <Table.Td />
                <Table.Td colSpan={7}>
                  <Text size="xs" c="orange">
                    Chiết khấu đơn hàng
                  </Text>
                </Table.Td>
                <Table.Td ta="right" fw={600} c="orange">
                  - {calculations.orderDiscount.toLocaleString("vi-VN")}
                </Table.Td>
                <Table.Td />
                <Table.Td />
                <Table.Td />
              </Table.Tr>
            )}

            {/* HÀNG CHIẾT KHẤU 2 */}
            {calculations.otherDiscount > 0 && (
              <Table.Tr>
                <Table.Td />
                <Table.Td />
                <Table.Td colSpan={7}>
                  <Text size="xs" c="pink">
                    Chiết khấu 2
                  </Text>
                </Table.Td>
                <Table.Td ta="right" fw={600} c="pink">
                  - {calculations.otherDiscount.toLocaleString("vi-VN")}
                </Table.Td>
                <Table.Td />
                <Table.Td />
                <Table.Td />
              </Table.Tr>
            )}

            {/* HÀNG THUẾ */}
            <Table.Tr>
              <Table.Td />
              <Table.Td />
              <Table.Td colSpan={7}>
                <Text size="xs">Thuế 0.75%</Text>
              </Table.Td>
              <Table.Td ta="right" fw={600}>
                {calculations.tax.toLocaleString("vi-VN")}
              </Table.Td>
              <Table.Td />
              <Table.Td />
              <Table.Td />
            </Table.Tr>

            {/* HÀNG TIỀN CỌC */}
            <Table.Tr>
              <Table.Td />
              <Table.Td />
              <Table.Td colSpan={7} ta="left">
                <Text size="xs">Tiền cọc</Text>
              </Table.Td>
              <Table.Td ta="right" fw={600}>
                - {calculations.deposit.toLocaleString("vi-VN")}
              </Table.Td>
              <Table.Td />
              <Table.Td />
              <Table.Td />
            </Table.Tr>

            {/* HÀNG TỔNG CỘNG CẦN TRẢ */}
            <Table.Tr>
              <Table.Td />
              <Table.Td />
              <Table.Td colSpan={7} ta="right">
                <Text fw={700} c="red">
                  Tổng cộng cần trả
                </Text>
              </Table.Td>
              <Table.Td ta="right">
                <Text fw={700} c="red">
                  {calculations.remainingAmount.toLocaleString("vi-VN")}
                </Text>
              </Table.Td>
              <Table.Td />
              <Table.Td />
              <Table.Td />
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Box>
    </Paper>
  )
}

/* =========================
 *  CAPTURE COMPONENT: LỆNH GỬI KHO
 *  Layout = giống warehouseOrderRef cũ (ít info hơn)
 * ======================= */

interface WarehouseOrderCaptureContentProps {
  order: any
  channel: any
  items: ItemWithExtendedData[]
  calculations: Calculations
}

const WarehouseOrderCaptureContent = ({
  order,
  channel,
  items,
  calculations
}: WarehouseOrderCaptureContentProps) => {
  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      w={1100}
      bg="white"
      shadow="xs"
      style={{ boxSizing: "border-box" }}
    >
      {/* HEADER NGANG */}
      <Group justify="space-between" align="flex-start" mb="sm">
        <Text size="sm" fw={700}>
          Lệnh xuất hàng - {channel?.channel.channelName}
        </Text>

        <Text size="sm" fw={600}>
          {format(new Date(order.date), "dd/MM/yyyy")}
        </Text>

        <Text size="sm" fw={600} ta="right">
          {order.salesFunnelId.name} - {order.address} -{" "}
          {order.salesFunnelId.phoneNumber}
        </Text>
      </Group>

      {/* BẢNG HÀNG GỬI KHO */}
      <Box
        p="sm"
        style={{
          borderRadius: 8,
          border: "2px solid #343a40",
          backgroundColor: "#ffffff"
        }}
      >
        <Table
          withTableBorder
          withColumnBorders
          verticalSpacing="sm"
          horizontalSpacing="sm"
          style={{ fontSize: "14px" }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th ta="center" fw={700}>
                STT
              </Table.Th>
              <Table.Th ta="center" fw={700}>
                Mã SP
              </Table.Th>
              <Table.Th ta="center" fw={700}>
                Sản phẩm
              </Table.Th>
              <Table.Th ta="right" fw={700}>
                Số lượng
              </Table.Th>
              <Table.Th ta="right" fw={700}>
                Số m³ / 1 thùng
              </Table.Th>
              <Table.Th ta="right" fw={700}>
                Tổng m³
              </Table.Th>
              <Table.Th ta="center" fw={700}>
                Quy cách
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {items.map((item, index) => (
              <Table.Tr key={item.code}>
                <Table.Td ta="center">
                  <Text fw={600}>{index + 1}</Text>
                </Table.Td>
                <Table.Td ta="center">
                  <Text fw={600}>{item.code}</Text>
                </Table.Td>
                <Table.Td>
                  <Text>{item.name}</Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text fw={600}>{item.quantity}</Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text>
                    {item.squareMetersPerItem > 0
                      ? item.squareMetersPerItem.toFixed(3)
                      : "-"}
                  </Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text>{item.totalSquareMeters.toFixed(3)}</Text>
                </Table.Td>
                <Table.Td ta="center">
                  <Text>{item.specification || "-"}</Text>
                </Table.Td>
              </Table.Tr>
            ))}

            {/* HÀNG TỔNG */}
            <Table.Tr>
              <Table.Td />
              <Table.Td />
              <Table.Td fw={700}>Tổng</Table.Td>
              <Table.Td ta="right" fw={700}>
                {calculations.totalQuantity}
              </Table.Td>
              <Table.Td />
              <Table.Td ta="right" fw={700}>
                {calculations.totalSquareMeters.toFixed(3)}
              </Table.Td>
              <Table.Td />
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Box>
    </Paper>
  )
}

/* =========================
 *  MAIN MODAL
 * ======================= */

export const QuotationModal = ({ orderId, shippingCost = 0 }: Props) => {
  const { getSalesOrderById } = useSalesOrders()
  const { getMyChannel } = useSalesChannels()
  const contentRef = useRef<HTMLDivElement>(null)
  const warehouseOrderRef = useRef<HTMLDivElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isCapturingWarehouse, setIsCapturingWarehouse] = useState(false)

  const { data: orderData } = useQuery({
    queryKey: ["salesOrder", orderId],
    queryFn: () => getSalesOrderById(orderId)
  })

  const { data: channelData } = useQuery({
    queryKey: ["myChannel"],
    queryFn: () => getMyChannel(),
    select: (data) => data.data
  })

  // Process items with extended calculations
  const itemsWithExtendedData = useMemo((): ItemWithExtendedData[] => {
    if (!orderData?.data.items) return []

    return orderData.data.items.map((item: any) => {
      const weight = item.mass ?? 0.1
      const squareMetersPerItem = item.area ?? 0
      const specification = item.specification ?? ""

      const totalWeight = weight * item.quantity
      const totalSquareMeters = squareMetersPerItem * item.quantity

      return {
        ...item,
        weight,
        totalWeight,
        squareMetersPerItem,
        totalSquareMeters,
        specification
      }
    })
  }, [orderData?.data.items])

  // Calculate totals
  const calculations: Calculations = useMemo(() => {
    const totalQuantity = itemsWithExtendedData.reduce(
      (sum, item) => sum + item.quantity,
      0
    )
    const totalWeight = itemsWithExtendedData.reduce(
      (sum, item) => sum + item.totalWeight,
      0
    )
    const totalIndividualWeight = itemsWithExtendedData.reduce(
      (sum, item) => sum + item.weight,
      0
    )
    const totalSquareMeters = itemsWithExtendedData.reduce(
      (sum, item) => sum + item.totalSquareMeters,
      0
    )
    const subtotal = itemsWithExtendedData.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const orderDiscount = orderData?.data.orderDiscount || 0
    const otherDiscount = orderData?.data.otherDiscount || 0
    const totalDiscount = orderDiscount + otherDiscount
    const subtotalAfterDiscount = subtotal - totalDiscount
    const tax = orderData?.data.tax || 0
    const deposit = orderData?.data.deposit || 0
    const totalAmount = subtotalAfterDiscount + tax + shippingCost
    const remainingAmount = totalAmount - deposit

    return {
      totalQuantity,
      totalWeight,
      totalIndividualWeight,
      totalSquareMeters,
      shippingCost,
      subtotal,
      orderDiscount,
      otherDiscount,
      totalDiscount,
      subtotalAfterDiscount,
      tax,
      deposit,
      totalAmount,
      remainingAmount
    }
  }, [itemsWithExtendedData, orderData?.data, shippingCost])

  const handleCaptureScreenshot = async () => {
    if (!contentRef.current) return

    setIsCapturing(true)
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true
      })

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                "image/png": blob
              })
            ])
            CToast.success({ title: "Đã sao chép ảnh vào clipboard" })
          } catch (clipboardError) {
            console.error("Error copying to clipboard:", clipboardError)
            CToast.error({ title: "Không thể sao chép ảnh vào clipboard" })
          }
        }
      })
    } catch (error) {
      console.error("Error capturing screenshot:", error)
      CToast.error({ title: "Có lỗi xảy ra khi chụp ảnh" })
    } finally {
      setIsCapturing(false)
    }
  }

  const handleCaptureWarehouseOrder = async () => {
    if (!warehouseOrderRef.current) return

    setIsCapturingWarehouse(true)
    try {
      const canvas = await html2canvas(warehouseOrderRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true
      })

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                "image/png": blob
              })
            ])
            CToast.success({ title: "Đã sao chép lệnh gửi kho vào clipboard" })
          } catch (clipboardError) {
            console.error("Error copying to clipboard:", clipboardError)
            CToast.error({ title: "Không thể sao chép ảnh vào clipboard" })
          }
        }
      })
    } catch (error) {
      console.error("Error capturing screenshot:", error)
      CToast.error({ title: "Có lỗi xảy ra khi chụp ảnh" })
    } finally {
      setIsCapturingWarehouse(false)
    }
  }

  if (!orderData?.data) return null

  const order = orderData.data
  const channel = channelData

  return (
    <Stack gap="md">
      {/* Buttons */}
      <Group justify="flex-end">
        <Button
          leftSection={<IconCamera size={16} />}
          onClick={handleCaptureWarehouseOrder}
          loading={isCapturingWarehouse}
          variant="light"
          color="green"
        >
          Sao chép lệnh gửi kho
        </Button>
        <Button
          leftSection={<IconCamera size={16} />}
          onClick={handleCaptureScreenshot}
          loading={isCapturing}
          variant="light"
          color="blue"
        >
          Sao chép ảnh báo giá
        </Button>
      </Group>

      {/* MAIN VISIBLE CONTENT – vẫn là phiếu xuất hàng dự kiến, nhưng table nổi bật */}
      <Paper withBorder radius="md" p="md" bg="white">
        <Group ml={8} mt={8} justify="space-between" align="center">
          <Group>
            <Image src={channel?.channel.avatarUrl} alt="MCD" h={60} />
            <Stack gap={2}>
              <Text size="lg" fw={600}>
                {channel?.channel.channelName}
              </Text>
              <Text size="xs" fw={500}>
                {channel?.channel.address}
              </Text>
              <Text size="xs" fw={500}>
                Sđt: {order.phoneNumber}
              </Text>
            </Stack>
          </Group>
        </Group>

        <Stack gap="xs" p="xs">
          {/* Header */}
          <Box p="xs">
            <Stack gap="xs">
              <Group justify="center">
                <Title order={3} fw={700}>
                  PHIẾU XUẤT HÀNG DỰ KIẾN
                </Title>
              </Group>

              <Group justify="center" align="center">
                <Group gap="4">
                  <Text size="sm" fw={600}>
                    Ngày xuất hàng (ngày đặt):
                  </Text>
                  <Text size="sm">
                    {format(new Date(order.date), "dd/MM/yyyy")}
                  </Text>
                </Group>
              </Group>
            </Stack>
          </Box>
          <Divider size="xs" />

          <Group ml={8} justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Text size="sm">
                <b>Khách hàng:</b> {order.salesFunnelId.name}
              </Text>
              <Text size="sm">
                <b>Địa chỉ:</b> {order.address}, {order.province.name}
              </Text>
              <Text size="sm">
                <b>Số điện thoại:</b> {order.salesFunnelId.phoneNumber}
                {order.salesFunnelId.secondaryPhoneNumbers &&
                  `${order.salesFunnelId.secondaryPhoneNumbers.length > 0 ? "/" + order.salesFunnelId.secondaryPhoneNumbers.join("/") : ""}`}
              </Text>
            </Stack>
          </Group>

          {/* Items Table – làm nổi bật */}
          <Box
            p="sm"
            style={{
              border: "2px solid #343a40",
              borderRadius: 8,
              backgroundColor: "#fff"
            }}
          >
            <Title order={5} fw={700} mb="xs">
              Danh sách sản phẩm ({itemsWithExtendedData.length} sản phẩm)
            </Title>

            <Table
              striped
              verticalSpacing="sm"
              horizontalSpacing="sm"
              withTableBorder
              withColumnBorders
              style={{ border: "1px solid #dee2e6", fontSize: "14px" }}
            >
              <Table.Thead bg="gray.2">
                <Table.Tr>
                  <Table.Th ta="center" fw={700}>
                    STT
                  </Table.Th>
                  <Table.Th ta="center" fw={700}>
                    Mã SP
                  </Table.Th>
                  <Table.Th ta="center" fw={700}>
                    Tên sản phẩm
                  </Table.Th>
                  <Table.Th ta="center" fw={700}>
                    SL
                  </Table.Th>
                  <Table.Th ta="center" fw={700}>
                    m³/sp
                  </Table.Th>
                  <Table.Th ta="center" fw={700}>
                    Tổng m³
                  </Table.Th>
                  <Table.Th ta="center" fw={700}>
                    Quy cách
                  </Table.Th>
                  <Table.Th ta="center" fw={700}>
                    Đơn giá
                  </Table.Th>
                  <Table.Th ta="center" fw={700}>
                    Thành tiền
                  </Table.Th>
                  <Table.Th ta="center" fw={700}>
                    kg/sp
                  </Table.Th>
                  <Table.Th ta="center" fw={700}>
                    Tổng kg
                  </Table.Th>
                  <Table.Th ta="center" fw={700}>
                    Ghi chú
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {itemsWithExtendedData.map((item, index) => (
                  <Table.Tr key={item.code}>
                    <Table.Td ta="center">
                      <Text fw={600}>{index + 1}</Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text fw={600}>{item.code}</Text>
                    </Table.Td>
                    <Table.Td ta={"center"}>
                      <Text>{item.name}</Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text fw={600}>{item.quantity}</Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text>
                        {item.squareMetersPerItem > 0
                          ? `${item.squareMetersPerItem.toFixed(2)} m³`
                          : "-"}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text>{item.totalSquareMeters.toFixed(2)} m³</Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text>{item.specification || "-"}</Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text>{item.price.toLocaleString("vi-VN")}đ</Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text fw={600}>
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text>
                        {item.weight > 0 ? `${item.weight.toFixed(2)} kg` : "-"}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text>{item.totalWeight.toFixed(2)} kg</Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text>{item.note || "-"}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}

                {/* Totals Row */}
                <Table.Tr
                  style={{ backgroundColor: "#f8f9fa", fontWeight: 700 }}
                >
                  <Table.Td ta="center">
                    <Text fw={700}>TỔNG</Text>
                  </Table.Td>
                  <Table.Td></Table.Td>
                  <Table.Td></Table.Td>
                  <Table.Td ta="center">
                    <Text fw={700}>{calculations.totalQuantity}</Text>
                  </Table.Td>
                  <Table.Td></Table.Td>
                  <Table.Td ta="center">
                    <Text fw={700}>
                      {calculations.totalSquareMeters.toFixed(2)} m³
                    </Text>
                  </Table.Td>
                  <Table.Td></Table.Td>
                  <Table.Td></Table.Td>
                  <Table.Td ta="center">
                    <Text fw={700}>
                      {calculations.subtotal.toLocaleString("vi-VN")}đ
                    </Text>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Text fw={700}>
                      {calculations.totalIndividualWeight.toFixed(2)} kg
                    </Text>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Text fw={700}>
                      {calculations.totalWeight.toFixed(2)} kg
                    </Text>
                  </Table.Td>
                  <Table.Td></Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Box>

          {/* Summary Section */}
          <Box p="xs" style={{ border: "1px solid #dee2e6", borderRadius: 8 }}>
            <Title order={5} fw={600} mb="xs">
              Tổng kết đơn hàng
            </Title>

            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">
                  Phí ship ({calculations.totalWeight.toFixed(2)} kg
                  {calculations.totalWeight < 10
                    ? " < 10kg → 45k"
                    : ` ≥ 10kg → ${calculations.totalWeight.toFixed(2)}kg × 5k`}
                  ):
                </Text>
                <Text size="sm" fw={500}>
                  {calculations.shippingCost.toLocaleString("vi-VN")}đ
                </Text>
              </Group>

              {calculations.orderDiscount > 0 && (
                <Group justify="space-between">
                  <Text size="sm">Chiết khấu đơn hàng:</Text>
                  <Text size="sm" fw={500} c="orange">
                    -{calculations.orderDiscount.toLocaleString("vi-VN")}đ
                  </Text>
                </Group>
              )}

              {calculations.otherDiscount > 0 && (
                <Group justify="space-between">
                  <Text size="sm">Chiết khấu 2:</Text>
                  <Text size="sm" fw={500} c="pink">
                    -{calculations.otherDiscount.toLocaleString("vi-VN")}đ
                  </Text>
                </Group>
              )}

              <Group justify="space-between">
                <Text size="sm">Thuế (0.75%):</Text>
                <Text size="sm" fw={500}>
                  {calculations.tax.toLocaleString("vi-VN")}đ
                </Text>
              </Group>

              <Divider size="xs" />

              <Group justify="space-between">
                <Text size="sm" fw={600}>
                  Tổng tiền đơn hàng:
                </Text>
                <Text size="sm" fw={600}>
                  {calculations.totalAmount.toLocaleString("vi-VN")}đ
                </Text>
              </Group>

              <Group justify="space-between">
                <Text size="sm">Tiền cọc:</Text>
                <Text size="sm" fw={500}>
                  -{calculations.deposit.toLocaleString("vi-VN")}đ
                </Text>
              </Group>

              <Divider size="xs" />

              <Group
                justify="space-between"
                p="xs"
                style={{
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #dee2e6",
                  borderRadius: 8
                }}
              >
                <Text size="sm" fw={700}>
                  Tổng tiền cần trả:
                </Text>
                <Text size="sm" fw={700}>
                  {calculations.remainingAmount.toLocaleString("vi-VN")}đ
                </Text>
              </Group>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* HIDDEN CAPTURE CONTENTS */}
      <Box
        ref={contentRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0
        }}
        aria-hidden="true"
      >
        <QuotationCaptureContent
          order={order}
          channel={channel}
          items={itemsWithExtendedData}
          calculations={calculations}
        />
      </Box>

      <Box
        ref={warehouseOrderRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0
        }}
        aria-hidden="true"
      >
        <WarehouseOrderCaptureContent
          order={order}
          channel={channel}
          items={itemsWithExtendedData}
          calculations={calculations}
        />
      </Box>
    </Stack>
  )
}
