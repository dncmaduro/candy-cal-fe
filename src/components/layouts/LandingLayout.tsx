import {
  Anchor,
  AppShell,
  Badge,
  Box,
  Container,
  Flex,
  Group,
  rem,
  Text
} from "@mantine/core"
import { Link, useNavigate } from "@tanstack/react-router"
import { ReactNode, useEffect, useRef } from "react"
import { useUserStore } from "../../store/userStore"
import { UserMenu } from "./UserMenu"
import { useUsers } from "../../hooks/useUsers"
import { useMutation, useQuery } from "@tanstack/react-query"
import { saveToCookies } from "../../store/cookies"
import { CToast } from "../common/CToast"
import { getVisibleNavigationItems, LANDING_NAVS } from "../../constants/navs"
import { Notifications } from "./Notifications"
import { NavButton } from "./NavButton"

interface Props {
  children: ReactNode
}

export const LandingLayout = ({ children }: Props) => {
  const { accessToken, setUser, clearUser } = useUserStore()
  const { checkToken, getNewToken, getMe } = useUsers()
  const navigate = useNavigate()
  const refreshAttemptedRef = useRef(false)

  const { mutate: getToken, isPending: isRefreshing } = useMutation({
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
    queryKey: ["validateToken", accessToken],
    queryFn: checkToken,
    enabled: !!accessToken,
    select: (data) => data.data.valid,
    refetchInterval: 1000 * 30 // 30s
  })

  useEffect(() => {
    if (isTokenValid === true) {
      refreshAttemptedRef.current = false
      return
    }

    if (
      isTokenValid === false &&
      !isRefreshing &&
      !refreshAttemptedRef.current
    ) {
      refreshAttemptedRef.current = true
      getToken()
    }
  }, [getToken, isRefreshing, isTokenValid])

  useEffect(() => {
    if (!accessToken) {
      navigate({ to: "/" })
    }
  }, [accessToken])

  return (
    <AppShell
      header={{ height: 64 }}
      footer={{ height: 60 }}
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
        <Container size="xl" px={{ base: 16, md: 32 }} h="100%">
          <Flex
            h="100%"
            align="center"
            justify="space-between"
            gap={16}
            style={{ minHeight: rem(60) }}
          >
            <Group gap={8}>
              {getVisibleNavigationItems(LANDING_NAVS, meData?.permissions).map((n) => (
                <NavButton key={n.to} to={n.to} label={n.label} />
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
                  : "v2.4.1"}
              </Badge>
            </Group>
            <Group>
              <Notifications />
              <UserMenu />
            </Group>
          </Flex>
        </Container>
      </AppShell.Header>

      <AppShell.Main style={{ background: "none" }} h={"calc(100vh - 192px)"}>
        <Container size="xl">
          <Box w="100%" maw={1200} mx="auto">
            {children}
          </Box>
        </Container>
      </AppShell.Main>

      <AppShell.Footer
        style={{
          borderTop: "1px solid #ececec",
          background: "#fff"
        }}
      >
        <Container size="xl" px={{ base: 16, md: 32 }} h="100%">
          <Flex h="100%" align="center" justify="space-between">
            <Text size="sm" c="dimmed">
              © {new Date().getFullYear()} Candy Cal. Bảo lưu mọi quyền.
            </Text>
            <Group gap="md">
              <Anchor
                component={Link}
                to="/privacy-policy"
                size="sm"
                c="dimmed"
                underline="hover"
              >
                Chính sách bảo mật
              </Anchor>
            </Group>
          </Flex>
        </Container>
      </AppShell.Footer>
    </AppShell>
  )
}
