import { useMutation } from "@tanstack/react-query"
import { DeleteIncomeByDateRequest } from "../../hooks/models"
import { useIncomes } from "../../hooks/useIncomes"
import { CToast } from "../common/CToast"
import { format } from "date-fns"
import { Button, Group } from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useState } from "react"
import { modals } from "@mantine/modals"

export const DeleteIncomeModal = () => {
  const { deleteIncomeByDate } = useIncomes()
  const [date, setDate] = useState<Date | null>(null)

  const { mutate: deleteIncome, isPending: deleting } = useMutation({
    mutationFn: (req: DeleteIncomeByDateRequest) => deleteIncomeByDate(req),
    onSuccess: (_, args) => {
      CToast.success({
        title: `Xoá doanh thu cho ngày ${format(args.date, "dd/MM/yyyy")} thành công`
      })
      modals.closeAll()
      setDate(null)
    },
    onError: () => {
      CToast.error({
        title: "Xoá doanh thu thất bại"
      })
    }
  })

  return (
    <Group gap="md" p="sm" align="flex-end">
      <DatePickerInput
        label="Chọn ngày xoá doanh thu"
        size="md"
        placeholder="Chọn ngày"
        value={date}
        onChange={setDate}
        maxDate={new Date()}
        withAsterisk
        w={250}
      />
      <Button
        onClick={() => {
          if (date) {
            deleteIncome({ date })
          }
        }}
        disabled={!date}
        loading={deleting}
        color="red"
        size="md"
      >
        Xoá
      </Button>
    </Group>
  )
}
