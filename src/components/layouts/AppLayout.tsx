import { AppShell, Badge, Box, Button, Flex, Group } from "@mantine/core"
import { Link, useNavigate } from "@tanstack/react-router"
import { ReactNode, useEffect } from "react"
import { useUserStore } from "../../store/userStore"
import { UserMenu } from "./UserMenu"

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
  const { accessToken } = useUserStore()

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
            <NavButton to="/cal" label="Tính toán" />
            <NavButton to="/calfile" label="Nhập file XLSX để tính" />
            <Badge ml={16} variant="outline" color="red">
              version 1.0
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
