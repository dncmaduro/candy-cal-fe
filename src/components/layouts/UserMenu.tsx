import { Avatar, Box, Group, Menu, Stack, Text } from "@mantine/core"
import { IconPower, IconUser } from "@tabler/icons-react"
import { useUserStore } from "../../store/userStore"
import { useUsers } from "../../hooks/useUsers"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const UserMenu = () => {
  const { clearUser } = useUserStore()
  const { getMe } = useUsers()

  const { data: meData } = useQuery({
    queryKey: ["get-me"],
    queryFn: () => getMe(),
    select: (data) => data.data
  })

  const role = useMemo(() => {
    if (!meData) return "Unknown"
    if (meData.role === "admin") return "Admin"
    if (meData.role === "accounting-emp") return "Nhân viên kế toán"
    if (meData.role === "order-emp") return "Nhân viên vận đơn"
    return meData.role
  }, [meData?.role])

  return (
    <Menu shadow="xl" withArrow position="bottom-end" offset={8}>
      <Menu.Target>
        <Group
          gap={10}
          className="cursor-pointer select-none"
          px={10}
          py={4}
          style={{
            borderRadius: 24,
            background: "rgba(245,246,250,0.9)",
            border: "1px solid #ececec",
            transition: "box-shadow 0.2s",
            boxShadow: "0 2px 8px 0 rgba(60, 60, 80, 0.06)"
          }}
        >
          <Avatar size="sm" radius="xl" alt={meData?.name} />
          <Box>
            <Text fw={500} fz="sm" lh={1.2}>
              {meData?.name ?? "Người dùng"}
            </Text>
            <Text size="xs" c="dimmed" lh={1.2}>
              {role}
            </Text>
          </Box>
        </Group>
      </Menu.Target>

      <Menu.Dropdown px={0} py={0} style={{ minWidth: 230 }}>
        <Box p="md" bg="gray.0" mb={6}>
          <Stack gap={4} align="center">
            <Avatar
              size={54}
              radius={32}
              alt={meData?.name}
              style={{ border: "2px solid #ececec" }}
            />
            <Text fw={600} fz="md">
              {meData?.name ?? "Người dùng"}
            </Text>
            <Text size="xs" c="dimmed">
              {role}
            </Text>
          </Stack>
        </Box>

        <Menu.Divider my={0} />

        <Menu.Item
          leftSection={<IconUser size={18} />}
          onClick={() => {
            /* Chuyển trang tài khoản nếu có */
          }}
          fz="sm"
        >
          Thông tin tài khoản
        </Menu.Item>
        <Menu.Item
          leftSection={<IconPower size={18} />}
          color="red"
          fz="sm"
          onClick={clearUser}
        >
          Đăng xuất
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
