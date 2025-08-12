import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../components/layouts/AppLayout"
import {
  Box,
  Button,
  Divider,
  Flex,
  Stack,
  Text,
  TextInput,
  Avatar,
  ActionIcon,
  FileInput
} from "@mantine/core"
import { useUsers } from "../../hooks/useUsers"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CToast } from "../../components/common/CToast"
import { Controller, useForm } from "react-hook-form"
import { IconCamera } from "@tabler/icons-react"
import { useAuthGuard } from "../../hooks/useAuthGuard"
import { modals } from "@mantine/modals"
import { AvatarCropModal } from "../../components/user/AvatarCropModal"
import { ChangePasswordModal } from "../../components/user/ChangePasswordModal"
import { useState } from "react"

export const Route = createFileRoute("/user/")({
  component: RouteComponent
})

function RouteComponent() {
  useAuthGuard(["admin"])
  const queryClient = useQueryClient()
  const { getMe, updateUser } = useUsers()

  const { data: meData } = useQuery({
    queryKey: ["getMe"],
    queryFn: getMe,
    select: (data) => data.data
  })

  const { control, handleSubmit } = useForm<{ name: string }>({
    defaultValues: { name: meData?.name || "" },
    values: { name: meData?.name || "" }
  })
  const { mutate: updateUserMutate, isPending: isUpdatingUser } = useMutation({
    mutationFn: (req: { name: string }) => updateUser(req),
    onSuccess: (response) => {
      CToast.success({ title: response.data.message })
      queryClient.invalidateQueries({ queryKey: ["getMe"] })
    },
    onError: () => {
      CToast.error({ title: "Cập nhật tài khoản thất bại" })
    }
  })

  const [file, setFile] = useState<File | null>(null)

  const onChangeAvatar = (file: File | null) => {
    if (file) {
      modals.open({
        size: "lg",
        title: "Cập nhật ảnh đại diện",
        onClose: () => {
          setFile(null)
          queryClient.invalidateQueries({ queryKey: ["getMe"] })
        },
        children: <AvatarCropModal file={URL.createObjectURL(file)} />
      })
    }
  }

  const roleText =
    meData?.role === "admin"
      ? "Quản trị viên"
      : meData?.role === "order-emp"
        ? "Nhân viên vận đơn"
        : meData?.role === "system-emp"
          ? "Nhân viên hệ thống"
          : meData?.role === "accounting-emp"
            ? "Nhân viên kế toán"
            : meData?.role || ""

  return (
    <AppLayout>
      <Box
        maw={480}
        mx="auto"
        mt={40}
        bg="#fff"
        p={32}
        style={{
          borderRadius: 20,
          boxShadow: "0 4px 24px 0 rgba(120,120,150,0.07)",
          border: "1px solid #ececec"
        }}
      >
        <Flex direction="column" align="center" mb={32}>
          <Box pos="relative" w={120} h={120}>
            <Avatar
              src={meData?.avatarUrl}
              radius={120}
              size={120}
              style={{ border: "2px solid #ececec" }}
            />
            <ActionIcon
              variant="filled"
              color="indigo"
              radius="xl"
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                boxShadow: "0 2px 8px rgba(100,100,150,0.10)"
              }}
              onClick={() => document.getElementById("avatar-upload")?.click()}
            >
              <IconCamera size={20} />
              <FileInput
                id="avatar-upload"
                accept="image/*"
                multiple={false}
                hidden
                onChange={(f) => {
                  setFile(f)
                  onChangeAvatar(f)
                }}
                value={file}
              />
            </ActionIcon>
          </Box>
          <Text fw={700} fz="xl" mt={12}>
            {meData?.name}
          </Text>
          <Text c="dimmed" fz="sm">
            {roleText}
          </Text>
        </Flex>

        <form
          onSubmit={handleSubmit((values) => updateUserMutate(values))}
          autoComplete="off"
        >
          <Stack gap={16}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextInput label="Tên tài khoản" required {...field} />
              )}
            />

            <TextInput
              label="Tên người dùng"
              value={meData?.username || ""}
              disabled
            />

            <Button
              type="submit"
              color="indigo"
              radius="xl"
              loading={isUpdatingUser}
              fw={600}
            >
              Lưu thay đổi
            </Button>
          </Stack>
        </form>

        <Divider my={24} />

        <Button
          variant="light"
          color="gray"
          radius="xl"
          onClick={() =>
            modals.open({
              title: "Đổi mật khẩu",
              children: <ChangePasswordModal />
            })
          }
        >
          Đổi mật khẩu
        </Button>
      </Box>
    </AppLayout>
  )
}
