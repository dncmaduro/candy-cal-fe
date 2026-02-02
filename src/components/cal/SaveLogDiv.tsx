import { Button, Group, Select, Stack } from "@mantine/core"
import { DatePickerInput, DateTimePicker } from "@mantine/dates"
import { useState } from "react"
import { useSessionLogs } from "../../hooks/useSessionLogs"
import { useDailyLogs } from "../../hooks/useDailyLogs"
import { IconDeviceFloppy } from "@tabler/icons-react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { CToast } from "../common/CToast"
import { useLivestreamChannels } from "../../hooks/useLivestreamChannels"

interface Props {
  items: {
    _id: string
    quantity: number
    storageItems: {
      code: string
      name: string
      receivedQuantity: {
        quantity: number
        real: number
      }
      deliveredQuantity: {
        quantity: number
        real: number
      }
      restQuantity: {
        quantity: number
        real: number
      }
      note?: string
    }[]
  }[]
  orders: {
    products: {
      name: string
      quantity: number
    }[]
    quantity: number
  }[]
  platform?: string
}

export const SaveLogDiv = ({ items, orders, platform }: Props) => {
  const { createSessionLog } = useSessionLogs()
  const { createDailyLog } = useDailyLogs()
  const { searchLivestreamChannels } = useLivestreamChannels()

  console.log(platform)

  const { mutate: createSession, isPending: isCreatingSession } = useMutation({
    mutationFn: createSessionLog,
    onSuccess: () => {
      CToast.success({
        title: "Lưu log theo ca thành công"
      })
    },
    onError: () => {
      CToast.error({
        title: "Lưu log theo ca thất bại"
      })
    }
  })

  const { mutate: createDaily, isPending: isCreatingDaily } = useMutation({
    mutationFn: createDailyLog,
    onSuccess: () => {
      CToast.success({
        title: "Lưu log hàng ngày thành công"
      })
    },
    onError: () => {
      CToast.error({
        title: "Lưu log hàng ngày thất bại"
      })
    }
  })

  const [option, setOption] = useState<"session-log" | "daily-log">(
    "session-log"
  )
  const [date, setDate] = useState<Date | null>(
    new Date(new Date().setHours(0, 0, 0, 0))
  )
  const [channelId, setChannelId] = useState<string | null>(null)

  const { data: channelsData, isLoading: isLoadingChannels } = useQuery({
    queryKey: ["searchLivestreamChannels", "all"],
    queryFn: () => searchLivestreamChannels({ page: 1, limit: 200 }),
    select: (res) => {
      const data = res.data.data ?? []
      if (!platform) {
        return data
      }

      return data.filter((d) => d.platform === platform)
    },
    refetchOnWindowFocus: false
  })

  const channelOptions = (channelsData ?? [])
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((ch) => ({
      value: ch._id,
      label: ch.name
    }))

  const saveOptions = [
    {
      label: "Lưu log theo ca",
      value: "session-log"
    },
    {
      label: "Lưu log hàng ngày",
      value: "daily-log"
    }
  ]

  const handleSave = () => {
    if (option === "session-log") {
      createSession({ time: date as Date, items, orders })
    } else {
      if (!channelId) {
        CToast.error({ title: "Vui lòng chọn kênh" })
        return
      }
      createDaily({ date: date as Date, items, orders, channelId })
    }
  }

  return (
    <Stack>
      <Group align="flex-end">
        <Select
          data={saveOptions}
          size="md"
          radius={"md"}
          label="Chọn loại log"
          allowDeselect={false}
          value={option}
          onChange={(val) => setOption(val as "session-log" | "daily-log")}
        />
        {option === "session-log" ? (
          <>
            <DateTimePicker
              size="md"
              radius={"md"}
              label="Chọn ngày và giờ"
              w={200}
              value={date}
              onChange={setDate}
            />
          </>
        ) : (
          <>
            <DatePickerInput
              size="md"
              radius={"md"}
              label="Chọn ngày"
              value={date}
              w={150}
              valueFormat="DD/MM/YYYY"
              onChange={setDate}
            />
            <Select
              data={channelOptions}
              size="md"
              radius={"md"}
              label="Chọn kênh"
              placeholder="Chọn kênh"
              value={channelId}
              onChange={setChannelId}
              w={220}
              searchable
              clearable
              disabled={isLoadingChannels}
              nothingFoundMessage="Không có kênh"
            />
          </>
        )}
        <Button
          color="indigo"
          size="md"
          radius="xl"
          fw={600}
          px={22}
          onClick={handleSave}
          leftSection={<IconDeviceFloppy size={16} />}
          loading={isCreatingSession || isCreatingDaily}
          disabled={
            isCreatingSession ||
            isCreatingDaily ||
            (option === "daily-log" && !channelId)
          }
        >
          Lưu log
        </Button>
      </Group>
    </Stack>
  )
}
