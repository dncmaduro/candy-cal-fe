import { Button } from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { modals } from "@mantine/modals"
import { Controller, useForm } from "react-hook-form"

interface UpdateOrderDateModalProps {
  currentOrderDate: Date
  onSubmit: ({ date }: { date: Date }) => void
  loading: boolean
}

export const UpdateOrderDateModal = ({
  currentOrderDate,
  onSubmit,
  loading
}: UpdateOrderDateModalProps) => {
  const { handleSubmit, control } = useForm<{ date: Date }>({
    defaultValues: { date: currentOrderDate }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="date"
        control={control}
        render={({ field }) => (
          <DatePickerInput
            label="Ngày của đơn hàng"
            placeholder="Chọn ngày"
            required
            valueFormat="DD/MM/YYYY"
            value={field.value}
            onChange={(val) => field.onChange(val)}
          />
        )}
      />

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={() => modals.closeAll()}>
          Hủy
        </Button>
        <Button type="submit" loading={loading}>
          Cập nhật
        </Button>
      </div>
    </form>
  )
}
