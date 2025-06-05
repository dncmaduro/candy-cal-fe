import { AppShell, Badge, Box, Button, Flex, Group } from "@mantine/core"
import { Link, useNavigate } from "@tanstack/react-router"
import { ReactNode, useEffect } from "react"
import { useUserStore } from "../../store/userStore"
import { UserMenu } from "./UserMenu"
import { useUsers } from "../../hooks/useUsers"
import { useMutation, useQuery } from "@tanstack/react-query"
import { saveToCookies } from "../../store/cookies"
import { CToast } from "../common/CToast"

interface Props {
  children: ReactNode
}

const NavButton = ({ to, label }: { to: string; label: string }) => {
  const pathname = window.location.pathname
  return (
    <Button
      component={Link}
      to={to}
      color={pathname === to ? "indigo" : "gray"}
      variant={pathname === to ? "light" : "subtle"}
    >
      {label}
    </Button>
  )
}

export const AppLayout = ({ children }: Props) => {
  const { accessToken, setUser, clearUser } = useUserStore()
  const { checkToken, getNewToken } = useUsers()

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

  const { data: isTokenValid } = useQuery({
    queryKey: ["validateToken"],
    queryFn: checkToken,
    select: (data) => {
      return data.data.valid
    },
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

  const navigate = useNavigate()

  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header className="border-b border-gray-300 shadow-sm">
        <Flex
          gap={32}
          px={32}
          h={"100%"}
          align="center"
          justify={"space-between"}
        >
          <Group>
            <NavButton to="/storage" label="Kho chứa" />
            {/* <NavButton to="/cal" label="Tính toán" /> */}
            <NavButton to="/calfile" label="Nhập file XLSX để tính" />
            <NavButton to="/logs" label="Lịch sử" />
            <Badge ml={16} variant="outline" color="red">
              version 1.1.1
            </Badge>
          </Group>
          <UserMenu />
        </Flex>
      </AppShell.Header>

      <AppShell.Main>
        <Box px={32}>{children}</Box>
      </AppShell.Main>
    </AppShell>
  )
}
