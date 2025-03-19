import { AppShell, Box, Group } from "@mantine/core"
import { Link } from "@tanstack/react-router"
import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const AppLayout = ({ children }: Props) => {
  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header className="border-b border-gray-300 shadow-sm">
        <Group gap={16} px={32} h={"100%"} align="center">
          <Link to="/storage">Kho chứa</Link>
          <Link to="/cal">Tính toán</Link>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Box px={32}>{children}</Box>
      </AppShell.Main>
    </AppShell>
  )
}
