import {
  Button,
  Group,
  Select,
  NumberInput,
  Text,
  TextInput,
  Stack,
  ActionIcon,
  Divider,
  Checkbox,
  Switch
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useForm, Controller } from "react-hook-form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { CToast } from "../common/CToast"
import { useSalesOrders } from "../../hooks/useSalesOrders"
import { useSalesFunnel } from "../../hooks/useSalesFunnel"
import { useSalesItems } from "../../hooks/useSalesItems"
import { useProvinces } from "../../hooks/useProvinces"
import { useSalesChannels } from "../../hooks/useSalesChannels"

type CreateSalesOrderFormData = {
  salesFunnelId: string
  storage: "position_HaNam" | "position_MKT"
  date: Date
  discount?: number
  deposit?: number
  // New customer info
  isNewCustomer?: boolean
  newCustomerName?: string
  newCustomerChannel?: string
  province?: string
  phoneNumber?: string
  address?: string
  funnelSource: "ads" | "seeding" | "referral"
  fromSystem?: boolean
}

type ItemInput = {
  code: string
  quantity: number
  note?: string
}

type CreateSalesOrderModalProps = {
  onSuccess: () => void
  salesFunnelId?: string
  initialItems?: { code: string; quantity: number }[]
  initialDiscount?: number
  initialDeposit?: number
}

