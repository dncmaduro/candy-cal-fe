import { createFileRoute } from "@tanstack/react-router"
import { LivestreamLayout } from "../../../components/layouts/LivestreamLayout"
import { useLivestreamAltRequests } from "../../../hooks/useLivestreamAltRequests"
import { useLivestreamChannels } from "../../../hooks/useLivestreamChannels"
import { useUsers } from "../../../hooks/useUsers"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  Box,
  Button,
  Divider,
  Flex,
  Text,
  Stack,
  Badge,
  Group,
  ActionIcon,
  Select,
  TextInput
} from "@mantine/core"
import { IconEdit, IconTrash, IconCheck, IconX } from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import { modals } from "@mantine/modals"
import { useState, useMemo } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CDataTable } from "../../../components/common/CDataTable"
import { ColumnDef } from "@tanstack/react-table"
import { SearchAltRequestsResponse } from "../../../hooks/models"

export const Route = createFileRoute("/livestream/alt-requests/")({
  component: RouteComponent
})

type AltRequest = SearchAltRequestsResponse["data"][0]

function RouteComponent() {
  const {
    searchAltRequests,
    updateAltRequests,
    deleteAltRequest,
    updateAltRequestStatus
  } = useLivestreamAltRequests()
  const { searchLivestreamChannels } = useLivestreamChannels()
  const { publicSearchUser, getMe } = useUsers()

  const [statusFilter, setStatusFilter] = useState<string | null>("pending")
  const [requestByFilter, setRequestByFilter] = useState<string | null>(null)
  const [channelFilter, setChannelFilter] = useState<string | null>(null)

  const { data: me } = useQuery({
    queryKey: ["getMe"],
    queryFn: () => getMe(),
    select: (data) => data.data
  })

  // Check if user is admin or livestream-leader
  const isAdminOrLeader = useMemo(() => {
    if (!me) return false
    return (
      me.roles?.includes("admin") || me.roles?.includes("livestream-leader")
    )
  }, [me])

  // Fetch employees for alt assignee selection
  const { data: livestreamEmpData } = useQuery({
    queryKey: ["livestreamEmployees"],
    queryFn: () =>
      publicSearchUser({
        page: 1,
        limit: 100,
        role: "livestream-emp"
      }),
    select: (data) => data.data.data
  })

  const { data: livestreamLeaderData } = useQuery({
    queryKey: ["livestreamLeaders"],
    queryFn: () =>
      publicSearchUser({
        page: 1,
        limit: 100,
        role: "livestream-leader"
      }),
    select: (data) => data.data.data
  })

  // Combine employees
  const employeesData = useMemo(() => {
    const emps = [...(livestreamEmpData || []), ...(livestreamLeaderData || [])]
    return emps.filter((emp, index, self) => {
      return self.findIndex((e) => e._id === emp._id) === index
    })
  }, [livestreamEmpData, livestreamLeaderData])

  const employeeOptions = useMemo(() => {
    if (!employeesData) return []
    return employeesData.map((emp) => ({ label: emp.name, value: emp._id }))
  }, [employeesData])

  // Fetch channels
  const { data: channelsData } = useQuery({
    queryKey: ["livestreamChannels"],
    queryFn: async () => {
      const response = await searchLivestreamChannels({ page: 1, limit: 100 })
      return response.data.data
    }
  })

  const channelOptions = useMemo(() => {
    if (!channelsData) return []
    return channelsData.map((ch) => ({ label: ch.name, value: ch._id }))
  }, [channelsData])

  // Fetch alt requests with server-side filtering
  const {
    data: altRequestsResponse,
    isLoading,
    refetch
  } = useQuery({
    queryKey: [
      "searchAltRequests",
      statusFilter,
      requestByFilter,
      channelFilter,
      isAdminOrLeader,
      me?._id
    ],
    queryFn: async () => {
      // If not admin/leader, auto-filter by current user
      const actualRequestBy = isAdminOrLeader
        ? requestByFilter || undefined
        : me?._id || undefined

      const response = await searchAltRequests({
        page: 1,
        limit: 100,
        status: statusFilter
          ? (statusFilter as "pending" | "accepted" | "rejected")
          : undefined,
        requestBy: actualRequestBy,
        channel: channelFilter || undefined
      })
      return response.data
    }
  })

  // Update request mutation
  const { mutate: updateRequest, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, altNote }: { id: string; altNote: string }) => {
      return await updateAltRequests(id, { altNote })
    },
    onSuccess: () => {
      notifications.show({
        title: "Cập nhật thành công",
        message: "Đã cập nhật yêu cầu",
        color: "green"
      })
      refetch()
    },
    onError: (error: any) => {
      notifications.show({
        title: "Cập nhật thất bại",
        message: error?.response?.data?.message || "Có lỗi xảy ra",
        color: "red"
      })
    }
  })

  // Delete request mutation
  const { mutate: deleteRequestMutation, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      return await deleteAltRequest({ id })
    },
    onSuccess: () => {
      notifications.show({
        title: "Xóa thành công",
        message: "Đã xóa yêu cầu",
        color: "green"
      })
      refetch()
    },
    onError: (error: any) => {
      notifications.show({
        title: "Xóa thất bại",
        message: error?.response?.data?.message || "Có lỗi xảy ra",
        color: "red"
      })
    }
  })

  // Accept request mutation
  const { mutate: acceptRequest, isPending: isAccepting } = useMutation({
    mutationFn: async ({
      id,
      altAssignee
    }: {
      id: string
      altAssignee: string
    }) => {
      return await updateAltRequestStatus(id, {
        status: "accepted",
        altAssignee
      })
    },
    onSuccess: () => {
      notifications.show({
        title: "Chấp nhận thành công",
        message: "Đã chấp nhận yêu cầu thay đổi",
        color: "green"
      })
      refetch()
    },
    onError: (error: any) => {
      notifications.show({
        title: "Chấp nhận thất bại",
        message: error?.response?.data?.message || "Có lỗi xảy ra",
        color: "red"
      })
    }
  })

  // Reject request mutation
  const { mutate: rejectRequest, isPending: isRejecting } = useMutation({
    mutationFn: async (id: string) => {
      return await updateAltRequestStatus(id, { status: "rejected" })
    },
    onSuccess: () => {
      notifications.show({
        title: "Từ chối thành công",
        message: "Đã từ chối yêu cầu thay đổi",
        color: "green"
      })
      refetch()
    },
    onError: (error: any) => {
      notifications.show({
        title: "Từ chối thất bại",
        message: error?.response?.data?.message || "Có lỗi xảy ra",
        color: "red"
      })
    }
  })

  // Handle open edit modal
  const handleOpenEdit = (request: AltRequest) => {
    modals.open({
      title: "Chỉnh sửa yêu cầu",
      centered: true,
      children: (
        <EditModalContent
          request={request}
          onSubmit={(altNote) => {
            updateRequest({ id: request._id, altNote })
            modals.closeAll()
          }}
          isUpdating={isUpdating}
        />
      )
    })
  }

  // Handle open accept modal
  const handleOpenAccept = (request: AltRequest) => {
    modals.open({
      title: "Chấp nhận yêu cầu",
      centered: true,
      children: (
        <AcceptModalContent
          employeeOptions={employeeOptions.filter(
            (e) => e.value !== request.createdBy._id
          )}
          onSubmit={(altAssignee) => {
            acceptRequest({ id: request._id, altAssignee })
            modals.closeAll()
          }}
          isAccepting={isAccepting}
        />
      )
    })
  }

  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa yêu cầu này?")) {
      deleteRequestMutation(id)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge color="yellow" variant="light">
            Chờ xử lý
          </Badge>
        )
      case "accepted":
        return (
          <Badge color="green" variant="light">
            Đã chấp nhận
          </Badge>
        )
      case "rejected":
        return (
          <Badge color="red" variant="light">
            Đã từ chối
          </Badge>
        )
      default:
        return null
    }
  }

  // Define table columns
  const columns = useMemo<
    ColumnDef<SearchAltRequestsResponse["data"][0]>[]
  >(() => {
    return [
      {
        accessorKey: "createdBy",
        header: "Người yêu cầu",
        cell: ({ row }) => (
          <Text size="sm">
            {row.original.createdBy ? row.original.createdBy.name : ""}
          </Text>
        )
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => getStatusBadge(row.original.status),
        size: 120
      },
      {
        accessorKey: "createdAt",
        header: "Ngày tạo",
        cell: ({ row }) =>
          format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm", {
            locale: vi
          }),
        size: 150
      },
      {
        accessorKey: "altNote",
        header: "Lý do",
        cell: ({ row }) => (
          <Text size="sm" lineClamp={2}>
            {row.original.altNote}
          </Text>
        )
      },
      {
        accessorKey: "snapshotId",
        header: "Snapshot ID",
        cell: ({ row }) => (
          <Text size="xs" c="dimmed" style={{ fontFamily: "monospace" }}>
            {row.original.snapshotId.slice(0, 8)}...
          </Text>
        ),
        size: 120
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <Group gap="xs" wrap="nowrap">
            {/* Regular user actions - only for pending requests they created */}
            {!isAdminOrLeader &&
              row.original.status === "pending" &&
              row.original.createdBy._id === me?._id && (
                <>
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => handleOpenEdit(row.original)}
                    disabled={isUpdating}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => handleDelete(row.original._id)}
                    disabled={isDeleting}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </>
              )}

            {/* Admin/Leader actions - only for pending requests */}
            {isAdminOrLeader && row.original.status === "pending" && (
              <>
                <ActionIcon
                  variant="light"
                  color="green"
                  onClick={() => handleOpenAccept(row.original)}
                  disabled={isAccepting}
                >
                  <IconCheck size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="light"
                  color="red"
                  onClick={() => rejectRequest(row.original._id)}
                  disabled={isRejecting}
                >
                  <IconX size={16} />
                </ActionIcon>
              </>
            )}
          </Group>
        ),
        size: 120,
        enableSorting: false
      }
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminOrLeader, me, isUpdating, isDeleting, isAccepting, isRejecting])

  return (
    <LivestreamLayout>
      <Box
        mt={40}
        mx="auto"
        px={{ base: 8, md: 0 }}
        w="100%"
        style={{
          background: "rgba(255,255,255,0.97)",
          borderRadius: "20px",
          boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
          border: "1px solid #ececec"
        }}
      >
        <Flex
          align="flex-start"
          justify="space-between"
          pt={32}
          pb={8}
          px={{ base: 8, md: 28 }}
          direction="row"
          gap={8}
        >
          <Box>
            <Text fw={700} fz="xl" mb={2}>
              Quản lý yêu cầu thay đổi nhân sự
            </Text>
            <Text c="dimmed" fz="sm">
              {isAdminOrLeader
                ? "Xem và phê duyệt các yêu cầu thay đổi nhân sự"
                : "Xem và quản lý các yêu cầu thay đổi của bạn"}
            </Text>
          </Box>
        </Flex>

        <Divider my={0} />

        <Box px={{ base: 4, md: 28 }} py={20}>
          <CDataTable
            columns={columns}
            data={altRequestsResponse?.data || []}
            isLoading={isLoading}
            initialPageSize={20}
            pageSizeOptions={[10, 20, 50, 100]}
            enableGlobalFilter={false}
            hideSearch={true}
            extraFilters={
              <>
                <Select
                  placeholder="Trạng thái"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  data={[
                    { label: "Chờ xử lý", value: "pending" },
                    { label: "Đã chấp nhận", value: "accepted" },
                    { label: "Đã từ chối", value: "rejected" }
                  ]}
                  clearable
                  style={{ minWidth: 150 }}
                />
                {isAdminOrLeader && (
                  <>
                    <Select
                      placeholder="Người tạo"
                      value={requestByFilter}
                      onChange={setRequestByFilter}
                      data={employeeOptions}
                      searchable
                      clearable
                      style={{ minWidth: 200 }}
                    />
                    <Select
                      placeholder="Kênh"
                      value={channelFilter}
                      onChange={setChannelFilter}
                      data={channelOptions}
                      searchable
                      clearable
                      style={{ minWidth: 150 }}
                    />
                  </>
                )}
              </>
            }
          />
        </Box>
      </Box>
    </LivestreamLayout>
  )
}

