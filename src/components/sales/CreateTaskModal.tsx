import { Button, Select, Stack, Textarea } from "@mantine/core"
import { DateTimePicker } from "@mantine/dates"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { useSalesTasks } from "../../hooks/useSalesTasks"
import { CToast } from "../common/CToast"

interface CreateTaskModalProps {
  funnelId: string
  funnelName: string
  onSuccess: () => void
}

export const CreateTaskModal = ({
  funnelId,
  funnelName,
  onSuccess
}: CreateTaskModalProps) => {
  const { createSalesTask } = useSalesTasks()

  const [type, setType] = useState<"call" | "message" | "other">("call")
  const [note, setNote] = useState("")
  const [deadline, setDeadline] = useState<Date>(new Date())

  const { mutate: createTask, isPending } = useMutation({
    mutationFn: createSalesTask,
    onSuccess: () => {
      CToast.success({ title: "Tạo task thành công" })
      onSuccess()
    },
    onError: () => {
      CToast.error({ title: "Tạo task thất bại" })
    }
  })

  const handleSubmit = () => {
    createTask({
      salesFunnelId: funnelId,
      type,
      note,
      deadline
    })
  }

  return (
    <Stack gap="md">
      <div>
        <strong>Khách hàng:</strong> {funnelName}
      </div>

      <Select
        label="Loại công việc"
        placeholder="Chọn loại công việc"
        data={[
          { value: "call", label: "Gọi điện" },
          { value: "message", label: "Nhắn tin" },
          { value: "other", label: "Khác" }
        ]}
        value={type}
        onChange={(value) => setType(value as any)}
        required
      />

      <DateTimePicker
        label="Hạn hoàn thành"
        placeholder="Chọn thời gian"
        value={deadline}
        onChange={(value) => setDeadline(value || new Date())}
        valueFormat="DD/MM/YYYY HH:mm"
        required
      />

      <Textarea
        label="Ghi chú"
        placeholder="Nhập ghi chú về công việc..."
        value={note}
        onChange={(e) => setNote(e.currentTarget.value)}
        minRows={3}
      />

      <Button onClick={handleSubmit} loading={isPending} fullWidth>
        Tạo task
      </Button>
    </Stack>
  )
}
