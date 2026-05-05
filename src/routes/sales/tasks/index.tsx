import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  Badge,
  Group,
  Box,
  rem,
  Text,
  Select,
  ActionIcon,
  Tooltip
} from "@mantine/core"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useMemo } from "react"
import { modals } from "@mantine/modals"
import { format } from "date-fns"
import {
  IconCheck,
  IconTrash,
  IconPhone,
  IconMessage,
  IconDots
} from "@tabler/icons-react"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { CDataTable } from "../../../components/common/CDataTable"
import { useSalesTasks } from "../../../hooks/useSalesTasks"
import { useUsers } from "../../../hooks/useUsers"
import { CToast } from "../../../components/common/CToast"
import { ColumnDef } from "@tanstack/react-table"

export const Route = createFileRoute("/sales/tasks/")({
  validateSearch: (search: Record<string, unknown>) => {
    const parsePositiveInt = (value: unknown, fallback: number) => {
      const parsed = Number(value)
      return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
    }
    const parseString = (value: unknown) => {
      if (typeof value !== "string") return undefined
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : undefined
    }

    return {
      page: parsePositiveInt(search.page, 1),
      limit: parsePositiveInt(search.limit, 10),
      typeFilter: parseString(search.typeFilter),
      statusFilter: parseString(search.statusFilter),
      assigneeFilter: parseString(search.assigneeFilter)
    }
  },
  component: RouteComponent
})

type TaskItem = {
  _id: string
  salesFunnelId: {
    _id: string
    name: string
    phoneNumber: string
  }
  type: "call" | "message" | "other"
  assigneeId: {
    id: string
    name: string
    username: string
  }
  note?: string
  completed: boolean
  completedAt?: Date
  deadline: Date
  createdAt: string
  updatedAt: string
}

