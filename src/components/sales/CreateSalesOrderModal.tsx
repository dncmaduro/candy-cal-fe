import {
  Button,
  Badge,
  Group,
  Select,
  NumberInput,
  Text,
  TextInput,
  Stack,
  Flex,
  ActionIcon,
  Divider,
  Checkbox,
  Switch
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { Controller, useFormContext, useFieldArray } from "react-hook-form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import type { AxiosError } from "axios"
import { useEffect, useMemo, useState } from "react"
import { CToast } from "../common/CToast"
import { useSalesOrders } from "../../hooks/useSalesOrders"
import { useSalesFunnel } from "../../hooks/useSalesFunnel"
import { useSalesItems } from "../../hooks/useSalesItems"
import { useProvinces } from "../../hooks/useProvinces"
import { useSalesChannels } from "../../hooks/useSalesChannels"
import {
  calculatePercentDiscountAmount,
  calculatePercentFromAmount,
  formatOrderDiscountPercent,
  getEffectiveOrderDiscountType,
  type SalesOrderDiscountType
} from "../../utils/salesOrderDiscount"
import { OrderDiscountModeToggle } from "./OrderDiscountModeToggle"

type CreateSalesOrderFormData = {
  salesFunnelId: string
  storage: "position_HaNam" | "position_MKT"
  date: Date
  orderDiscount?: number
  orderDiscountType?: SalesOrderDiscountType
  otherDiscount?: number
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
  // Items and secondary phones as part of form
  items: { code: string; quantity: number; note?: string }[]
  secondaryPhones: string[]
}

type CreateSalesOrderModalProps = {
  channelId: string
  onSuccess: () => void
}

const RHF_INTERACTION_OPTIONS = {
  shouldDirty: true,
  shouldTouch: true,
  shouldValidate: true
} as const

export const CreateSalesOrderModal = ({
  channelId,
  onSuccess
}: CreateSalesOrderModalProps) => {
  const { createSalesOrder } = useSalesOrders()
  const { searchFunnel, createLead, updateFunnelInfo } = useSalesFunnel()
  const { searchSalesItems } = useSalesItems()
  const { getProvinces } = useProvinces()
  const { searchSalesChannels } = useSalesChannels()

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useFormContext<CreateSalesOrderFormData>()

  const watchIsNewCustomer = watch("isNewCustomer")
  const watchItems = watch("items") || []
  const watchOrderDiscountAmount = Number(watch("orderDiscount") || 0)
  const watchOtherDiscountAmount = Number(watch("otherDiscount") || 0)
  const watchOrderDiscountType = getEffectiveOrderDiscountType(
    watch("orderDiscountType")
  )
  const [orderDiscountPercent, setOrderDiscountPercent] = useState(0)
  const [isPercentInitialized, setIsPercentInitialized] = useState(false)

  // Use useFieldArray to manage items and secondaryPhones
  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem
  } = useFieldArray({
    control,
    name: "items"
  })

  // Load funnel items for dropdown
  const { data: funnelData } = useQuery({
    queryKey: ["salesFunnel", "all"],
    queryFn: () =>
      searchFunnel({
        page: 1,
        limit: 999,
        deleted: false,
        channel: channelId
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

  const salesItemPriceByCode = useMemo(
    () =>
      new Map(
        (salesItemsData?.data.data || []).map((item) => [item.code, item.price])
      ),
    [salesItemsData?.data.data]
  )

  const calculateItemsSubtotal = (
    items: { code: string; quantity: number; note?: string }[]
  ) =>
    items.reduce((sum, item) => {
      const price = salesItemPriceByCode.get(item.code) || 0
      const quantity = Number(item.quantity) || 0

      return sum + price * quantity
    }, 0)

  const subtotal = calculateItemsSubtotal(watchItems)
  const currentOrderDiscountAmount =
    watchOrderDiscountType === "percent"
      ? calculatePercentDiscountAmount(subtotal, orderDiscountPercent)
      : watchOrderDiscountAmount
  const totalDiscountAmount =
    currentOrderDiscountAmount + watchOtherDiscountAmount
  const estimatedOrderSubtotal = subtotal - totalDiscountAmount
  const orderDiscountPercentError =
    orderDiscountPercent < 0 || orderDiscountPercent > 100
      ? "Phần trăm chiết khấu phải từ 0 đến 100"
      : undefined

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

  useEffect(() => {
    if (watchOrderDiscountType !== "percent") return
    if (isPercentInitialized) return
    if (watchItems.length > 0 && !salesItemsData) return

    const nextPercent = calculatePercentFromAmount(
      subtotal,
      watchOrderDiscountAmount
    )

    setOrderDiscountPercent(nextPercent)
    setIsPercentInitialized(true)
  }, [
    isPercentInitialized,
    salesItemsData,
    subtotal,
    watchItems.length,
    watchOrderDiscountAmount,
    watchOrderDiscountType
  ])

  useEffect(() => {
    if (watchOrderDiscountType !== "percent") return

    const nextAmount = calculatePercentDiscountAmount(
      subtotal,
      orderDiscountPercent
    )

    if (watchOrderDiscountAmount !== nextAmount) {
      setValue("orderDiscount", nextAmount, RHF_INTERACTION_OPTIONS)
    }
  }, [
    orderDiscountPercent,
    setValue,
    subtotal,
    watchOrderDiscountAmount,
    watchOrderDiscountType
  ])

  const mutation = useMutation({
    mutationFn: async (data: CreateSalesOrderFormData) => {
      // Filter out empty items
      const validItems = data.items.filter(
        (item) => item.code && item.quantity > 0
      )

      if (validItems.length === 0) {
        throw new Error("Vui lòng thêm ít nhất một sản phẩm")
      }

      const effectiveOrderDiscountType = getEffectiveOrderDiscountType(
        data.orderDiscountType
      )
      const validItemsSubtotal = calculateItemsSubtotal(validItems)
      const orderDiscount =
        effectiveOrderDiscountType === "percent"
          ? calculatePercentDiscountAmount(
              validItemsSubtotal,
              orderDiscountPercent
            )
          : Number(data.orderDiscount) || 0

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
          secondaryPhoneNumbers: data.secondaryPhones.filter(
            (p) => p.trim() !== ""
          ),
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
        orderDiscount,
        orderDiscountType: effectiveOrderDiscountType,
        otherDiscount: data.otherDiscount,
        deposit: data.deposit
      })
    },
    onSuccess: () => {
      CToast.success({ title: "Tạo đơn hàng thành công" })
      onSuccess()
    },
    onError: (error: unknown) => {
      const message = (error as AxiosError<{ message?: string }>)?.response
        ?.data?.message

      CToast.error({
        title: message || "Có lỗi xảy ra khi tạo đơn hàng"
      })
    }
  })

  const onSubmit = (data: CreateSalesOrderFormData) => {
    if (
      getEffectiveOrderDiscountType(data.orderDiscountType) === "percent" &&
      orderDiscountPercentError
    ) {
      CToast.error({ title: orderDiscountPercentError })
      return
    }

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
  const secondaryPhones = watch("secondaryPhones") || []

  const addSecondaryPhone = () => {
    setValue("secondaryPhones", [...secondaryPhones, ""])
  }

  const removeSecondaryPhone = (index: number) => {
    setValue(
      "secondaryPhones",
      secondaryPhones.filter((_, i) => i !== index)
    )
  }

  const updateSecondaryPhone = (index: number, value: string) => {
    const newPhones = [...secondaryPhones]
    newPhones[index] = value
    setValue("secondaryPhones", newPhones)
  }

  const handleAddItem = () => {
    appendItem({ code: "", quantity: 1, note: "" })
  }

  const handleRemoveItem = (index: number) => {
    removeItem(index)
  }

  const handleOrderDiscountTypeChange = (nextType: SalesOrderDiscountType) => {
    if (nextType === watchOrderDiscountType) return

    if (nextType === "percent") {
      const canInitializePercent =
        watchItems.length === 0 || Boolean(salesItemsData)

      if (canInitializePercent) {
        const nextPercent = calculatePercentFromAmount(
          subtotal,
          watchOrderDiscountAmount
        )

        setOrderDiscountPercent(nextPercent)
      }

      setIsPercentInitialized(canInitializePercent)
    }

    if (nextType === "value") {
      const nextAmount = calculatePercentDiscountAmount(
        subtotal,
        orderDiscountPercent
      )

      setValue("orderDiscount", nextAmount, RHF_INTERACTION_OPTIONS)
      setIsPercentInitialized(false)
    }

    setValue("orderDiscountType", nextType, RHF_INTERACTION_OPTIONS)
  }

  const toggleOrderDiscountType = () => {
    handleOrderDiscountTypeChange(
      watchOrderDiscountType === "percent" ? "value" : "percent"
    )
  }

  const duplicateCodeIndexes = watchItems.reduce(
    (acc, item, index) => {
      if (!item?.code) return acc
      if (!acc[item.code]) {
        acc[item.code] = []
      }
      acc[item.code].push(index)
      return acc
    },
    {} as Record<string, number[]>
  )

  const duplicatedCodes = Object.entries(duplicateCodeIndexes).filter(
    ([, indexes]) => indexes.length > 1
  )

  const funnelOptions =
    funnelData?.data.data.map((item) => ({
      value: item._id,
      label: `${item.stage === "closed" ? "[ĐÃ ĐÓNG]" : ""}${item.name}${item.phoneNumber ? ` - ${item.phoneNumber}` : ""}`
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
      {!watch("salesFunnelId") && (
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
        name="orderDiscountType"
        control={control}
        render={({ field }) => <input type="hidden" {...field} />}
      />

      <Controller
        name="orderDiscount"
        control={control}
        render={({ field }) => (
          <Flex align="flex-end" gap="xs" mb="md">
            <NumberInput
              value={
                watchOrderDiscountType === "percent"
                  ? orderDiscountPercent
                  : field.value || 0
              }
              onChange={(value) => {
                if (watchOrderDiscountType === "percent") {
                  setOrderDiscountPercent(Number(value) || 0)
                  return
                }

                setValue(
                  "orderDiscount",
                  Number(value) || 0,
                  RHF_INTERACTION_OPTIONS
                )
              }}
              label={
                <Text fw={700} size="md" c="orange">
                  Chiết khấu đơn hàng
                </Text>
              }
              placeholder={
                watchOrderDiscountType === "percent"
                  ? "Nhập phần trăm chiết khấu"
                  : "Nhập số tiền chiết khấu đơn hàng"
              }
              description="Chiết khấu trực tiếp lên các mặt hàng"
              error={
                (watchOrderDiscountType === "percent"
                  ? orderDiscountPercentError
                  : undefined) || errors.orderDiscount?.message
              }
              min={0}
              max={watchOrderDiscountType === "percent" ? 100 : undefined}
              step={watchOrderDiscountType === "percent" ? 0.5 : 1}
              decimalScale={watchOrderDiscountType === "percent" ? 2 : 0}
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
              mode={watchOrderDiscountType}
              onToggle={toggleOrderDiscountType}
            />
          </Flex>
        )}
      />

      {watchOrderDiscountType === "percent" && (
        <Text size="xs" c="orange.7" mb="md" mt={-8}>
          CK đơn hiện tại: {formatOrderDiscountPercent(orderDiscountPercent)}%
        </Text>
      )}

      <Controller
        name="otherDiscount"
        control={control}
        render={({ field }) => (
          <NumberInput
            {...field}
            label={
              <Text fw={700} size="md" c="pink">
                Chiết khấu 2
              </Text>
            }
            placeholder="Nhập số tiền chiết khấu 2"
            description="Chiết khấu bổ sung (khuyến mãi, voucher,...)"
            error={errors.otherDiscount?.message}
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

      <Text fw={700} mb="xs">
        Sản phẩm
      </Text>

      {duplicatedCodes.length > 0 && (
        <Stack gap={4} mb="sm">
          <Text size="xs" c="orange.7" fw={600}>
            Có {duplicatedCodes.length} mã sản phẩm đang bị trùng dòng.
          </Text>
          <Group gap={6}>
            {duplicatedCodes.map(([code, indexes]) => (
              <Badge key={code} variant="light" color="orange">
                {code}: dòng {indexes.map((i) => i + 1).join(", ")}
              </Badge>
            ))}
          </Group>
        </Stack>
      )}

      {itemFields.map((field, index) => (
        <Group key={field.id} mb="sm" align="flex-end" wrap="nowrap">
          <Controller
            name={`items.${index}.code` as const}
            control={control}
            render={({ field: inputField }) => {
              const currentCode = inputField.value
              const sameCodeIndexes = currentCode
                ? duplicateCodeIndexes[currentCode] || []
                : []
              const duplicateIndexes = sameCodeIndexes.filter(
                (i) => i !== index
              )
              const rowSalesItemOptions = salesItemOptions.map((option) => {
                const selectedIndexes = duplicateCodeIndexes[option.value] || []
                const isSelected = selectedIndexes.length > 0
                const selectedOnAnotherRow = selectedIndexes.some(
                  (selectedIndex) => selectedIndex !== index
                )

                return {
                  ...option,
                  label: `${option.label}${isSelected ? " (đã chọn)" : ""}`,
                  disabled: selectedOnAnotherRow && option.value !== currentCode
                }
              })

              return (
                <Select
                  {...inputField}
                  label={index === 0 ? "Mã sản phẩm" : undefined}
                  placeholder="Chọn sản phẩm"
                  data={rowSalesItemOptions}
                  searchable
                  style={{ flex: 1 }}
                  description={
                    duplicateIndexes.length > 0
                      ? `Mã này đang trùng với dòng ${duplicateIndexes
                          .map((i) => i + 1)
                          .join(", ")}`
                      : undefined
                  }
                />
              )
            }}
          />
          <Controller
            name={`items.${index}.quantity` as const}
            control={control}
            render={({ field: inputField }) => (
              <NumberInput
                {...inputField}
                label={index === 0 ? "Số lượng" : undefined}
                placeholder="Số lượng"
                min={1}
                style={{ width: 100 }}
              />
            )}
          />
          <Controller
            name={`items.${index}.note` as const}
            control={control}
            render={({ field: inputField }) => (
              <TextInput
                {...inputField}
                label={index === 0 ? "Ghi chú" : undefined}
                placeholder="Nhập ghi chú"
                w={250}
              />
            )}
          />
          {itemFields.length > 1 && (
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
          Tạm tính
        </Text>
        <Text size="sm" fw={600}>
          {estimatedOrderSubtotal.toLocaleString("vi-VN")}đ
        </Text>
        <Text size="xs" c="dimmed">
          {subtotal.toLocaleString("vi-VN")}đ tiền hàng -{" "}
          {totalDiscountAmount.toLocaleString("vi-VN")}đ chiết khấu
        </Text>
      </Stack>

      <Group justify="flex-end" mt="xl">
        <Button type="submit" loading={mutation.isPending}>
          Tạo đơn hàng
        </Button>
      </Group>
    </form>
  )
}
