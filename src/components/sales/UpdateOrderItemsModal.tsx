import {
  Button,
  Group,
  Select,
  NumberInput,
  Text,
  TextInput,
  Stack,
  Flex
} from "@mantine/core"
import { useForm } from "react-hook-form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import type { AxiosError } from "axios"
import { CToast } from "../common/CToast"
import { useSalesOrders } from "../../hooks/useSalesOrders"
import { useSalesItems } from "../../hooks/useSalesItems"
import {
  calculatePercentDiscountAmount,
  calculatePercentFromAmount,
  formatOrderDiscountPercent,
  getEffectiveOrderDiscountType,
  type SalesOrderDiscountType
} from "../../utils/salesOrderDiscount"
import { OrderDiscountModeToggle } from "./OrderDiscountModeToggle"

type ItemInput = {
  code: string
  quantity: number
  note?: string
}

type UpdateOrderItemsModalProps = {
  orderId: string
  currentItems: { code: string; quantity: number; note?: string }[]
  currentOrderDiscount?: number
  currentOrderDiscountType?: SalesOrderDiscountType | null
  currentOtherDiscount?: number
  currentDeposit?: number
  onSuccess: () => void
}

export const UpdateOrderItemsModal = ({
  orderId,
  currentItems,
  currentOrderDiscount,
  currentOrderDiscountType,
  currentOtherDiscount,
  currentDeposit,
  onSuccess
}: UpdateOrderItemsModalProps) => {
  const { updateSalesOrderItems } = useSalesOrders()
  const { searchSalesItems } = useSalesItems()

  const [items, setItems] = useState<ItemInput[]>(
    currentItems.length > 0
      ? currentItems
      : [{ code: "", quantity: 1, note: "" }]
  )
  const [orderDiscountType, setOrderDiscountType] =
    useState<SalesOrderDiscountType>(
      getEffectiveOrderDiscountType(currentOrderDiscountType)
    )
  const [orderDiscount, setOrderDiscount] = useState<number>(
    currentOrderDiscount || 0
  )
  const [orderDiscountPercent, setOrderDiscountPercent] = useState<number>(0)
  const [otherDiscount, setOtherDiscount] = useState<number>(
    currentOtherDiscount || 0
  )
  const [deposit, setDeposit] = useState<number>(currentDeposit || 0)
  const [isPercentInitialized, setIsPercentInitialized] = useState(false)

  const { handleSubmit } = useForm()

  const { data: salesItemsData } = useQuery({
    queryKey: ["salesItems", "all"],
    queryFn: () =>
      searchSalesItems({
        page: 1,
        limit: 999
      })
  })

  const salesItemPriceByCode = useMemo(
    () =>
      new Map(
        (salesItemsData?.data.data || []).map((item) => [item.code, item.price])
      ),
    [salesItemsData?.data.data]
  )

  const calculateItemsSubtotal = (nextItems: ItemInput[]) =>
    nextItems.reduce((sum, item) => {
      const price = salesItemPriceByCode.get(item.code) || 0
      const quantity = Number(item.quantity) || 0

      return sum + price * quantity
    }, 0)

  const subtotal = calculateItemsSubtotal(items)
  const currentOrderDiscountAmount =
    orderDiscountType === "percent"
      ? calculatePercentDiscountAmount(subtotal, orderDiscountPercent)
      : orderDiscount
  const totalDiscountAmount = currentOrderDiscountAmount + otherDiscount
  const estimatedOrderSubtotal = subtotal - totalDiscountAmount
  const orderDiscountPercentError =
    orderDiscountPercent < 0 || orderDiscountPercent > 100
      ? "Phần trăm chiết khấu phải từ 0 đến 100"
      : undefined

  useEffect(() => {
    if (orderDiscountType !== "percent") return
    if (isPercentInitialized) return
    if (items.length > 0 && !salesItemsData) return

    setOrderDiscountPercent(calculatePercentFromAmount(subtotal, orderDiscount))
    setIsPercentInitialized(true)
  }, [
    isPercentInitialized,
    items.length,
    orderDiscount,
    orderDiscountType,
    salesItemsData,
    subtotal
  ])

  useEffect(() => {
    if (orderDiscountType !== "percent") return

    const nextAmount = calculatePercentDiscountAmount(
      subtotal,
      orderDiscountPercent
    )

    if (orderDiscount !== nextAmount) {
      setOrderDiscount(nextAmount)
    }
  }, [orderDiscount, orderDiscountPercent, orderDiscountType, subtotal])

  const mutation = useMutation({
    mutationFn: () => {
      const validItems = items.filter((item) => item.code && item.quantity > 0)

      if (validItems.length === 0) {
        throw new Error("Vui lòng thêm ít nhất một sản phẩm")
      }

      if (orderDiscountType === "percent" && orderDiscountPercentError) {
        throw new Error(orderDiscountPercentError)
      }

      return updateSalesOrderItems(orderId, {
        items: validItems,
        orderDiscount:
          orderDiscountType === "percent"
            ? calculatePercentDiscountAmount(
                calculateItemsSubtotal(validItems),
                orderDiscountPercent
              )
            : orderDiscount,
        orderDiscountType,
        otherDiscount,
        deposit
      })
    },
    onSuccess: () => {
      CToast.success({ title: "Cập nhật sản phẩm thành công" })
      onSuccess()
    },
    onError: (error: unknown) => {
      const message = (error as AxiosError<{ message?: string }>)?.response
        ?.data?.message

      CToast.error({
        title:
          message ||
          (error as Error | undefined)?.message ||
          "Có lỗi xảy ra khi cập nhật sản phẩm"
      })
    }
  })

  const onSubmit = () => {
    mutation.mutate()
  }

  const handleAddItem = () => {
    setItems([...items, { code: "", quantity: 1, note: "" }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (
    index: number,
    field: keyof ItemInput,
    value: string | number
  ) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleOrderDiscountTypeChange = (value: string) => {
    const nextType = value as SalesOrderDiscountType

    if (nextType === "percent") {
      const canInitializePercent = items.length === 0 || Boolean(salesItemsData)

      if (canInitializePercent) {
        setOrderDiscountPercent(
          calculatePercentFromAmount(subtotal, orderDiscount)
        )
      }

      setIsPercentInitialized(canInitializePercent)
    }

    setOrderDiscountType(nextType)
  }

  const toggleOrderDiscountType = () => {
    handleOrderDiscountTypeChange(
      orderDiscountType === "percent" ? "value" : "percent"
    )
  }

  const salesItemOptions =
    salesItemsData?.data.data.map((item) => ({
      value: item.code,
      label: `${item.code} - ${item.name.vn}`
    })) || []

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex align="flex-end" gap="xs" mb="md">
        <NumberInput
          label={
            <Text fw={700} size="md" c="orange">
              Chiết khấu đơn hàng
            </Text>
          }
          placeholder={
            orderDiscountType === "percent"
              ? "Nhập phần trăm chiết khấu"
              : "Nhập số tiền chiết khấu đơn hàng"
          }
          description="Chiết khấu trực tiếp lên các mặt hàng"
          value={
            orderDiscountType === "percent"
              ? orderDiscountPercent
              : orderDiscount
          }
          onChange={(value) => {
            if (orderDiscountType === "percent") {
              setOrderDiscountPercent(Number(value) || 0)
              return
            }

            setOrderDiscount(Number(value) || 0)
          }}
          error={
            orderDiscountType === "percent"
              ? orderDiscountPercentError
              : undefined
          }
          min={0}
          max={orderDiscountType === "percent" ? 100 : undefined}
          step={orderDiscountType === "percent" ? 0.5 : 1}
          decimalScale={orderDiscountType === "percent" ? 2 : 0}
          hideControls
          thousandSeparator=","
          flex={1}
          styles={{
            input: {
              borderColor: "orange",
              borderWidth: 2,
              fontWeight: 600
            }
          }}
        />

        <OrderDiscountModeToggle
          mode={orderDiscountType}
          onToggle={toggleOrderDiscountType}
        />
      </Flex>

      {orderDiscountType === "percent" && (
        <Text size="xs" c="orange.7" mb="md" mt={-8}>
          CK đơn hiện tại: {formatOrderDiscountPercent(orderDiscountPercent)}%
        </Text>
      )}

      <NumberInput
        label={
          <Text fw={700} size="md" c="pink">
            Chiết khấu 2
          </Text>
        }
        placeholder="Nhập số tiền chiết khấu 2"
        description={
          <Text size="xs" c="dimmed">
            Chiết khấu bổ sung (khuyến mãi, voucher,...)
          </Text>
        }
        value={otherDiscount}
        onChange={(value) => setOtherDiscount(Number(value) || 0)}
        mb="md"
        min={0}
        thousandSeparator=","
        suffix=" đ"
        styles={{
          input: {
            borderColor: "pink",
            borderWidth: 2,
            fontWeight: 600
          }
        }}
      />

      <NumberInput
        label={
          <Text fw={700} size="md" c="teal">
            Tiền cọc
          </Text>
        }
        placeholder="Nhập số tiền cọc"
        description={
          <Text size="xs" c="dimmed">
            Số tiền khách hàng đã đặt cọc cho đơn hàng này
          </Text>
        }
        value={deposit}
        onChange={(value) => setDeposit(Number(value) || 0)}
        mb="md"
        min={0}
        thousandSeparator=","
        suffix=" đ"
        styles={{
          input: {
            borderColor: "teal",
            borderWidth: 2,
            fontWeight: 600
          }
        }}
      />

      <Text fw={700} mb="xs">
        Sản phẩm
      </Text>

      {items.map((item, index) => (
        <Group key={index} mb="sm" align="flex-end">
          <Select
            label={index === 0 ? "Mã sản phẩm" : undefined}
            placeholder="Chọn sản phẩm"
            data={salesItemOptions}
            value={item.code}
            onChange={(value) => handleItemChange(index, "code", value || "")}
            searchable
            style={{ flex: 1 }}
          />
          <NumberInput
            label={index === 0 ? "Số lượng" : undefined}
            placeholder="Số lượng"
            value={item.quantity}
            onChange={(value) =>
              handleItemChange(index, "quantity", Number(value) || 0)
            }
            min={1}
            style={{ width: 120 }}
          />
          <TextInput
            label={index === 0 ? "Ghi chú" : undefined}
            placeholder="Nhập ghi chú"
            value={item.note}
            onChange={(e) =>
              handleItemChange(index, "note", e.target.value || "")
            }
            w={250}
          />
          {items.length > 1 && (
            <Button
              color="red"
              variant="light"
              onClick={() => handleRemoveItem(index)}
              size="sm"
            >
              <IconTrash size={16} />
            </Button>
          )}
        </Group>
      ))}

      <Group mb="md" justify="flex-start">
        <Button
          size="xs"
          variant="light"
          leftSection={<IconPlus size={14} />}
          onClick={handleAddItem}
        >
          Thêm sản phẩm
        </Button>
      </Group>

      <Stack gap={2} mb="md">
        <Text fw={700} size="md">
          Tạm tính: {estimatedOrderSubtotal.toLocaleString("vi-VN")}đ
        </Text>
        <Text size="sm" fw={600}></Text>
        <Text size="xs" c="dimmed">
          {subtotal.toLocaleString("vi-VN")}đ tiền hàng -{" "}
          {totalDiscountAmount.toLocaleString("vi-VN")}đ chiết khấu
        </Text>
      </Stack>

      <Group justify="flex-end" mt="xl">
        <Button type="submit" loading={mutation.isPending}>
          Cập nhật
        </Button>
      </Group>
    </form>
  )
}
