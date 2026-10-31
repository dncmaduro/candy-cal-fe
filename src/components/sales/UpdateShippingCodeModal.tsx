import { Button, Group, TextInput, Select, NumberInput } from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { useForm, Controller } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { CToast } from "../common/CToast"
import { useSalesOrders } from "../../hooks/useSalesOrders"
import {
  calculateSalesShippingCost,
  calculateJntShippingCost,
  getJntShippingDescription,
  getSalesShippingDescription,
  type JntShippingItem
} from "../../utils/salesShipping"

type UpdateShippingInfoFormData = {
  shippingCode?: string
  shippingType?: "shipping_vtp" | "shipping_cargo" | "shipping_jnt"
  tax?: number
  shippingCost?: number
  receivedDate?: Date
}

type UpdateShippingInfoModalProps = {
  orderId: string
  currentShippingCode?: string
  currentShippingType?: "shipping_vtp" | "shipping_cargo" | "shipping_jnt"
  currentTax?: number
  currentShippingCost?: number
  currentReceivedDate?: Date
  total: number
  weight: number
  items: JntShippingItem[]
  onSuccess: () => void
}

export const UpdateShippingInfoModal = ({
  orderId,
  currentShippingCode,
  currentShippingType,
  currentTax,
  currentShippingCost,
  currentReceivedDate,
  total,
  weight,
  items,
  onSuccess
}: UpdateShippingInfoModalProps) => {
  const { updateShippingInfo } = useSalesOrders()

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<UpdateShippingInfoFormData>({
    defaultValues: {
      shippingCode: currentShippingCode || "",
      shippingType: currentShippingType || undefined,
      tax: currentTax || undefined,
      shippingCost: currentShippingCost || undefined,
      receivedDate: currentReceivedDate || undefined
    }
  })

  const selectedShippingType = watch("shippingType")
  const isJnt = selectedShippingType === "shipping_jnt"
  const calculatedShippingCost = isJnt
    ? calculateJntShippingCost(items)
    : calculateSalesShippingCost(weight)

  const mutation = useMutation({
    mutationFn: (data: UpdateShippingInfoFormData) => {
      return updateShippingInfo(orderId, data)
    },
    onSuccess: () => {
      CToast.success({ title: "Cập nhật thông tin vận chuyển thành công" })
      onSuccess()
    },
    onError: (error: any) => {
      CToast.error({
        title:
          error?.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật thông tin vận chuyển"
      })
    }
  })

  const onSubmit = (data: UpdateShippingInfoFormData) => {
    mutation.mutate({
      ...data,
      shippingCost: isJnt ? calculatedShippingCost : data.shippingCost
    })
  }

  const applyTax = (rate: number) => {
    setValue("tax", Math.floor((total * rate) / 100))
  }

  const applyShipping = () => {
    setValue("shippingCost", calculatedShippingCost)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="shippingCode"
        control={control}
        render={({ field }) => (
          <TextInput
            {...field}
            label="Mã vận đơn"
            placeholder="Nhập mã vận đơn"
            error={errors.shippingCode?.message}
            mb="md"
          />
        )}
      />

      <Controller
        name="shippingType"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label="Loại vận chuyển"
            placeholder="Chọn loại vận chuyển"
            data={[
              { value: "shipping_vtp", label: "Viettel Post" },
              { value: "shipping_cargo", label: "Shipcode lên chành" },
              { value: "shipping_jnt", label: "J&T" }
            ]}
            error={errors.shippingType?.message}
            mb="md"
            clearable
          />
        )}
      />

      <Controller
        name="tax"
        control={control}
        render={({ field }) => (
          <NumberInput
            {...field}
            label="Thuế"
            placeholder="Nhập thuế"
            error={errors.tax?.message}
            mb="md"
            min={0}
            styles={{
              section: {
                display: "flex",
                justifyContent: "space-between",
                width: "100px"
              }
            }}
            rightSection={
              <>
                <Button
                  radius={"xl"}
                  size="xs"
                  variant="light"
                  onClick={() => applyTax(0.75)}
                >
                  Thuế 0.75%
                </Button>
              </>
            }
            thousandSeparator="."
            suffix=" đ"
          />
        )}
      />

      <Controller
        name="shippingCost"
        control={control}
        render={({ field }) => (
          <NumberInput
            {...field}
            label="Phí vận chuyển"
            placeholder="Nhập phí vận chuyển"
            description={
              isJnt
                ? getJntShippingDescription(items)
                : getSalesShippingDescription(weight)
            }
            error={errors.shippingCost?.message}
            mb="md"
            min={0}
            thousandSeparator="."
            suffix=" đ"
            styles={{
              section: {
                display: "flex",
                justifyContent: "space-between",
                width: "84px"
              }
            }}
            rightSection={
              <>
                <Button
                  radius={"xl"}
                  size="xs"
                  variant="light"
                  onClick={() => applyShipping()}
                >
                  Áp dụng
                </Button>
              </>
            }
          />
        )}
      />

      <Controller
        name="receivedDate"
        control={control}
        render={({ field }) => (
          <DateInput
            {...field}
            label="Ngày thu tiền"
            placeholder="Chọn ngày thu tiền"
            error={errors.receivedDate?.message}
            mb="md"
            clearable
            valueFormat="DD/MM/YYYY"
          />
        )}
      />

      <Group justify="flex-end" mt="xl">
        <Button type="submit" loading={mutation.isPending}>
          Cập nhật
        </Button>
      </Group>
    </form>
  )
}

// Keep old export for backward compatibility
export const UpdateShippingCodeModal = UpdateShippingInfoModal
