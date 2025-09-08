import { useState } from "react"
import { useLivestream } from "../../hooks/useLivestream"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  Table,
  Text,
  Badge,
  Group,
  ActionIcon,
  Select,
  NumberInput,
  Button,
  Stack,
  Paper
} from "@mantine/core"
import {
  IconEdit,
  IconCheck,
  IconX,
  IconTrash,
  IconPlus
} from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import { Can } from "../common/Can"
import { UpdateLivestreamSnapshotRequest } from "../../hooks/models"
import { format } from "date-fns"
import { fmtCurrency } from "../../utils/fmt"

interface Props {
  livestreamId: string
  livestreamDate: string
  snapshots: Array<{
    _id: string
    period: {
      _id?: string
      startTime: { hour: number; minute: number }
      endTime: { hour: number; minute: number }
      channel: string
      noon?: boolean
    }
    host: string
    assistant: string
    goal: number
    income?: number
    noon?: boolean
  }>
  refetch: () => void
}

interface EditingSnapshot {
  id: string
  period: string
  host: string
  assistant: string
  goal: number
  income: number
}

interface NewSnapshot {
  period: string
  host: string
  assistant: string
  goal: number
  income: number
}

export const InlineEditableSnapshotsTable = ({
  livestreamId,
  livestreamDate,
  snapshots,
  refetch
}: Props) => {
  const {
    updateLivestreamSnapshot,
    addLivestreamSnapshot,
    getAllLivestreamPeriods,
    searchLivestreamEmployees
  } = useLivestream()
  const [editingSnapshot, setEditingSnapshot] =
    useState<EditingSnapshot | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newSnapshot, setNewSnapshot] = useState<NewSnapshot>({
    period: "",
    host: "",
    assistant: "",
    goal: 0,
    income: 0
  })

  // Fetch periods
  const { data: periodsData } = useQuery({
    queryKey: ["getAllLivestreamPeriods"],
    queryFn: () => getAllLivestreamPeriods(),
    select: (data) =>
      data.data.periods.reduce(
        (acc, period) => {
          acc[period._id] = {
            timeRange: `${format(new Date(0, 0, 0, period.startTime.hour, period.startTime.minute), "HH:mm")} - ${format(new Date(0, 0, 0, period.endTime.hour, period.endTime.minute), "HH:mm")}`,
            channel: period.channel,
            noon: period.noon
          }
          return acc
        },
        {} as Record<
          string,
          { timeRange: string; channel: string; noon?: boolean }
        >
      )
  })

  // Fetch periods for dropdown
  const { data: periodsOptions } = useQuery({
    queryKey: ["getAllLivestreamPeriods", "options"],
    queryFn: () => getAllLivestreamPeriods(),
    select: (data) =>
      data.data.periods.map((period) => ({
        label: `${format(new Date(0, 0, 0, period.startTime.hour, period.startTime.minute), "HH:mm")} - ${format(new Date(0, 0, 0, period.endTime.hour, period.endTime.minute), "HH:mm")} (${period.channel})${period.noon ? " (Ca trưa)" : ""}`,
        value: period._id
      }))
  })

  // Fetch employees
  const { data: employeesData } = useQuery({
    queryKey: ["searchLivestreamEmployees"],
    queryFn: () => searchLivestreamEmployees({ page: 1, limit: 100 }),
    select: (data) => {
      const employeeMap = data.data.data.reduce(
        (acc, emp) => {
          acc[emp._id] = emp.name
          return acc
        },
        {} as Record<string, string>
      )
      const employeeOptions = data.data.data.map((emp) => ({
        label: emp.name,
        value: emp._id
      }))
      return { employeeMap, employeeOptions }
    }
  })

  const { mutate: updateSnapshot, isPending: isUpdating } = useMutation({
    mutationFn: ({
      snapshotId,
      req
    }: {
      snapshotId: string
      req: UpdateLivestreamSnapshotRequest
    }) => updateLivestreamSnapshot(livestreamId, snapshotId, req),
    onSuccess: () => {
      CToast.success({ title: "Cập nhật snapshot thành công" })
      setEditingSnapshot(null)
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi cập nhật snapshot" })
    }
  })

  const { mutate: addSnapshot, isPending: isAdding } = useMutation({
    mutationFn: (req: {
      period: string
      host: string
      assistant: string
      goal: number
      income?: number
    }) => addLivestreamSnapshot(livestreamId, req),
    onSuccess: () => {
      CToast.success({ title: "Thêm khung giờ phát sóng thành công" })
      setIsAddingNew(false)
      setNewSnapshot({
        period: "",
        host: "",
        assistant: "",
        goal: 0,
        income: 0
      })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi thêm khung giờ phát sóng" })
    }
  })

  // Get already selected period IDs to filter them out for new snapshot
  const existingPeriodIds = snapshots.map((s) => s.period._id || "")
  const availablePeriodsForNew = (periodsOptions || []).filter(
    (period) => !existingPeriodIds.includes(period.value)
  )

  const isPending = isUpdating || isAdding

  // Helper function to format time range
  const formatTimeRange = (period: Props["snapshots"][0]["period"]) => {
    const start = `${period.startTime.hour.toString().padStart(2, "0")}:${period.startTime.minute.toString().padStart(2, "0")}`
    const end = `${period.endTime.hour.toString().padStart(2, "0")}:${period.endTime.minute.toString().padStart(2, "0")}`
    return `${start} - ${end}`
  }

  const startEditing = (snapshot: Props["snapshots"][0]) => {
    setEditingSnapshot({
      id: snapshot._id,
      period: snapshot.period._id || "",
      host: snapshot.host,
      assistant: snapshot.assistant,
      goal: snapshot.goal,
      income: snapshot.income || 0
    })
  }

  const cancelEditing = () => {
    setEditingSnapshot(null)
  }

  const saveChanges = () => {
    if (!editingSnapshot) return

    const isNoonPeriod = periodsData?.[editingSnapshot.period]?.noon

    updateSnapshot({
      snapshotId: editingSnapshot.id,
      req: {
        period: editingSnapshot.period,
        host: isNoonPeriod ? "" : editingSnapshot.host,
        assistant: editingSnapshot.assistant,
        goal: isNoonPeriod ? 0 : editingSnapshot.goal,
        income: isNoonPeriod ? 0 : editingSnapshot.income
      }
    })
  }

  const startAddingNew = () => {
    setIsAddingNew(true)
    setNewSnapshot({ period: "", host: "", assistant: "", goal: 0, income: 0 })
  }

  const cancelAddingNew = () => {
    setIsAddingNew(false)
    setNewSnapshot({ period: "", host: "", assistant: "", goal: 0, income: 0 })
  }

  const saveNewSnapshot = () => {
    const isNoonPeriod =
      newSnapshot.period && periodsData?.[newSnapshot.period]?.noon

    if (!newSnapshot.period || !newSnapshot.assistant) {
      CToast.error({ title: "Vui lòng điền đầy đủ thông tin" })
      return
    }

    // For non-noon periods, require host and goal
    if (!isNoonPeriod) {
      if (!newSnapshot.host || !newSnapshot.goal) {
        CToast.error({ title: "Vui lòng điền đầy đủ thông tin" })
        return
      }

      if (newSnapshot.goal <= 0) {
        CToast.error({ title: "Mục tiêu phải lớn hơn 0" })
        return
      }
    }

    addSnapshot({
      period: newSnapshot.period,
      host: isNoonPeriod ? "" : newSnapshot.host,
      assistant: newSnapshot.assistant,
      goal: isNoonPeriod ? 0 : newSnapshot.goal,
      income: isNoonPeriod ? 0 : newSnapshot.income
    })
  }

  const confirmDeleteSnapshot = (snapshot: Props["snapshots"][0]) => {
    modals.openConfirmModal({
      title: "Xác nhận xóa khung giờ phát sóng",
      children: (
        <Stack gap="sm">
          <Text>Bạn có chắc chắn muốn xóa khung giờ phát sóng này không?</Text>
          <Text size="sm" c="dimmed">
            <strong>Ngày:</strong>{" "}
            {format(new Date(livestreamDate), "dd/MM/yyyy")}
          </Text>
          <Text size="sm" c="dimmed">
            <strong>Khung giờ:</strong> {formatTimeRange(snapshot.period)}
          </Text>
          <Text size="sm" c="red">
            ⚠️ Hành động này không thể hoàn tác.
          </Text>
        </Stack>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        CToast.info({ title: "Chức năng xóa snapshot đang được phát triển" })
      }
    })
  }

  const openAddSnapshotModal = () => {
    if (availablePeriodsForNew.length === 0) {
      CToast.error({ title: "Không có khung giờ nào khả dụng" })
      return
    }
    startAddingNew()
  }

  if (snapshots.length === 0) {
    return (
      <Paper p="md" withBorder radius="md" bg="gray.0">
        <Group justify="space-between" mb="sm">
          <Text fw={500}>Chi tiết khung giờ phát sóng:</Text>
          <Can roles={["admin", "livestream-leader"]}>
            <Button
              variant="light"
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={openAddSnapshotModal}
            >
              Thêm khung giờ
            </Button>
          </Can>
        </Group>

        {isAddingNew ? (
          <Table
            withTableBorder
            withColumnBorders
            highlightOnHover
            verticalSpacing="xs"
            horizontalSpacing="sm"
            style={{ backgroundColor: "white" }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: "15%" }}>Khung giờ</Table.Th>
                <Table.Th style={{ width: "12%" }}>Kênh</Table.Th>
                <Table.Th style={{ width: "18%" }}>Host live</Table.Th>
                <Table.Th style={{ width: "18%" }}>Trợ live</Table.Th>
                <Table.Th style={{ width: "15%" }}>Mục tiêu</Table.Th>
                <Table.Th style={{ width: "15%" }}>Doanh thu</Table.Th>
                <Table.Th style={{ width: "7%" }}>Hành động</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr
                style={{ backgroundColor: "var(--mantine-color-blue-0)" }}
              >
                {/* Khung giờ */}
                <Table.Td>
                  <Select
                    value={newSnapshot.period}
                    onChange={(value) =>
                      setNewSnapshot({
                        ...newSnapshot,
                        period: value || ""
                      })
                    }
                    data={availablePeriodsForNew}
                    size="sm"
                    disabled={isPending}
                    placeholder="Chọn khung giờ"
                  />
                </Table.Td>

                {/* Kênh */}
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {newSnapshot.period
                      ? periodsData?.[newSnapshot.period]?.channel || "-"
                      : "-"}
                  </Text>
                </Table.Td>

                {/* Host */}
                <Table.Td>
                  {newSnapshot.period &&
                  periodsData?.[newSnapshot.period]?.noon ? (
                    <Text size="sm" c="dimmed">
                      -
                    </Text>
                  ) : (
                    <Select
                      value={newSnapshot.host}
                      onChange={(value) =>
                        setNewSnapshot({
                          ...newSnapshot,
                          host: value || ""
                        })
                      }
                      data={employeesData?.employeeOptions || []}
                      size="sm"
                      disabled={isPending}
                      searchable
                      placeholder="Chọn host"
                    />
                  )}
                </Table.Td>

                {/* Assistant */}
                <Table.Td>
                  <Select
                    value={newSnapshot.assistant}
                    onChange={(value) =>
                      setNewSnapshot({
                        ...newSnapshot,
                        assistant: value || ""
                      })
                    }
                    data={employeesData?.employeeOptions || []}
                    size="sm"
                    disabled={isPending}
                    searchable
                    placeholder="Chọn assistant"
                  />
                </Table.Td>

                {/* Mục tiêu */}
                <Table.Td>
                  {newSnapshot.period &&
                  periodsData?.[newSnapshot.period]?.noon ? (
                    <Text size="sm" c="dimmed">
                      -
                    </Text>
                  ) : (
                    <NumberInput
                      value={newSnapshot.goal}
                      onChange={(value) =>
                        setNewSnapshot({
                          ...newSnapshot,
                          goal: Number(value) || 0
                        })
                      }
                      size="sm"
                      min={0}
                      thousandSeparator=","
                      disabled={isPending}
                      placeholder="Nhập mục tiêu"
                    />
                  )}
                </Table.Td>

                {/* Doanh thu */}
                <Table.Td>
                  {newSnapshot.period &&
                  periodsData?.[newSnapshot.period]?.noon ? (
                    <Text size="sm" c="dimmed">
                      -
                    </Text>
                  ) : (
                    <NumberInput
                      value={newSnapshot.income}
                      onChange={(value) =>
                        setNewSnapshot({
                          ...newSnapshot,
                          income: Number(value) || 0
                        })
                      }
                      size="sm"
                      min={0}
                      thousandSeparator=","
                      disabled={isPending}
                      placeholder="Nhập doanh thu"
                    />
                  )}
                </Table.Td>

                {/* Hành động */}
                <Table.Td>
                  <Can roles={["admin", "livestream-leader"]}>
                    <Group gap={4}>
                      <ActionIcon
                        variant="light"
                        color="green"
                        size="sm"
                        onClick={saveNewSnapshot}
                        loading={isPending}
                      >
                        <IconCheck size={14} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="gray"
                        size="sm"
                        onClick={cancelAddingNew}
                        disabled={isPending}
                      >
                        <IconX size={14} />
                      </ActionIcon>
                    </Group>
                  </Can>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        ) : (
          <Text size="sm" c="dimmed" ta="center" py={20}>
            Chưa có khung giờ phát sóng nào.
          </Text>
        )}
      </Paper>
    )
  }

  return (
    <Paper p="md" withBorder radius="md" bg="gray.0">
      <Group justify="space-between" mb="sm">
        <Text fw={500}>Chi tiết khung giờ phát sóng:</Text>
        <Can roles={["admin", "livestream-leader"]}>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconPlus size={14} />}
            onClick={openAddSnapshotModal}
          >
            Thêm khung giờ
          </Button>
        </Can>
      </Group>

      <Table
        withTableBorder
        withColumnBorders
        verticalSpacing="xs"
        horizontalSpacing="sm"
        style={{ backgroundColor: "white" }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: "15%" }}>Khung giờ</Table.Th>
            <Table.Th style={{ width: "12%" }}>Kênh</Table.Th>
            <Table.Th style={{ width: "18%" }}>Host live</Table.Th>
            <Table.Th style={{ width: "18%" }}>Trợ live</Table.Th>
            <Table.Th style={{ width: "15%" }}>Mục tiêu</Table.Th>
            <Table.Th style={{ width: "15%" }}>Doanh thu</Table.Th>
            <Table.Th style={{ width: "7%" }}>Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {snapshots.map((snapshot, index) => {
            const isEditing = editingSnapshot?.id === snapshot._id
            const currentEditingPeriod = isEditing
              ? periodsData?.[editingSnapshot.period]
              : null

            return (
              <Table.Tr
                key={snapshot._id}
                style={{
                  backgroundColor:
                    index % 2 === 0 ? "var(--mantine-color-gray-0)" : "white"
                }}
              >
                {/* Khung giờ */}
                <Table.Td>
                  {isEditing ? (
                    <Select
                      value={editingSnapshot.period}
                      onChange={(value) =>
                        setEditingSnapshot({
                          ...editingSnapshot,
                          period: value || ""
                        })
                      }
                      data={periodsOptions || []}
                      size="sm"
                      disabled={isPending}
                    />
                  ) : (
                    <Group gap="xs">
                      <Badge
                        color={snapshot.period.noon ? "green" : "blue"}
                        size="sm"
                      >
                        {formatTimeRange(snapshot.period)}
                      </Badge>
                    </Group>
                  )}
                </Table.Td>

                {/* Kênh */}
                <Table.Td>
                  <Text size="sm">{snapshot.period.channel}</Text>
                </Table.Td>

                {/* Host */}
                <Table.Td>
                  {snapshot.period.noon ? (
                    <Text size="sm" c="dimmed">
                      -
                    </Text>
                  ) : isEditing ? (
                    currentEditingPeriod?.noon ? (
                      <Text size="sm" c="dimmed">
                        -
                      </Text>
                    ) : (
                      <Select
                        value={editingSnapshot.host}
                        onChange={(value) =>
                          setEditingSnapshot({
                            ...editingSnapshot,
                            host: value || ""
                          })
                        }
                        data={employeesData?.employeeOptions || []}
                        size="sm"
                        disabled={isPending}
                        searchable
                      />
                    )
                  ) : (
                    <Text size="sm">
                      {employeesData?.employeeMap[snapshot.host] || "N/A"}
                    </Text>
                  )}
                </Table.Td>

                {/* Assistant */}
                <Table.Td>
                  {isEditing ? (
                    <Select
                      value={editingSnapshot.assistant}
                      onChange={(value) =>
                        setEditingSnapshot({
                          ...editingSnapshot,
                          assistant: value || ""
                        })
                      }
                      data={employeesData?.employeeOptions || []}
                      size="sm"
                      disabled={isPending}
                      searchable
                    />
                  ) : (
                    <Text size="sm">
                      {employeesData?.employeeMap[snapshot.assistant] || "N/A"}
                    </Text>
                  )}
                </Table.Td>

                {/* Mục tiêu */}
                <Table.Td>
                  {snapshot.period.noon ? (
                    <Text size="sm" c="dimmed">
                      -
                    </Text>
                  ) : isEditing ? (
                    currentEditingPeriod?.noon ? (
                      <Text size="sm" c="dimmed">
                        -
                      </Text>
                    ) : (
                      <NumberInput
                        value={editingSnapshot.goal}
                        onChange={(value) =>
                          setEditingSnapshot({
                            ...editingSnapshot,
                            goal: Number(value) || 0
                          })
                        }
                        size="sm"
                        min={0}
                        thousandSeparator=","
                        disabled={isPending}
                      />
                    )
                  ) : (
                    <Text size="sm" fw={500} c="blue">
                      {fmtCurrency(snapshot.goal)}
                    </Text>
                  )}
                </Table.Td>

                {/* Doanh thu */}
                <Table.Td>
                  {snapshot.period.noon ? (
                    <Text size="sm" c="dimmed">
                      -
                    </Text>
                  ) : isEditing ? (
                    currentEditingPeriod?.noon ? (
                      <Text size="sm" c="dimmed">
                        -
                      </Text>
                    ) : (
                      <NumberInput
                        value={editingSnapshot.income}
                        onChange={(value) =>
                          setEditingSnapshot({
                            ...editingSnapshot,
                            income: Number(value) || 0
                          })
                        }
                        size="sm"
                        min={0}
                        thousandSeparator=","
                        disabled={isPending}
                      />
                    )
                  ) : (
                    <Text size="sm" fw={500} c="green">
                      {snapshot.income ? fmtCurrency(snapshot.income) : "-"}
                    </Text>
                  )}
                </Table.Td>

                {/* Hành động */}
                <Table.Td>
                  <Can roles={["admin", "livestream-leader"]}>
                    <Group gap={4}>
                      {isEditing ? (
                        <>
                          <ActionIcon
                            variant="light"
                            color="green"
                            size="sm"
                            onClick={saveChanges}
                            loading={isPending}
                          >
                            <IconCheck size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="gray"
                            size="sm"
                            onClick={cancelEditing}
                            disabled={isPending}
                          >
                            <IconX size={14} />
                          </ActionIcon>
                        </>
                      ) : (
                        <>
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="sm"
                            onClick={() => startEditing(snapshot)}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="sm"
                            onClick={() => confirmDeleteSnapshot(snapshot)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </>
                      )}
                    </Group>
                  </Can>
                </Table.Td>
              </Table.Tr>
            )
          })}

          {/* Add new snapshot row */}
          {isAddingNew && (
            <Table.Tr
              style={{ backgroundColor: "var(--mantine-color-blue-0)" }}
            >
              {/* Khung giờ */}
              <Table.Td>
                <Select
                  value={newSnapshot.period}
                  onChange={(value) =>
                    setNewSnapshot({
                      ...newSnapshot,
                      period: value || ""
                    })
                  }
                  data={availablePeriodsForNew}
                  size="sm"
                  disabled={isPending}
                  placeholder="Chọn khung giờ"
                />
              </Table.Td>

              {/* Kênh */}
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {newSnapshot.period
                    ? periodsData?.[newSnapshot.period]?.channel || "-"
                    : "-"}
                </Text>
              </Table.Td>

              {/* Host */}
              <Table.Td>
                {newSnapshot.period &&
                periodsData?.[newSnapshot.period]?.noon ? (
                  <Text size="sm" c="dimmed">
                    -
                  </Text>
                ) : (
                  <Select
                    value={newSnapshot.host}
                    onChange={(value) =>
                      setNewSnapshot({
                        ...newSnapshot,
                        host: value || ""
                      })
                    }
                    data={employeesData?.employeeOptions || []}
                    size="sm"
                    disabled={isPending}
                    searchable
                    placeholder="Chọn host"
                  />
                )}
              </Table.Td>

              {/* Assistant */}
              <Table.Td>
                <Select
                  value={newSnapshot.assistant}
                  onChange={(value) =>
                    setNewSnapshot({
                      ...newSnapshot,
                      assistant: value || ""
                    })
                  }
                  data={employeesData?.employeeOptions || []}
                  size="sm"
                  disabled={isPending}
                  searchable
                  placeholder="Chọn assistant"
                />
              </Table.Td>

              {/* Mục tiêu */}
              <Table.Td>
                {newSnapshot.period &&
                periodsData?.[newSnapshot.period]?.noon ? (
                  <Text size="sm" c="dimmed">
                    -
                  </Text>
                ) : (
                  <NumberInput
                    value={newSnapshot.goal}
                    onChange={(value) =>
                      setNewSnapshot({
                        ...newSnapshot,
                        goal: Number(value) || 0
                      })
                    }
                    size="sm"
                    min={0}
                    thousandSeparator=","
                    disabled={isPending}
                    placeholder="Nhập mục tiêu"
                  />
                )}
              </Table.Td>

              {/* Doanh thu */}
              <Table.Td>
                {newSnapshot.period &&
                periodsData?.[newSnapshot.period]?.noon ? (
                  <Text size="sm" c="dimmed">
                    -
                  </Text>
                ) : (
                  <NumberInput
                    value={newSnapshot.income}
                    onChange={(value) =>
                      setNewSnapshot({
                        ...newSnapshot,
                        income: Number(value) || 0
                      })
                    }
                    size="sm"
                    min={0}
                    thousandSeparator=","
                    disabled={isPending}
                    placeholder="Nhập doanh thu"
                  />
                )}
              </Table.Td>

              {/* Hành động */}
              <Table.Td>
                <Can roles={["admin", "livestream-leader"]}>
                  <Group gap={4}>
                    <ActionIcon
                      variant="light"
                      color="green"
                      size="sm"
                      onClick={saveNewSnapshot}
                      loading={isPending}
                    >
                      <IconCheck size={14} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="gray"
                      size="sm"
                      onClick={cancelAddingNew}
                      disabled={isPending}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Group>
                </Can>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Paper>
  )
}
