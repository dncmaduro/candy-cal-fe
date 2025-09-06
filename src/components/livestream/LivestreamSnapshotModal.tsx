import { useLivestream } from "../../hooks/useLivestream"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  Stack,
  Button,
  Group,
  Text,
  Select,
  NumberInput,
  Box
} from "@mantine/core"
import { useForm, Controller } from "react-hook-form"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import { UpdateLivestreamSnapshotRequest } from "../../hooks/models"
import { format } from "date-fns"

interface Props {
  livestreamId: string
  snapshot: {
    _id: string
    period: string
    host: string
    assistant: string
    goal: number
    income?: number
    noon?: boolean
  }
  refetch: () => void
}

interface FormData {
  period: string
  host: string
  assistant: string
  goal: number
  income?: number
}

export const LivestreamSnapshotModal = ({
  livestreamId,
  snapshot,
  refetch
}: Props) => {
  const {
    updateLivestreamSnapshot,
    getAllLivestreamPeriods,
    searchLivestreamEmployees
  } = useLivestream()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      period: snapshot.period,
      host: snapshot.host,
      assistant: snapshot.assistant,
      goal: snapshot.goal,
      income: snapshot.income || 0
    }
  })

  // Fetch periods
  const { data: periodsData } = useQuery({
    queryKey: ["getAllLivestreamPeriods"],
    queryFn: () => getAllLivestreamPeriods(),
    select: (data) =>
      data.data.periods.map((period) => ({
        label: `${format(new Date(0, 0, 0, period.startTime.hour, period.startTime.minute), "HH:mm")} - ${format(new Date(0, 0, 0, period.endTime.hour, period.endTime.minute), "HH:mm")} (${period.channel})`,
        value: period._id
      }))
  })

  // Fetch employees
  const { data: employeesData } = useQuery({
    queryKey: ["searchLivestreamEmployees"],
    queryFn: () => searchLivestreamEmployees({ page: 1, limit: 100 }),
    select: (data) =>
      data.data.data.map((emp) => ({
        label: emp.name,
        value: emp._id
      }))
  })

  const { mutate: updateSnapshot, isPending } = useMutation({
    mutationFn: (req: UpdateLivestreamSnapshotRequest) =>
      updateLivestreamSnapshot(livestreamId, snapshot._id, req),
    onSuccess: () => {
      CToast.success({ title: "Cập nhật snapshot thành công" })
      modals.closeAll()
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi cập nhật snapshot" })
    }
  })

  const onSubmit = (data: FormData) => {
    if (!data.period || !data.host || !data.assistant || !data.goal) {
      CToast.error({ title: "Vui lòng điền đầy đủ thông tin" })
      return
    }

    if (data.goal <= 0) {
      CToast.error({ title: "Mục tiêu phải lớn hơn 0" })
      return
    }

    if (data.income && data.income < 0) {
      CToast.error({ title: "Doanh thu thực tế không được âm" })
      return
    }

    updateSnapshot({
      period: data.period,
      host: data.host,
      assistant: data.assistant,
      goal: data.goal,
      income: data.income || 0
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={16}>
        <Text size="sm" c="dimmed" mb="md">
          Cập nhật thông tin khung giờ phát sóng
        </Text>

        <Controller
          name="period"
          control={control}
          rules={{ required: "Vui lòng chọn khung giờ" }}
          render={({ field }) => (
            <Select
              label="Khung giờ phát sóng"
              placeholder="Chọn khung giờ"
              data={periodsData || []}
              value={field.value}
              onChange={field.onChange}
              required
              disabled={isPending}
              size="md"
              error={errors.period?.message}
            />
          )}
        />

        <Group grow>
          <Controller
            name="host"
            control={control}
            rules={{ required: "Vui lòng chọn host" }}
            render={({ field }) => (
              <Select
                label="Host"
                placeholder="Chọn host"
                data={employeesData || []}
                value={field.value}
                onChange={field.onChange}
                required
                disabled={isPending}
                size="md"
                error={errors.host?.message}
                searchable
              />
            )}
          />
          <Controller
            name="assistant"
            control={control}
            rules={{ required: "Vui lòng chọn assistant" }}
            render={({ field }) => (
              <Select
                label="Assistant"
                placeholder="Chọn assistant"
                data={employeesData || []}
                value={field.value}
                onChange={field.onChange}
                required
                disabled={isPending}
                size="md"
                error={errors.assistant?.message}
                searchable
              />
            )}
          />
        </Group>

        <Group grow>
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
          <Controller
            name="income"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Doanh thu thực tế (VNĐ)"
                placeholder="Nhập doanh thu thực tế"
                value={field.value}
                onChange={field.onChange}
                disabled={isPending}
                size="md"
                min={0}
                thousandSeparator=","
                error={errors.income?.message}
              />
            )}
          />
        </Group>

        <Box
          p="sm"
          style={{
            backgroundColor: "var(--mantine-color-blue-0)",
            borderRadius: 8
          }}
        >
          <Text size="sm" c="blue">
            💡 <strong>Gợi ý:</strong> Doanh thu thực tế có thể để trống nếu
            chưa có số liệu cuối buổi. Mục tiêu doanh thu sẽ được sử dụng để
            đánh giá hiệu suất livestream.
          </Text>
        </Box>

        <Group justify="flex-end" mt={16}>
          <Button
            type="button"
            variant="outline"
            onClick={() => modals.closeAll()}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button type="submit" loading={isPending}>
            Cập nhật
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
