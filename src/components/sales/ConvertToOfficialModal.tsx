import {
  Button,
  Group,
  TextInput,
  Select,
  NumberInput,
  Text
} from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { useForm, Controller } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { CToast } from "../common/CToast"
import { useSalesOrders } from "../../hooks/useSalesOrders"
import {
  calculateSalesShippingCost,
  getSalesShippingDescription
} from "../../utils/salesShipping"
import {
  SALES_ORDER_STATUS_OPTIONS,
  getSalesOrderStatusLabel,
  type SalesOrderStatus
} from "../../utils/salesOrderStatus"

type TransitionOrderStatusFormData = {
  status: SalesOrderStatus
  shippingCode?: string
  shippingType?: "shipping_vtp" | "shipping_cargo"
  tax?: number
  shippingCost?: number
  receivedDate?: Date
}

type TransitionOrderStatusModalProps = {
  orderId: string
  currentStatus: SalesOrderStatus
  currentShippingCode?: string
  currentShippingType?: "shipping_vtp" | "shipping_cargo"
  currentTax?: number
  currentShippingCost?: number
  currentReceivedDate?: Date
  total: number
  weight: number
  onSuccess: () => void
}

export const TransitionOrderStatusModal = ({
  orderId,
  currentStatus,
  currentShippingCode,
  currentShippingType,
  currentTax,
  currentShippingCost,
  currentReceivedDate,
  total,
  weight,
  onSuccess
}: TransitionOrderStatusModalProps) => {
  const { transitionSalesOrderStatus } = useSalesOrders()

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<TransitionOrderStatusFormData>({
    defaultValues: {
      status: currentStatus,
      shippingCode: currentShippingCode || "",
      shippingType: currentShippingType || undefined,
      tax: currentTax || undefined,
      shippingCost: currentShippingCost || undefined,
      receivedDate: currentReceivedDate || undefined
    }
  })

  const targetStatus = watch("status")
  const isOfficialTarget = targetStatus === "official"
  const isCurrentStatusSelected = targetStatus === currentStatus
  const availableStatuses = SALES_ORDER_STATUS_OPTIONS.filter(({ value }) => {
    if (currentStatus === "draft") {
      return value !== "draft" || value === currentStatus
    }

    return value !== "confirmed" || value === currentStatus
  })

  const mutation = useMutation({
    mutationFn: (data: TransitionOrderStatusFormData) => {
      const requestData = {
        status: data.status,
        shippingCode:
          data.status === "official" ? (data.shippingCode ?? "") : undefined,
        shippingType:
          data.status === "official"
            ? (data.shippingType ?? "shipping_vtp")
            : undefined,
        tax: data.status === "official" ? (data.tax ?? 0) : undefined,
        shippingCost:
          data.status === "official" ? (data.shippingCost ?? 0) : undefined,
        receivedDate:
          data.status === "official" ? data.receivedDate?.toISOString() : undefined
      }
      return transitionSalesOrderStatus(orderId, requestData)
    },
    onSuccess: (_, variables) => {
      CToast.success({
        title: `Chuyển trạng thái đơn hàng sang ${getSalesOrderStatusLabel(
          variables.status
        ).toLowerCase()} thành công`
      })
      onSuccess()
    },
    onError: (error: any) => {
      CToast.error({
        title:
          error?.response?.data?.message ||
          "Có lỗi xảy ra khi chuyển trạng thái đơn hàng"
      })
    }
  })

  const onSubmit = (data: TransitionOrderStatusFormData) => {
    mutation.mutate(data)
  }

  const applyTax = (rate: number) => {
    setValue("tax", Math.floor((total * rate) / 100))
  }

  const applyShipping = () => {
    setValue("shippingCost", calculateSalesShippingCost(weight))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Text size="sm" c="dimmed" mb="lg">
        Chọn trạng thái mới cho đơn hàng. Nếu chuyển sang chính thức, cần bổ sung
        thông tin vận chuyển và thuế.
      </Text>

      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            data={availableStatuses}
            description={`Trạng thái hiện tại: ${getSalesOrderStatusLabel(currentStatus)}`}
            error={errors.status?.message}
            mb="md"
            allowDeselect={false}
          />
        )}
      />

      {isOfficialTarget && (
        <>
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
                  <Button
                    radius="xl"
                    size="xs"
                    variant="light"
                    onClick={() => applyTax(0.75)}
                  >
                    Thuế 0.75%
                  </Button>
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
                description={getSalesShippingDescription(weight)}
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
                  <Button
                    radius="xl"
                    size="xs"
                    variant="light"
                    onClick={() => applyShipping()}
                  >
                    Áp dụng
                  </Button>
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
        </>
      )}

      <Group justify="flex-end" mt="xl">
        <Button
          type="submit"
          loading={mutation.isPending}
          color="green"
          disabled={isCurrentStatusSelected}
        >
          Cập nhật trạng thái
        </Button>
      </Group>
    </form>
  )
}
