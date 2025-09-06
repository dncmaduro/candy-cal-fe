import { useLivestream } from "../../hooks/useLivestream"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  Stack,
  Button,
  Group,
  Text,
  Select,
  ActionIcon,
  Box
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import { CreateLivestreamRangeRequest } from "../../hooks/models"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { format } from "date-fns"

interface Props {
  refetch: () => void
}

interface FormData {
  startDate: Date | null
  endDate: Date | null
  snapshots: {
    periodId: string
  }[]
}

export const LivestreamRangeModal = ({ refetch }: Props) => {
  const { createLivestreamRange, getAllLivestreamPeriods } = useLivestream()

  const { control, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
      snapshots: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "snapshots"
  })

  const watchedStartDate = watch("startDate")

  // Fetch periods
  const { data: periodsData } = useQuery({
    queryKey: ["getAllLivestreamPeriods"],
    queryFn: () => getAllLivestreamPeriods(),
    select: (data) =>
      data.data.periods.map((period) => ({
        label: `${format(new Date(0, 0, 0, period.startTime.hour, period.startTime.minute), "HH:mm")} - ${format(new Date(0, 0, 0, period.endTime.hour, period.endTime.minute), "HH:mm")} (${period.channel})${period.noon ? " (Ca trưa)" : ""}`,
        value: period._id
      }))
  })

  const { mutate: createRange, isPending } = useMutation({
    mutationFn: (req: CreateLivestreamRangeRequest) =>
      createLivestreamRange(req),
    onSuccess: () => {
      CToast.success({ title: "Tạo lịch livestream thành công" })
      modals.closeAll()
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi tạo lịch livestream" })
    }
  })

  const onSubmit = (data: FormData) => {
    if (!data.startDate || !data.endDate) {
      CToast.error({ title: "Vui lòng chọn ngày bắt đầu và kết thúc" })
      return
    }

    if (data.endDate < data.startDate) {
      CToast.error({ title: "Ngày kết thúc phải sau ngày bắt đầu" })
      return
    }

    // Validate snapshots
    const invalidSnapshot = data.snapshots.find((s) => !s.periodId)
    if (invalidSnapshot) {
      CToast.error({ title: "Vui lòng chọn khung giờ cho tất cả snapshots" })
      return
    }

    // Check for duplicate periods
    const periodIds = data.snapshots.map((s) => s.periodId)
    const uniquePeriodIds = new Set(periodIds)
    if (periodIds.length !== uniquePeriodIds.size) {
      CToast.error({
        title: "Không được chọn trùng khung giờ trong cùng một ngày"
      })
      return
    }

    createRange({
      startDate: data.startDate,
      endDate: data.endDate,
      snapshots: data.snapshots.map((s) => s.periodId)
    })
  }

  const addSnapshot = () => {
    append({ periodId: "" })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={16}>
        <Group grow>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DatePickerInput
                label="Ngày bắt đầu"
                value={field.value}
                onChange={field.onChange}
                valueFormat="DD/MM/YYYY"
                required
                disabled={isPending}
                size="md"
                minDate={new Date()}
              />
            )}
          />
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DatePickerInput
                label="Ngày kết thúc"
                value={field.value}
                onChange={field.onChange}
                valueFormat="DD/MM/YYYY"
                required
                disabled={isPending}
                size="md"
                minDate={watchedStartDate || new Date()}
              />
            )}
          />
        </Group>

        <Stack gap={8}>
          <Group justify="space-between">
            <Text fw={500} fz="sm">
              Khung giờ livestream
            </Text>
            <Button
              type="button"
              variant="light"
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={addSnapshot}
              disabled={isPending}
            >
              Thêm khung giờ
            </Button>
          </Group>

          {fields.map((field, index) => {
            // Get already selected period IDs to filter them out
            const watchedSnapshots = watch("snapshots")
            const selectedPeriodIds = watchedSnapshots
              .map((s, i) => (i !== index ? s.periodId : null))
              .filter(Boolean)

            // Filter available periods to exclude already selected ones
            const availablePeriods = (periodsData || []).filter(
              (period) => !selectedPeriodIds.includes(period.value)
            )

            return (
              <Box
                key={field.id}
                p={12}
                style={{ border: "1px solid #e9ecef", borderRadius: 8 }}
              >
                <Group justify="space-between" align="flex-end">
                  <Controller
                    name={`snapshots.${index}.periodId`}
                    control={control}
                    render={({ field: controllerField }) => (
                      <Select
                        label={`Khung giờ ${index + 1}`}
                        placeholder="Chọn khung giờ"
                        data={availablePeriods}
                        value={controllerField.value}
                        onChange={controllerField.onChange}
                        required
                        disabled={isPending}
                        size="sm"
                        style={{ flex: 1 }}
                      />
                    )}
                  />
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={isPending}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Box>
            )
          })}

          {fields.length === 0 && (
            <Text size="sm" c="dimmed" ta="center" py={20}>
              Chưa có khung giờ nào. Nhấn "Thêm khung giờ" để bắt đầu.
            </Text>
          )}
        </Stack>

        <Text size="sm" c="dimmed">
          Lịch livestream sẽ được tạo cho khoảng thời gian đã chọn. Bạn có thể
          thêm khung giờ phát sóng ngay tại đây.
        </Text>

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
            Tạo lịch
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
