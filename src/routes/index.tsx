import {
  AppShell,
  Button,
  Checkbox,
  Stack,
  Text,
  TextInput,
  PasswordInput,
  Paper,
  Center,
  Box
} from "@mantine/core"
import { IconCandy, IconLock, IconUser } from "@tabler/icons-react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { Controller, useForm } from "react-hook-form"
import { useUsers } from "../hooks/useUsers"
import { useMutation } from "@tanstack/react-query"
import { useUserStore } from "../store/userStore"
import { saveToCookies } from "../store/cookies"
import { CToast } from "../components/common/CToast"

export const Route = createFileRoute("/")({
  component: RouteComponent
})

interface LoginType {
  username: string
  password: string
}

function RouteComponent() {
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<LoginType>({
    defaultValues: {}
  })

  const { login } = useUsers()
  const { setUser, accessToken } = useUserStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (accessToken) {
      navigate({ to: "/postauth" })
    }
  }, [accessToken])

  const { mutate: tryLogin, isPending: isLogging } = useMutation({
    mutationKey: ["login"],
    mutationFn: login,
    onSuccess: (response) => {
      setUser(response.data.accessToken)
      saveToCookies("refreshToken", response.data.refreshToken)
      CToast.success({
        title: "Đăng nhập thành công"
      })
      navigate({ to: "/postauth" })
    },
    onError: () => {
      CToast.error({
        title: "Đăng nhập thất bại"
      })
    }
  })

  const onSubmit = (values: LoginType) => {
    tryLogin(values)
  }

  return (
    <>
      <Helmet>
        <title>Đăng nhập | MyCandy</title>
      </Helmet>
      <AppShell>
        <AppShell.Main
          h={"100vh"}
          w={"100vw"}
          style={{
            background:
              "radial-gradient(520px 520px at 12% 12%, #eef0ff 0%, rgba(238,240,255,0.55) 42%, rgba(255,255,255,0) 60%), radial-gradient(520px 520px at 88% 88%, #eef0ff 0%, rgba(238,240,255,0.55) 42%, rgba(255,255,255,0) 60%), #f8fafc"
          }}
        >
          <Center h="100%">
            <Paper
              withBorder
              shadow="xl"
              p={32}
              pt={36}
              w={420}
              radius={28}
              style={{
                background: "rgba(255,255,255,0.99)",
                border: "1.5px solid #eef2ff",
                minWidth: 330,
                position: "relative"
              }}
            >
              <Stack align="center" mb={18} gap={6}>
                <Box
                  w={58}
                  h={58}
                  style={{
                    borderRadius: 16,
                    background: "#eef0ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      "0 8px 18px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.7)"
                  }}
                >
                  <IconCandy size={30} color="#6366f1" />
                </Box>
                <Text
                  fw={800}
                  fz={24}
                  ta="center"
                  mt={8}
                  style={{ letterSpacing: 0.2 }}
                >
                  Đăng nhập vào CandyCal
                </Text>
                <Text c="dimmed" fz={13} ta="center" mb={2}>
                  Hệ thống quản lý nội bộ Marketing FMCG
                </Text>
              </Stack>
              <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                <Stack gap={14}>
                  <Controller
                    control={control}
                    name="username"
                    rules={{ required: "Tên người dùng không được bỏ trống" }}
                    render={({ field }) => (
                      <TextInput
                        {...field}
                        label="Tên người dùng"
                        placeholder="Nhập tên tài khoản"
                        error={errors.username?.message}
                        size="md"
                        leftSection={<IconUser size={16} color="#94a3b8" />}
                        leftSectionPointerEvents="none"
                        autoFocus
                        radius="md"
                        required
                        spellCheck={false}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="password"
                    rules={{ required: "Mật khẩu không được bỏ trống" }}
                    render={({ field }) => (
                      <PasswordInput
                        {...field}
                        label="Mật khẩu"
                        placeholder="Nhập mật khẩu"
                        error={errors.password?.message}
                        size="md"
                        radius="md"
                        leftSection={<IconLock size={16} color="#94a3b8" />}
                        leftSectionPointerEvents="none"
                        required
                      />
                    )}
                  />
                  <Checkbox
                    label="Ghi nhớ đăng nhập"
                    color="indigo"
                    radius="xl"
                    styles={{
                      label: {
                        color: "#475569",
                        fontSize: 13
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    loading={isLogging}
                    fullWidth
                    size="md"
                    radius="md"
                    fw={700}
                    mt={8}
                    disabled={isLogging}
                    style={{
                      background: "#6366f1",
                      boxShadow: "0 12px 24px rgba(99,102,241,0.3)"
                    }}
                  >
                    Đăng nhập
                  </Button>
                </Stack>
              </form>
              <Text
                c="dimmed"
                fz={12}
                ta="center"
                mt={22}
                style={{ letterSpacing: 0.2 }}
              >
                © 2026 CandyCal. All rights reserved.
              </Text>
            </Paper>
          </Center>
        </AppShell.Main>
      </AppShell>
    </>
  )
}
