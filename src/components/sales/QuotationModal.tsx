import { useQuery } from "@tanstack/react-query"
import { useSalesOrders } from "../../hooks/useSalesOrders"
import {
  Group,
  Text,
  Table,
  Stack,
  NumberInput,
  Title,
  TextInput,
  Divider,
  Box,
  Button
} from "@mantine/core"
import { format } from "date-fns"
import { useMemo, useState, useRef } from "react"
import html2canvas from "html2canvas"
import { IconCamera } from "@tabler/icons-react"
import { CToast } from "../common/CToast"

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
}

interface Props {
  orderId: string
  initialWeights?: Record<string, number>
  initialSquareMeters?: Record<string, number>
  initialSpecifications?: Record<string, string>
  onDataChange?: (data: {
    weights: Record<string, number>
    squareMeters: Record<string, number>
    specifications: Record<string, string>
  }) => void
}

export const QuotationModal = ({
  orderId,
  initialWeights = {},
  initialSquareMeters = {},
  initialSpecifications = {},
  onDataChange
}: Props) => {
  const { getSalesOrderById } = useSalesOrders()
  const contentRef = useRef<HTMLDivElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  // State for editable fields - initialize with passed values
  const [itemWeights, setItemWeights] =
    useState<Record<string, number>>(initialWeights)
  const [itemSquareMeters, setItemSquareMeters] =
    useState<Record<string, number>>(initialSquareMeters)
  const [itemSpecifications, setItemSpecifications] = useState<
    Record<string, string>
  >(initialSpecifications)

  const { data: orderData } = useQuery({
    queryKey: ["salesOrder", orderId],
    queryFn: () => getSalesOrderById(orderId)
  })

  // Process items with extended calculations
  const itemsWithExtendedData = useMemo((): ItemWithExtendedData[] => {
    if (!orderData?.data.items) return []

    return orderData.data.items.map((item) => {
      // Get values from state or defaults
      const weight = itemWeights[item.code] ?? 0.1
      const squareMetersPerItem = itemSquareMeters[item.code] ?? 0
      const specification = itemSpecifications[item.code] ?? ""

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
  }, [orderData?.data.items, itemWeights, itemSquareMeters, itemSpecifications])

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
    const shippingCost = Math.ceil(totalWeight) * 5000 // 5k per kg, rounded up
    const subtotal = itemsWithExtendedData.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const discount = orderData?.data.discount || 0
    const discountTotal = discount * totalQuantity // Multiply discount by total quantity
    const subtotalAfterDiscount = subtotal - discountTotal
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
      discount,
      discountTotal,
      subtotalAfterDiscount,
      tax,
      deposit,
      totalAmount,
      remainingAmount
    }
  }, [itemsWithExtendedData, orderData?.data])

  // Handler functions
  const handleWeightChange = (code: string, weight: number) => {
    const newWeights = {
      ...itemWeights,
      [code]: weight
    }
    setItemWeights(newWeights)

    // Call parent callback if provided
    if (onDataChange) {
      onDataChange({
        weights: newWeights,
        squareMeters: itemSquareMeters,
        specifications: itemSpecifications
      })
    }
  }

  const handleSquareMetersChange = (code: string, squareMeters: number) => {
    const newSquareMeters = {
      ...itemSquareMeters,
      [code]: squareMeters
    }
    setItemSquareMeters(newSquareMeters)

    // Call parent callback if provided
    if (onDataChange) {
      onDataChange({
        weights: itemWeights,
        squareMeters: newSquareMeters,
        specifications: itemSpecifications
      })
    }
  }

  const handleSpecificationChange = (code: string, specification: string) => {
    const newSpecifications = {
      ...itemSpecifications,
      [code]: specification
    }
    setItemSpecifications(newSpecifications)

    // Call parent callback if provided
    if (onDataChange) {
      onDataChange({
        weights: itemWeights,
        squareMeters: itemSquareMeters,
        specifications: newSpecifications
      })
    }
  }

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
        <Stack gap="xs" p="xs">
          {/* Header */}
          <Box p="xs" style={{ border: "1px solid #dee2e6" }}>
            <Stack gap="xs">
              <Group justify="center">
                <Title order={4} fw={600}>
                  PHIẾU XUẤT HÀNG DỰ KIẾN
                </Title>
              </Group>

              <Divider size="xs" />

              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <Text size="xs" fw={500}>
                    Ngày tạo:
                  </Text>
                  <Text size="xs">
                    {format(new Date(orderData.data.createdAt), "dd/MM/yyyy")}
                  </Text>
                </Group>

                <Group gap="xs">
                  <Text size="xs" fw={500}>
                    Khách hàng:
                  </Text>
                  <Text size="xs">{orderData.data.salesFunnelId.name}</Text>
                </Group>

                <Group gap="xs">
                  <Text size="xs" fw={500}>
                    SĐT:
                  </Text>
                  <Text size="xs">
                    {orderData.data.salesFunnelId.phoneNumber}
                    {orderData.data.salesFunnelId.secondaryPhoneNumbers &&
                      `/${orderData.data.salesFunnelId.secondaryPhoneNumbers.join("/")}`}
                  </Text>
                </Group>
              </Group>
            </Stack>
          </Box>

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
                    <Table.Td>
                      <Text size="xs">{item.name}</Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text size="xs" fw={500}>
                        {item.quantity}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="xs">
                        {item.price.toLocaleString("vi-VN")}đ
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="xs" fw={500}>
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <NumberInput
                        value={item.squareMetersPerItem}
                        onChange={(value) =>
                          handleSquareMetersChange(
                            item.code,
                            Number(value) || 0
                          )
                        }
                        size="xs"
                        min={0}
                        step={0.1}
                        decimalScale={2}
                        hideControls
                        w={50}
                        styles={{
                          input: { textAlign: "center", fontSize: "10px" }
                        }}
                      />
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text size="xs">
                        {item.totalSquareMeters.toFixed(2)} m²
                      </Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <TextInput
                        value={item.specification}
                        onChange={(event) =>
                          handleSpecificationChange(
                            item.code,
                            event.currentTarget.value
                          )
                        }
                        size="xs"
                        placeholder="Quy cách..."
                        styles={{ input: { width: "120px", fontSize: "10px" } }}
                      />
                    </Table.Td>
                    <Table.Td ta="center">
                      <NumberInput
                        value={item.weight}
                        onChange={(value) =>
                          handleWeightChange(item.code, Number(value) || 0)
                        }
                        size="xs"
                        min={0}
                        step={0.1}
                        decimalScale={2}
                        hideControls
                        styles={{
                          input: {
                            textAlign: "center",
                            width: "50px",
                            fontSize: "10px"
                          }
                        }}
                      />
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text size="xs">{item.totalWeight.toFixed(2)} kg</Text>
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
                  <Table.Td ta="right">
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
                <Text size="xs">Phí ship:</Text>
                <Text size="xs" fw={500}>
                  {calculations.shippingCost.toLocaleString("vi-VN")}đ
                </Text>
              </Group>

              <Group justify="space-between">
                <Text size="xs">Giảm giá:</Text>
                <Text size="xs" fw={500}>
                  -{calculations.discountTotal.toLocaleString("vi-VN")}đ
                </Text>
              </Group>

              <Group justify="space-between">
                <Text size="xs">Thuế:</Text>
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
