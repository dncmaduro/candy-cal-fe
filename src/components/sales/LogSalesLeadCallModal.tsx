import { Button, Group, Select, Stack, Textarea } from "@mantine/core"
import { DateTimePicker } from "@mantine/dates"
import { modals } from "@mantine/modals"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { useSalesLeads } from "../../hooks/useSalesLeads"
import { CToast } from "../common/CToast"

interface LogSalesLeadCallModalProps {
  leadCaseId: string
  onSuccess?: () => void
}

const outcomes = [
  { value: "no_answer", label: "Không nghe máy" },
  { value: "not_interested", label: "Không quan tâm" },
  { value: "call_back", label: "Hẹn gọi lại" },
  { value: "considering", label: "Đang cân nhắc" },
  { value: "closed", label: "Đã chốt" },
  { value: "wrong_number", label: "Sai số" },
  { value: "other", label: "Khác" }
]

export const LogSalesLeadCallModal = ({
  leadCaseId,
  onSuccess
}: LogSalesLeadCallModalProps) => {
  const { addCall } = useSalesLeads()
  const [outcome, setOutcome] = useState<string | null>(null)
  const [calledAt, setCalledAt] = useState<Date>(new Date())
  const [note, setNote] = useState("")

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      addCall(leadCaseId, {
        outcome,
        calledAt,
        note: note.trim()
      }),
    onSuccess: () => {
      CToast.success({ title: "Đã lưu cuộc gọi" })
      onSuccess?.()
      modals.closeAll()
    },
    onError: (error: any) => {
      CToast.error({ title: error?.message || "Không thể lưu cuộc gọi" })
    }
  })

  return (
    <Stack gap="md">
      <Select
        label="Kết quả gọi"
        placeholder="Chọn kết quả"
        data={outcomes}
        value={outcome}
        onChange={setOutcome}
        required
      />
      <DateTimePicker
        label="Thời điểm gọi"
        value={calledAt}
        onChange={(value) => setCalledAt(value || new Date())}
        valueFormat="DD/MM/YYYY HH:mm"
        required
      />
      <Textarea
        label="Ghi chú cuộc gọi"
        placeholder="Nhập tình trạng và nội dung trao đổi..."
        value={note}
        onChange={(event) => setNote(event.currentTarget.value)}
        minRows={4}
        required
      />
      <Group justify="flex-end">
        <Button
          variant="default"
          onClick={() => modals.closeAll()}
          disabled={isPending}
        >
          Hủy
        </Button>
        <Button
          loading={isPending}
          disabled={!outcome || !note.trim()}
          onClick={() => mutate()}
        >
          Lưu cuộc gọi
        </Button>
      </Group>
    </Stack>
  )
}
