import { Button, Group, Select, NumberInput } from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useForm, Controller } from "react-hook-form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { CToast } from "../common/CToast"
import { useSalesOrders } from "../../hooks/useSalesOrders"
import { useSalesFunnel } from "../../hooks/useSalesFunnel"
import { useSalesItems } from "../../hooks/useSalesItems"

type CreateSalesOrderFormData = {
  salesFunnelId: string
  storage: "position_HaNam" | "position_MKT"
  date: Date
}

type ItemInput = {
  code: string
  quantity: number
}

type CreateSalesOrderModalProps = {
  onSuccess: () => void
  salesFunnelId?: string
}

export const CreateSalesOrderModal = ({
  onSuccess,
  salesFunnelId
}: CreateSalesOrderModalProps) => {
  const { createSalesOrder } = useSalesOrders()
  const { searchFunnel } = useSalesFunnel()
  const { searchSalesItems } = useSalesItems()

  const [items, setItems] = useState<ItemInput[]>([{ code: "", quantity: 1 }])

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateSalesOrderFormData>({
    defaultValues: {
      salesFunnelId: salesFunnelId || "",
      storage: "position_HaNam",
      date: new Date()
    }
  })

  // Load funnel items for dropdown
  const { data: funnelData } = useQuery({
    queryKey: ["salesFunnel", "all"],
    queryFn: () =>
      searchFunnel({
        page: 1,
        limit: 999
      })
  })

  // Load storage items for dropdown
  const { data: salesItemsData } = useQuery({
    queryKey: ["salesItems", "all"],
    queryFn: () =>
      searchSalesItems({
        page: 1,
        limit: 999
      })
  })

  const mutation = useMutation({
    mutationFn: (data: CreateSalesOrderFormData) => {
      // Filter out empty items
      const validItems = items.filter((item) => item.code && item.quantity > 0)

      if (validItems.length === 0) {
        throw new Error("Vui lòng thêm ít nhất một sản phẩm")
      }

      return createSalesOrder({
        salesFunnelId: data.salesFunnelId,
        items: validItems,
        storage: data.storage,
        date: data.date
      })
    },
    onSuccess: () => {
      CToast.success({ title: "Tạo đơn hàng thành công" })
      onSuccess()
    },
    onError: (error: any) => {
      CToast.error({
        title:
          error?.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng"
      })
    }
  })

  const onSubmit = (data: CreateSalesOrderFormData) => {
    if (!data.salesFunnelId) {
      CToast.error({ title: "Vui lòng chọn khách hàng" })
      return
    }
    mutation.mutate(data)
  }

  const handleAddItem = () => {
    setItems([...items, { code: "", quantity: 1 }])
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

  const funnelOptions =
    funnelData?.data.data.map((item) => ({
      value: item._id,
      label: `${item.name} - ${item.facebook}`
    })) || []

  const salesItemOptions =
    salesItemsData?.data.data.map((item) => ({
      value: item.code,
      label: `${item.code} - ${item.name.vn}`
    })) || []

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="salesFunnelId"
        control={control}
        rules={{ required: "Vui lòng chọn khách hàng" }}
        render={({ field }) => (
          <Select
            {...field}
            label="Khách hàng"
            placeholder="Chọn khách hàng"
            data={funnelOptions}
            searchable
            required
            readOnly={!!salesFunnelId}
            error={errors.salesFunnelId?.message}
            mb="md"
          />
        )}
      />

      <Controller
        name="storage"
        control={control}
        rules={{ required: "Vui lòng chọn kho" }}
        render={({ field }) => (
          <Select
            {...field}
            label="Kho xuất hàng"
            placeholder="Chọn kho"
            data={[
              { value: "position_HaNam", label: "Kho Hà Nam" },
              { value: "position_MKT", label: "Kho MKT" }
            ]}
            required
            error={errors.storage?.message}
            mb="md"
          />
        )}
      />

      <Controller
        name="date"
        control={control}
        rules={{ required: "Vui lòng chọn ngày" }}
        render={({ field }) => (
          <DatePickerInput
            {...field}
            label="Ngày đặt hàng"
            placeholder="Chọn ngày"
            required
            error={errors.date?.message}
            mb="md"
            valueFormat="DD/MM/YYYY"
          />
        )}
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
          Tạo đơn hàng
        </Button>
      </Group>
    </form>
  )
}
