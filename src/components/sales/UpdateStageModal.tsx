import { Button, Group, Stack, Select } from "@mantine/core"
import { modals } from "@mantine/modals"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { CToast } from "../common/CToast"
import { useSalesFunnel } from "../../hooks/useSalesFunnel"
import { UpdateStageRequest } from "../../hooks/models"

interface UpdateStageModalProps {
  funnelId: string
  currentStage: "lead" | "contacted" | "customer" | "closed"
  onSuccess?: () => void
}

const STAGE_OPTIONS = [
  { value: "lead", label: "Lead" },
  { value: "contacted", label: "Đã liên hệ" },
  { value: "customer", label: "Khách hàng" },
  { value: "closed", label: "Đã đóng" }
]

export const UpdateStageModal = ({
  funnelId,
  currentStage,
  onSuccess
}: UpdateStageModalProps) => {
  const queryClient = useQueryClient()
  const { updateStage } = useSalesFunnel()

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<UpdateStageRequest>({
    defaultValues: {
      stage: currentStage
    }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateStageRequest) => updateStage(funnelId, data),
    onSuccess: () => {
      CToast.success({ title: "Cập nhật giai đoạn thành công" })
      queryClient.invalidateQueries({ queryKey: ["salesFunnel"] })
      modals.closeAll()
      onSuccess?.()
    },
    onError: (error: any) => {
      CToast.error({ title: error?.message || "Có lỗi xảy ra" })
    }
  })

  const onSubmit = (data: UpdateStageRequest) => {
    mutate(data)
  }

  const onInvalid = () => {
    CToast.error({ title: "Vui lòng chọn giai đoạn" })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <Stack gap="md">
        <Controller
          name="stage"
          control={control}
          rules={{ required: "Giai đoạn là bắt buộc" }}
          render={({ field }) => (
            <Select
              {...field}
              label="Giai đoạn"
              placeholder="Chọn giai đoạn"
              data={STAGE_OPTIONS}
              required
              error={errors.stage?.message}
            />
          )}
        />

        <Group justify="flex-end" mt="md">
          <Button
            variant="default"
            onClick={() => modals.closeAll()}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button type="submit" loading={isPending}>
            Cập nhật
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
