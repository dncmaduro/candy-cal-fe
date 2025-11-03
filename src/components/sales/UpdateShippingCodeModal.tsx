import { Button, Group, TextInput, Select } from "@mantine/core"
import { useForm, Controller } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { CToast } from "../common/CToast"
import { useSalesOrders } from "../../hooks/useSalesOrders"

type UpdateShippingInfoFormData = {
  shippingCode?: string
  shippingType?: "shipping_vtp" | "shipping_cargo"
}

type UpdateShippingInfoModalProps = {
  orderId: string
  currentShippingCode?: string
  currentShippingType?: "shipping_vtp" | "shipping_cargo"
  onSuccess: () => void
}

export const UpdateShippingInfoModal = ({
  orderId,
  currentShippingCode,
  currentShippingType,
  onSuccess
}: UpdateShippingInfoModalProps) => {
  const { updateShippingInfo } = useSalesOrders()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<UpdateShippingInfoFormData>({
    defaultValues: {
      shippingCode: currentShippingCode || "",
      shippingType: currentShippingType || undefined
    }
  })

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
    mutation.mutate(data)
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
              { value: "shipping_cargo", label: "Shipcode lên chành" }
            ]}
            error={errors.shippingType?.message}
            mb="md"
            clearable
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
