import { useMutation, useQuery } from "@tanstack/react-query"
import { useMonthGoals } from "../../hooks/useMonthGoals"
import { useLivestreamChannels } from "../../hooks/useLivestreamChannels"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import { Controller, useForm } from "react-hook-form"
import { CreateMonthGoalRequest } from "../../hooks/models"
import { Button, Group, NumberInput, Stack, Select } from "@mantine/core"
import { MonthPickerInput } from "@mantine/dates"
import { useEffect, useState, useMemo } from "react"

interface Props {
  monthGoal?: {
    month: number
    year: number
    channel?: string
    liveStreamGoal: number
    shopGoal: number
    liveAdsPercentageGoal?: number
    shopAdsPercentageGoal?: number
  }
  refetch: () => void
}

export const MonthGoalModal = ({ monthGoal, refetch }: Props) => {
  const { createMonthGoal, updateGoal } = useMonthGoals()
  const { searchLivestreamChannels } = useLivestreamChannels()
  const [month, setMonth] = useState<Date | null>(new Date())

  // Fetch livestream channels
  const { data: channelsData = [] } = useQuery({
    queryKey: ["livestream-channels-for-goals-modal"],
    queryFn: () => searchLivestreamChannels({ page: 1, limit: 100 }),
    select: (data) => data.data.data || [],
    staleTime: 5 * 60 * 1000
  })

  // Channel options for Select
  const channelOptions = useMemo(() => {
    return channelsData.map((channel) => ({
      value: channel._id,
      label: channel.name
    }))
  }, [channelsData])

  const { handleSubmit, setValue, control } = useForm<CreateMonthGoalRequest>({
    defaultValues: monthGoal ?? {
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      channel: "",
      liveStreamGoal: 1_000_000,
      shopGoal: 1_000_000,
      liveAdsPercentageGoal: 0,
      shopAdsPercentageGoal: 0
    }
  })

  useEffect(() => {
    if (month) {
      setValue("month", month.getMonth())
      setValue("year", month.getFullYear())
    } else {
      setValue("month", new Date().getMonth())
      setValue("year", new Date().getFullYear())
    }
  }, [month])

  const { mutate: createMonthGoalMutation } = useMutation({
    mutationFn: createMonthGoal,
    onSuccess: (response) => {
      modals.closeAll()
      CToast.success({
        title: `Tạo KPI tháng ${response.data.month}/${response.data.year} thành công`
      })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi tạo KPI tháng" })
    }
  })

  const { mutate: updateGoalMutation } = useMutation({
    mutationFn: updateGoal,
    onSuccess: (response) => {
      modals.closeAll()
      CToast.success({
        title: `Cập nhật KPI tháng ${response.data.month}/${response.data.year} thành công`
      })
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi cập nhật KPI tháng" })
    }
  })

  const onSubmit = (values: CreateMonthGoalRequest) => {
    if (monthGoal) {
      updateGoalMutation({
        ...values,
        month: monthGoal.month,
        year: monthGoal.year
      })
    } else {
      createMonthGoalMutation(values)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={18} w={"100%"} p={2}>
        <MonthPickerInput
          value={month}
          onChange={(val) => setMonth(val)}
          label="Tháng"
          size="md"
          valueFormat="MM/YYYY"
        />
        <Controller
          control={control}
          name="channel"
          render={({ field }) => (
            <Select
              label="Kênh livestream"
              placeholder="Chọn kênh"
              data={channelOptions}
              size="md"
              searchable
              required
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="liveStreamGoal"
          render={({ field }) => (
            <NumberInput
              label="KPI Live"
              placeholder="Nhập KPI Live"
              min={0}
              size="md"
              thousandSeparator=","
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="shopGoal"
          render={({ field }) => (
            <NumberInput
              label="KPI Shop"
              placeholder="Nhập KPI Shop"
              min={0}
              size="md"
              thousandSeparator=","
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="liveAdsPercentageGoal"
          render={({ field }) => (
            <NumberInput
              label="KPI % Ads Live"
              placeholder="Nhập % Ads Live"
              min={0}
              max={100}
              size="md"
              suffix="%"
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="shopAdsPercentageGoal"
          render={({ field }) => (
            <NumberInput
              label="KPI % Ads Shop"
              placeholder="Nhập % Ads Shop"
              min={0}
              max={100}
              size="md"
              suffix="%"
              {...field}
            />
          )}
        />
        <Group justify="flex-end">
          <Button type="submit" color="indigo" size="md" fw={600}>
            Xác nhận
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
