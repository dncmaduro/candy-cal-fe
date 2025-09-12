import { useState } from "react"
import { useLivestream } from "../../hooks/useLivestream"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Stack, Button, Group, Switch, Text, Select } from "@mantine/core"
import { TimeInput } from "@mantine/dates"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import {
  CreateLivestreamPeriodRequest,
  UpdateLivestreamPeriodRequest,
  GetAllLivestreamPeriodsResponse
} from "../../hooks/models"

type LivestreamPeriod = GetAllLivestreamPeriodsResponse["periods"][0]

interface Props {
  period?: LivestreamPeriod
  refetch: () => void
}

export const LivestreamPeriodModal = ({ period, refetch }: Props) => {
  const {
    createLivestreamPeriod,
    updateLivestreamPeriod,
    searchLivestreamChannels
  } = useLivestream()

  // Fetch channels for select options
  const { data: channelOptions } = useQuery({
    queryKey: ["searchLivestreamChannels", "for-select"],
    queryFn: () => searchLivestreamChannels({ page: 1, limit: 100 }),
    select: (data) =>
      data.data.data.map((channel) => ({
        label: channel.name,
        value: channel.name
      }))
  })

  const formatTimeValue = (hour: number, minute: number) => {
    const h = hour.toString().padStart(2, "0")
    const m = minute.toString().padStart(2, "0")
    return `${h}:${m}`
  }

  const parseTimeValue = (timeString: string) => {
    const [hourStr, minuteStr] = timeString.split(":")
    return {
      hour: parseInt(hourStr) || 0,
      minute: parseInt(minuteStr) || 0
    }
  }

  const [startTime, setStartTime] = useState(
    period
      ? formatTimeValue(period.startTime.hour, period.startTime.minute)
      : "00:00"
  )
  const [endTime, setEndTime] = useState(
    period
      ? formatTimeValue(period.endTime.hour, period.endTime.minute)
      : "00:00"
  )
  const [channel, setChannel] = useState(period?.channel || "")
  const [noon, setNoon] = useState(period?.noon || false)

  const { mutate: createPeriod, isPending: creating } = useMutation({
    mutationFn: (req: CreateLivestreamPeriodRequest) =>
      createLivestreamPeriod(req),
    onSuccess: () => {
      CToast.success({ title: "Thêm khoảng thời gian thành công" })
      modals.closeAll()
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi thêm khoảng thời gian" })
    }
  })

  const { mutate: updatePeriod, isPending: updating } = useMutation({
    mutationFn: ({
      id,
      req
    }: {
      id: string
      req: UpdateLivestreamPeriodRequest
    }) => updateLivestreamPeriod(id, req),
    onSuccess: () => {
      CToast.success({ title: "Cập nhật khoảng thời gian thành công" })
      modals.closeAll()
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi cập nhật khoảng thời gian" })
    }
  })

  const handleSubmit = () => {
    if (!channel.trim()) {
      CToast.error({ title: "Vui lòng nhập tên kênh" })
      return
    }

    const startTimeParsed = parseTimeValue(startTime)
    const endTimeParsed = parseTimeValue(endTime)

    // Check if end time is after start time
    const startTotalMinutes = startTimeParsed.hour * 60 + startTimeParsed.minute
    const endTotalMinutes = endTimeParsed.hour * 60 + endTimeParsed.minute

    if (endTotalMinutes <= startTotalMinutes) {
      CToast.error({ title: "Thời gian kết thúc phải sau thời gian bắt đầu" })
      return
    }

    if (period) {
      // Update existing period
      updatePeriod({
        id: period._id,
        req: {
          startTime: startTimeParsed,
          endTime: endTimeParsed,
          channel: channel.trim(),
          noon
        }
      })
    } else {
      // Create new period
      createPeriod({
        startTime: startTimeParsed,
        endTime: endTimeParsed,
        channel: channel.trim(),
        noon
      })
    }
  }

  const isPending = creating || updating

  return (
    <Stack gap={16}>
      <Group grow>
        <TimeInput
          label="Thời gian bắt đầu"
          placeholder="HH:MM"
          value={startTime}
          onChange={(event) => setStartTime(event.currentTarget.value)}
          required
          disabled={isPending}
          size="md"
        />
        <TimeInput
          label="Thời gian kết thúc"
          placeholder="HH:MM"
          value={endTime}
          onChange={(event) => setEndTime(event.currentTarget.value)}
          required
          disabled={isPending}
          size="md"
        />
      </Group>

      <Select
        label="Kênh"
        placeholder="Chọn kênh livestream"
        value={channel}
        onChange={(value) => setChannel(value || "")}
        data={channelOptions || []}
        required
        disabled={isPending}
        size="md"
        searchable
      />

      <Stack gap={8}>
        <Text fw={500} fz="sm">
          Loại khung giờ
        </Text>
        <Switch
          label={noon ? "Khung giờ trưa" : "Khung giờ thường"}
          checked={noon}
          onChange={(e) => setNoon(e.currentTarget.checked)}
          disabled={isPending}
          size="md"
          color="green"
        />
        {noon && (
          <Text fz="xs" c="dimmed">
            Khung giờ trưa sẽ được tô màu xanh trong bảng
          </Text>
        )}
      </Stack>

      <Group justify="flex-end" mt={16}>
        <Button
          variant="outline"
          onClick={() => modals.closeAll()}
          disabled={isPending}
        >
          Hủy
        </Button>
        <Button onClick={handleSubmit} loading={isPending}>
          {period ? "Cập nhật" : "Thêm"}
        </Button>
      </Group>
    </Stack>
  )
}
