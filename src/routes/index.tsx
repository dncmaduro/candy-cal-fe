import {
  AppShell,
  Button,
  Stack,
  Text,
  TextInput,
  PasswordInput,
  Paper,
  Center
} from "@mantine/core"
import { IconCandy } from "@tabler/icons-react"
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
        <AppShell.Main h={"100vh"} w={"100vw"} bg="gray.0">
          <Center h="100%">
            <Paper
              withBorder
              shadow="md"
              p={32}
              pt={40}
              w={400}
              radius={24}
              style={{
                background: "rgba(255,255,255,0.99)",
                border: "1.5px solid #ececec",
                minWidth: 330,
                position: "relative"
              }}
            >
              <Stack align="center" mb={18} gap={6}>
                {/* Có logo thì để dưới đây */}
                <IconCandy size={48} color="#6366f1" />
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
                  Quản lý kho vận MyCandy
                </Text>
              </Stack>
              <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                <Stack gap={12}>
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
                        required
                      />
                    )}
                  />
                  <Button
                    type="submit"
                    loading={isLogging}
                    fullWidth
                    size="md"
                    radius="xl"
                    fw={700}
                    mt={6}
                    disabled={isLogging}
                  >
                    Đăng nhập
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Center>
        </AppShell.Main>
      </AppShell>
    </>
  )
}
