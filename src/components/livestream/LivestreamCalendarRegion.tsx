import {
  ActionIcon,
  Box,
  Button,
  Group,
  Popover,
  TextInput,
  Paper,
  Select,
  Stack,
  Text
} from "@mantine/core"
import { TimeInput } from "@mantine/dates"
import { modals } from "@mantine/modals"
import { notifications } from "@mantine/notifications"
import {
  IconAlertCircle,
  IconCalendarRepeat,
  IconCircleDashedCheck,
  IconCircleDashedX,
  IconCalculator,
  IconEye,
  IconRefresh,
  IconReport,
  IconTrash,
  IconUserPlus,
  IconUserEdit,
  IconClock
} from "@tabler/icons-react"
import { format } from "date-fns"
import { useEffect, useMemo, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  CreateAltRequestRequest,
  CreateAltRequestResponse,
  GetAltRequestBySnapshotRequest,
  GetAltRequestBySnapshotResponse,
  GetMeResponse,
  AddExternalSnapshotRequest,
  AssignOtherSnapshotRequest,
  UpdateAltRequestStatusRequest,
  UpdateAltRequestStatusResponse,
  UpdateSnapshotAltRequest,
  UpdateSnapshotAltResponse,
  UpdateTimeDirectRequest
} from "../../hooks/models"
import { useLivestreamCore } from "../../hooks/useLivestreamCore"

type LivestreamEmployee = {
  _id: string
  name: string
  roles?: string[]
}

type LivestreamSnapshot = {
  _id: string
  period: {
    _id?: string
    startTime: { hour: number; minute: number }
    endTime: { hour: number; minute: number }
    channel: { _id: string; name: string }
    for: "host" | "assistant"
  }
  assignee?: {
    _id: string
    username: string
    name: string
  }
  altAssignee?: string
  altOtherAssignee?: string
  altNote?: string
  altRequest?: string
  income?: number
  realIncome?: number
  adsCost?: number
  clickRate?: number
  avgViewingDuration?: number
  comments?: number
  ordersNote?: string
  orders?: number
  rating?: string
  salary?: {
    salaryPerHour: number
    bonusPercentage: number
    total?: number
  }
}

type LivestreamData = {
  _id: string
  date: string
  snapshots: LivestreamSnapshot[]
  totalOrders: number
  totalIncome: number
  ads: number
  fixed?: boolean
}

