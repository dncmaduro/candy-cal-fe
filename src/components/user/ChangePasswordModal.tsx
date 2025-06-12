import { Button, Stack, TextInput } from "@mantine/core"
import { useMutation } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { useUsers } from "../../hooks/useUsers"
import { CToast } from "../common/CToast"
import { modals } from "@mantine/modals"

export const ChangePasswordModal = () => {
  const { changePassword } = useUsers()

  const { mutate: changePasswordMutate, isPending: isChangingPw } = useMutation(
    {
      mutationFn: (req: { oldPassword: string; newPassword: string }) =>
        changePassword(req),
      onSuccess: (response) => {
        CToast.success({ title: response.data.message })
        modals.closeAll()
      },
      onError: (error) => {
        CToast.error({
          title: "Đổi mật khẩu thất bại",
          subtitle: error.message
        })
      }
    }
  )

  const { control, handleSubmit } = useForm<{
    oldPassword: string
    newPassword: string
  }>({
    defaultValues: { oldPassword: "", newPassword: "" }
  })

  return (
    <form onSubmit={handleSubmit((v) => changePasswordMutate(v))}>
      <Stack gap={14} mt={8}>
        <Controller
          name="oldPassword"
          control={control}
          render={({ field }) => (
            <TextInput
              label="Mật khẩu cũ"
              required
              type="password"
              {...field}
            />
          )}
        />
        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => (
            <TextInput
              label="Mật khẩu mới"
              required
              type="password"
              {...field}
            />
          )}
        />
        <Button
          type="submit"
          loading={isChangingPw}
          color="indigo"
          radius="xl"
          fw={600}
        >
          Xác nhận
        </Button>
      </Stack>
    </form>
  )
}
