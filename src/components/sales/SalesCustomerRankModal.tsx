import { useForm, Controller } from "react-hook-form"
import { Button, Stack, Select, NumberInput, Text } from "@mantine/core"
import { useSalesCustomerRanks } from "../../hooks/useSalesCustomerRanks"
import { CToast } from "../common/CToast"
import { GetSalesCustomerRanksResponse } from "../../hooks/models"

type SalesCustomerRank = GetSalesCustomerRanksResponse

interface Props {
  rank?: SalesCustomerRank
  refetch: () => void
}

interface FormValues {
  rank: "gold" | "silver" | "bronze"
  minIncome: number
}

const RANK_OPTIONS = [
  { value: "gold", label: "Vàng" },
  { value: "silver", label: "Bạc" },
  { value: "bronze", label: "Đồng" }
]

export function SalesCustomerRankModal({ rank, refetch }: Props) {
  const { createSalesCustomerRank, updateSalesCustomerRank } =
    useSalesCustomerRanks()

  const {
    control,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<FormValues>({
    defaultValues: {
      rank: rank?.rank || "bronze",
      minIncome: rank?.minIncome || 0
    }
  })

  const onSubmit = async (data: FormValues) => {
    try {
      if (rank) {
        await updateSalesCustomerRank(rank._id, data)
        CToast.success({ title: "Cập nhật hạng khách hàng thành công" })
      } else {
        await createSalesCustomerRank(data)
        CToast.success({ title: "Tạo hạng khách hàng thành công" })
      }
      refetch()
    } catch (error: any) {
      CToast.error({
        title:
          error?.response?.data?.message ||
          "Có lỗi xảy ra khi lưu hạng khách hàng"
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md">
        <Controller
          name="rank"
          control={control}
          rules={{ required: "Vui lòng chọn hạng" }}
          render={({ field, fieldState }) => (
            <Select
              {...field}
              label="Hạng khách hàng"
              placeholder="Chọn hạng"
              data={RANK_OPTIONS}
              required
              error={fieldState.error?.message}
              withAsterisk
            />
          )}
        />

        <Controller
          name="minIncome"
          control={control}
          rules={{
            required: "Vui lòng nhập doanh thu tối thiểu",
            min: { value: 0, message: "Doanh thu phải lớn hơn hoặc bằng 0" }
          }}
          render={({ field, fieldState }) => (
            <NumberInput
              {...field}
              label="Doanh thu tối thiểu"
              placeholder="Nhập số tiền"
              min={0}
              required
              thousandSeparator=","
              suffix=" đ"
              error={fieldState.error?.message}
              withAsterisk
              description="Khách hàng đạt doanh thu này trở lên sẽ được xếp vào hạng này"
            />
          )}
        />

        <Text size="xs" c="dimmed">
          * Hệ thống sẽ tự động xếp hạng khách hàng dựa trên tổng doanh thu
        </Text>

        <Button type="submit" loading={isSubmitting} fullWidth mt="md">
          {rank ? "Cập nhật" : "Tạo mới"}
        </Button>
      </Stack>
    </form>
  )
}
