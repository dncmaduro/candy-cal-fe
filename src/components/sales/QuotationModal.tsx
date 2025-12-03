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
  Image
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

interface Props {
  orderId: string
  shippingCost?: number
}

export const QuotationModal = ({ orderId, shippingCost = 0 }: Props) => {
  const { getSalesOrderById } = useSalesOrders()
  const { getMyChannel } = useSalesChannels()
  const contentRef = useRef<HTMLDivElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)

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

    return orderData.data.items.map((item) => {
      // Use values directly from API
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
  const calculations = useMemo(() => {
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

      // Convert canvas to blob and copy to clipboard
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

  if (!orderData?.data) return null

  return (
    <Stack gap="md">
      {/* Capture Button */}
      <Group justify="flex-end">
        <Button
          leftSection={<IconCamera size={16} />}
          onClick={handleCaptureScreenshot}
          loading={isCapturing}
          variant="light"
          color="blue"
        >
          Sao chép ảnh
        </Button>
      </Group>
      {/* Content to capture */}
      <div ref={contentRef}>
        <Group ml={8} mt={8} justify="space-between" align="center">
          <Group>
            <Image src={channelData?.channel.avatarUrl} alt="MCD" h={100} />
            <Stack gap={4}>
              <Text size="xl" fw={600}>
                {channelData?.channel.channelName}
              </Text>
              <Text fw={600}>{channelData?.channel.address}</Text>
              <Text fw={600}>Sđt: {orderData.data.phoneNumber}</Text>
            </Stack>
          </Group>
        </Group>

        <Stack gap="xs" p="xs">
          {/* Header */}
          <Box p="xs">
            <Stack gap="xs">
              <Group justify="center">
                <Title order={3} fw={600}>
                  PHIẾU XUẤT HÀNG DỰ KIẾN
                </Title>
              </Group>

              <Group justify="center" align="center">
                <Group gap="4">
                  <Text size="sm" fw={600}>
                    Ngày tạo:
                  </Text>
                  <Text size="sm">
                    {format(new Date(orderData.data.createdAt), "dd/MM/yyyy")}
                  </Text>
                </Group>
              </Group>
            </Stack>
          </Box>
          <Divider size="xs" />

          <Group ml={8} justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Text>
                <b>Khách hàng:</b> {orderData.data.salesFunnelId.name}
              </Text>
              <Text>
                <b>Địa chỉ:</b> {orderData.data.address},{" "}
                {orderData.data.province.name}
              </Text>
              <Text>
                <b>Số điện thoại:</b> {orderData.data.salesFunnelId.phoneNumber}
                {orderData.data.salesFunnelId.secondaryPhoneNumbers &&
                  `${orderData.data.salesFunnelId.secondaryPhoneNumbers.length > 0 ? "/" + orderData.data.salesFunnelId.secondaryPhoneNumbers.join("/") : ""}`}
              </Text>
            </Stack>
          </Group>

          {/* Items Table */}
          <Box p="xs" style={{ border: "1px solid #dee2e6" }}>
            <Title order={5} fw={500} mb="xs">
              Danh sách sản phẩm ({itemsWithExtendedData.length} sản phẩm)
            </Title>

            <Table
              striped
              verticalSpacing="xs"
              style={{ border: "1px solid #dee2e6", fontSize: "11px" }}
            >
              <Table.Thead bg="gray.1">
                <Table.Tr>
                  <Table.Th ta="center" fw={500}>
                    STT
                  </Table.Th>
                  <Table.Th ta="center" fw={500}>
                    Mã SP
                  </Table.Th>
                  <Table.Th ta="center" fw={500}>
                    Tên sản phẩm
                  </Table.Th>
                  <Table.Th ta="center" fw={500}>
                    SL
                  </Table.Th>
                  <Table.Th ta="center" fw={500}>
                    Đơn giá
                  </Table.Th>
                  <Table.Th ta="center" fw={500}>
                    Thành tiền
                  </Table.Th>
                  <Table.Th ta="center" fw={500}>
                    m²/sp
                  </Table.Th>
                  <Table.Th ta="center" fw={500}>
                    Tổng m²
                  </Table.Th>
                  <Table.Th ta="center" fw={500}>
                    Quy cách
                  </Table.Th>
                  <Table.Th ta="center" fw={500}>
                    kg/sp
                  </Table.Th>
                  <Table.Th ta="center" fw={500}>
                    Tổng kg
                  </Table.Th>
                  <Table.Th ta="center" fw={500}>
                    Ghi chú
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {itemsWithExtendedData.map((item, index) => (
                  <Table.Tr key={item.code}>
                    <Table.Td ta="center">
                      <Text size="xs" fw={500}>
                        {index + 1}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text size="xs" fw={500}>
                        {item.code}
                      </Text>
                    </Table.Td>
                    <Table.Td ta={"center"}>
                      <Text size="xs">{item.name}</Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text size="xs" fw={500}>
                        {item.quantity}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text size="xs">
                        {item.price.toLocaleString("vi-VN")}đ
                      </Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text size="xs" fw={500}>
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text size="xs">
                        {item.squareMetersPerItem > 0
                          ? `${item.squareMetersPerItem.toFixed(2)} m³`
                          : "-"}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text size="xs">
                        {item.totalSquareMeters.toFixed(2)} m²
                      </Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text size="xs">{item.specification || "-"}</Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text size="xs">
                        {item.weight > 0 ? `${item.weight.toFixed(2)} kg` : "-"}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text size="xs">{item.totalWeight.toFixed(2)} kg</Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text size="xs">{item.note || "-"}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}

                {/* Totals Row */}
                <Table.Tr
                  style={{ backgroundColor: "#f8f9fa", fontWeight: 600 }}
                >
                  <Table.Td ta="center">
                    <Text size="xs" fw={600}>
                      TỔNG
                    </Text>
                  </Table.Td>
                  <Table.Td></Table.Td>
                  <Table.Td></Table.Td>
                  <Table.Td ta="center">
                    <Text size="xs" fw={600}>
                      {calculations.totalQuantity}
                    </Text>
                  </Table.Td>
                  <Table.Td></Table.Td>
                  <Table.Td ta="center">
                    <Text size="xs" fw={600}>
                      {calculations.subtotal.toLocaleString("vi-VN")}đ
                    </Text>
                  </Table.Td>
                  <Table.Td></Table.Td>
                  <Table.Td ta="center">
                    <Text size="xs" fw={600}>
                      {calculations.totalSquareMeters.toFixed(2)} m²
                    </Text>
                  </Table.Td>
                  <Table.Td></Table.Td>
                  <Table.Td ta="center">
                    <Text size="xs" fw={600}>
                      {calculations.totalIndividualWeight.toFixed(2)} kg
                    </Text>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Text size="xs" fw={600}>
                      {calculations.totalWeight.toFixed(2)} kg
                    </Text>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Box>

          {/* Summary Section */}
          <Box p="xs" style={{ border: "1px solid #dee2e6" }}>
            <Title order={5} fw={500} mb="xs">
              Tổng kết đơn hàng
            </Title>

            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="xs">Phí ship (5k/kg):</Text>
                <Text size="xs" fw={500}>
                  {calculations.shippingCost.toLocaleString("vi-VN")}đ
                </Text>
              </Group>

              {calculations.orderDiscount > 0 && (
                <Group justify="space-between">
                  <Text size="xs">Chiết khấu đơn hàng:</Text>
                  <Text size="xs" fw={500} c="orange">
                    -{calculations.orderDiscount.toLocaleString("vi-VN")}đ
                  </Text>
                </Group>
              )}

              {calculations.otherDiscount > 0 && (
                <Group justify="space-between">
                  <Text size="xs">Chiết khấu 2:</Text>
                  <Text size="xs" fw={500} c="pink">
                    -{calculations.otherDiscount.toLocaleString("vi-VN")}đ
                  </Text>
                </Group>
              )}

              <Group justify="space-between">
                <Text size="xs">Thuế (0.75%):</Text>
                <Text size="xs" fw={500}>
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
                <Text size="xs">Tiền cọc:</Text>
                <Text size="xs" fw={500}>
                  -{calculations.deposit.toLocaleString("vi-VN")}đ
                </Text>
              </Group>

              <Divider size="xs" />

              <Group
                justify="space-between"
                p="xs"
                style={{
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #dee2e6"
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
      </div>
    </Stack>
  )
}
