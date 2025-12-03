import {
  Button,
  Group,
  Select,
  NumberInput,
  Text,
  TextInput
} from "@mantine/core"
import { useForm } from "react-hook-form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { CToast } from "../common/CToast"
import { useSalesOrders } from "../../hooks/useSalesOrders"
import { useSalesItems } from "../../hooks/useSalesItems"

type ItemInput = {
  code: string
  quantity: number
  note?: string
}

type UpdateOrderItemsModalProps = {
  orderId: string
  currentItems: { code: string; quantity: number }[]
  currentOrderDiscount?: number
  currentOtherDiscount?: number
  currentDeposit?: number
  onSuccess: () => void
}

export const UpdateOrderItemsModal = ({
  orderId,
  currentItems,
  currentOrderDiscount,
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
  const [orderDiscount, setOrderDiscount] = useState<number>(
    currentOrderDiscount || 0
  )
  const [otherDiscount, setOtherDiscount] = useState<number>(
    currentOtherDiscount || 0
  )
  const [deposit, setDeposit] = useState<number>(currentDeposit || 0)

  const { handleSubmit } = useForm()

  // Load sales items for dropdown
  const { data: salesItemsData } = useQuery({
    queryKey: ["salesItems", "all"],
    queryFn: () =>
      searchSalesItems({
        page: 1,
        limit: 999
      })
  })

  const mutation = useMutation({
    mutationFn: () => {
      // Filter out empty items
      const validItems = items.filter((item) => item.code && item.quantity > 0)

      if (validItems.length === 0) {
        throw new Error("Vui lòng thêm ít nhất một sản phẩm")
      }

      return updateSalesOrderItems(orderId, {
        items: validItems,
        orderDiscount: orderDiscount,
        otherDiscount: otherDiscount,
        deposit: deposit
      })
    },
    onSuccess: () => {
      CToast.success({ title: "Cập nhật sản phẩm thành công" })
      onSuccess()
    },
    onError: (error: any) => {
      CToast.error({
        title:
          error?.response?.data?.message ||
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

  const salesItemOptions =
    salesItemsData?.data.data.map((item) => ({
      value: item.code,
      label: `${item.code} - ${item.name.vn}`
    })) || []

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <NumberInput
        label={
          <Text fw={700} size="md" c="orange">
            Chiết khấu đơn hàng
          </Text>
        }
        placeholder="Nhập số tiền chiết khấu đơn hàng"
        description={
          <Text size="xs" c="dimmed">
            Số tiền chiết khấu áp dụng trực tiếp cho đơn hàng
          </Text>
        }
        value={orderDiscount}
        onChange={(value) => setOrderDiscount(Number(value) || 0)}
        mb="md"
        min={0}
        thousandSeparator=","
        suffix=" đ"
        styles={{
          input: {
            borderColor: "orange",
            borderWidth: 2,
            fontWeight: 600
          }
        }}
      />

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

      <Group mb="xs" align="center" justify="space-between">
        <strong>Sản phẩm</strong>
        <Button
          size="xs"
          variant="light"
          leftSection={<IconPlus size={14} />}
          onClick={handleAddItem}
        >
          Thêm sản phẩm
        </Button>
      </Group>

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

      <Group justify="flex-end" mt="xl">
        <Button type="submit" loading={mutation.isPending}>
          Cập nhật
        </Button>
      </Group>
    </form>
  )
}
