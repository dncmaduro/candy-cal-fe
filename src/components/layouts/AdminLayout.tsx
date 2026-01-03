import { Badge, Box, Container, Group, rem, Burger } from "@mantine/core"
import pkg from "../../../package.json"
import { useNavigate } from "@tanstack/react-router"
import { ReactNode, useEffect, useState } from "react"
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
// import { MyTasksPopover } from "../tasks/MyTasksPopover.tsx"
import { ADMIN_NAVS } from "../../constants/navs.ts"
import { useMediaQuery } from "@mantine/hooks"

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { accessToken, setUser, clearUser } = useUserStore()
  const { checkToken, getNewToken, getMe } = useUsers()
  const navigate = useNavigate()
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const setCollapsed = useUIStore((s) => s.setSidebarCollapsed)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

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
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 199
          }}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          left: isMobile && !mobileMenuOpen ? "-100%" : 0,
          transition: "left 0.3s ease",
          zIndex: 202,
          height: "100vh"
        }}
      >
        <Sidebar
          meData={meData}
          collapsed={isMobile ? false : collapsed}
          setCollapsed={
            isMobile ? () => setMobileMenuOpen(false) : setCollapsed
          }
          navs={ADMIN_NAVS}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: isMobile ? "100%" : "auto"
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
            position: "sticky",
            top: 0
          }}
          className="h-12 lg:h-16"
        >
          <Group gap={8} style={{ marginLeft: isMobile ? rem(8) : rem(16) }}>
            {/* Mobile Menu Button */}
            {isMobile && (
              <Burger
                opened={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                size={isMobile ? "xs" : "sm"}
                aria-label="Toggle navigation"
              />
            )}
            <Badge
              ml={0}
              variant="gradient"
              gradient={{ from: "indigo", to: "violet", deg: 112 }}
              radius="xl"
              size={isMobile ? "sm" : "md"}
              fw={700}
              style={{
                fontFamily: "Montserrat, sans-serif",
                letterSpacing: 0.2,
                display:
                  isMobile && import.meta.env.VITE_ENV === "testing"
                    ? "none"
                    : "block"
              }}
            >
              {import.meta.env.VITE_ENV === "development"
                ? isMobile
                  ? "DEV"
                  : "DEVELOPMENT"
                : `v${pkg.version}`}
            </Badge>
            <Badge
              ml={0}
              variant="gradient"
              gradient={{ from: "red", to: "orange", deg: 112 }}
              radius="xl"
              size={isMobile ? "sm" : "md"}
              fw={700}
              style={{
                fontFamily: "Montserrat, sans-serif",
                letterSpacing: 0.2
              }}
              hidden={import.meta.env.VITE_ENV !== "testing"}
            >
              {isMobile ? "TEST" : "TESTING"}
            </Badge>
          </Group>
          <Group
            gap={isMobile ? 4 : 8}
            style={{ marginRight: isMobile ? rem(8) : rem(16) }}
          >
            {/* <MyTasksPopover /> */}
            <Notifications />
            <UserMenu />
          </Group>
        </header>
        <main
          style={{
            flex: 1,
            background: "none",
            minHeight: "calc(100vh - 64px)",
            padding: isMobile ? "0.5rem" : "1rem"
          }}
        >
          <Container size="1600" px={isMobile ? 4 : undefined}>
            <Box w="100%" maw={1600} mx="auto">
              <MeContext.Provider value={meData}>{children}</MeContext.Provider>
            </Box>
          </Container>
        </main>
      </div>
    </div>
  )
}
