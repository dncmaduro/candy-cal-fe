import { useLivestream } from "../../hooks/useLivestream"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Stack, Button, Group, NumberInput, Select } from "@mantine/core"
import { MonthPickerInput } from "@mantine/dates"
import { useForm, Controller } from "react-hook-form"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import {
  CreateLivestreamMonthGoalRequest,
  UpdateLivestreamMonthGoalRequest
} from "../../hooks/models"
import { useState, useEffect } from "react"

interface Props {
  goal?: {
    _id: string
    month: number
    year: number
    channel: {
      _id: string
      name: string
    }
    goal: number
  }
  refetch: () => void
}

interface FormData {
  month: number
  year: number
  channel: string
  goal: number
}

export const LivestreamGoalModal = ({ goal, refetch }: Props) => {
  const {
    createLivestreamMonthGoal,
    updateLivestreamMonthGoal,
    searchLivestreamChannels
  } = useLivestream()

  const [month, setMonth] = useState<Date | null>(() => {
    if (goal) {
      return new Date(goal.year, goal.month, 1)
    }
    return new Date()
  })

  // Fetch channels for select options
  const { data: channelOptions } = useQuery({
    queryKey: ["searchLivestreamChannels", "for-select"],
    queryFn: () => searchLivestreamChannels({ page: 1, limit: 100 }),
    select: (data) =>
      data.data.data.map((channel) => ({
        label: channel.name,
        value: channel._id
      }))
  })

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      month: goal?.month ?? new Date().getMonth(),
      year: goal?.year ?? new Date().getFullYear(),
      channel: goal?.channel._id ?? "",
      goal: goal?.goal ?? 0
    }
  })

  useEffect(() => {
    if (month) {
      setValue("month", month.getMonth())
      setValue("year", month.getFullYear())
    }
  }, [month, setValue])

  const { mutate: createGoal, isPending: creating } = useMutation({
    mutationFn: (req: CreateLivestreamMonthGoalRequest) =>
      createLivestreamMonthGoal(req),
    onSuccess: () => {
      modals.closeAll()
      CToast.success({ title: "Tạo mục tiêu thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi tạo mục tiêu" })
    }
  })

  const { mutate: updateGoal, isPending: updating } = useMutation({
    mutationFn: ({
      id,
      req
    }: {
      id: string
      req: UpdateLivestreamMonthGoalRequest
    }) => updateLivestreamMonthGoal(id, req),
    onSuccess: () => {
      modals.closeAll()
      CToast.success({ title: "Cập nhật mục tiêu thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi cập nhật mục tiêu" })
    }
  })

  const onSubmit = (values: FormData) => {
    if (goal) {
      // Update existing goal
      updateGoal({
        id: goal._id,
        req: { goal: values.goal }
      })
    } else {
      // Create new goal
      createGoal({
        month: values.month,
        year: values.year,
        channel: values.channel,
        goal: values.goal
      })
    }
  }

  const isPending = creating || updating

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={18} w="100%" p={2}>
        <MonthPickerInput
          label="Tháng"
          value={month}
          onChange={setMonth}
          valueFormat="MM/YYYY"
          size="md"
          disabled={isPending || !!goal} // Disable if editing existing goal
          required
        />

        <Controller
          name="channel"
          control={control}
          rules={{ required: "Vui lòng chọn kênh" }}
          render={({ field }) => (
            <Select
              label="Kênh"
              placeholder="Chọn kênh"
              value={field.value}
              onChange={field.onChange}
              data={channelOptions || []}
              size="md"
              disabled={isPending || !!goal} // Disable if editing existing goal
              required
              error={errors.channel?.message}
              searchable
            />
          )}
        />

        <Controller
          name="goal"
          control={control}
          rules={{
            required: "Vui lòng nhập mục tiêu",
            min: { value: 1, message: "Mục tiêu phải lớn hơn 0" }
          }}
          render={({ field }) => (
            <NumberInput
              label="Mục tiêu doanh thu (VNĐ)"
              placeholder="Nhập mục tiêu doanh thu"
              value={field.value}
              onChange={field.onChange}
              required
              disabled={isPending}
              size="md"
              min={0}
              thousandSeparator=","
              error={errors.goal?.message}
            />
          )}
        />

        <Group justify="flex-end" mt="md">
          <Button
            variant="light"
            onClick={() => modals.closeAll()}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button type="submit" loading={isPending} disabled={isPending}>
            {goal ? "Cập nhật" : "Tạo mục tiêu"}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