const CreateRequestPopover = ({
  livestreamId,
  snapshot,
  onCreateRequest,
  onRefetch
}: {
  livestreamId: string
  snapshot: LivestreamSnapshot
  onCreateRequest: (
    req: CreateAltRequestRequest
  ) => Promise<{ data: CreateAltRequestResponse }>
  onRefetch: () => void
}) => {
  const [opened, setOpened] = useState(false)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) {
      notifications.show({
        title: "Thiếu thông tin",
        message: "Vui lòng nhập lý do",
        color: "red"
      })
      return
    }

    setLoading(true)
    try {
      await onCreateRequest({
        livestreamId,
        snapshotId: snapshot._id,
        altNote: reason.trim()
      })
      notifications.show({
        title: "Tạo yêu cầu thành công",
        message: "Yêu cầu thay đổi đã được gửi",
        color: "green"
      })
      setOpened(false)
      setReason("")
      onRefetch()
    } catch (error: unknown) {
      notifications.show({
        title: "Tạo yêu cầu thất bại",
        message: getErrorMessage(error) || "Có lỗi xảy ra",
        color: "red"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Popover opened={opened} onChange={setOpened} width={320} withArrow>
      <Popover.Target>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="yellow"
          title="Tạo yêu cầu thay thế"
          styles={{
            root: {
              color: "white",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.14)" }
            }
          }}
          onClick={(e) => {
            e.stopPropagation()
            setOpened(true)
          }}
        >
          <IconAlertCircle size={16} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown onClick={(e) => e.stopPropagation()}>
        <Stack gap="sm">
          <Text size="sm" fw={600}>
            Yêu cầu thay đổi nhân sự
          </Text>
          <TextInput
            placeholder="Nhập lý do..."
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            size="sm"
          />
          <Button size="xs" onClick={handleSubmit} loading={loading}>
            Gửi yêu cầu
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}

const AltRequestInfoPopover = ({
  requestData,
  employees,
  onUpdateRequestStatus,
  onRefetch,
  isAdminOrLeader,
  isCreator
}: {
  requestData: GetAltRequestBySnapshotResponse
  employees: LivestreamEmployee[]
  onUpdateRequestStatus: (
    id: string,
    req: UpdateAltRequestStatusRequest
  ) => Promise<{ data: UpdateAltRequestStatusResponse }>
  onRefetch: () => void
  isAdminOrLeader: boolean
  isCreator: boolean
}) => {
  const queryClient = useQueryClient()
  const [opened, setOpened] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [selectedAlt, setSelectedAlt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isAdminOrLeader && !isCreator) return null

  const handleReject = async () => {
    setLoading(true)
    try {
      await onUpdateRequestStatus(requestData._id, { status: "rejected" })
      notifications.show({
        title: "Đã từ chối",
        message: "Yêu cầu đã được từ chối",
        color: "orange"
      })
      setOpened(false)
      queryClient.invalidateQueries({
        queryKey: [
          "getAltRequestBySnapshot",
          requestData.snapshotId,
          requestData.livestreamId
        ]
      })
      onRefetch()
    } catch (error: unknown) {
      notifications.show({
        title: "Lỗi",
        message: getErrorMessage(error) || "Có lỗi xảy ra",
        color: "red"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmAccept = async () => {
    if (!selectedAlt) {
      notifications.show({
        title: "Thiếu thông tin",
        message: "Vui lòng chọn người thay thế",
        color: "red"
      })
      return
    }

    setLoading(true)
    try {
      await onUpdateRequestStatus(requestData._id, {
        status: "accepted",
        altAssignee: selectedAlt
      })
      notifications.show({
        title: "Đã chấp nhận",
        message: "Yêu cầu đã được chấp nhận",
        color: "green"
      })
      setOpened(false)
      setIsAccepting(false)
      setSelectedAlt(null)
      queryClient.invalidateQueries({
        queryKey: [
          "getAltRequestBySnapshot",
          requestData.snapshotId,
          requestData.livestreamId
        ]
      })
      onRefetch()
    } catch (error: unknown) {
      notifications.show({
        title: "Lỗi",
        message: getErrorMessage(error) || "Có lỗi xảy ra",
        color: "red"
      })
    } finally {
      setLoading(false)
    }
  }

  const iconProps = (() => {
    switch (requestData.status) {
      case "pending":
        return { color: "orange" as const, icon: IconCalendarRepeat }
      case "accepted":
        return { color: "green" as const, icon: IconCircleDashedCheck }
      case "rejected":
        return { color: "red" as const, icon: IconCircleDashedX }
      default:
        return { color: "orange" as const, icon: IconCalendarRepeat }
    }
  })()
  const IconComponent = iconProps.icon

  return (
    <Popover
      opened={opened}
      onChange={(o) => {
        setOpened(o)
        if (!o) {
          setIsAccepting(false)
          setSelectedAlt(null)
        }
      }}
      width={320}
      withArrow
    >
      <Popover.Target>
        <ActionIcon
          size="sm"
          variant="subtle"
          color={iconProps.color}
          title="Xem yêu cầu"
          styles={{
            root: {
              color: "white",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.14)" }
            }
          }}
          onClick={(e) => {
            e.stopPropagation()
            setOpened(true)
          }}
        >
          <IconComponent size={16} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown onClick={(e) => e.stopPropagation()}>
        <Stack gap="sm">
          <Text size="sm" fw={600}>
            Yêu cầu thay đổi
          </Text>

          {requestData.status === "pending" && (
            <>
              <Text size="xs">
                <strong>Lý do:</strong> {requestData.altNote}
              </Text>

              {isAdminOrLeader ? (
                <>
                  {isAccepting ? (
                    <>
                      <Select
                        placeholder="Chọn người thay thế"
                        value={selectedAlt}
                        onChange={setSelectedAlt}
                        data={employees
                          .map((e) => ({ label: e.name, value: e._id }))
                          .filter(
                            (e) => e.value !== requestData.createdBy?._id
                          )}
                        searchable
                        size="sm"
                        comboboxProps={{ withinPortal: false }}
                      />
                      <Group justify="apart">
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => setIsAccepting(false)}
                          disabled={loading}
                        >
                          Hủy
                        </Button>
                        <Button
                          size="xs"
                          color="green"
                          onClick={handleConfirmAccept}
                          loading={loading}
                          disabled={!selectedAlt}
                        >
                          Xác nhận
                        </Button>
                      </Group>
                    </>
                  ) : (
                    <Group justify="apart">
                      <Button
                        size="xs"
                        color="red"
                        variant="light"
                        onClick={handleReject}
                        loading={loading}
                      >
                        Từ chối
                      </Button>
                      <Button
                        size="xs"
                        color="green"
                        onClick={() => setIsAccepting(true)}
                        disabled={loading}
                      >
                        Chấp nhận
                      </Button>
                    </Group>
                  )}
                </>
              ) : (
                <Text size="xs" c="orange">
                  <strong>Trạng thái:</strong> Đang chờ duyệt
                </Text>
              )}
            </>
          )}

          {requestData.status === "accepted" && (
            <>
              <Text size="xs" c="green">
                <strong>Trạng thái:</strong> Đã chấp nhận
              </Text>
              <Text size="xs">
                <strong>Lý do:</strong> {requestData.altNote}
              </Text>
            </>
          )}

          {requestData.status === "rejected" && (
            <>
              <Text size="xs" c="red">
                <strong>Trạng thái:</strong> Đã từ chối
              </Text>
              <Text size="xs">
                <strong>Lý do:</strong> {requestData.altNote}
              </Text>
            </>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}

const UpdateAltPopover = ({
  livestreamId,
  snapshot,
  employees,
  onUpdateAlt,
  onRefetch
}: {
  livestreamId: string
  snapshot: LivestreamSnapshot
  employees: LivestreamEmployee[]
  onUpdateAlt: (
    livestreamId: string,
    snapshotId: string,
    req: UpdateSnapshotAltRequest
  ) => Promise<{ data: UpdateSnapshotAltResponse }>
  onRefetch: () => void
}) => {
  const [opened, setOpened] = useState(false)
  const [selectedAlt, setSelectedAlt] = useState<string | null>(
    snapshot.altAssignee || null
  )
  const [altOtherName, setAltOtherName] = useState(
    snapshot.altOtherAssignee || ""
  )
  const [altNote, setAltNote] = useState(snapshot.altNote || "")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!selectedAlt) return
    if (selectedAlt === "other" && !altOtherName.trim()) {
      notifications.show({
        title: "Thiếu thông tin",
        message: "Vui lòng nhập tên người thay thế",
        color: "red"
      })
      return
    }
    setLoading(true)
    try {
      await onUpdateAlt(livestreamId, snapshot._id, {
        altAssignee: selectedAlt,
        altOtherAssignee:
          selectedAlt === "other" ? altOtherName.trim() : undefined,
        altNote: altNote.trim() || undefined
      })
      notifications.show({
        title: "Cập nhật thành công",
        message: "Đã cập nhật người thay thế",
        color: "green"
      })
      setOpened(false)
      onRefetch()
    } catch (error: unknown) {
      notifications.show({
        title: "Cập nhật thất bại",
        message: getErrorMessage(error) || "Có lỗi xảy ra",
        color: "red"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    setLoading(true)
    try {
      await onUpdateAlt(livestreamId, snapshot._id, {
        altAssignee: undefined,
        altOtherAssignee: undefined,
        altNote: undefined
      })
      notifications.show({
        title: "Xóa thành công",
        message: "Đã xóa người thay thế",
        color: "green"
      })
      setOpened(false)
      onRefetch()
    } catch (error: unknown) {
      notifications.show({
        title: "Xóa thất bại",
        message: getErrorMessage(error) || "Có lỗi xảy ra",
        color: "red"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Popover opened={opened} onChange={setOpened} width={340} withArrow>
      <Popover.Target>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="indigo"
          title="Chỉ định người thay thế"
          styles={{
            root: {
              color: "white",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.14)" }
            }
          }}
          onClick={(e) => {
            e.stopPropagation()
            setOpened(true)
          }}
        >
          <IconUserEdit size={16} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown onClick={(e) => e.stopPropagation()}>
        <Stack gap="sm">
          <Select
            placeholder="Chọn người thay thế"
            value={selectedAlt}
            onChange={setSelectedAlt}
            data={employees
              .map((emp) => ({ label: emp.name, value: emp._id }))
              .filter((emp) => emp.value !== snapshot.assignee?._id)
              .concat({ label: "Khác", value: "other" })}
            searchable
            comboboxProps={{ withinPortal: false }}
          />
          {selectedAlt === "other" && (
            <TextInput
              placeholder="Nhập tên người thay thế"
              value={altOtherName}
              onChange={(e) => setAltOtherName(e.currentTarget.value)}
              size="sm"
            />
          )}
          <TextInput
            placeholder="Lý do (tùy chọn)"
            value={altNote}
            onChange={(e) => setAltNote(e.currentTarget.value)}
            size="sm"
          />
          <Group justify="apart">
            <Button
              size="xs"
              onClick={handleSave}
              loading={loading}
              disabled={!selectedAlt}
            >
              Lưu
            </Button>
            {snapshot.altAssignee && (
              <Button
                size="xs"
                variant="light"
                color="red"
                onClick={handleRemove}
                loading={loading}
                leftSection={<IconTrash size={14} />}
              >
                Xóa
              </Button>
            )}
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}

const EditTimePopover = ({
  dayData,
  snapshot,
  onDelete,
  onSave,
  loadingDelete,
  loadingSave
}: {
  dayData: LivestreamData
  snapshot: LivestreamSnapshot
  onDelete: () => void
  onSave: (req: UpdateTimeDirectRequest) => void
  loadingDelete: boolean
  loadingSave: boolean
}) => {
  const [opened, setOpened] = useState(false)
  const [startStr, setStartStr] = useState(
    formatTimeString(snapshot.period.startTime)
  )
  const [endStr, setEndStr] = useState(
    formatTimeString(snapshot.period.endTime)
  )

  useEffect(() => {
    if (!opened) return
    setStartStr(formatTimeString(snapshot.period.startTime))
    setEndStr(formatTimeString(snapshot.period.endTime))
  }, [opened, snapshot.period.startTime, snapshot.period.endTime])

  return (
    <Popover opened={opened} onChange={setOpened} width={360} withArrow>
      <Popover.Target>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="gray"
          title="Chỉnh giờ / xóa"
          styles={{
            root: {
              color: "white",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.14)" }
            }
          }}
          onClick={(e) => {
            e.stopPropagation()
            setOpened(true)
          }}
        >
          <IconClock size={16} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown onClick={(e) => e.stopPropagation()}>
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            {format(new Date(dayData.date), "dd/MM/yyyy")}
          </Text>
          <Group grow>
            <TimeInput
              label="Bắt đầu"
              value={startStr}
              onChange={(e) => setStartStr(e.currentTarget.value)}
              placeholder="HH:MM"
            />
            <TimeInput
              label="Kết thúc"
              value={endStr}
              onChange={(e) => setEndStr(e.currentTarget.value)}
              placeholder="HH:MM"
            />
          </Group>
          <Group justify="space-between">
            <Button
              size="xs"
              variant="light"
              color="red"
              leftSection={<IconTrash size={14} />}
              loading={loadingDelete}
              onClick={onDelete}
            >
              Xóa
            </Button>
            <Button
              size="xs"
              loading={loadingSave}
              onClick={() => {
                const s = parseTimeString(startStr)
                const e = parseTimeString(endStr)
                const sMin = timeObjToMinutes(s)
                const eMin = timeObjToMinutes(e)
                if (eMin <= sMin) {
                  notifications.show({
                    title: "Giờ không hợp lệ",
                    message: "Giờ kết thúc phải sau giờ bắt đầu",
                    color: "red"
                  })
                  return
                }
                onSave({ startTime: s, endTime: e })
                setOpened(false)
              }}
            >
              Lưu giờ
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}

interface LivestreamCalendarRegionProps {
  role: "host" | "assistant"
  weekDays: Date[]
  employeesData: LivestreamEmployee[]
  livestreamData: LivestreamData[]
  onAssignEmployee: (params: {
    livestreamId: string
    snapshotId?: string
    periodId?: string
    userId: string
    role: "host" | "assistant"
  }) => void
  onUnassignEmployee: (params: {
    livestreamId: string
    snapshotId: string
  }) => void
  onOpenReport?: (livestreamId: string, snapshot: LivestreamSnapshot) => void
  isWeekFixed: boolean
  currentUser: GetMeResponse | undefined
  onUpdateAlt: (
    livestreamId: string,
    snapshotId: string,
    req: UpdateSnapshotAltRequest
  ) => Promise<{ data: UpdateSnapshotAltResponse }>
  onCreateRequest: (
    req: CreateAltRequestRequest
  ) => Promise<{ data: CreateAltRequestResponse }>
  onUpdateRequestStatus: (
    id: string,
    req: UpdateAltRequestStatusRequest
  ) => Promise<{ data: UpdateAltRequestStatusResponse }>
  onGetRequest: (
    req: GetAltRequestBySnapshotRequest
  ) => Promise<{ data: GetAltRequestBySnapshotResponse }>
  onRefetch: () => void
  onCalculateDailySalary?: (date: Date, baseOnRealIncome: boolean) => void
  isCalculatingSalary?: boolean
  onCalculateIncome?: (date: Date) => void
  isCalculatingIncome?: boolean
  hideEditButtons?: boolean
}

const pad2 = (n: number) => n.toString().padStart(2, "0")

const timeObjToMinutes = (t: { hour: number; minute: number }) =>
  t.hour * 60 + t.minute

const minutesToTimeObj = (minutesTotal: number) => {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, minutesTotal))
  return { hour: Math.floor(clamped / 60), minute: clamped % 60 }
}

const parseTimeString = (value: string) => {
  const [h, m] = value.split(":")
  return {
    hour: Math.max(0, Math.min(23, Number(h) || 0)),
    minute: Math.max(0, Math.min(59, Number(m) || 0))
  }
}

const formatTimeString = (t: { hour: number; minute: number }) =>
  `${pad2(t.hour)}:${pad2(t.minute)}`

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v))

const snapMinutes = (minutes: number, step: number) =>
  Math.round(minutes / step) * step

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: unknown }).response
    if (typeof response === "object" && response && "data" in response) {
      const data = (response as { data?: unknown }).data
      if (typeof data === "object" && data && "message" in data) {
        const message = (data as { message?: unknown }).message
        if (typeof message === "string") return message
      }
    }
  }
  if (error instanceof Error) return error.message
  return undefined
}

const SnapshotActions = ({
  dayData,
  snapshot,
  employeesData,
  currentUser,
  role,
  hideEditButtons,
  isWeekFixed,
  isAdminOrLeader,
  canEditSnapshot,
  onGetRequest,
  onCreateRequest,
  onUpdateRequestStatus,
  onUpdateAlt,
  onUnassignEmployee,
  onAssignEmployee,
  onAssignOther,
  onRefetch,
  onOpenReport,
  onDeleteSnapshot,
  onUpdateTime,
  loadingDeleteSnapshot,
  loadingUpdateTime,
  loadingAssignOther
}: {
  dayData: LivestreamData
  snapshot: LivestreamSnapshot
  employeesData: LivestreamEmployee[]
  currentUser: GetMeResponse | undefined
  role: "host" | "assistant"
  hideEditButtons: boolean
  isWeekFixed: boolean
  isAdminOrLeader: boolean
  canEditSnapshot: (snapshot: LivestreamSnapshot) => boolean
  onGetRequest: (
    req: GetAltRequestBySnapshotRequest
  ) => Promise<{ data: GetAltRequestBySnapshotResponse }>
  onCreateRequest: (
    req: CreateAltRequestRequest
  ) => Promise<{ data: CreateAltRequestResponse }>
  onUpdateRequestStatus: (
    id: string,
    req: UpdateAltRequestStatusRequest
  ) => Promise<{ data: UpdateAltRequestStatusResponse }>
  onUpdateAlt: (
    livestreamId: string,
    snapshotId: string,
    req: UpdateSnapshotAltRequest
  ) => Promise<{ data: UpdateSnapshotAltResponse }>
  onUnassignEmployee: (params: {
    livestreamId: string
    snapshotId: string
  }) => void
  onAssignEmployee: (params: {
    livestreamId: string
    snapshotId?: string
    periodId?: string
    userId: string
    role: "host" | "assistant"
  }) => void
  onAssignOther: (
    livestreamId: string,
    snapshotId: string,
    req: AssignOtherSnapshotRequest
  ) => void
  onRefetch: () => void
  onOpenReport?: (livestreamId: string, snapshot: LivestreamSnapshot) => void
  onDeleteSnapshot: (livestreamId: string, snapshotId: string) => void
  onUpdateTime: (
    livestreamId: string,
    snapshotId: string,
    req: UpdateTimeDirectRequest
  ) => void
  loadingDeleteSnapshot: boolean
  loadingUpdateTime: boolean
  loadingAssignOther: boolean
}) => {
  const hasAltAssignee = !!snapshot.altAssignee
  const altEmployee = employeesData.find((e) => e._id === snapshot.altAssignee)
  const displayName = hasAltAssignee
    ? snapshot.altAssignee === "other"
      ? snapshot.altOtherAssignee || "Khác"
      : altEmployee?.name
    : snapshot.assignee?.name
  const isUserLivestreamAst = currentUser?.roles?.includes("livestream-ast")

  const { data: requestData } = useQuery({
    queryKey: ["getAltRequestBySnapshot", snapshot._id, dayData._id],
    queryFn: () =>
      onGetRequest({
        livestreamId: dayData._id,
        snapshotId: snapshot._id
      }),
    enabled: !!dayData?._id && !!snapshot?._id
  })

  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(
    snapshot.assignee?._id || null
  )
  const [otherAssigneeName, setOtherAssigneeName] = useState("")
  const [otherAssigneeNote, setOtherAssigneeNote] = useState("")

  useEffect(() => {
    if (!assignOpen) return
    setSelectedAssignee(snapshot.assignee?._id || null)
    setOtherAssigneeName("")
    setOtherAssigneeNote("")
  }, [assignOpen, snapshot.assignee?._id])

  return (
    <Group gap={4} justify="space-between" wrap="nowrap">
      <Text size="xs" fw={600} c="white" lineClamp={1}>
        {displayName || "Chưa phân"}
      </Text>

      <Group gap={4} wrap="nowrap">
        {!hideEditButtons &&
          isAdminOrLeader &&
          !snapshot.assignee &&
          !snapshot.altAssignee && (
            <Popover
              opened={assignOpen}
              onChange={setAssignOpen}
              position="bottom-start"
              withArrow
              shadow="md"
              withinPortal={false}
              closeOnClickOutside={false}
              closeOnEscape={false}
            >
              <Popover.Target>
                <Box
                  onMouseDownCapture={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                  onClickCapture={(e) => {
                    e.stopPropagation()
                    setAssignOpen((v) => !v)
                  }}
                >
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="indigo"
                    title="Phân công nhân sự"
                    styles={{
                      root: {
                        color: "white",
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.14)" }
                      }
                    }}
                  >
                    <IconUserPlus size={16} />
                  </ActionIcon>
                </Box>
              </Popover.Target>
              <Popover.Dropdown
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                style={{ minWidth: 320 }}
              >
                <Stack gap="xs">
                  <Text size="sm" fw={600}>
                    Phân công nhân sự
                  </Text>
                  <Select
                    placeholder="Chọn nhân sự"
                    value={selectedAssignee}
                    onChange={setSelectedAssignee}
                    data={employeesData
                      .map((e) => ({
                        label: e.name,
                        value: e._id
                      }))
                      .concat(
                        snapshot.assignee
                          ? []
                          : [{ label: "Khác", value: "other" }]
                      )}
                    searchable
                    comboboxProps={{
                      withinPortal: false,
                      position: "bottom-start"
                    }}
                  />
                  {selectedAssignee === "other" && (
                    <Stack gap="xs">
                      <TextInput
                        label="Tên người khác"
                        placeholder="Nhập tên..."
                        value={otherAssigneeName}
                        onChange={(e) =>
                          setOtherAssigneeName(e.currentTarget.value)
                        }
                        size="sm"
                      />
                      <TextInput
                        label="Ghi chú"
                        placeholder="Nhập ghi chú..."
                        value={otherAssigneeNote}
                        onChange={(e) =>
                          setOtherAssigneeNote(e.currentTarget.value)
                        }
                        size="sm"
                      />
                    </Stack>
                  )}
                  <Group justify="space-between">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setAssignOpen(false)}
                    >
                      Đóng
                    </Button>
                    <Group>
                      {snapshot.assignee && (
                        <Button
                          size="xs"
                          variant="light"
                          color="red"
                          leftSection={<IconTrash size={14} />}
                          onClick={() => {
                            onUnassignEmployee({
                              livestreamId: dayData._id,
                              snapshotId: snapshot._id
                            })
                            setAssignOpen(false)
                          }}
                        >
                          Bỏ
                        </Button>
                      )}
                      <Button
                        size="xs"
                        loading={
                          selectedAssignee === "other"
                            ? loadingAssignOther
                            : false
                        }
                        disabled={
                          !selectedAssignee ||
                          (selectedAssignee === "other" &&
                            !otherAssigneeName.trim())
                        }
                        onClick={() => {
                          if (!selectedAssignee) return
                          if (selectedAssignee === "other") {
                            onAssignOther(dayData._id, snapshot._id, {
                              altOtherAssignee: otherAssigneeName.trim(),
                              altNote: otherAssigneeNote.trim()
                            })
                            setAssignOpen(false)
                            return
                          }
                          onAssignEmployee({
                            livestreamId: dayData._id,
                            snapshotId: snapshot._id,
                            periodId: snapshot.period._id,
                            userId: selectedAssignee,
                            role
                          })
                          setAssignOpen(false)
                        }}
                      >
                        Lưu
                      </Button>
                    </Group>
                  </Group>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          )}

        {!hideEditButtons &&
          isWeekFixed &&
          snapshot.assignee &&
          canEditSnapshot(snapshot) &&
          !hasAltAssignee &&
          !requestData?.data && (
            <CreateRequestPopover
              livestreamId={dayData._id}
              snapshot={snapshot}
              onCreateRequest={onCreateRequest}
              onRefetch={onRefetch}
            />
          )}

        {!hideEditButtons && requestData?.data && (
          <AltRequestInfoPopover
            requestData={requestData.data}
            employees={employeesData}
            onUpdateRequestStatus={onUpdateRequestStatus}
            onRefetch={onRefetch}
            isAdminOrLeader={isAdminOrLeader}
            isCreator={canEditSnapshot(snapshot)}
          />
        )}

        {!hideEditButtons && snapshot.assignee && (
          <EditTimePopover
            dayData={dayData}
            snapshot={snapshot}
            loadingDelete={loadingDeleteSnapshot}
            loadingSave={loadingUpdateTime}
            onDelete={() => onDeleteSnapshot(dayData._id, snapshot._id)}
            onSave={(req) => onUpdateTime(dayData._id, snapshot._id, req)}
          />
        )}

        {!hideEditButtons &&
          isWeekFixed &&
          isAdminOrLeader &&
          (!!snapshot.assignee || !!snapshot.altAssignee) && (
            <UpdateAltPopover
              livestreamId={dayData._id}
              snapshot={snapshot}
              employees={employeesData}
              onUpdateAlt={onUpdateAlt}
              onRefetch={onRefetch}
            />
          )}

        {onOpenReport &&
          dayData &&
          isUserLivestreamAst &&
          role === "host" &&
          snapshot.assignee && (
            <ActionIcon
              size="sm"
              variant="subtle"
              color={
                snapshot.income !== undefined &&
                snapshot.clickRate !== undefined &&
                snapshot.avgViewingDuration !== undefined &&
                snapshot.comments !== undefined &&
                snapshot.ordersNote !== undefined
                  ? "blue"
                  : "gray"
              }
              styles={{
                root: {
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.14)" }
                }
              }}
              onClick={(e) => {
                e.stopPropagation()
                onOpenReport(dayData._id, snapshot)
              }}
            >
              {snapshot.income !== undefined &&
              snapshot.clickRate !== undefined &&
              snapshot.avgViewingDuration !== undefined &&
              snapshot.comments !== undefined &&
              snapshot.ordersNote !== undefined ? (
                <IconEye size={16} />
              ) : (
                <IconReport size={16} />
              )}
            </ActionIcon>
          )}
        {onOpenReport &&
          dayData &&
          isUserLivestreamAst &&
          role === "assistant" &&
          snapshot.assignee && (
            <ActionIcon
              size="sm"
              variant="subtle"
              color="blue"
              styles={{
                root: {
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.14)" }
                }
              }}
              onClick={(e) => {
                e.stopPropagation()
                onOpenReport(dayData._id, snapshot)
              }}
            >
              <IconEye size={16} />
            </ActionIcon>
          )}
      </Group>
    </Group>
  )
}

