import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Accordion,
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text
} from "@mantine/core"
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react"
import { Helmet } from "react-helmet-async"
import { notifications } from "@mantine/notifications"
import { AdminLayout } from "../../../../components/layouts/AdminLayout"
import { useAuthGuard } from "../../../../hooks/useAuthGuard"
import type {
  PermissionGroupResponse,
  PermissionResponse
} from "../../../../hooks/models"
import { useUsers } from "../../../../hooks/useUsers"

export const Route = createFileRoute("/admin/users/$userId/permissions")({
  component: RouteComponent
})

const moduleTitle = (moduleName?: string) =>
  moduleName
    ? moduleName.replace(/(^|[-_])(\w)/g, (_, __, letter) => letter.toUpperCase())
    : "Khác"

function RouteComponent() {
  useAuthGuard(["api.users.admin-list-users"])

  const { userId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {
    adminGetUser,
    listPermissionGroups,
    listPermissions,
    updateUserPermissions
  } = useUsers()
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const { data: user, isLoading: isLoadingUser, isError } = useQuery({
    queryKey: ["adminUser", userId],
    queryFn: () => adminGetUser(userId),
    select: (response) => response.data
  })
  const { data: permissions = [], isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: listPermissions,
    select: (response) => response.data.data
  })
  const { data: permissionGroups = [] } = useQuery({
    queryKey: ["permissionGroups"],
    queryFn: listPermissionGroups,
    select: (response) => response.data.data
  })

  useEffect(() => {
    setSelectedPermissions(user?.permissions ?? [])
  }, [user?.permissions])

  const permissionModules = useMemo(() => {
    const result = new Map<string, PermissionResponse[]>()
    permissions.forEach((permission) => {
      const key = permission.module || "other"
      result.set(key, [...(result.get(key) ?? []), permission])
    })
    return [...result.entries()].sort(([left], [right]) => left.localeCompare(right))
  }, [permissions])

  const selectedSet = useMemo(
    () => new Set(selectedPermissions),
    [selectedPermissions]
  )

  const setPermission = (permissionKey: string, checked: boolean) => {
    setSelectedPermissions((current) =>
      checked
        ? Array.from(new Set([...current, permissionKey]))
        : current.filter((key) => key !== permissionKey)
    )
  }

  const setPermissionKeys = (keys: string[], checked: boolean) => {
    setSelectedPermissions((current) => {
      if (!checked) return current.filter((key) => !keys.includes(key))
      return Array.from(new Set([...current, ...keys]))
    })
  }

  const { mutate: savePermissions, isPending: isSaving } = useMutation({
    mutationFn: () =>
      updateUserPermissions(userId, { permissions: selectedPermissions }),
    onSuccess: () => {
      notifications.show({
        title: "Đã cập nhật quyền",
        message: "Quyền trực tiếp của tài khoản đã được lưu.",
        color: "green"
      })
      queryClient.invalidateQueries({ queryKey: ["adminUser", userId] })
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] })
      queryClient.invalidateQueries({ queryKey: ["getMe"] })
    },
    onError: (error: any) =>
      notifications.show({
        title: "Cập nhật quyền thất bại",
        message:
          error?.response?.data?.message ||
          "Không thể cập nhật quyền của tài khoản.",
        color: "red"
      })
  })

  if (isError) {
    return (
      <AdminLayout>
        <Text mt={40} ta="center" c="red">
          Không tìm thấy người dùng hoặc bạn không có quyền truy cập.
        </Text>
      </AdminLayout>
    )
  }

  return (
    <>
      <Helmet>
        <title>Chỉnh sửa quyền | MyCandy</title>
      </Helmet>
      <AdminLayout>
        <Box mt={32} mx="auto" maw={1280} px={{ base: 8, md: 0 }}>
          <Group justify="space-between" mb="md" wrap="wrap">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate({ to: "/admin/users" })}
            >
              Quay lại người dùng
            </Button>
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={() => savePermissions()}
              loading={isSaving}
              disabled={isLoadingUser || isLoadingPermissions}
            >
              Lưu {selectedPermissions.length} quyền
            </Button>
          </Group>

          <Paper
            p={{ base: "md", md: "xl" }}
            radius="lg"
            withBorder
            style={{ boxShadow: "0 4px 24px rgba(50, 64, 117, 0.06)" }}
          >
            {isLoadingUser ? (
              <Group>
                <Skeleton circle h={48} />
                <Stack gap={6}>
                  <Skeleton h={16} w={180} />
                  <Skeleton h={12} w={120} />
                </Stack>
              </Group>
            ) : (
              <Group gap="sm">
                <Avatar src={user?.avatarUrl} radius="xl" size={48}>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
                <Box>
                  <Text fw={700} fz="lg">
                    {user?.name || user?.username}
                  </Text>
                  <Text size="sm" c="dimmed">
                    @{user?.username}
                  </Text>
                </Box>
                <Badge variant="light" color="indigo" radius="xl">
                  {selectedPermissions.length} quyền trực tiếp
                </Badge>
              </Group>
            )}

            <Divider my="lg" />

            <Stack gap="xs" mb="lg">
              <Text fw={700}>Nhóm quyền</Text>
              <Text size="sm" c="dimmed">
                Chọn một nhóm để thêm hoặc bỏ toàn bộ permission của nhóm.
                Nhóm chỉ là preset, không được lưu vào user.
              </Text>
              <Group gap="sm" mt={4}>
                {permissionGroups.map((group: PermissionGroupResponse) => {
                  const groupKeys = group.permissionKeys.filter((key) =>
                    permissions.some((permission) => permission.key === key)
                  )
                  const selectedCount = groupKeys.filter((key) =>
                    selectedSet.has(key)
                  ).length
                  return (
                    <Checkbox.Card
                      key={group.key}
                      checked={
                        groupKeys.length > 0 &&
                        selectedCount === groupKeys.length
                      }
                      onChange={() =>
                        setPermissionKeys(
                          groupKeys,
                          selectedCount !== groupKeys.length
                        )
                      }
                      p="sm"
                      withBorder
                    >
                      <Group gap="xs">
                        <Checkbox.Indicator />
                        <Box>
                          <Text size="sm" fw={600}>
                            {group.label}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {selectedCount}/{groupKeys.length} quyền
                          </Text>
                        </Box>
                      </Group>
                    </Checkbox.Card>
                  )
                })}
              </Group>
            </Stack>

            <Text fw={700} mb={4}>
              Permission chi tiết
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              Chọn/bỏ từng permission. Danh sách được chia theo module API.
            </Text>

            <Accordion variant="separated" multiple defaultValue={permissionModules.map(([moduleName]) => moduleName)}>
              {permissionModules.map(([moduleName, modulePermissions]) => {
                const selectedCount = modulePermissions.filter((permission) =>
                  selectedSet.has(permission.key)
                ).length
                return (
                  <Accordion.Item key={moduleName} value={moduleName}>
                    <Accordion.Control>
                      <Group justify="space-between" pr="md">
                        <Text fw={600}>{moduleTitle(moduleName)}</Text>
                        <Badge variant="light" radius="xl">
                          {selectedCount}/{modulePermissions.length}
                        </Badge>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="xs">
                        <Checkbox
                          label="Chọn toàn bộ module"
                          checked={selectedCount === modulePermissions.length}
                          indeterminate={selectedCount > 0 && selectedCount < modulePermissions.length}
                          onChange={(event) =>
                            setPermissionKeys(
                              modulePermissions.map((permission) => permission.key),
                              event.currentTarget.checked
                            )
                          }
                        />
                        <Divider />
                        {modulePermissions.map((permission) => (
                          <Checkbox
                            key={permission.key}
                            checked={selectedSet.has(permission.key)}
                            onChange={(event) =>
                              setPermission(
                                permission.key,
                                event.currentTarget.checked
                              )
                            }
                            label={
                              <Box>
                                <Text size="sm">{permission.label}</Text>
                                <Text size="xs" c="dimmed">
                                  {permission.key}
                                </Text>
                              </Box>
                            }
                          />
                        ))}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                )
              })}
            </Accordion>
          </Paper>
        </Box>
      </AdminLayout>
    </>
  )
}
