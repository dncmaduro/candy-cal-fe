import { createFileRoute } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query"
import {
  Avatar,
  Badge,
  Box,
  Divider,
  Flex,
  Group,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  rem
} from "@mantine/core"
import { ColumnDef } from "@tanstack/react-table"
import { IconSearch } from "@tabler/icons-react"
import { Helmet } from "react-helmet-async"
import { notifications } from "@mantine/notifications"
import { AdminLayout } from "../../../components/layouts/AdminLayout"
import { CDataTable } from "../../../components/common/CDataTable"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import type { AdminListUsersResponse } from "../../../hooks/models"
import { useUsers } from "../../../hooks/useUsers"

export const Route = createFileRoute("/admin/users/")({
  component: RouteComponent
})

type UserRow = AdminListUsersResponse["data"][number]

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  "order-emp": "Nhân viên TikTok Shop",
  "tiktokshop-emp": "Nhân viên TikTok Shop",
  "shopee-emp": "Nhân viên Shopee",
  "accounting-emp": "Nhân viên kế toán",
  "system-emp": "Nhân viên hệ thống",
  "livestream-leader": "Leader livestream",
  "livestream-emp": "Host livestream",
  "livestream-ast": "Trợ live",
  "livestream-accounting": "Kế toán livestream",
  "sales-leader": "Leader sales",
  "sales-emp": "Nhân viên sales",
  "sales-accounting": "Kế toán sales"
}

const ROLE_COLORS: Record<string, string> = {
  admin: "red",
  "order-emp": "grape",
  "tiktokshop-emp": "grape",
  "shopee-emp": "orange",
  "accounting-emp": "cyan",
  "system-emp": "gray",
  "livestream-leader": "pink",
  "livestream-emp": "violet",
  "livestream-ast": "indigo",
  "livestream-accounting": "teal",
  "sales-leader": "lime",
  "sales-emp": "green",
  "sales-accounting": "blue"
}

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label
}))

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Đã vô hiệu hóa" }
] as const

