import { useMutation } from "@tanstack/react-query"
import { useTasks } from "../../hooks/useTasks"
import { CToast } from "../common/CToast"
import { useState } from "react"
import { Button, Group, Stack, Text, Loader } from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { IconPlayerPlay } from "@tabler/icons-react"
import { format } from "date-fns"
import { modals } from "@mantine/modals"

export const GenerateTasks = () => {
  const { generateTasks } = useTasks()
  const [date, setDate] = useState<Date | null>(new Date())

  const { mutate: generate, isPending: generating } = useMutation({
    mutationFn: () => generateTasks({ date: date as Date }),
    onSuccess: (response) => {
      const payload = response.data.data
      CToast.success({
        title: `Đã tạo ${payload.tasksCreated} task cho ngày ${format(
          new Date(payload.date),
          "dd/MM/yyyy"
        )}`
      })
      modals.closeAll()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi tạo task" })
    }
  })

  const disabled = !date || generating

  return (
    <Stack gap={14} p={4}>
      <Text fw={600} fz="sm" c="dimmed">
        Chọn ngày để generate daily tasks.
      </Text>
      <Group align="flex-end" gap={16}>
        <DatePickerInput
          label="Ngày"
          value={date}
          onChange={(d) => setDate(d)}
          maxDate={new Date()}
          valueFormat="DD/MM/YYYY"
          disabled={generating}
          placeholder="Chọn ngày"
        />
        <Button
          leftSection={
            generating ? <Loader size={16} /> : <IconPlayerPlay size={16} />
          }
          disabled={disabled}
          onClick={() => generate()}
          variant="filled"
          color="indigo"
          radius="xl"
        >
          {generating ? "Đang tạo..." : "Generate"}
        </Button>
      </Group>
    </Stack>
  )
}
