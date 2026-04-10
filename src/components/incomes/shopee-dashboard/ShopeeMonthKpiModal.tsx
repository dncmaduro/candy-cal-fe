import { Button, Group, NumberInput, Select, SimpleGrid, Stack } from "@mantine/core"
import { useMutation } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import type { LivestreamChannel, ShopeeMonthKpiRecord } from "../../../hooks/models"
import { useShopeeMonthKpis } from "../../../hooks/useShopeeMonthKpis"
import { CToast } from "../../common/CToast"

interface ShopeeMonthKpiModalProps {
  kpi?: ShopeeMonthKpiRecord
  channels: LivestreamChannel[]
  onSuccess: () => void
}

interface ShopeeMonthKpiFormData {
  month: number
  year: number
  channel: string
  revenueKpi: number
  adsCostKpi: number
  roasKpi: number
}

const getChannelId = (channel: ShopeeMonthKpiRecord["channel"] | undefined) => {
  if (!channel) return ""
  return typeof channel === "string" ? channel : channel._id
}

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data &&
    "message" in error.response.data
  ) {
    const message = error.response.data.message

    if (typeof message === "string" && message.trim()) return message
    if (Array.isArray(message)) return message.join(", ")
  }

  if (error instanceof Error && error.message) return error.message
  return "Vui lòng thử lại sau"
}

export const ShopeeMonthKpiModal = ({
  kpi,
  channels,
  onSuccess
}: ShopeeMonthKpiModalProps) => {
  const { createShopeeMonthKpi, updateShopeeMonthKpi } = useShopeeMonthKpis()
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ShopeeMonthKpiFormData>({
    defaultValues: {
      month: kpi?.month ?? currentMonth,
      year: kpi?.year ?? currentYear,
      channel: getChannelId(kpi?.channel),
      revenueKpi: kpi?.revenueKpi ?? 0,
      adsCostKpi: kpi?.adsCostKpi ?? 0,
      roasKpi: kpi?.roasKpi ?? 0
    }
  })

  const createMutation = useMutation({
    mutationFn: createShopeeMonthKpi,
    onSuccess: () => {
      CToast.success({ title: "Tạo KPI Shopee thành công" })
      onSuccess()
    },
    onError: (error) => {
      CToast.error({
        title: "Tạo KPI Shopee thất bại",
        subtitle: getErrorMessage(error)
      })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string
      data: ShopeeMonthKpiFormData
    }) => updateShopeeMonthKpi(id, data),
    onSuccess: () => {
      CToast.success({ title: "Cập nhật KPI Shopee thành công" })
      onSuccess()
    },
    onError: (error) => {
      CToast.error({
        title: "Cập nhật KPI Shopee thất bại",
        subtitle: getErrorMessage(error)
      })
    }
  })

  const monthOptions = Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1),
    label: `Tháng ${index + 1}`
  }))

  const yearOptions = Array.from({ length: 5 }, (_, index) => ({
    value: String(currentYear - 2 + index),
    label: String(currentYear - 2 + index)
  }))

  const channelOptions = channels.map((channel) => ({
    value: channel._id,
    label: channel.name
  }))

  const onSubmit = (data: ShopeeMonthKpiFormData) => {
    if (kpi) {
      updateMutation.mutate({
        id: kpi._id,
        data
      })
      return
    }

    createMutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Controller
            name="month"
            control={control}
            rules={{ required: "Vui lòng chọn tháng" }}
            render={({ field }) => (
              <Select
                {...field}
                label="Tháng"
                placeholder="Chọn tháng"
                data={monthOptions}
                value={String(field.value)}
                onChange={(value) => {
                  if (!value) return
                  field.onChange(Number(value))
                }}
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
                label="Năm"
                placeholder="Chọn năm"
                data={yearOptions}
                value={String(field.value)}
                onChange={(value) => {
                  if (!value) return
                  field.onChange(Number(value))
                }}
                error={errors.year?.message}
                required
              />
            )}
          />
        </SimpleGrid>

        <Controller
          name="channel"
          control={control}
          rules={{ required: "Vui lòng chọn shop Shopee" }}
          render={({ field }) => (
            <Select
              {...field}
              label="Shop Shopee"
              placeholder="Chọn shop Shopee"
              data={channelOptions}
              error={errors.channel?.message}
              searchable
              required
            />
          )}
        />

        <Controller
          name="revenueKpi"
          control={control}
          rules={{
            required: "Vui lòng nhập KPI doanh thu",
            min: { value: 0, message: "KPI doanh thu phải là số không âm" }
          }}
          render={({ field }) => (
            <NumberInput
              label="KPI doanh thu (VNĐ)"
              placeholder="Nhập KPI doanh thu"
              value={field.value}
              onChange={(value) =>
                field.onChange(typeof value === "number" ? value : 0)
              }
              error={errors.revenueKpi?.message}
              min={0}
              step={1000000}
              thousandSeparator=","
              required
            />
          )}
        />

        <Controller
          name="adsCostKpi"
          control={control}
          rules={{
            required: "Vui lòng nhập KPI chi phí ads",
            min: { value: 0, message: "KPI chi phí ads phải là số không âm" }
          }}
          render={({ field }) => (
            <NumberInput
              label="KPI chi phí ads (VNĐ)"
              placeholder="Nhập KPI chi phí ads"
              value={field.value}
              onChange={(value) =>
                field.onChange(typeof value === "number" ? value : 0)
              }
              error={errors.adsCostKpi?.message}
              min={0}
              step={1000000}
              thousandSeparator=","
              required
            />
          )}
        />

        <Controller
          name="roasKpi"
          control={control}
          rules={{
            required: "Vui lòng nhập KPI ROAS",
            min: { value: 0, message: "KPI ROAS phải là số không âm" }
          }}
          render={({ field }) => (
            <NumberInput
              label="KPI ROAS"
              placeholder="Nhập KPI ROAS"
              value={field.value}
              onChange={(value) =>
                field.onChange(typeof value === "number" ? value : 0)
              }
              error={errors.roasKpi?.message}
              min={0}
              step={0.1}
              decimalScale={2}
              required
            />
          )}
        />

        <Group justify="flex-end" mt="md">
          <Button
            type="submit"
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {kpi ? "Cập nhật KPI" : "Tạo KPI"}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