function RouteComponent() {
  useAuthGuard(["admin"])

  const queryClient = useQueryClient()
  const { adminListUsers, updateUserActive } = useUsers()

  const [searchText, setSearchText] = useState("")
  const [role, setRole] = useState<string | null>(null)
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const { data: usersResponse, isLoading, isFetching } = useQuery({
    queryKey: ["adminUsers", searchText, role, status, page, limit],
    queryFn: () =>
      adminListUsers({
        searchText: searchText.trim() || undefined,
        role: role || undefined,
        status,
        page,
        limit
      }),
    select: (data) => data.data,
    placeholderData: keepPreviousData
  })

  const users = usersResponse?.data ?? []
  const total = usersResponse?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const { mutate: toggleUserActive } = useMutation({
    mutationFn: async (payload: { userId: string; active: boolean }) => {
      setUpdatingUserId(payload.userId)
      return updateUserActive(payload.userId, { active: payload.active })
    },
    onSuccess: (_response, variables) => {
      notifications.show({
        title: variables.active ? "Đã kích hoạt tài khoản" : "Đã vô hiệu hóa tài khoản",
        message: "Trạng thái người dùng đã được cập nhật",
        color: variables.active ? "green" : "orange"
      })
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] })
    },
    onError: (error: any) => {
      notifications.show({
        title: "Cập nhật thất bại",
        message: error?.response?.data?.message || "Không thể cập nhật trạng thái người dùng",
        color: "red"
      })
    },
    onSettled: () => {
      setUpdatingUserId(null)
    }
  })

  const columns = useMemo<ColumnDef<UserRow>[]>(
    () => [
      {
        accessorKey: "username",
        header: "Tên đăng nhập",
        cell: ({ row }) => (
          <Stack gap={2}>
            <Text fw={600} size="sm">
              {row.original.username}
            </Text>
            <Text size="xs" c="dimmed">
              ID: {row.original._id}
            </Text>
          </Stack>
        )
      },
      {
        accessorKey: "name",
        header: "Người dùng",
        cell: ({ row }) => (
          <Group gap="sm" wrap="nowrap">
            <Avatar src={row.original.avatarUrl} radius="xl" size="md">
              {row.original.name?.charAt(0)?.toUpperCase() || row.original.username?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
            <Stack gap={2}>
              <Text fw={600} size="sm">
                {row.original.name || "Chưa cập nhật tên"}
              </Text>
              <Text size="xs" c="dimmed">
                {row.original.avatarUrl ? "Có ảnh đại diện" : "Chưa có ảnh đại diện"}
              </Text>
            </Stack>
          </Group>
        )
      },
      {
        accessorKey: "roles",
        header: "Vai trò",
        cell: ({ row }) => (
          <Group gap={6}>
            {row.original.roles.map((userRole) => (
              <Badge
                key={`${row.original._id}-${userRole}`}
                size="sm"
                radius="xl"
                variant="light"
                color={ROLE_COLORS[userRole] ?? "gray"}
              >
                {ROLE_LABELS[userRole] ?? userRole}
              </Badge>
            ))}
          </Group>
        )
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          const isUpdating = updatingUserId === row.original._id

          return (
            <Group gap="sm" justify="space-between" wrap="nowrap">
              <Badge
                color={row.original.active ? "green" : "gray"}
                variant="light"
                radius="xl"
              >
                {row.original.active ? "Active" : "Inactive"}
              </Badge>
              <Switch
                checked={row.original.active}
                onChange={(event) =>
                  toggleUserActive({
                    userId: row.original._id,
                    active: event.currentTarget.checked
                  })
                }
                disabled={isUpdating}
                color="green"
                size="md"
                onLabel="ON"
                offLabel="OFF"
              />
            </Group>
          )
        }
      }
    ],
    [toggleUserActive, updatingUserId]
  )

  const extraFilters = (
    <Group gap={12} align="end" wrap="wrap">
      <TextInput
        value={searchText}
        onChange={(event) => {
          setSearchText(event.currentTarget.value)
          setPage(1)
        }}
        leftSection={<IconSearch size={16} />}
        placeholder="Tìm theo tên hoặc username..."
        label="Tìm kiếm"
        size="sm"
        w={{ base: "100%", sm: 280 }}
        radius="md"
        styles={{
          input: { background: "#f4f6fb", border: "1px solid #ececec" }
        }}
      />

      <Select
        label="Vai trò"
        placeholder="Tất cả vai trò"
        data={ROLE_OPTIONS}
        value={role}
        onChange={(value) => {
          setRole(value)
          setPage(1)
        }}
        clearable
        searchable
        size="sm"
        w={{ base: "100%", sm: 260 }}
      />

      <Select
        label="Trạng thái"
        data={STATUS_OPTIONS}
        value={status}
        onChange={(value) => {
          setStatus((value as "all" | "active" | "inactive") || "all")
          setPage(1)
        }}
        size="sm"
        w={{ base: "100%", sm: 220 }}
      />
    </Group>
  )

  const extraActions = (
    <Group gap={8}>
      <Badge variant="light" color="indigo" size="lg" radius="xl">
        Tổng: {total}
      </Badge>
      {isFetching && !isLoading ? (
        <Badge variant="light" color="gray" size="lg" radius="xl">
          Đang cập nhật dữ liệu
        </Badge>
      ) : null}
    </Group>
  )

  return (
    <>
      <Helmet>
        <title>Quản trị - Người dùng | MyCandy</title>
      </Helmet>

      <AdminLayout>
        <Box
          mt={40}
          mx="auto"
          px={{ base: 8, md: 0 }}
          w="100%"
          style={{
            background: "rgba(255,255,255,0.97)",
            borderRadius: rem(20),
            boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
            border: "1px solid #ececec"
          }}
        >
          <Flex
            align="center"
            justify="space-between"
            pt={32}
            pb={8}
            px={{ base: 8, md: 28 }}
            direction={{ base: "column", md: "row" }}
            gap={12}
          >
            <Box>
              <Text fw={700} fz="xl" mb={2}>
                Quản lý người dùng
              </Text>
              <Text c="dimmed" fz="sm">
                Tìm kiếm người dùng, lọc theo vai trò và bật tắt trạng thái hoạt động.
              </Text>
            </Box>
          </Flex>

          <Divider my={0} />

          <Box px={{ base: 8, md: 28 }} py={20}>
            <CDataTable<UserRow, unknown>
              columns={columns}
              data={users}
              isLoading={isLoading}
              loadingText="Đang tải danh sách người dùng..."
              enableGlobalFilter={false}
              hideSearch
              extraFilters={extraFilters}
              extraActions={extraActions}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={(pageSize) => {
                setLimit(pageSize)
                setPage(1)
              }}
              initialPageSize={limit}
              pageSizeOptions={[10, 20, 50, 100]}
              getRowId={(row) => row._id}
            />
          </Box>
        </Box>
      </AdminLayout>
    </>
  )
}
