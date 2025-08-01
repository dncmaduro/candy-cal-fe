import { Badge, Button, Group, Text } from "@mantine/core"
import { Link } from "@tanstack/react-router"

interface Props {
  to: string
  label: string
  beta?: boolean
}

export const NavButton = ({ to, label, beta }: Props) => {
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
      <Group gap={4}>
        <Text>{label}</Text>
        {beta && (
          <Badge size="xs" color="red" variant="outline">
            Beta
          </Badge>
        )}
      </Group>
    </Button>
  )
}
