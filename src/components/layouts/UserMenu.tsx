import { Avatar, Box, Group, Menu, Stack, Text } from "@mantine/core"
import {
  IconAppWindow,
  IconPackages,
  IconPower,
  IconSettings,
  IconShoppingBag,
  IconUser,
  IconVideo
} from "@tabler/icons-react"
import { useUserStore } from "../../store/userStore"
import { useUsers } from "../../hooks/useUsers"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useMediaQuery } from "@mantine/hooks"
import {
  NAVS,
  LANDING_NAVS,
  LIVESTREAM_NAVS,
  SALES_NAVS,
  ADMIN_NAVS
} from "../../constants/navs"

export const UserMenu = () => {
  const { clearUser } = useUserStore()
  const { getMe } = useUsers()

  const { data: meData } = useQuery({
    queryKey: ["getMe"],
    queryFn: () => getMe(),
    select: (data) => data.data
  })
  const isMobile = useMediaQuery("(max-width: 768px)")

  const ROLES: Record<string, string> = {
    admin: "Admin",
    "order-emp": "Nhân viên vận đơn",
    "accounting-emp": "Nhân viên kế toán",
    "system-emp": "Nhân viên hệ thống",
    "livestream-leader": "Leader livestream",
    "livestream-emp": "Host livestream",
    "livestream-ast": "Trợ live",
    "sales-leader": "Leader sales",
    "sales-emp": "Nhân viên sales",
    "livestream-accounting": "Kế toán livestream",
    "sales-accounting": "Kế toán sales"
  }

  // Hàm tìm nav đầu tiên mà user có quyền truy cập
  const getFirstAccessibleNav = (
    navs: Array<{ to: string; roles: string[]; deprecated?: boolean }>,
    userRoles: string[]
  ): string | null => {
    const accessibleNav = navs.find(
      (nav) =>
        !nav.deprecated && nav.roles.some((role) => userRoles.includes(role))
    )
    return accessibleNav?.to || null
  }

  // Map app base paths to their nav arrays
  const getAppNavs = (basePath: string) => {
    switch (basePath) {
      case "/marketing-storage":
        return NAVS
      case "/landing":
        return LANDING_NAVS
      case "/livestream":
        return LIVESTREAM_NAVS
      case "/sales":
        return SALES_NAVS
      case "/admin":
        return ADMIN_NAVS
      default:
        return []
    }
  }

  const APPS = [
    {
      to: "/marketing-storage",
      label: "Kho vận",
      icon: <IconPackages size={isMobile ? 14 : 18} />,
      roles: ["admin", "order-emp", "accounting-emp", "system-emp"]
    },
    {
      to: "/landing",
      label: "Landing Page",
      icon: <IconAppWindow size={isMobile ? 14 : 18} />,
      roles: ["admin"]
    },
    {
      to: "/livestream",
      label: "Livestream",
      icon: <IconVideo size={isMobile ? 14 : 18} />,
      roles: [
        "admin",
        "system-emp",
        "livestream-leader",
        "livestream-emp",
        "livestream-ast",
        "livestream-accounting"
      ]
    },
    {
      to: "/sales",
      label: "Sales",
      icon: <IconShoppingBag size={isMobile ? 14 : 18} />,
      roles: [
        "admin",
        "system-emp",
        "sales-leader",
        "sales-emp",
        "sales-accounting"
      ]
    },
    {
      to: "/admin",
      label: "Quản trị",
      icon: <IconSettings size={isMobile ? 14 : 18} />,
      roles: ["admin"]
    }
  ]

  return (
    <Menu shadow="xl" withArrow position="bottom-end" offset={isMobile ? 2 : 8}>
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
          <Avatar
            size={isMobile ? 24 : "sm"}
            radius="xl"
            alt={meData?.name}
            src={meData?.avatarUrl}
          />
          <Box>
            <Text fw={500} fz={isMobile ? "xs" : "sm"} lh={isMobile ? 1 : 1.2}>
              {meData?.name ?? "Người dùng"}
            </Text>
            <Text
              fz={isMobile ? "10" : "xs"}
              c="dimmed"
              lh={isMobile ? 1 : 1.2}
            >
              {meData?.roles.map((r) => ROLES[r]).join(", ")}
            </Text>
          </Box>
        </Group>
      </Menu.Target>

      <Menu.Dropdown px={0} py={0} style={{ minWidth: isMobile ? 200 : 230 }}>
        <Box p="md" bg="gray.0" mb={6}>
          <Stack gap={4} align="center">
            <Avatar
              size={isMobile ? 40 : 54}
              radius={32}
              src={meData?.avatarUrl}
              alt={meData?.name}
              style={{ border: "2px solid #ececec" }}
            />
            <Text fw={600} fz={isMobile ? "sm" : "md"}>
              {meData?.name ?? "Người dùng"}
            </Text>
            <Text c="dimmed" fz={isMobile ? "xs" : "sm"}>
              {meData?.roles.map((r) => ROLES[r]).join(", ")}
            </Text>
          </Stack>
        </Box>

        <Menu.Label fz={isMobile ? "11" : "sm"}>Các ứng dụng</Menu.Label>
        {APPS.map((app) => {
          const hasPermission = app.roles.some((role) =>
            meData?.roles.includes(role)
          )

          // Tìm nav đầu tiên mà user có quyền truy cập
          const appNavs = getAppNavs(app.to)
          const firstAccessibleNavPath =
            getFirstAccessibleNav(appNavs, meData?.roles || []) || app.to

          return (
            <Menu.Item
              key={app.to}
              leftSection={app.icon}
              fz={isMobile ? "xs" : "sm"}
              component={Link}
              to={firstAccessibleNavPath}
              hidden={!hasPermission}
            >
              {app.label}
            </Menu.Item>
          )
        })}

        <Menu.Divider my={0} />

        <Menu.Label fz={isMobile ? "11" : "sm"}>Tài khoản</Menu.Label>
        <Menu.Item
          leftSection={<IconUser size={isMobile ? 14 : 18} />}
          onClick={() => {
            /* Chuyển trang tài khoản nếu có */
          }}
          fz={isMobile ? "xs" : "sm"}
          component={Link}
          to="/user"
        >
          Thông tin tài khoản
        </Menu.Item>
        <Menu.Item
          leftSection={<IconPower size={isMobile ? 14 : 18} />}
          color="red"
          fz={isMobile ? "xs" : "sm"}
          onClick={clearUser}
        >
          Đăng xuất
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