// Modal content components
function EditModalContent({
  request,
  onSubmit,
  isUpdating
}: {
  request: AltRequest
  onSubmit: (altNote: string) => void
  isUpdating: boolean
}) {
  const [editReason, setEditReason] = useState(request.altNote)

  const handleSubmit = () => {
    if (!editReason.trim()) {
      notifications.show({
        title: "Thiếu thông tin",
        message: "Vui lòng nhập lý do",
        color: "red"
      })
      return
    }
    onSubmit(editReason.trim())
  }

  return (
    <Stack gap="md">
      <TextInput
        label="Lý do thay đổi"
        placeholder="Nhập lý do..."
        value={editReason}
        onChange={(e) => setEditReason(e.currentTarget.value)}
        required
      />
      <Group justify="flex-end">
        <Button variant="light" onClick={() => modals.closeAll()}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} loading={isUpdating}>
          Lưu
        </Button>
      </Group>
    </Stack>
  )
}

function AcceptModalContent({
  employeeOptions,
  onSubmit,
  isAccepting
}: {
  employeeOptions: { label: string; value: string }[]
  onSubmit: (altAssignee: string) => void
  isAccepting: boolean
}) {
  const [selectedAltAssignee, setSelectedAltAssignee] = useState<string | null>(
    null
  )

  const handleSubmit = () => {
    if (!selectedAltAssignee) {
      notifications.show({
        title: "Thiếu thông tin",
        message: "Vui lòng chọn người thay thế",
        color: "red"
      })
      return
    }
    onSubmit(selectedAltAssignee)
  }

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Chọn người sẽ thay thế cho ca livestream này
      </Text>
      <Select
        label="Người thay thế"
        placeholder="Chọn nhân viên..."
        value={selectedAltAssignee}
        onChange={setSelectedAltAssignee}
        data={employeeOptions}
        searchable
        required
      />
      <Group justify="flex-end">
        <Button variant="light" onClick={() => modals.closeAll()}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          loading={isAccepting}
          disabled={!selectedAltAssignee}
        >
          Chấp nhận
        </Button>
      </Group>
    </Stack>
  )
}