function RouteComponent() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const { getSalesTasks, completeTask, deleteSalesTask } = useSalesTasks()
  const { publicSearchUser, getMe } = useUsers()

  const page = search.page
  const limit = search.limit
  const typeFilter = search.typeFilter ?? ""
  const statusFilter = search.statusFilter ?? ""
  const assigneeFilter = search.assigneeFilter ?? ""

  // Load reference data
  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: getMe
  })

  const { data: usersData } = useQuery({
    queryKey: ["users", "public", "all"],
    queryFn: () => publicSearchUser({ page: 1, limit: 999 })
  })

  // Load tasks data with filters
  const { data, refetch } = useQuery({
    queryKey: [
      "salesTasks",
      page,
      limit,
      typeFilter,
      statusFilter,
      assigneeFilter
    ],
    queryFn: () =>
      getSalesTasks({
        page,
        limit,
        salesFunnelId: undefined,
        completed: statusFilter ? statusFilter === "completed" : undefined,
        assigneeId: assigneeFilter || undefined
      })
  })

  const tasksData = data?.data.data || []

  const userOptions =
    usersData?.data.data.map((user) => ({
      value: user._id,
      label: user.name ?? "Anonymous"
    })) || []

  const { mutate: completeTaskMutation } = useMutation({
    mutationFn: completeTask,
    onSuccess: () => {
      CToast.success({ title: "Đánh dấu hoàn thành task thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Đánh dấu hoàn thành task thất bại" })
    }
  })

  const { mutate: deleteTaskMutation } = useMutation({
    mutationFn: deleteSalesTask,
    onSuccess: () => {
      CToast.success({ title: "Xóa task thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Xóa task thất bại" })
    }
  })

  const handleCompleteTask = (taskId: string) => {
    modals.openConfirmModal({
      title: <b>Xác nhận hoàn thành</b>,
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn đánh dấu task này là hoàn thành?
        </Text>
      ),
      labels: { confirm: "Hoàn thành", cancel: "Hủy" },
      confirmProps: { color: "green" },
      onConfirm: () => completeTaskMutation(taskId)
    })
  }

  const handleDeleteTask = (taskId: string) => {
    modals.openConfirmModal({
      title: <b>Xác nhận xóa</b>,
      children: (
        <Text size="sm">Bạn có chắc chắn muốn xóa task này không?</Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteTaskMutation(taskId)
    })
  }

  // Check permissions
  const me = meData?.data
  const isAdmin = useMemo(() => {
    return me?.roles?.includes("admin") ?? false
  }, [me])

  const isSaleLeader = useMemo(() => {
    return me?.roles?.includes("sales-leader") ?? false
  }, [me])

  const columns: ColumnDef<TaskItem>[] = [
    {
      accessorKey: "salesFunnelId.name",
      header: "Khách hàng",
      cell: ({ row }) => (
        <Text
          fw={500}
          size="sm"
          style={{ cursor: "pointer" }}
          c="blue"
          onClick={() =>
            navigate({ to: `/sales/funnel/${row.original.salesFunnelId._id}` })
          }
        >
          {row.original.salesFunnelId.name}
        </Text>
      )
    },
    {
      accessorKey: "type",
      header: "Loại",
      cell: ({ row }) => (
        <Badge
          variant="light"
          leftSection={
            row.original.type === "call" ? (
              <IconPhone size={14} />
            ) : row.original.type === "message" ? (
              <IconMessage size={14} />
            ) : (
              <IconDots size={14} />
            )
          }
        >
          {row.original.type === "call"
            ? "Gọi điện"
            : row.original.type === "message"
              ? "Tin nhắn"
              : "Khác"}
        </Badge>
      )
    },
    {
      accessorKey: "assigneeId.name",
      header: "Người thực hiện",
      cell: ({ row }) => (
        <Text size="sm">
          {row.original.assigneeId ? row.original.assigneeId.name : "N/A"}
        </Text>
      )
    },
    {
      accessorKey: "deadline",
      header: "Hạn hoàn thành",
      cell: ({ row }) => {
        const isOverdue =
          !row.original.completed &&
          new Date(row.original.deadline) < new Date()
        return (
          <Text
            size="sm"
            c={isOverdue ? "red" : undefined}
            fw={isOverdue ? 600 : undefined}
          >
            {format(new Date(row.original.deadline), "dd/MM/yyyy HH:mm")}
          </Text>
        )
      }
    },
    {
      accessorKey: "note",
      header: "Ghi chú",
      cell: ({ row }) => (
        <Text size="sm" lineClamp={1}>
          {row.original.note || "N/A"}
        </Text>
      )
    },
    {
      accessorKey: "completed",
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge color={row.original.completed ? "green" : "gray"}>
          {row.original.completed ? "Hoàn thành" : "Chưa hoàn thành"}
        </Badge>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => (
        <Text size="sm" c="dimmed">
          {format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm")}
        </Text>
      )
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const item = row.original
        console.log(item)
        const isAssignee = item.assigneeId && item.assigneeId.id === me?._id
        const canManage = isAdmin || isSaleLeader || isAssignee

        if (!canManage) {
          return null
        }

        return (
          <Group gap="xs">
            {!item.completed && (
              <Tooltip label="Hoàn thành" withArrow>
                <ActionIcon
                  variant="light"
                  color="green"
                  size="sm"
                  onClick={() => handleCompleteTask(item._id)}
                >
                  <IconCheck size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            {(isAdmin || isSaleLeader) && (
              <Tooltip label="Xóa" withArrow>
                <ActionIcon
                  variant="light"
                  color="red"
                  size="sm"
                  onClick={() => handleDeleteTask(item._id)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        )
      },
      enableSorting: false
    }
  ]

  return (
    <SalesLayout>
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
        {/* Header Section */}
        <Box pt={32} pb={16} px={{ base: 8, md: 28 }}>
          <Text fw={700} fz="xl" mb={2}>
            Quản lý Tasks
          </Text>
          <Text c="dimmed" fz="sm">
            Quản lý công việc cần thực hiện cho từng khách hàng
          </Text>
        </Box>

        {/* Content */}
        <Box px={{ base: 4, md: 28 }} pb={20}>
          <CDataTable
            columns={columns}
            data={tasksData}
            enableGlobalFilter={false}
            page={page}
            totalPages={Math.ceil((data?.data.total || 0) / limit)}
            onPageChange={(nextPage) =>
              navigate({
                to: "/sales/tasks",
                search: {
                  ...search,
                  page: nextPage
                }
              })
            }
            onPageSizeChange={(nextLimit) =>
              navigate({
                to: "/sales/tasks",
                search: {
                  ...search,
                  limit: nextLimit,
                  page: 1
                }
              })
            }
            initialPageSize={limit}
            pageSizeOptions={[10, 20, 50, 100]}
            extraFilters={
              <>
                <Select
                  label="Loại"
                  placeholder="Tất cả loại"
                  data={[
                    { value: "", label: "Tất cả loại" },
                    { value: "call", label: "Gọi điện" },
                    { value: "message", label: "Tin nhắn" },
                    { value: "other", label: "Khác" }
                  ]}
                  value={typeFilter}
                  onChange={(value) =>
                    navigate({
                      to: "/sales/tasks",
                      search: {
                        ...search,
                        typeFilter: value || undefined,
                        page: 1
                      }
                    })
                  }
                  clearable
                  style={{ width: 180 }}
                />

                <Select
                  label="Trạng thái"
                  placeholder="Tất cả trạng thái"
                  data={[
                    { value: "", label: "Tất cả trạng thái" },
                    { value: "completed", label: "Hoàn thành" },
                    { value: "pending", label: "Chưa hoàn thành" }
                  ]}
                  value={statusFilter}
                  onChange={(value) =>
                    navigate({
                      to: "/sales/tasks",
                      search: {
                        ...search,
                        statusFilter: value || undefined,
                        page: 1
                      }
                    })
                  }
                  clearable
                  style={{ width: 200 }}
                />

                <Select
                  label="Người thực hiện"
                  placeholder="Tất cả người thực hiện"
                  data={[
                    { value: "", label: "Tất cả người thực hiện" },
                    ...userOptions
                  ]}
                  value={assigneeFilter}
                  onChange={(value) =>
                    navigate({
                      to: "/sales/tasks",
                      search: {
                        ...search,
                        assigneeFilter: value || undefined,
                        page: 1
                      }
                    })
                  }
                  searchable
                  clearable
                  style={{ width: 220 }}
                />
              </>
            }
          />
        </Box>
      </Box>
    </SalesLayout>
  )
}
