import {
  Button,
  Group,
  TextInput,
  Select,
  NumberInput,
  Text
} from "@mantine/core"
import { useForm, Controller } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { CToast } from "../common/CToast"
import { useSalesOrders } from "../../hooks/useSalesOrders"

type ConvertToOfficialFormData = {
  shippingCode?: string
  shippingType?: "shipping_vtp" | "shipping_cargo"
  tax?: number
  shippingCost?: number
}

type ConvertToOfficialModalProps = {
  orderId: string
  currentShippingCode?: string
  currentShippingType?: "shipping_vtp" | "shipping_cargo"
  currentTax?: number
  currentShippingCost?: number
  total: number
  weight: number
  onSuccess: () => void
}

export const ConvertToOfficialModal = ({
  orderId,
  currentShippingCode,
  currentShippingType,
  currentTax,
  currentShippingCost,
  total,
  weight,
  onSuccess
}: ConvertToOfficialModalProps) => {
  const { moveSalesOrderToOfficial } = useSalesOrders()

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<ConvertToOfficialFormData>({
    defaultValues: {
      shippingCode: currentShippingCode || "",
      shippingType: currentShippingType || undefined,
      tax: currentTax || undefined,
      shippingCost: currentShippingCost || undefined
    }
  })

  const mutation = useMutation({
    mutationFn: (data: ConvertToOfficialFormData) => {
      // API requires tax and shippingCost to be numbers
      const requestData = {
        tax: data.tax ?? 0,
        shippingCost: data.shippingCost ?? 0,
        shippingCode: data.shippingCode,
        shippingType: data.shippingType
      }
      return moveSalesOrderToOfficial(orderId, requestData)
    },
    onSuccess: () => {
      CToast.success({ title: "Chuyển đơn hàng sang chính thức thành công" })
      onSuccess()
    },
    onError: (error: any) => {
      CToast.error({
        title:
          error?.response?.data?.message ||
          "Có lỗi xảy ra khi chuyển đơn hàng sang chính thức"
      })
    }
  })

  const onSubmit = (data: ConvertToOfficialFormData) => {
    mutation.mutate(data)
  }

  const applyTax = (rate: number) => {
    setValue("tax", Math.floor((total * rate) / 100))
  }

  const applyShipping = () => {
    // Nếu khối lượng < 10kg thì 45k, >= 10kg thì 5k/kg (không làm tròn khối lượng)
    const shippingCost = weight < 10 ? 45000 : weight * 5000
    setValue("shippingCost", Math.round(shippingCost))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Text size="sm" c="dimmed" mb="lg">
        Cập nhật thông tin vận chuyển và thuế để chuyển đơn hàng từ báo giá sang
        chính thức
      </Text>

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
            thousandSeparator=","
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
              weight < 10
                ? `Khối lượng ${weight.toFixed(2)}kg < 10kg → Phí cố định 45.000đ`
                : `Khối lượng ${weight.toFixed(2)}kg ≥ 10kg → ${weight.toFixed(2)}kg × 5.000đ = ${(weight * 5000).toLocaleString("vi-VN")}đ`
            }
            error={errors.shippingCost?.message}
            mb="md"
            min={0}
            thousandSeparator=","
            suffix=" đ"
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
                  onClick={() => applyShipping()}
                >
                  Áp dụng
                </Button>
              </>
            }
          />
        )}
      />

      <Group justify="flex-end" mt="xl">
        <Button type="submit" loading={mutation.isPending} color="green">
          Chuyển sang chính thức
        </Button>
      </Group>
    </form>
  )
}
