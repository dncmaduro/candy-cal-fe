import { Avatar, Button, Group, Menu, Text } from "@mantine/core"
import { IconPower } from "@tabler/icons-react"
import { useUserStore } from "../../store/userStore"
import { useUsers } from "../../hooks/useUsers"
import { useQuery } from "@tanstack/react-query"

export const UserMenu = () => {
  const { clearUser } = useUserStore()
  const { getMe } = useUsers()

  const { data: meData } = useQuery({
    queryKey: ["get-me"],
    queryFn: () => getMe(),
    select: (data) => data.data
  })

  return (
    <Menu>
      <Menu.Target>
        <Group gap={8} className="cursor-pointer">
          <Text>{meData?.name}</Text>
          <Avatar />
        </Group>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconPower />}
          variant="subtle"
          color="red"
          onClick={clearUser}
        >
          Đăng xuất
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
