import {
  ActionIcon,
  AppShell,
  Box,
  Button,
  Stack,
  Text,
  TextInput
} from "@mantine/core"
import { IconEye, IconEyeClosed } from "@tabler/icons-react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
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
  const { handleSubmit, control } = useForm<LoginType>({
    defaultValues: {}
  })

  const { login } = useUsers()
  const { setUser, accessToken } = useUserStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (accessToken) {
      navigate({ to: "/storage" })
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
      navigate({ to: "/storage" })
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

  const [showPw, setShowPw] = useState(false)

  return (
    <>
      <Helmet>
        <title>MyCandy x Chíp</title>
      </Helmet>
      <AppShell>
        <AppShell.Main h={"100vh"} w={"100vw"}>
          <Box h="100%" className="relative flex items-center justify-center">
            <Box mx="auto" my="auto">
              <Box
                w={400}
                py={32}
                px={24}
                className="rounded-lg border border-gray-200"
              >
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Stack>
                    <Text>Đăng nhập vào CandyCal</Text>
                    <Controller
                      control={control}
                      name="username"
                      render={({ field }) => (
                        <TextInput {...field} label="Tên người dùng" />
                      )}
                    />
                    <Controller
                      control={control}
                      name="password"
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          label="Mật khẩu"
                          type={showPw ? "text" : "password"}
                          rightSection={
                            <ActionIcon
                              size={"md"}
                              variant="subtle"
                              onClick={() => setShowPw((prev) => !prev)}
                            >
                              {showPw ? <IconEye /> : <IconEyeClosed />}
                            </ActionIcon>
                          }
                        />
                      )}
                    />
                    <Button type="submit" loading={isLogging}>
                      Đăng nhập
                    </Button>
                  </Stack>
                </form>
              </Box>
            </Box>
          </Box>
        </AppShell.Main>
      </AppShell>
    </>
  )
}