export const LivestreamCalendarRegion = ({
  role,
  weekDays,
  employeesData,
  livestreamData,
  onAssignEmployee,
  onUnassignEmployee,
  onOpenReport,
  isWeekFixed,
  currentUser,
  onUpdateAlt,
  onCreateRequest,
  onUpdateRequestStatus,
  onGetRequest,
  onRefetch,
  onCalculateDailySalary,
  isCalculatingSalary = false,
  onCalculateIncome,
  isCalculatingIncome = false,
  hideEditButtons = false
}: LivestreamCalendarRegionProps) => {
  const {
    addExternalSnapshot,
    deleteSnapshot,
    updateTimeDirect,
    assignOtherSnapshot
  } = useLivestreamCore()

  const roleLabel = role === "host" ? "Host" : "Trợ live"
  const viewportHeightPx = 800
  const initialMinPxPerMinute = Math.max(0.75, viewportHeightPx / (24 * 60))
  const [pxPerMinute, setPxPerMinute] = useState(() => initialMinPxPerMinute)
  const [now, setNow] = useState(() => new Date())
  const snapStepMinutes = 5

  const isAdminOrLeader = useMemo(() => {
    if (!currentUser) return false
    return (
      currentUser.roles?.includes("admin") ||
      currentUser.roles?.includes("livestream-leader")
    )
  }, [currentUser])

  const canEditSnapshot = (snapshot: LivestreamSnapshot) => {
    if (!currentUser) return false
    return snapshot.assignee?._id === currentUser._id
  }

  const timeRange = useMemo(() => {
    return { startMin: 0, endMin: 24 * 60 }
  }, [])

  const hours = useMemo(() => {
    const out: number[] = []
    for (let m = timeRange.startMin; m < timeRange.endMin; m += 60) out.push(m)
    return out
  }, [timeRange])

  const viewportStartMin = 8 * 60
  // const viewportEndMin = 16 * 60
  const timelineHeight = (timeRange.endMin - timeRange.startMin) * pxPerMinute
  const timelineScrollRef = useRef<HTMLDivElement | null>(null)
  const minPxPerMinute = Math.max(0.75, viewportHeightPx / (24 * 60))
  const maxPxPerMinute = 6
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  useEffect(() => {
    const el = timelineScrollRef.current
    if (!el) return

    const isMac =
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPad|iPod/.test(navigator.platform)

    const onWheel = (event: WheelEvent) => {
      if (isMac ? !event.metaKey : !event.ctrlKey) return
      event.preventDefault()

      const rect = el.getBoundingClientRect()
      const pointerY = clamp(event.clientY - rect.top, 0, el.clientHeight)
      const minutesAtPointer =
        timeRange.startMin + (el.scrollTop + pointerY) / pxPerMinute

      const direction = event.deltaY > 0 ? -1 : 1
      const next = clamp(
        pxPerMinute + direction * 0.25,
        minPxPerMinute,
        maxPxPerMinute
      )
      if (next === pxPerMinute) return

      setPxPerMinute(next)

      requestAnimationFrame(() => {
        const newScrollTop =
          (minutesAtPointer - timeRange.startMin) * next - pointerY
        el.scrollTop = clamp(
          newScrollTop,
          0,
          Math.max(0, el.scrollHeight - el.clientHeight)
        )
      })
    }

    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [pxPerMinute, timeRange.startMin])

  useEffect(() => {
    const el = timelineScrollRef.current
    if (!el) return
    el.scrollTop = clamp(
      (viewportStartMin - timeRange.startMin) * pxPerMinute,
      0,
      Math.max(0, timelineHeight - viewportHeightPx)
    )
  }, [pxPerMinute, timeRange.startMin, timelineHeight])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  const { mutate: mutateAddSnapshot } = useMutation({
    mutationFn: async (payload: {
      livestreamId: string
      req: AddExternalSnapshotRequest
    }) => addExternalSnapshot(payload.livestreamId, payload.req),
    onSuccess: () => {
      notifications.show({
        title: "Thêm ca thành công",
        message: "Đã thêm snapshot",
        color: "green"
      })
      onRefetch()
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "Thêm ca thất bại",
        message: getErrorMessage(error) || "Có lỗi xảy ra",
        color: "red"
      })
    }
  })

  const { mutate: mutateDeleteSnapshot, isPending: deletingSnapshot } =
    useMutation({
      mutationFn: (payload: { livestreamId: string; snapshotId: string }) =>
        deleteSnapshot(payload),
      onSuccess: () => {
        notifications.show({
          title: "Xóa ca thành công",
          message: "Đã xóa snapshot",
          color: "green"
        })
        onRefetch()
      },
      onError: (error: unknown) => {
        notifications.show({
          title: "Xóa ca thất bại",
          message: getErrorMessage(error) || "Có lỗi xảy ra",
          color: "red"
        })
      }
    })

  const { mutate: mutateUpdateTime, isPending: updatingTime } = useMutation({
    mutationFn: (payload: {
      livestreamId: string
      snapshotId: string
      req: UpdateTimeDirectRequest
    }) =>
      updateTimeDirect(payload.livestreamId, payload.snapshotId, payload.req),
    onSuccess: () => {
      notifications.show({
        title: "Cập nhật giờ thành công",
        message: "Đã cập nhật thời gian snapshot",
        color: "green"
      })
      onRefetch()
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "Cập nhật giờ thất bại",
        message: getErrorMessage(error) || "Có lỗi xảy ra",
        color: "red"
      })
    }
  })

  const {
    mutate: mutateAssignOtherSnapshot,
    isPending: assigningOtherSnapshot
  } = useMutation({
    mutationFn: (payload: {
      livestreamId: string
      snapshotId: string
      req: AssignOtherSnapshotRequest
    }) =>
      assignOtherSnapshot(
        payload.livestreamId,
        payload.snapshotId,
        payload.req
      ),
    onSuccess: () => {
      notifications.show({
        title: "Phân công thành công",
        message: "Đã phân công người khác cho snapshot",
        color: "green"
      })
      onRefetch()
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "Phân công thất bại",
        message: getErrorMessage(error) || "Có lỗi xảy ra",
        color: "red"
      })
    }
  })

  const defaultNewSnapshotMinutes = 60

  const dragStateRef = useRef<{
    livestreamId: string
    snapshotId: string
    startMin: number
    endMin: number
    handle: "top" | "bottom"
    dayData: LivestreamData
  } | null>(null)

  const [dragPreview, setDragPreview] = useState<{
    snapshotId: string
    startMin: number
    endMin: number
  } | null>(null)
  const dragPreviewRef = useRef<typeof dragPreview>(null)
  const [hoveredSnapshotId, setHoveredSnapshotId] = useState<string | null>(
    null
  )

  const onMouseMoveResize = (event: MouseEvent) => {
    const st = dragStateRef.current
    if (!st) return
    const dayEl = document.querySelector<HTMLElement>(
      `[data-day-surface="${st.dayData._id}"]`
    )
    if (!dayEl) return
    const rect = dayEl.getBoundingClientRect()
    const y = clamp(event.clientY - rect.top, 0, rect.height)
    const minutes = timeRange.startMin + y / pxPerMinute
    const snapped = snapMinutes(minutes, snapStepMinutes)
    const minDuration = 5
    if (st.handle === "top") {
      const newStart = clamp(
        snapped,
        timeRange.startMin,
        st.endMin - minDuration
      )
      const next = {
        snapshotId: st.snapshotId,
        startMin: newStart,
        endMin: st.endMin
      }
      dragPreviewRef.current = next
      setDragPreview(next)
    } else {
      const newEnd = clamp(snapped, st.startMin + minDuration, timeRange.endMin)
      const next = {
        snapshotId: st.snapshotId,
        startMin: st.startMin,
        endMin: newEnd
      }
      dragPreviewRef.current = next
      setDragPreview(next)
    }
  }

  const onMouseUpResize = () => {
    const st = dragStateRef.current
    if (!st) return
    const preview = dragPreviewRef.current
    dragStateRef.current = null
    window.removeEventListener("mousemove", onMouseMoveResize)
    window.removeEventListener("mouseup", onMouseUpResize)
    if (!preview || preview.snapshotId !== st.snapshotId) {
      setDragPreview(null)
      return
    }
    dragPreviewRef.current = null
    setDragPreview(null)
    const start = minutesToTimeObj(Math.round(preview.startMin))
    const end = minutesToTimeObj(Math.round(preview.endMin))
    mutateUpdateTime({
      livestreamId: st.livestreamId,
      snapshotId: st.snapshotId,
      req: { startTime: start, endTime: end }
    })

    window.setTimeout(() => {
      suppressSnapshotClickRef.current = false
    }, 0)
  }

  const suppressSnapshotClickRef = useRef(false)

  const beginResize = (opts: {
    dayData: LivestreamData
    snapshot: LivestreamSnapshot
    handle: "top" | "bottom"
  }) => {
    suppressSnapshotClickRef.current = true
    const startMin = timeObjToMinutes(opts.snapshot.period.startTime)
    const endMin = timeObjToMinutes(opts.snapshot.period.endTime)
    dragStateRef.current = {
      livestreamId: opts.dayData._id,
      snapshotId: opts.snapshot._id,
      startMin,
      endMin,
      handle: opts.handle,
      dayData: opts.dayData
    }
    const next = { snapshotId: opts.snapshot._id, startMin, endMin }
    dragPreviewRef.current = next
    setDragPreview(next)
    window.addEventListener("mousemove", onMouseMoveResize)
    window.addEventListener("mouseup", onMouseUpResize)
  }

  const getDayData = (day: Date) =>
    livestreamData.find((ls) => {
      const d = new Date(ls.date)
      return (
        d.getFullYear() === day.getFullYear() &&
        d.getMonth() === day.getMonth() &&
        d.getDate() === day.getDate()
      )
    })

  return (
    <Stack gap="sm">
      <Text fw={600} size="md">
        {roleLabel}
      </Text>
      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        <Box style={{ overflowX: "auto" }}>
          <Box style={{ minWidth: 980 }}>
            <Group wrap="nowrap" gap={0} align="stretch">
              <Box
                style={{
                  width: 64,
                  flex: "0 0 64px",
                  borderRight: "1px solid #e9ecef",
                  background: "#f8f9fa"
                }}
              >
                <Box
                  style={{ height: 44, borderBottom: "1px solid #e9ecef" }}
                />
              </Box>

              {weekDays.map((day) => {
                const dayData = getDayData(day)
                const dayKey = day.toISOString()

                return (
                  <Box
                    key={dayKey}
                    style={{
                      flex: "1 0 180px",
                      borderRight: "1px solid #e9ecef"
                    }}
                  >
                    <Box
                      style={{
                        height: 44,
                        padding: "8px 10px",
                        borderBottom: "1px solid #e9ecef",
                        background: "#f8f9fa"
                      }}
                    >
                      <Text size="xs" fw={700}>
                        {format(day, "EEE dd/MM")}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {dayData?.fixed ? "Đã khóa" : "Chưa khóa"}
                      </Text>
                    </Box>
                  </Box>
                )
              })}
            </Group>

            {(!!onCalculateDailySalary ||
              (role === "host" && !!onCalculateIncome)) && (
              <Group wrap="nowrap" gap={0} align="stretch">
                <Box
                  style={{
                    width: 64,
                    flex: "0 0 64px",
                    borderRight: "1px solid #e9ecef",
                    background: "#fff"
                  }}
                />
                {weekDays.map((day) => {
                  const dayData = getDayData(day)
                  const hasCalculatedSalary = dayData?.snapshots.some(
                    (s) => s.salary?.total && s.salary.total > 0
                  )

                  return (
                    <Box
                      key={`actions-${day.toISOString()}`}
                      style={{
                        flex: "1 0 180px",
                        borderRight: "1px solid #e9ecef",
                        background: "#fff",
                        padding: "6px 10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6
                      }}
                    >
                      {onCalculateDailySalary && (
                        <>
                          <Button
                            size="xs"
                            color={hasCalculatedSalary ? "yellow" : "indigo"}
                            variant="light"
                            leftSection={
                              hasCalculatedSalary ? (
                                <IconRefresh size={14} />
                              ) : (
                                <IconCalculator size={14} />
                              )
                            }
                            onClick={() => onCalculateDailySalary(day, true)}
                            loading={isCalculatingSalary}
                            fullWidth
                          >
                            {hasCalculatedSalary ? "Tính lại" : "Tính lương"}
                          </Button>
                          {isAdminOrLeader && (
                            <Button
                              size="xs"
                              color="grape"
                              variant="light"
                              leftSection={<IconCalculator size={14} />}
                              onClick={() => onCalculateDailySalary(day, false)}
                              loading={isCalculatingSalary}
                              fullWidth
                            >
                              Tính lương (DT gốc)
                            </Button>
                          )}
                        </>
                      )}

                      {role === "host" && onCalculateIncome && (
                        <Button
                          size="xs"
                          color="teal"
                          variant="light"
                          leftSection={<IconCalculator size={14} />}
                          onClick={() => onCalculateIncome(day)}
                          loading={isCalculatingIncome}
                          fullWidth
                        >
                          Tính DT thực
                        </Button>
                      )}
                    </Box>
                  )
                })}
              </Group>
            )}

            <Box
              ref={timelineScrollRef}
              style={{
                height: viewportHeightPx,
                overflowY: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none"
              }}
              className="hide-scrollbar"
            >
              <Group wrap="nowrap" gap={0} align="stretch">
                <Box
                  style={{
                    width: 64,
                    flex: "0 0 64px",
                    borderRight: "1px solid #e9ecef",
                    background: "#f8f9fa"
                  }}
                >
                  <Box style={{ position: "relative", height: timelineHeight }}>
                    {hours.map((m) => (
                      <Box
                        key={m}
                        style={{
                          position: "absolute",
                          top: (m - timeRange.startMin) * pxPerMinute - 8,
                          left: 8,
                          fontSize: 11,
                          color: "#868e96"
                        }}
                      >
                        {pad2(Math.floor(m / 60))}:00
                      </Box>
                    ))}
                  </Box>
                </Box>

                {weekDays.map((day) => {
                  const dayData = getDayData(day)
                  const snapshots =
                    dayData?.snapshots.filter((s) => s.period.for === role) ||
                    []
                  const dayKey = day.toISOString()
                  const isToday =
                    format(day, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")

                  return (
                    <Box
                      key={dayKey}
                      style={{
                        flex: "1 0 180px",
                        borderRight: "1px solid #e9ecef"
                      }}
                    >
                      <Box
                        data-day-surface={dayData?._id || ""}
                        style={{
                          position: "relative",
                          height: timelineHeight,
                          background: `linear-gradient(#e9ecef 1px, transparent 1px) 0 0 / 100% ${60 * pxPerMinute}px`
                        }}
                        onClick={(e) => {
                          if (!dayData || hideEditButtons) return
                          const rect = (
                            e.currentTarget as HTMLElement
                          ).getBoundingClientRect()
                          const y = e.clientY - rect.top
                          const rawMin = timeRange.startMin + y / pxPerMinute
                          const snapped = snapMinutes(rawMin, snapStepMinutes)
                          const clickedMin = clamp(snapped, 0, 24 * 60 - 1)
                          const startMin = clickedMin
                          const endMin = clamp(
                            clickedMin + defaultNewSnapshotMinutes,
                            startMin + snapStepMinutes,
                            24 * 60 - 1
                          )
                          mutateAddSnapshot({
                            livestreamId: dayData._id,
                            req: {
                              startTime: minutesToTimeObj(startMin),
                              endTime: minutesToTimeObj(endMin),
                              forRole: role
                            }
                          })
                        }}
                      >
                        {isToday && (
                          <Box
                            style={{
                              position: "absolute",
                              left: 0,
                              right: 0,
                              top:
                                (nowMinutes - timeRange.startMin) * pxPerMinute,
                              height: 2,
                              background: "var(--mantine-color-red-6)",
                              zIndex: 4,
                              pointerEvents: "none"
                            }}
                          />
                        )}
                        {snapshots.map((snapshot) => {
                          const startMin = timeObjToMinutes(
                            snapshot.period.startTime
                          )
                          const endMin = timeObjToMinutes(
                            snapshot.period.endTime
                          )
                          const preview =
                            dragPreview?.snapshotId === snapshot._id
                              ? dragPreview
                              : null
                          const visualGapPx = 2
                          const top =
                            ((preview?.startMin ?? startMin) -
                              timeRange.startMin) *
                              pxPerMinute +
                            visualGapPx / 2
                          const height =
                            ((preview?.endMin ?? endMin) -
                              (preview?.startMin ?? startMin)) *
                              pxPerMinute -
                            visualGapPx
                          const isResizable =
                            !hideEditButtons &&
                            !!dayData &&
                            (canEditSnapshot(snapshot) || isAdminOrLeader)

                          return (
                            <Box
                              key={snapshot._id}
                              style={{
                                position: "absolute",
                                top,
                                left: 6,
                                right: 6,
                                height: Math.max(18, height),
                                backgroundColor: snapshot.altAssignee
                                  ? "var(--mantine-color-orange-5)"
                                  : role === "host"
                                    ? "var(--mantine-color-indigo-5)"
                                    : "var(--mantine-color-green-5)",
                                border: "1px solid rgba(255,255,255,0.22)",
                                borderLeft: "3px solid rgba(255,255,255,0.55)",
                                borderRadius: 16,
                                padding: "2px 10px",
                                cursor: hideEditButtons ? "default" : "pointer",
                                userSelect: "none",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.12)"
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (suppressSnapshotClickRef.current) return
                                if (!dayData || hideEditButtons) return
                                if (onOpenReport)
                                  onOpenReport(dayData._id, snapshot)
                              }}
                              onMouseEnter={() =>
                                setHoveredSnapshotId(snapshot._id)
                              }
                              onMouseLeave={() =>
                                setHoveredSnapshotId((prev) =>
                                  prev === snapshot._id ? null : prev
                                )
                              }
                            >
                              {isResizable &&
                                hoveredSnapshotId === snapshot._id && (
                                  <Box
                                    style={{
                                      position: "absolute",
                                      left: 0,
                                      right: 0,
                                      top: 0,
                                      height: 10,
                                      cursor: "ns-resize",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center"
                                    }}
                                    onMouseDown={(e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                      if (!dayData) return
                                      beginResize({
                                        dayData,
                                        snapshot,
                                        handle: "top"
                                      })
                                    }}
                                  >
                                    <Box
                                      style={{
                                        width: 26,
                                        height: 2,
                                        borderRadius: 2,
                                        background: "rgba(255,255,255,0.5)"
                                      }}
                                    />
                                  </Box>
                                )}
                              {isResizable &&
                                hoveredSnapshotId === snapshot._id && (
                                  <Box
                                    style={{
                                      position: "absolute",
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      height: 10,
                                      cursor: "ns-resize",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center"
                                    }}
                                    onMouseDown={(e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                      if (!dayData) return
                                      beginResize({
                                        dayData,
                                        snapshot,
                                        handle: "bottom"
                                      })
                                    }}
                                  >
                                    <Box
                                      style={{
                                        width: 26,
                                        height: 2,
                                        borderRadius: 2,
                                        background: "rgba(255,255,255,0.5)"
                                      }}
                                    />
                                  </Box>
                                )}

                              <Text
                                size="xs"
                                c="white"
                                style={{ opacity: 0.9 }}
                              >
                                {formatTimeString(
                                  minutesToTimeObj(
                                    Math.round(preview?.startMin ?? startMin)
                                  )
                                )}
                                -
                                {formatTimeString(
                                  minutesToTimeObj(
                                    Math.round(preview?.endMin ?? endMin)
                                  )
                                )}
                              </Text>
                              {dayData && (
                                <>
                                  <SnapshotActions
                                    dayData={dayData}
                                    snapshot={snapshot}
                                    employeesData={employeesData}
                                    currentUser={currentUser}
                                    role={role}
                                    hideEditButtons={hideEditButtons}
                                    isWeekFixed={isWeekFixed}
                                    isAdminOrLeader={isAdminOrLeader}
                                    canEditSnapshot={canEditSnapshot}
                                    onGetRequest={onGetRequest}
                                    onCreateRequest={onCreateRequest}
                                    onUpdateRequestStatus={
                                      onUpdateRequestStatus
                                    }
                                    onUpdateAlt={onUpdateAlt}
                                    onUnassignEmployee={onUnassignEmployee}
                                    onAssignEmployee={onAssignEmployee}
                                    onAssignOther={(
                                      livestreamId,
                                      snapshotId,
                                      req
                                    ) =>
                                      mutateAssignOtherSnapshot({
                                        livestreamId,
                                        snapshotId,
                                        req
                                      })
                                    }
                                    onRefetch={onRefetch}
                                    onOpenReport={onOpenReport}
                                    loadingDeleteSnapshot={deletingSnapshot}
                                    loadingUpdateTime={updatingTime}
                                    loadingAssignOther={assigningOtherSnapshot}
                                    onDeleteSnapshot={(
                                      livestreamId,
                                      snapshotId
                                    ) =>
                                      mutateDeleteSnapshot({
                                        livestreamId,
                                        snapshotId
                                      })
                                    }
                                    onUpdateTime={(
                                      livestreamId,
                                      snapshotId,
                                      req
                                    ) =>
                                      mutateUpdateTime({
                                        livestreamId,
                                        snapshotId,
                                        req
                                      })
                                    }
                                  />

                                  {!hideEditButtons && isAdminOrLeader && (
                                    <ActionIcon
                                      size="sm"
                                      variant="subtle"
                                      color="red"
                                      title="Xóa snapshot"
                                      styles={{
                                        root: {
                                          position: "absolute",
                                          right: 6,
                                          bottom: 4,
                                          color: "white",
                                          "&:hover": {
                                            backgroundColor:
                                              "rgba(255,255,255,0.14)"
                                          }
                                        }
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        modals.openConfirmModal({
                                          title: <b>Xóa snapshot</b>,
                                          children: (
                                            <Text size="sm">
                                              Bạn có chắc muốn xóa snapshot này
                                              không?
                                            </Text>
                                          ),
                                          centered: true,
                                          labels: {
                                            confirm: "Xóa",
                                            cancel: "Hủy"
                                          },
                                          confirmProps: { color: "red" },
                                          onConfirm: () =>
                                            mutateDeleteSnapshot({
                                              livestreamId: dayData._id,
                                              snapshotId: snapshot._id
                                            })
                                        })
                                      }}
                                    >
                                      <IconTrash size={16} />
                                    </ActionIcon>
                                  )}
                                </>
                              )}
                            </Box>
                          )
                        })}
                      </Box>
                    </Box>
                  )
                })}
              </Group>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Stack>
  )
}
