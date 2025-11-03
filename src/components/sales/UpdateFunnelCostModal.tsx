import { Button, Group, NumberInput } from "@mantine/core"
import { useForm, Controller } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { CToast } from "../common/CToast"
import { useSalesFunnel } from "../../hooks/useSalesFunnel"

type UpdateFunnelCostFormData = {
  cost: number
}

type UpdateFunnelCostModalProps = {
  funnelId: string
  currentCost?: number
  onSuccess: () => void
}

export const UpdateFunnelCostModal = ({
  funnelId,
  currentCost,
  onSuccess
}: UpdateFunnelCostModalProps) => {
  const { updateFunnelCost } = useSalesFunnel()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<UpdateFunnelCostFormData>({
    defaultValues: {
      cost: currentCost || 0
    }
  })

  const mutation = useMutation({
    mutationFn: (data: UpdateFunnelCostFormData) => {
      return updateFunnelCost(funnelId, data)
    },
    onSuccess: () => {
      CToast.success({ title: "Cập nhật chi phí marketing thành công" })
      onSuccess()
    },
    onError: (error: any) => {
      CToast.error({
        title:
          error?.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật chi phí marketing"
      })
    }
  })

  const onSubmit = (data: UpdateFunnelCostFormData) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="cost"
        control={control}
        rules={{
          required: "Vui lòng nhập chi phí",
          min: { value: 0, message: "Chi phí phải lớn hơn hoặc bằng 0" }
        }}
        render={({ field }) => (
          <NumberInput
            {...field}
            label="Chi phí marketing"
            placeholder="Nhập chi phí"
            required
            min={0}
            error={errors.cost?.message}
            mb="md"
            suffix=" đ"
            thousandSeparator=","
            hideControls
          />
        )}
      />

      <Group justify="flex-end" mt="xl">
        <Button type="submit" loading={mutation.isPending}>
          Cập nhật
        </Button>
      </Group>
    </form>
  )
}
