import { Button } from "@mantine/core"
import { Link } from "@tanstack/react-router"

export const NavButton = ({ to, label }: { to: string; label: string }) => {
  const pathname = window.location.pathname
  const active = pathname === to
  return (
    <Button
      component={Link}
      to={to}
      variant={active ? "light" : "subtle"}
      color={active ? "indigo" : "gray"}
      px="md"
      radius="xl"
      fw={500}
      style={{
        boxShadow: active ? "0 2px 12px 0 rgba(60,80,180,0.10)" : "none",
        transition: "box-shadow 0.18s"
      }}
    >
      {label}
    </Button>
  )
}
