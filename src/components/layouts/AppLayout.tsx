import {
  AppShell,
  Badge,
  Box,
  Container,
  Flex,
  Group,
  rem
} from "@mantine/core"
import { useNavigate } from "@tanstack/react-router"
import { ReactNode, useEffect } from "react"
import { useUserStore } from "../../store/userStore"
import { UserMenu } from "./UserMenu"
import { useUsers } from "../../hooks/useUsers"
import { useMutation, useQuery } from "@tanstack/react-query"
import { saveToCookies } from "../../store/cookies"
import { CToast } from "../common/CToast"
import { NAVS } from "../../constants/navs"
import { Notifications } from "./Notifications"
import { NavButton } from "./NavButton"

interface Props {
  children: ReactNode
}

export const AppLayout = ({ children }: Props) => {
  const { accessToken, setUser, clearUser } = useUserStore()
  const { checkToken, getNewToken, getMe } = useUsers()
  const navigate = useNavigate()

  const { mutate: getToken } = useMutation({
    mutationKey: ["getNewToken"],
    mutationFn: getNewToken,
    onSuccess: (response) => {
      setUser(response.data.accessToken)
      saveToCookies("refreshToken", response.data.refreshToken)
    },
    onError: () => {
      navigate({ to: "/" })
      clearUser()
      saveToCookies("refreshToken", "")
      CToast.error({
        title: "Vui lòng đăng nhập lại!"
      })
    }
  })

  const { data: meData } = useQuery({
    queryKey: ["getMe"],
    queryFn: getMe,
    enabled: !!accessToken,
    select: (data) => data.data
  })

  const { data: isTokenValid } = useQuery({
    queryKey: ["validateToken"],
    queryFn: checkToken,
    select: (data) => data.data.valid,
    refetchInterval: 1000 * 30 // 30s
  })

  useEffect(() => {
    if (!isTokenValid) {
      getToken()
    }
  }, [isTokenValid])

  useEffect(() => {
    if (!accessToken) {
      navigate({ to: "/" })
    }
  }, [accessToken])

  return (
    <AppShell
      header={{ height: 64 }}
      padding="md"
      withBorder={false}
      style={{ background: "#f8fafc" }}
    >
      <AppShell.Header
        style={{
          boxShadow:
            "0 2px 18px 0 rgba(120,120,150,0.06), 0 1.5px 0px 0 #ececec",
          background: "#fff",
          zIndex: 200
        }}
      >
        <Container size="1600" px={{ base: 16, md: 32 }} h="100%">
          <Flex
            h="100%"
            align="center"
            justify="space-between"
            gap={16}
            style={{ minHeight: rem(60) }}
          >
            <Group gap={8}>
              {NAVS.filter((n) => {
                if (!meData || n.deprecated) return false
                return meData.role === "admin" || n.roles.includes(meData.role)
              }).map((n) => (
                <NavButton key={n.to} to={n.to} label={n.label} beta={n.beta} />
              ))}
              <Badge
                ml={16}
                variant="gradient"
                gradient={{ from: "indigo", to: "violet", deg: 112 }}
                radius="xl"
                size="md"
                fw={700}
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  letterSpacing: 0.2
                }}
              >
                {import.meta.env.VITE_ENV === "development"
                  ? "DEVELOPMENT"
                  : "v2.5.0"}
              </Badge>
            </Group>
            <Group>
              <Notifications />
              <UserMenu />
            </Group>
          </Flex>
        </Container>
      </AppShell.Header>

      <AppShell.Main style={{ background: "none" }} h={"calc(100vh - 128px)"}>
        <Container size="1600">
          <Box w="100%" maw={1600} mx="auto">
            {children}
          </Box>
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
