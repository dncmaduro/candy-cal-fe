import { Button, Group, Select, Stack } from "@mantine/core"
import { DatePickerInput, DateTimePicker } from "@mantine/dates"
import { useState } from "react"
import { useSessionLogs } from "../../hooks/useSessionLogs"
import { useDailyLogs } from "../../hooks/useDailyLogs"
import { IconDeviceFloppy } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { CToast } from "../common/CToast"

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
}

export const SaveLogDiv = ({ items, orders }: Props) => {
  const { createSessionLog } = useSessionLogs()
  const { createDailyLog } = useDailyLogs()

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
      createDaily({ date: date as Date, items, orders })
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
          disabled={isCreatingSession || isCreatingDaily}
        >
          Lưu log
        </Button>
      </Group>
    </Stack>
  )
}
