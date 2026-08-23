import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Avatar, Badge, Box, Button, Divider, Flex, Group, Select, Stack, Switch, Text, TextInput, rem } from "@mantine/core"
import { ColumnDef } from "@tanstack/react-table"
import { IconEdit, IconSearch } from "@tabler/icons-react"
import { Helmet } from "react-helmet-async"
import { notifications } from "@mantine/notifications"
import { AdminLayout } from "../../../components/layouts/AdminLayout"
import { CDataTable } from "../../../components/common/CDataTable"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import type { AdminListUsersResponse, PermissionResponse } from "../../../hooks/models"
import { useUsers } from "../../../hooks/useUsers"

export const Route = createFileRoute("/admin/users/")({ component: RouteComponent })

type UserRow = AdminListUsersResponse["data"][number]

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Đã vô hiệu hóa" }
] as const

const permissionLabel = (permission: PermissionResponse) =>
  `${permission.label} · ${permission.key}`

function RouteComponent() {
  useAuthGuard(["api.users.admin-list-users"])

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { adminListUsers, listPermissions, updateUserActive } = useUsers()
  const [searchText, setSearchText] = useState("")
  const [permission, setPermission] = useState<string | null>(null)
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const { data: permissions = [] } = useQuery({
    queryKey: ["permissions"],
    queryFn: listPermissions,
    select: (response) => response.data.data
  })
  const permissionOptions = useMemo(
    () => permissions.map((item) => ({ value: item.key, label: permissionLabel(item) })),
    [permissions]
  )
  const permissionLabelByKey = useMemo(
    () => new Map(permissions.map((item) => [item.key, item.label])),
    [permissions]
  )

  const { data: usersResponse, isLoading, isFetching } = useQuery({
    queryKey: ["adminUsers", searchText, permission, status, page, limit],
    queryFn: () => adminListUsers({ searchText: searchText.trim() || undefined, permission: permission || undefined, status, page, limit }),
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
      notifications.show({ title: variables.active ? "Đã kích hoạt tài khoản" : "Đã vô hiệu hóa tài khoản", message: "Trạng thái người dùng đã được cập nhật", color: variables.active ? "green" : "orange" })
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] })
    },
    onError: (error: any) => notifications.show({ title: "Cập nhật thất bại", message: error?.response?.data?.message || "Không thể cập nhật trạng thái người dùng", color: "red" }),
    onSettled: () => setUpdatingUserId(null)
  })

  const columns = useMemo<ColumnDef<UserRow>[]>(
    () => [
      {
        accessorKey: "username",
        header: "Tên đăng nhập",
        cell: ({ row }) => <Stack gap={2}><Text fw={600} size="sm">{row.original.username}</Text><Text size="xs" c="dimmed">ID: {row.original._id}</Text></Stack>
      },
      {
        accessorKey: "name",
        header: "Người dùng",
        cell: ({ row }) => <Group gap="sm" wrap="nowrap"><Avatar src={row.original.avatarUrl} radius="xl" size="md">{row.original.name?.charAt(0)?.toUpperCase() || row.original.username?.charAt(0)?.toUpperCase() || "U"}</Avatar><Text fw={600} size="sm">{row.original.name || "Chưa cập nhật tên"}</Text></Group>
      },
      {
        accessorKey: "permissions",
        header: "Quyền",
        cell: ({ row }) => {
          const values = row.original.permissions || []
          return <Stack gap={5}><Badge size="sm" radius="xl" variant="light" color="indigo" w="fit-content">{values.length} quyền</Badge><Text size="xs" c="dimmed" lineClamp={2}>{values.slice(0, 3).map((key) => permissionLabelByKey.get(key) || key).join(", ") || "Chưa có quyền"}</Text></Stack>
        }
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          const isUpdating = updatingUserId === row.original._id
          return <Group gap="sm" justify="space-between" wrap="nowrap"><Badge color={row.original.active ? "green" : "gray"} variant="light" radius="xl">{row.original.active ? "Active" : "Inactive"}</Badge><Switch checked={row.original.active} onChange={(event) => toggleUserActive({ userId: row.original._id, active: event.currentTarget.checked })} disabled={isUpdating} color="green" size="md" onLabel="ON" offLabel="OFF" /></Group>
        }
      },
      {
        id: "actions",
        header: "Thao tác",
        enableSorting: false,
        cell: ({ row }) => <Button size="xs" variant="light" leftSection={<IconEdit size={15} />} onClick={() => navigate({ to: "/admin/users/$userId/permissions", params: { userId: row.original._id } })}>Sửa quyền</Button>
      }
    ],
    [navigate, permissionLabelByKey, toggleUserActive, updatingUserId]
  )

  return <>
    <Helmet><title>Quản trị - Người dùng | MyCandy</title></Helmet>
    <AdminLayout>
      <Box mt={40} mx="auto" px={{ base: 8, md: 0 }} w="100%" style={{ background: "rgba(255,255,255,0.97)", borderRadius: rem(20), boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)", border: "1px solid #ececec" }}>
        <Flex align="center" justify="space-between" pt={32} pb={8} px={{ base: 8, md: 28 }} direction={{ base: "column", md: "row" }} gap={12}><Box><Text fw={700} fz="xl" mb={2}>Quản lý người dùng</Text><Text c="dimmed" fz="sm">Cấp quyền trực tiếp hoặc áp dụng nhanh một nhóm quyền.</Text></Box></Flex>
        <Divider my={0} />
        <Box px={{ base: 8, md: 28 }} py={20}>
          <CDataTable<UserRow, unknown>
            columns={columns} data={users} isLoading={isLoading} loadingText="Đang tải danh sách người dùng..." enableGlobalFilter={false} hideSearch
            extraFilters={<Group gap={12} align="end" wrap="wrap"><TextInput value={searchText} onChange={(event) => { setSearchText(event.currentTarget.value); setPage(1) }} leftSection={<IconSearch size={16} />} placeholder="Tìm theo tên hoặc username..." label="Tìm kiếm" size="sm" w={{ base: "100%", sm: 280 }} /><Select label="Có quyền" placeholder="Tất cả quyền" data={permissionOptions} value={permission} onChange={(value) => { setPermission(value); setPage(1) }} clearable searchable size="sm" w={{ base: "100%", sm: 320 }} /><Select label="Trạng thái" data={STATUS_OPTIONS} value={status} onChange={(value) => { setStatus((value as "all" | "active" | "inactive") || "all"); setPage(1) }} size="sm" w={{ base: "100%", sm: 220 }} /></Group>}
            extraActions={<Group gap={8}><Badge variant="light" color="indigo" size="lg" radius="xl">Tổng: {total}</Badge>{isFetching && !isLoading ? <Badge variant="light" color="gray" size="lg" radius="xl">Đang cập nhật dữ liệu</Badge> : null}</Group>}
            page={page} totalPages={totalPages} onPageChange={setPage} onPageSizeChange={(pageSize) => { setLimit(pageSize); setPage(1) }} initialPageSize={limit} pageSizeOptions={[10, 20, 50, 100]} getRowId={(row) => row._id}
          />
        </Box>
      </Box>
    </AdminLayout>
  </>
}
