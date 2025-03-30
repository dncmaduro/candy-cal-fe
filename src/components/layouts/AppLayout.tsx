import { AppShell, Badge, Box, Button, Group } from "@mantine/core"
import { Link } from "@tanstack/react-router"
import { ReactNode } from "react"

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
  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header className="border-b border-gray-300 shadow-sm">
        <Group gap={32} px={32} h={"100%"} align="center">
          <NavButton to="/storage" label="Kho chứa" />
          <NavButton to="/cal" label="Tính toán" />
          <NavButton to="/calfile" label="Nhập file XLSX để tính" />
          <Badge ml={16} variant="outline" color="red">
            version 0.4
          </Badge>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Box px={32}>{children}</Box>
      </AppShell.Main>
    </AppShell>
  )
}
