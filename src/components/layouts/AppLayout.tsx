import { Badge, Box, Container, Group, rem } from "@mantine/core"
import pkg from "../../../package.json"
import { useNavigate } from "@tanstack/react-router"
import { ReactNode, useEffect } from "react"
import { useUserStore } from "../../store/userStore"
import { UserMenu } from "./UserMenu"
import { useUsers } from "../../hooks/useUsers"
import { useMutation, useQuery } from "@tanstack/react-query"
import { saveToCookies } from "../../store/cookies"
import { CToast } from "../common/CToast"
import { Notifications } from "./Notifications"
import { Sidebar } from "./Sidebar"
import { useUIStore } from "../../store/uiStore"
import { MeContext } from "../../context/MeContext"
import { MyTasksPopover } from "../tasks/MyTasksPopover.tsx"

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { accessToken, setUser, clearUser } = useUserStore()
  const { checkToken, getNewToken, getMe } = useUsers()
  const navigate = useNavigate()
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const setCollapsed = useUIStore((s) => s.setSidebarCollapsed)

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
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar
        meData={meData}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh"
        }}
      >
        <header
          style={{
            boxShadow:
              "0 2px 18px 0 rgba(120,120,150,0.06), 0 1.5px 0px 0 #ececec",
            background: "#fff",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: rem(64),
            position: "sticky",
            top: 0
          }}
        >
          <Group gap={8} style={{ marginLeft: rem(16) }}>
            <Badge
              ml={0}
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
                : `v${pkg.version}`}
            </Badge>
          </Group>
          <Group gap={8} style={{ marginRight: rem(16) }}>
            <MyTasksPopover />
            <Notifications />
            <UserMenu />
          </Group>
        </header>
        <main
          style={{
            flex: 1,
            background: "none",
            minHeight: "calc(100vh - 64px)"
          }}
        >
          <Container size="1600">
            <Box w="100%" maw={1600} mx="auto">
              <MeContext.Provider value={meData}>{children}</MeContext.Provider>
            </Box>
          </Container>
        </main>
      </div>
    </div>
  )
}
