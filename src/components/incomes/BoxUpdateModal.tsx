import { useState } from "react"
import { useIncomes } from "../../hooks/useIncomes"
import { useMutation } from "@tanstack/react-query"
import { UpdateIncomesBoxRequest } from "../../hooks/models"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import { Button, Group } from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"

export const BoxUpdateModal = () => {
  const { updateIncomesBox } = useIncomes()
  const [date, setDate] = useState<Date | null>(null)

  const { mutate: updateBox, isPending: updating } = useMutation({
    mutationFn: (req: UpdateIncomesBoxRequest) => updateIncomesBox(req),
    onSuccess: () => {
      CToast.success({
        title: "Cập nhật quy cách đóng hộp thành công"
      })
      modals.closeAll()
    },
    onError: () => {
      CToast.error({
        title: "Cập nhật quy cách đóng hộp thất bại"
      })
    }
  })

  return (
    <Group align="flex-end" gap="md" p="sm">
      <DatePickerInput
        label="Chọn ngày"
        size="md"
        placeholder="Chọn ngày"
        w={250}
        value={date}
        onChange={setDate}
        maxDate={new Date()}
        withAsterisk
      />
      <Button
        size="md"
        onClick={() => updateBox({ date: date! })}
        loading={updating}
      >
        Cập nhật
      </Button>
    </Group>
  )
}
