import { Button, Group, NumberInput, Select, Stack } from "@mantine/core"
import { useForm, Controller } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { useSalesDailyReports } from "../../../hooks/useSalesDailyReports"
import { CToast } from "../../common/CToast"
import { SearchSalesChannelResponse } from "../../../hooks/models"

interface KpiData {
  _id: string
  month: number
  year: number
  channel: {
    _id: string
    channelName: string
    phoneNumber: string
  }
  kpi: number
}

interface Props {
  kpi?: KpiData
  channels: SearchSalesChannelResponse["data"]
  onSuccess: () => void
}

interface FormData {
  month: number
  year: number
  channel: string
  kpi: number
}

export const SalesKPIModal = ({ kpi, channels, onSuccess }: Props) => {
  const { createSalesMonthKpi, updateSalesMonthKpi } = useSalesDailyReports()

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      month: kpi?.month || currentMonth,
      year: kpi?.year || currentYear,
      channel: kpi?.channel._id || "",
      kpi: kpi?.kpi || 0
    }
  })

  const createMutation = useMutation({
    mutationFn: createSalesMonthKpi,
    onSuccess: () => {
      CToast.success({ title: "Tạo KPI thành công" })
      onSuccess()
    },
    onError: () => {
      CToast.error({ title: "Tạo KPI thất bại" })
    }
  })

  const updateMutation = useMutation({
    mutationFn: updateSalesMonthKpi,
    onSuccess: () => {
      CToast.success({ title: "Cập nhật KPI thành công" })
      onSuccess()
    },
    onError: () => {
      CToast.error({ title: "Cập nhật KPI thất bại" })
    }
  })

  const onSubmit = (data: FormData) => {
    if (kpi) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `Tháng ${i + 1}`
  }))

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i)
  }))

  const channelOptions = channels.map((channel) => ({
    value: channel._id,
    label: channel.channelName
  }))

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md">
        <Controller
          name="month"
          control={control}
          rules={{ required: "Vui lòng chọn tháng" }}
          render={({ field }) => (
            <Select
              {...field}
              value={String(field.value)}
              onChange={(value) => field.onChange(Number(value))}
              label="Tháng"
              placeholder="Chọn tháng"
              data={monthOptions}
              error={errors.month?.message}
              required
            />
          )}
        />

        <Controller
          name="year"
          control={control}
          rules={{ required: "Vui lòng chọn năm" }}
          render={({ field }) => (
            <Select
              {...field}
              value={String(field.value)}
              onChange={(value) => field.onChange(Number(value))}
              label="Năm"
              placeholder="Chọn năm"
              data={yearOptions}
              error={errors.year?.message}
              required
            />
          )}
        />

        <Controller
          name="channel"
          control={control}
          rules={{ required: "Vui lòng chọn kênh" }}
          render={({ field }) => (
            <Select
              {...field}
              label="Kênh"
              placeholder="Chọn kênh"
              data={channelOptions}
              error={errors.channel?.message}
              searchable
              required
            />
          )}
        />

        <Controller
          name="kpi"
          control={control}
          rules={{
            required: "Vui lòng nhập KPI",
            min: { value: 0, message: "KPI phải lớn hơn 0" }
          }}
          render={({ field }) => (
            <NumberInput
              {...field}
              label="KPI (VNĐ)"
              placeholder="Nhập KPI"
              error={errors.kpi?.message}
              min={0}
              step={1000000}
              thousandSeparator=","
              required
            />
          )}
        />

        <Group justify="flex-end" mt="md">
          <Button
            type="submit"
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {kpi ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