export const CreateSalesOrderModal = ({
  onSuccess,
  salesFunnelId,
  initialItems,
  initialDiscount,
  initialDeposit
}: CreateSalesOrderModalProps) => {
  const { createSalesOrder } = useSalesOrders()
  const { searchFunnel, createLead, updateFunnelInfo } = useSalesFunnel()
  const { searchSalesItems } = useSalesItems()
  const { getProvinces } = useProvinces()
  const { searchSalesChannels } = useSalesChannels()

  const [items, setItems] = useState<ItemInput[]>(
    initialItems && initialItems.length > 0
      ? initialItems
      : [{ code: "", quantity: 1, note: "" }]
  )

  const [secondaryPhones, setSecondaryPhones] = useState<string[]>([])

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<CreateSalesOrderFormData>({
    defaultValues: {
      salesFunnelId: salesFunnelId || "",
      storage: "position_HaNam",
      date: new Date(),
      discount: initialDiscount ?? 0,
      deposit: initialDeposit ?? 0,
      isNewCustomer: false,
      newCustomerName: "",
      newCustomerChannel: "",
      province: "",
      phoneNumber: "",
      address: "",
      funnelSource: "ads",
      fromSystem: false
    }
  })

  const watchIsNewCustomer = watch("isNewCustomer")

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

  // Load provinces
  const { data: provincesData } = useQuery({
    queryKey: ["provinces"],
    queryFn: getProvinces
  })

  // Load sales channels
  const { data: channelsData } = useQuery({
    queryKey: ["salesChannels", "all"],
    queryFn: () => searchSalesChannels({ page: 1, limit: 999 })
  })

  const mutation = useMutation({
    mutationFn: async (data: CreateSalesOrderFormData) => {
      // Filter out empty items
      const validItems = items.filter((item) => item.code && item.quantity > 0)

      if (validItems.length === 0) {
        throw new Error("Vui lòng thêm ít nhất một sản phẩm")
      }

      let funnelId = data.salesFunnelId

      // If creating new customer
      if (data.isNewCustomer) {
        if (!data.newCustomerName || !data.newCustomerChannel) {
          throw new Error("Vui lòng điền tên khách hàng và kênh")
        }

        // Step 1: Create lead
        const leadResponse = await createLead({
          name: data.newCustomerName,
          channel: data.newCustomerChannel,
          funnelSource: data.funnelSource
        })

        funnelId = leadResponse.data._id

        // Step 2: Update funnel info with additional details
        await updateFunnelInfo(funnelId, {
          province: data.province,
          phoneNumber: data.phoneNumber,
          secondaryPhoneNumbers: secondaryPhones.filter((p) => p.trim() !== ""),
          address: data.address,
          fromSystem: data.fromSystem
        })
      }

      // Step 3: Create order
      return createSalesOrder({
        salesFunnelId: funnelId,
        items: validItems,
        storage: data.storage,
        date: data.date,
        discount: data.discount,
        deposit: data.deposit
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
    if (!data.isNewCustomer && !data.salesFunnelId) {
      CToast.error({ title: "Vui lòng chọn khách hàng" })
      return
    }
    if (
      data.isNewCustomer &&
      (!data.newCustomerName || !data.newCustomerChannel)
    ) {
      CToast.error({ title: "Vui lòng điền tên khách hàng và kênh" })
      return
    }
    mutation.mutate(data)
  }

  const addSecondaryPhone = () => {
    setSecondaryPhones([...secondaryPhones, ""])
  }

  const removeSecondaryPhone = (index: number) => {
    setSecondaryPhones(secondaryPhones.filter((_, i) => i !== index))
  }

  const updateSecondaryPhone = (index: number, value: string) => {
    const newPhones = [...secondaryPhones]
    newPhones[index] = value
    setSecondaryPhones(newPhones)
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

  const funnelOptions =
    funnelData?.data.data.map((item) => ({
      value: item._id,
      label: `${item.name}${item.phoneNumber ? ` - ${item.phoneNumber}` : ""}`
    })) || []

  const salesItemOptions =
    salesItemsData?.data.data.map((item) => ({
      value: item.code,
      label: `${item.code} - ${item.name.vn}`
    })) || []

  const provinceOptions =
    provincesData?.data.provinces.map((province) => ({
      value: province._id,
      label: province.name
    })) || []

  const channelOptions =
    channelsData?.data.data.map((channel) => ({
      value: channel._id,
      label: channel.channelName
    })) || []

  const sourceOptions = [
    { value: "ads", label: "Ads" },
    { value: "seeding", label: "Seeding" },
    { value: "referral", label: "Giới thiệu" }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {!salesFunnelId && (
        <Controller
          name="isNewCustomer"
          control={control}
          render={({ field: { value, onChange, ...field } }) => (
            <Checkbox
              {...field}
              checked={value}
              label="Tạo đơn cho khách hàng mới"
              mb="md"
              onChange={(event) => {
                onChange(event.currentTarget.checked)
              }}
            />
          )}
        />
      )}

      {!watchIsNewCustomer ? (
        <Controller
          name="salesFunnelId"
          control={control}
          rules={{
            required: !watchIsNewCustomer ? "Vui lòng chọn khách hàng" : false
          }}
          render={({ field }) => (
            <Select
              {...field}
              label="Khách hàng"
              placeholder="Chọn khách hàng"
              data={funnelOptions}
              searchable
              required={!watchIsNewCustomer}
              readOnly={!!salesFunnelId}
              error={errors.salesFunnelId?.message}
              mb="md"
            />
          )}
        />
      ) : (
        <Stack gap="md" mb="md">
          <Divider label="Thông tin khách hàng mới" labelPosition="center" />

          <Controller
            name="newCustomerName"
            control={control}
            rules={{
              required: watchIsNewCustomer
                ? "Tên khách hàng là bắt buộc"
                : false
            }}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Tên khách hàng"
                placeholder="Nhập tên khách hàng"
                required={watchIsNewCustomer}
                error={errors.newCustomerName?.message}
              />
            )}
          />

          <Controller
            name="newCustomerChannel"
            control={control}
            rules={{
              required: watchIsNewCustomer ? "Kênh là bắt buộc" : false
            }}
            render={({ field }) => (
              <Select
                {...field}
                label="Kênh"
                placeholder="Chọn kênh"
                data={channelOptions}
                searchable
                required={watchIsNewCustomer}
                error={errors.newCustomerChannel?.message}
              />
            )}
          />

          <Controller
            name="funnelSource"
            control={control}
            rules={{
              required: watchIsNewCustomer ? "Nguồn là bắt buộc" : false
            }}
            render={({ field }) => (
              <Select
                {...field}
                label="Nguồn"
                placeholder="Chọn nguồn"
                data={sourceOptions}
                searchable
                required={watchIsNewCustomer}
                error={errors.funnelSource?.message}
              />
            )}
          />

          <Controller
            name="fromSystem"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={(e) => field.onChange(e.currentTarget.checked)}
                label="Khách hàng cũ (đã từng mua hàng trước khi vào hệ thống)"
              />
            )}
          />

          <Controller
            name="province"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Tỉnh/Thành phố"
                placeholder="Chọn tỉnh/thành phố"
                data={provinceOptions}
                searchable
                clearable
              />
            )}
          />

          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Số điện thoại chính"
                placeholder="Nhập số điện thoại chính"
              />
            )}
          />

          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" fw={500}>
                Số điện thoại phụ
              </Text>
              <ActionIcon variant="light" size="sm" onClick={addSecondaryPhone}>
                <IconPlus size={16} />
              </ActionIcon>
            </Group>
            {secondaryPhones.map((phone, index) => (
              <Group key={index} gap="xs">
                <TextInput
                  placeholder="Nhập số điện thoại phụ"
                  value={phone}
                  onChange={(e) => updateSecondaryPhone(index, e.target.value)}
                  style={{ flex: 1 }}
                />
                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={() => removeSecondaryPhone(index)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>

          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Địa chỉ"
                placeholder="Nhập địa chỉ"
              />
            )}
          />
        </Stack>
      )}

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
              { value: "position_HaNam", label: "Kho Hà Nội" },
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

      <Controller
        name="discount"
        control={control}
        render={({ field }) => (
          <NumberInput
            {...field}
            label={
              <Text fw={700} size="md" c="orange">
                Chiết khấu mỗi thùng
              </Text>
            }
            placeholder="Nhập số tiền chiết khấu mỗi thùng"
            description="Số tiền chiết khấu cho mỗi thùng hàng (sẽ nhân với tổng số lượng)"
            error={errors.discount?.message}
            mb="md"
            min={0}
            thousandSeparator=","
            suffix=" đ/thùng"
            styles={{
              input: {
                borderColor: "orange",
                borderWidth: 2,
                fontWeight: 600
              }
            }}
          />
        )}
      />

      <Controller
        name="deposit"
        control={control}
        render={({ field }) => (
          <NumberInput
            {...field}
            label={
              <Text fw={700} size="md" c="teal">
                Tiền cọc
              </Text>
            }
            placeholder="Nhập số tiền cọc"
            description="Số tiền khách hàng đã đặt cọc cho đơn hàng này"
            error={errors.deposit?.message}
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
            style={{ width: 100 }}
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
          Tạo đơn hàng
        </Button>
      </Group>
    </form>
  )
}
