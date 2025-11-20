import { Button, Group, Stack, Select } from "@mantine/core"
import { modals } from "@mantine/modals"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { CToast } from "../common/CToast"
import { useSalesFunnel } from "../../hooks/useSalesFunnel"
import { UpdateFunnelResponsibleUserRequest } from "../../hooks/models"
import { useUsers } from "../../hooks/useUsers"

interface UpdateFunnelResponsibleUserModalProps {
  funnelId: string
  currentUserId?: string
  onSuccess?: () => void
}

export const UpdateFunnelResponsibleUserModal = ({
  funnelId,
  currentUserId,
  onSuccess
}: UpdateFunnelResponsibleUserModalProps) => {
  const queryClient = useQueryClient()
  const { updateFunnelResponsibleUser } = useSalesFunnel()
  const { publicSearchUser } = useUsers()

  const { data: usersData } = useQuery({
    queryKey: ["users", "public", "sales-emp"],
    queryFn: () => publicSearchUser({ page: 1, limit: 999, role: "sales-emp" })
  })

  const { handleSubmit, control } = useForm<UpdateFunnelResponsibleUserRequest>(
    {
      defaultValues: {
        userId: currentUserId
      }
    }
  )

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateFunnelResponsibleUserRequest) =>
      updateFunnelResponsibleUser(funnelId, data),
    onSuccess: () => {
      CToast.success({ title: "Cập nhật người phụ trách thành công" })
      queryClient.invalidateQueries({ queryKey: ["salesFunnel"] })
      modals.closeAll()
      onSuccess?.()
    },
    onError: (error: any) => {
      CToast.error({ title: error?.message || "Có lỗi xảy ra" })
    }
  })

  const onSubmit = (data: UpdateFunnelResponsibleUserRequest) => {
    mutate(data)
  }

  const userOptions =
    usersData?.data.data.map((user) => ({
      value: user._id,
      label: user.name ?? "Anonymous"
    })) || []

  console.log(userOptions)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md">
        <Controller
          name="userId"
          control={control}
          rules={{ required: "Vui lòng chọn người phụ trách" }}
          render={({ field, fieldState }) => (
            <Select
              {...field}
              label="Người phụ trách"
              placeholder="Chọn người phụ trách"
              data={userOptions}
              searchable
              error={fieldState.error?.message}
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
