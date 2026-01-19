import {
  Button,
  Box,
  Stack,
  Text,
  ActionIcon,
  Group,
  Popover,
  TextInput,
  Select,
  Tooltip
} from "@mantine/core"
import {
  IconEye,
  IconReport,
  IconAlertCircle,
  IconUserEdit,
  IconTrash,
  IconCircleDashedCheck,
  IconCircleDashedX,
  IconCalendarRepeat,
  IconRefresh,
  IconCalculator,
  IconFold
} from "@tabler/icons-react"
import { format, parseISO } from "date-fns"
import { vi } from "date-fns/locale"
import { useMemo, useState } from "react"
import { notifications } from "@mantine/notifications"
import type {
  UpdateSnapshotAltRequest,
  UpdateSnapshotAltResponse,
  CreateAltRequestRequest,
  CreateAltRequestResponse,
  UpdateAltRequestsRequest,
  UpdateAltRequestsResponse,
  DeleteAltRequestRequest,
  UpdateAltRequestStatusRequest,
  UpdateAltRequestStatusResponse,
  GetAltRequestBySnapshotRequest,
  GetAltRequestBySnapshotResponse,
  GetMeResponse
} from "../../hooks/models"
import { useLivestreamAltRequests } from "../../hooks/useLivestreamAltRequests"
import { useQuery, useQueryClient } from "@tanstack/react-query"

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
  altAssignee?: string // This is the ID of alt assignee
  altOtherAssignee?: string // Name when altAssignee is "other"
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

// Helper function to check if a snapshot can be merged (doesn't have required fields)
const canMergeSnapshot = (
  snapshot: LivestreamSnapshot | undefined
): boolean => {
  if (!snapshot) return false

  const requiredFields = [
    "income",
    "realIncome",
    "adsCost",
    "clickRate",
    "avgViewingDuration",
    "comments",
    "orders"
  ]

  return !requiredFields.some(
    (field) => !!snapshot[field as keyof LivestreamSnapshot]
  )
}

// Merge Button Component
const MergeSnapshotsButton = ({
  snapshot1,
  snapshot2,
  livestreamId,
  onMerge
}: {
  snapshot1: LivestreamSnapshot | undefined
  snapshot2: LivestreamSnapshot | undefined
  livestreamId: string
  onMerge: (
    livestreamId: string,
    snapshotId1: string,
    snapshotId2: string
  ) => Promise<void>
}) => {
  const [loading, setLoading] = useState(false)

  if (!snapshot1 || !snapshot2) return null

  // Only show if both snapshots can be merged
  const canMerge = canMergeSnapshot(snapshot1) && canMergeSnapshot(snapshot2)

  if (!canMerge) return null

  const handleMerge = async () => {
    setLoading(true)
    await onMerge(livestreamId, snapshot1._id, snapshot2._id)
  }

  return (
    <Tooltip label="Gộp 2 ca" withArrow position="top">
      <ActionIcon
        size="sm"
        variant="light"
        color="indigo"
        onClick={handleMerge}
        loading={loading}
      >
        <IconFold size={14} />
      </ActionIcon>
    </Tooltip>
  )
}

// Alt Assignee Info Component - show on hover with original assignee and reason
const AltAssigneeInfo = ({
  snapshot,
  altEmployeeName,
  onGetRequest,
  livestreamId
}: {
  snapshot: LivestreamSnapshot
  altEmployeeName: string
  onGetRequest: (
    req: GetAltRequestBySnapshotRequest
  ) => Promise<{ data: GetAltRequestBySnapshotResponse }>
  livestreamId: string
}) => {
  const [altRequestData, setAltRequestData] = useState<{
    originalAssigneeName: string
    reason: string
  } | null>(null)

  const fetchAltRequestData = async () => {
    try {
      await onGetRequest({
        livestreamId,
        snapshotId: snapshot._id
      })
      setAltRequestData({
        originalAssigneeName: snapshot.assignee?.name || "",
        reason: snapshot.altNote || ""
      })
    } catch (error) {
      console.error("Error fetching alt request:", error)
    }
  }

  return (
    <Popover width={300} position="bottom" withArrow>
      <Popover.Target>
        <div onMouseEnter={fetchAltRequestData} style={{ cursor: "pointer" }}>
          <Text size="sm" fw={600} c="orange">
            {altEmployeeName}
          </Text>
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        {altRequestData ? (
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              Thông tin thay thế
            </Text>
            <Text size="xs">
              <strong>Người ban đầu:</strong>{" "}
              {altRequestData.originalAssigneeName}
            </Text>
            <Text size="xs">
              <strong>Lý do:</strong> {altRequestData.reason}
            </Text>
          </Stack>
        ) : (
          <Text size="sm">Đang tải...</Text>
        )}
      </Popover.Dropdown>
    </Popover>
  )
}

// Schedule Cell Component - handles hover state for UpdateAlt button
const ScheduleCell = ({
  snapshot,
  nextSnapshot,
  dayData,
  hasAltAssignee,
  altEmployee,
  displayName,
  roleColor,
  role,
  currentUser,
  isLivestreamFixed,
  isAdminOrLeader,
  canEditSnapshot,
  employeesData,
  onUpdateAlt,
  onCreateRequest,
  onGetRequest,
  onUpdateRequestStatus,
  onRefetch,
  onOpenReport,
  onCalculateDailySalary,
  onMergeSnapshots,
  canMergeWithNext = false,
  hideEditButtons = false
}: {
  snapshot?: LivestreamSnapshot
  nextSnapshot?: LivestreamSnapshot
  dayData?: LivestreamData
  hasAltAssignee: boolean
  altEmployee: LivestreamEmployee | null | undefined
  displayName: string | undefined
  roleColor: string
  role: "host" | "assistant"
  currentUser: GetMeResponse | undefined
  isLivestreamFixed: boolean
  isAdminOrLeader: boolean
  canEditSnapshot: (snapshot: LivestreamSnapshot) => boolean
  employeesData: LivestreamEmployee[]
  onUpdateAlt: (
    livestreamId: string,
    snapshotId: string,
    req: UpdateSnapshotAltRequest
  ) => Promise<{ data: UpdateSnapshotAltResponse }>
  onCreateRequest: (
    req: CreateAltRequestRequest
  ) => Promise<{ data: CreateAltRequestResponse }>
  onGetRequest: (
    req: GetAltRequestBySnapshotRequest
  ) => Promise<{ data: GetAltRequestBySnapshotResponse }>
  onUpdateRequestStatus: (
    id: string,
    req: UpdateAltRequestStatusRequest
  ) => Promise<{ data: UpdateAltRequestStatusResponse }>
  onRefetch: () => void
  onOpenReport?: (livestreamid: string, snapshot: LivestreamSnapshot) => void
  onCalculateDailySalary?: (date: Date) => void
  onMergeSnapshots: (
    livestreamId: string,
    snapshotId1: string,
    snapshotId2: string
  ) => Promise<void>
  canMergeWithNext?: boolean
  hideEditButtons?: boolean
}) => {
  const { getAltRequestBySnapshot } = useLivestreamAltRequests()
  const [isHovering, setIsHovering] = useState(false)
  const [isHoveringBottomBorder, setIsHoveringBottomBorder] = useState(false)

  const { data: requestData } = useQuery({
    queryKey: ["getAltRequestBySnapshot", snapshot?._id, dayData?._id],
    queryFn: () =>
      getAltRequestBySnapshot({
        livestreamId: dayData?._id!,
        snapshotId: snapshot?._id!
      }),
    enabled: !!snapshot && !!dayData
  })

  const showUpdate =
    isHovering &&
    isLivestreamFixed &&
    isAdminOrLeader &&
    !hasAltAssignee &&
    !!dayData

  // Admin update visibility when hovering (also applies when altAssignee exists)
  const showUpdateAdmin =
    isHovering && isLivestreamFixed && isAdminOrLeader && !!dayData

  const isUserLivestreamAst = currentUser?.roles?.includes("livestream-ast")

  const handleMouseEnter = (e: React.MouseEvent<HTMLTableCellElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    // Check if mouse is within 20px of bottom border
    if (y > rect.height - 20) {
      setIsHoveringBottomBorder(true)
    } else {
      setIsHovering(true)
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setIsHoveringBottomBorder(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLTableCellElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    // Check if mouse is within 20px of bottom border
    if (y > rect.height - 20) {
      setIsHoveringBottomBorder(true)
    } else {
      setIsHoveringBottomBorder(false)
    }
  }

  return (
    <td
      rowSpan={canMergeWithNext ? 2 : 1}
      style={{
        border: "1px solid #e0e0e0",
        padding: "8px",
        verticalAlign: canMergeWithNext ? "top" : "middle",
        backgroundColor: hasAltAssignee
          ? "rgba(255, 193, 7, 0.15)"
          : snapshot?.assignee
            ? role === "host"
              ? "rgba(34, 139, 230, 0.08)"
              : "rgba(64, 192, 87, 0.08)"
            : "#fff",
        position: "relative"
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {snapshot?.assignee ? (
        <Group justify="space-between" wrap="nowrap" gap="xs">
          {/* Show alt assignee name with popover if has altAssignee */}
          {hasAltAssignee ? (
            <Group align="center" gap={2}>
              <AltAssigneeInfo
                snapshot={snapshot}
                altEmployeeName={altEmployee?.name || displayName || "Khác"}
                onGetRequest={onGetRequest}
                livestreamId={dayData!._id}
              />

              {/* show UpdateAltPopover for admins only when hovering */}
              {!hideEditButtons && isAdminOrLeader && (
                <div
                  style={{
                    visibility: showUpdateAdmin ? "visible" : "hidden",
                    opacity: showUpdateAdmin ? 1 : 0,
                    pointerEvents: showUpdateAdmin ? "auto" : "none",
                    transition: "opacity 120ms ease, visibility 120ms",
                    marginLeft: 2
                  }}
                >
                  <UpdateAltPopover
                    livestreamId={dayData?._id!}
                    snapshot={snapshot}
                    employees={employeesData}
                    onUpdateAlt={onUpdateAlt}
                    onRefetch={onRefetch}
                    onCalculateDailySalary={onCalculateDailySalary}
                  />
                </div>
              )}
            </Group>
          ) : (
            <Group align="center" gap={2}>
              <Text size="sm" fw={600} c={roleColor}>
                {displayName}
              </Text>

              <div
                style={{
                  visibility: showUpdate ? "visible" : "hidden",
                  opacity: showUpdate ? 1 : 0,
                  pointerEvents: showUpdate ? "auto" : "none",
                  transition: "opacity 120ms ease, visibility 120ms",
                  marginLeft: 2
                }}
              >
                {!hideEditButtons && (
                  <UpdateAltPopover
                    livestreamId={dayData?._id!}
                    snapshot={snapshot}
                    employees={employeesData}
                    onUpdateAlt={onUpdateAlt}
                    onRefetch={onRefetch}
                  />
                )}
              </div>
            </Group>
          )}

          <Group gap={4}>
            {/* Show create request icon for assignee when week is fixed */}
            {!hideEditButtons &&
              isLivestreamFixed &&
              canEditSnapshot(snapshot) &&
              !hasAltAssignee &&
              !requestData?.data &&
              dayData && (
                <CreateRequestPopover
                  livestreamId={dayData._id}
                  snapshot={snapshot}
                  employees={employeesData}
                  onCreateRequest={onCreateRequest}
                  onRefetch={onRefetch}
                />
              )}

            <Group gap={4}>
              {/* Show alt request info if request exists */}
              {!hideEditButtons && requestData?.data && dayData && snapshot && (
                <AltRequestInfo
                  requestData={requestData.data}
                  employees={employeesData}
                  onUpdateRequestStatus={onUpdateRequestStatus}
                  onRefetch={onRefetch}
                  isAdminOrLeader={isAdminOrLeader}
                  isCreator={canEditSnapshot(snapshot)}
                />
              )}
              {/* Show report button for host with conditions */}
              {onOpenReport &&
                dayData &&
                isUserLivestreamAst &&
                role === "host" && (
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
                    onClick={() => onOpenReport(dayData._id, snapshot)}
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
              {/* Show eye button for assistant - always visible */}
              {onOpenReport &&
                dayData &&
                isUserLivestreamAst &&
                role === "assistant" && (
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="blue"
                    onClick={() => onOpenReport(dayData._id, snapshot)}
                  >
                    <IconEye size={16} />
                  </ActionIcon>
                )}
            </Group>
          </Group>
        </Group>
      ) : (
        <Text size="xs" c="dimmed" fs="italic">
          Chưa phân
        </Text>
      )}

      {/* Merge button on bottom border hover */}
      {isHoveringBottomBorder && snapshot && dayData && (
        <div
          style={{
            position: "absolute",
            bottom: -12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            display: "flex",
            alignItems: "center"
          }}
        >
          <MergeSnapshotsButton
            snapshot1={snapshot}
            snapshot2={nextSnapshot}
            livestreamId={dayData._id}
            onMerge={onMergeSnapshots}
          />
        </div>
      )}
    </td>
  )
}

// Update Alt Popover Component - for admin/leader to set alt assignee
const UpdateAltPopover = ({
  livestreamId,
  snapshot,
  employees,
  onUpdateAlt,
  onRefetch,
  onCalculateDailySalary
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
  onCalculateDailySalary?: (date: Date) => void
}) => {
  const [opened, setOpened] = useState(false)
  const [selectedAlt, setSelectedAlt] = useState<string | null>(
    snapshot.altAssignee || null
  )
  const [altNote, setAltNote] = useState<string>(snapshot.altNote || "")
  const [altOtherName, setAltOtherName] = useState<string>(
    snapshot.altOtherAssignee || ""
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedAlt) return

    // Validate that if "other" is selected, a name must be provided
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
        altNote: altNote?.trim() || undefined
      })
      notifications.show({
        title: "Cập nhật thành công",
        message: "Đã cập nhật người thay thế",
        color: "green"
      })
      setOpened(false)
      onRefetch()
    } catch (error: any) {
      notifications.show({
        title: "Cập nhật thất bại",
        message: error?.response?.data?.message || "Có lỗi xảy ra",
        color: "red"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAlt = async () => {
    setLoading(true)
    try {
      await onUpdateAlt(livestreamId, snapshot._id, {
        altAssignee: undefined as any,
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
    } catch (error: any) {
      notifications.show({
        title: "Xóa thất bại",
        message: error?.response?.data?.message || "Có lỗi xảy ra",
        color: "red"
      })
    } finally {
      setLoading(false)
    }
  }

  if (onCalculateDailySalary) {
    return null
  }

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      width={300}
      position="bottom"
      withArrow
    >
      <Popover.Target>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="indigo"
          onClick={() => setOpened(true)}
        >
          <IconUserEdit size={16} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="sm">
          <Text size="sm" fw={600}>
            Chỉ định người thay thế
          </Text>
          <Select
            placeholder="Chọn người thay thế"
            value={selectedAlt}
            onChange={setSelectedAlt}
            data={employees
              .map((e) => ({ label: e.name, value: e._id }))
              .filter((e) => e.value !== snapshot.assignee?._id)
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
              onClick={handleSubmit}
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
                onClick={handleRemoveAlt}
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

// Alt Request Info Component - show request details with accept/reject
const AltRequestInfo = ({
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

  // Only show to admin/leader or creator
  if (!isAdminOrLeader && !isCreator) {
    return null
  }

  const handleAccept = () => {
    setIsAccepting(true)
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      // Use livestreamId and snapshotId to construct the request ID
      const requestId = requestData._id
      await onUpdateRequestStatus(requestId, {
        status: "rejected"
      })
      notifications.show({
        title: "Đã từ chối",
        message: "Yêu cầu đã được từ chối",
        color: "orange"
      })
      setOpened(false)
      // Invalidate the query to refetch updated data
      queryClient.invalidateQueries({
        queryKey: [
          "getAltRequestBySnapshot",
          requestData.snapshotId,
          requestData.livestreamId
        ]
      })
      onRefetch()
    } catch (error: any) {
      notifications.show({
        title: "Lỗi",
        message: error?.response?.data?.message || "Có lỗi xảy ra",
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
      // Use livestreamId and snapshotId to construct the request ID
      const requestId = requestData._id
      await onUpdateRequestStatus(requestId, {
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
      // Invalidate the query to refetch updated data
      queryClient.invalidateQueries({
        queryKey: [
          "getAltRequestBySnapshot",
          requestData.snapshotId,
          requestData.livestreamId
        ]
      })
      onRefetch()
    } catch (error: any) {
      notifications.show({
        title: "Lỗi",
        message: error?.response?.data?.message || "Có lỗi xảy ra",
        color: "red"
      })
    } finally {
      setLoading(false)
    }
  }

  // Determine icon color and type based on status
  const getIconProps = () => {
    switch (requestData.status) {
      case "pending":
        return { color: "orange", icon: IconCalendarRepeat }
      case "accepted":
        return { color: "green", icon: IconCircleDashedCheck }
      case "rejected":
        return { color: "red", icon: IconCircleDashedX }
      default:
        return { color: "orange", icon: IconCalendarRepeat }
    }
  }

  const iconProps = getIconProps()
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
      width={300}
      position="bottom"
      withArrow
    >
      <Popover.Target>
        <ActionIcon
          size="sm"
          variant="subtle"
          color={iconProps.color}
          onClick={() => setOpened(true)}
        >
          <IconComponent size={16} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="sm">
          <Text size="sm" fw={600}>
            Yêu cầu thay đổi
          </Text>

          {/* Show content based on status and user role */}
          {requestData.status === "pending" && (
            <>
              <Text size="xs">
                <strong>Lý do:</strong> {requestData.altNote}
              </Text>

              {/* Show accept/reject buttons only for admin/leader */}
              {isAdminOrLeader && (
                <>
                  {isAccepting ? (
                    <>
                      <Select
                        placeholder="Chọn người thay thế"
                        value={selectedAlt}
                        onChange={setSelectedAlt}
                        data={employees
                          .map((e) => ({
                            label: e.name,
                            value: e._id
                          }))
                          .filter((e) => e.value !== requestData.createdBy._id)}
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
                        onClick={handleAccept}
                        disabled={loading}
                      >
                        Chấp nhận
                      </Button>
                    </Group>
                  )}
                </>
              )}

              {/* Show status only for creator (read-only) */}
              {!isAdminOrLeader && isCreator && (
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

// Create Request Popover Component - for assignee to create alt request
const CreateRequestPopover = ({
  livestreamId,
  snapshot,
  onCreateRequest,
  onRefetch
}: {
  livestreamId: string
  snapshot: LivestreamSnapshot
  employees: LivestreamEmployee[]
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
        livestreamId: livestreamId,
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
    } catch (error: any) {
      notifications.show({
        title: "Tạo yêu cầu thất bại",
        message: error?.response?.data?.message || "Có lỗi xảy ra",
        color: "red"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      width={300}
      position="bottom"
      withArrow
    >
      <Popover.Target>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="yellow"
          onClick={() => setOpened(true)}
        >
          <IconAlertCircle size={16} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
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

interface LivestreamCalendarTableProps {
  role: "host" | "assistant"
  weekDays: Date[]
  employeesData: LivestreamEmployee[]
  livestreamData: LivestreamData[]
  onAssignEmployee: (params: {
    livestreamId: string
    snapshotId?: string
    periodId: string
    userId: string
    role: "host" | "assistant"
  }) => void
  onUnassignEmployee: (params: {
    livestreamId: string
    snapshotId: string
  }) => void
  viewMode: "assign" | "schedule"
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
  onUpdateRequest: (
    id: string,
    req: UpdateAltRequestsRequest
  ) => Promise<{ data: UpdateAltRequestsResponse }>
  onDeleteRequest: (req: DeleteAltRequestRequest) => Promise<{ data: never }>
  onUpdateRequestStatus: (
    id: string,
    req: UpdateAltRequestStatusRequest
  ) => Promise<{ data: UpdateAltRequestStatusResponse }>
  onGetRequest: (
    req: GetAltRequestBySnapshotRequest
  ) => Promise<{ data: GetAltRequestBySnapshotResponse }>
  onRefetch: () => void
  onMergeSnapshots?: (
    livestreamId: string,
    snapshotId1: string,
    snapshotId2: string
  ) => Promise<void>
  onCalculateDailySalary?: (date: Date) => void
  isCalculatingSalary?: boolean
  onCalculateIncome?: (date: Date) => void
  isCalculatingIncome?: boolean
  hideEditButtons?: boolean // Hide UpdateAlt and AltRequest buttons
}

export const LivestreamCalendarTable = ({
  role,
  weekDays,
  employeesData,
  livestreamData,
  onAssignEmployee,
  onUnassignEmployee,
  viewMode,
  onOpenReport,
  isWeekFixed,
  currentUser,
  onUpdateAlt,
  onCreateRequest,
  onGetRequest,
  onUpdateRequestStatus,
  onRefetch,
  onMergeSnapshots,
  onCalculateDailySalary,
  isCalculatingSalary,
  onCalculateIncome,
  isCalculatingIncome,
  hideEditButtons = false
}: LivestreamCalendarTableProps) => {
  const formatTimeRange = (
    start: { hour: number; minute: number },
    end: { hour: number; minute: number }
  ) => {
    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${pad(start.hour)}:${pad(start.minute)}-${pad(end.hour)}:${pad(end.minute)}`
  }

  // Check if user is admin or livestream-leader
  const isAdminOrLeader = useMemo(() => {
    if (!currentUser) return false
    return (
      currentUser.roles?.includes("admin") ||
      currentUser.roles?.includes("livestream-leader")
    )
  }, [currentUser])

  // Check if user can edit snapshot (is assignee)
  const canEditSnapshot = (snapshot: LivestreamSnapshot) => {
    if (!currentUser) return false
    return snapshot.assignee?._id === currentUser._id
  }

  // Collect unique periods from snapshots that match the role
  const uniquePeriods =
    livestreamData?.flatMap((ls) =>
      ls.snapshots.filter((s) => s.period.for === role).map((s) => s.period)
    ) || []

  // Remove duplicates by period._id
  const periods = uniquePeriods.filter(
    (period, index, self) =>
      index === self.findIndex((p) => p._id === period._id)
  )

  // Sort periods by start time
  const sortedPeriods = periods.sort((a, b) => {
    if (a.startTime.hour !== b.startTime.hour) {
      return a.startTime.hour - b.startTime.hour
    }
    return a.startTime.minute - b.startTime.minute
  })

  const roleLabel = role === "host" ? "Host" : "Trợ live"
  const roleColor = role === "host" ? "blue" : "green"

  // Don't render if there are no periods for this role
  if (sortedPeriods.length === 0) {
    return null
  }

  // Render for Schedule View Mode
  if (viewMode === "schedule") {
    return (
      <div>
        <Text fw={600} size="md" mb="md">
          {roleLabel}
        </Text>
        <Box style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #e0e0e0"
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    border: "1px solid #e0e0e0",
                    padding: "12px",
                    backgroundColor: "#f8f9fa",
                    position: "sticky",
                    left: 0,
                    zIndex: 10,
                    minWidth: "100px"
                  }}
                >
                  <Text size="xs" fw={600}>
                    Khung giờ
                  </Text>
                </th>
                {weekDays.map((day) => (
                  <th
                    key={day.toISOString()}
                    style={{
                      border: "1px solid #e0e0e0",
                      padding: "8px",
                      backgroundColor: "#f8f9fa",
                      width: "13%"
                    }}
                  >
                    <div>
                      <Text fw={600} size="sm">
                        {format(day, "EEEE", { locale: vi })}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {format(day, "dd/MM/yyyy")}
                      </Text>
                      {(() => {
                        const dayData = livestreamData?.find(
                          (ls) =>
                            format(parseISO(ls.date), "yyyy-MM-dd") ===
                            format(day, "yyyy-MM-dd")
                        )
                        const hasRealIncome = dayData?.snapshots.some(
                          (s) =>
                            s.realIncome !== undefined && s.realIncome !== null
                        )
                        return hasRealIncome ? (
                          <Text size="xs" c="teal" fw={600} mt={4}>
                            Đã tính DT thực
                          </Text>
                        ) : null
                      })()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedPeriods.map((period, periodIndex) => {
                // Check if this row is already merged (merged into the previous row)
                const prevPeriod =
                  periodIndex > 0 ? sortedPeriods[periodIndex - 1] : null
                const isMergedRow = prevPeriod
                  ? livestreamData?.some((dayData) => {
                      const currentSnapshot = dayData.snapshots.find(
                        (s) => s.period._id === period._id
                      )
                      const prevSnapshot = dayData.snapshots.find(
                        (s) => s.period._id === prevPeriod._id
                      )
                      // Check if both have same assignee and are mergeable
                      return (
                        currentSnapshot &&
                        prevSnapshot &&
                        currentSnapshot.assignee?._id ===
                          prevSnapshot.assignee?._id &&
                        canMergeSnapshot(currentSnapshot) &&
                        canMergeSnapshot(prevSnapshot)
                      )
                    })
                  : false

                // Skip rendering this row if it's merged into previous row
                if (isMergedRow) {
                  return null
                }

                return (
                  <tr key={period._id}>
                    <td
                      style={{
                        border: "1px solid #e0e0e0",
                        padding: "8px",
                        backgroundColor: "#fff",
                        position: "sticky",
                        left: 0,
                        zIndex: 5
                      }}
                    >
                      <Text size="xs" fw={600}>
                        {formatTimeRange(period.startTime, period.endTime)}
                      </Text>
                    </td>
                    {weekDays.map((day) => {
                      const dayData = livestreamData?.find(
                        (ls) =>
                          format(parseISO(ls.date), "yyyy-MM-dd") ===
                          format(day, "yyyy-MM-dd")
                      )

                      const snapshot = dayData?.snapshots.find(
                        (s) => s.period._id === period._id
                      )

                      // Get next period snapshot for merge button
                      const nextPeriodIndex = sortedPeriods.findIndex(
                        (p) => p._id === period._id
                      )
                      const nextPeriod =
                        nextPeriodIndex !== -1 &&
                        nextPeriodIndex < sortedPeriods.length - 1
                          ? sortedPeriods[nextPeriodIndex + 1]
                          : null
                      const nextSnapshot = nextPeriod
                        ? dayData?.snapshots.find(
                            (s) => s.period._id === nextPeriod._id
                          )
                        : undefined

                      // Check if next snapshot is mergeable with current
                      const canMergeWithNext =
                        snapshot &&
                        nextSnapshot &&
                        snapshot.assignee?._id === nextSnapshot.assignee?._id &&
                        canMergeSnapshot(snapshot) &&
                        canMergeSnapshot(nextSnapshot)

                      // Check if snapshot has alt assignee (yellow background)
                      const hasAltAssignee = !!snapshot?.altAssignee
                      const altEmployee = hasAltAssignee
                        ? snapshot.altAssignee === "other"
                          ? null // Don't look up employee if it's "other"
                          : employeesData.find(
                              (e) => e._id === snapshot.altAssignee
                            )
                        : null
                      const displayName =
                        snapshot?.altAssignee === "other"
                          ? snapshot.altOtherAssignee || "Khác"
                          : altEmployee
                            ? altEmployee.name
                            : snapshot?.assignee?.name

                      // Check if this livestream is fixed
                      const isLivestreamFixed = dayData?.fixed === true

                      return (
                        <ScheduleCell
                          key={`${period._id}-${day.toISOString()}`}
                          snapshot={snapshot}
                          nextSnapshot={nextSnapshot}
                          dayData={dayData}
                          hasAltAssignee={hasAltAssignee}
                          altEmployee={altEmployee}
                          displayName={displayName}
                          roleColor={roleColor}
                          role={role}
                          currentUser={currentUser}
                          isLivestreamFixed={isLivestreamFixed}
                          isAdminOrLeader={isAdminOrLeader}
                          canEditSnapshot={canEditSnapshot}
                          employeesData={employeesData}
                          onUpdateAlt={onUpdateAlt}
                          onCreateRequest={onCreateRequest}
                          onGetRequest={onGetRequest}
                          onUpdateRequestStatus={onUpdateRequestStatus}
                          onRefetch={onRefetch}
                          onOpenReport={onOpenReport}
                          onCalculateDailySalary={onCalculateDailySalary}
                          onMergeSnapshots={
                            onMergeSnapshots || (() => Promise.resolve())
                          }
                          hideEditButtons={hideEditButtons}
                          canMergeWithNext={canMergeWithNext}
                        />
                      )
                    })}
                  </tr>
                )
              })}
              {/* Add Salary Calculation Button Row for both Host and Assistant */}
              {onCalculateDailySalary && (
                <tr>
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      padding: "8px",
                      backgroundColor: "#fff",
                      position: "sticky",
                      left: 0,
                      zIndex: 5
                    }}
                  ></td>
                  {weekDays.map((day) => {
                    const dayData = livestreamData?.find(
                      (ls) =>
                        format(parseISO(ls.date), "yyyy-MM-dd") ===
                        format(day, "yyyy-MM-dd")
                    )

                    // Check if any snapshot for this day has calculated salary
                    const hasCalculatedSalary = dayData?.snapshots.some(
                      (s) => s.salary?.total && s.salary.total > 0
                    )

                    return (
                      <td
                        key={`salary-${day.toISOString()}`}
                        style={{
                          border: "1px solid #e0e0e0",
                          padding: "8px",
                          verticalAlign: "middle",
                          textAlign: "center"
                        }}
                      >
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
                          onClick={() => onCalculateDailySalary(day)}
                          loading={isCalculatingSalary}
                          fullWidth
                        >
                          {hasCalculatedSalary ? "Tính lại" : "Tính lương"}
                        </Button>
                      </td>
                    )
                  })}
                </tr>
              )}
              {/* Add Calculate Income Button Row for Host */}
              {role === "host" && onCalculateIncome && (
                <tr>
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      padding: "8px",
                      backgroundColor: "#fff",
                      position: "sticky",
                      left: 0,
                      zIndex: 5
                    }}
                  ></td>
                  {weekDays.map((day) => {
                    return (
                      <td
                        key={`income-${day.toISOString()}`}
                        style={{
                          border: "1px solid #e0e0e0",
                          padding: "8px",
                          verticalAlign: "middle",
                          textAlign: "center"
                        }}
                      >
                        <Button
                          size="xs"
                          color="teal"
                          variant="light"
                          leftSection={<IconCalculator size={14} />}
                          onClick={() => onCalculateIncome?.(day)}
                          loading={isCalculatingIncome}
                          fullWidth
                        >
                          Tính DT thực
                        </Button>
                      </td>
                    )
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </div>
    )
  }

  // Render for Assign View Mode (default)
  return (
    <div>
      <Text fw={600} size="md" mb="md">
        {roleLabel}
      </Text>
      <Box style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #e0e0e0"
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #e0e0e0",
                  padding: "12px",
                  backgroundColor: "#f8f9fa",
                  position: "sticky",
                  left: 0,
                  zIndex: 10,
                  minWidth: "150px"
                }}
              >
                Nhân viên
              </th>
              {weekDays.map((day) => (
                <th
                  key={day.toISOString()}
                  style={{
                    border: "1px solid #e0e0e0",
                    padding: "12px",
                    backgroundColor: "#f8f9fa",
                    width: "13%"
                  }}
                >
                  <div>
                    <Text fw={600} size="sm">
                      {format(day, "EEEE", { locale: vi })}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {format(day, "dd/MM/yyyy")}
                    </Text>
                    {(() => {
                      const dayData = livestreamData?.find(
                        (ls) =>
                          format(parseISO(ls.date), "yyyy-MM-dd") ===
                          format(day, "yyyy-MM-dd")
                      )
                      const hasRealIncome = dayData?.snapshots.some(
                        (s) =>
                          s.realIncome !== undefined && s.realIncome !== null
                      )
                      return hasRealIncome ? (
                        <Text size="xs" c="teal" fw={600} mt={4}>
                          Đã tính DT thực
                        </Text>
                      ) : null
                    })()}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employeesData?.map((employee) => (
              <tr key={employee._id}>
                <td
                  style={{
                    border: "1px solid #e0e0e0",
                    padding: "12px",
                    backgroundColor: "#fff",
                    position: "sticky",
                    left: 0,
                    zIndex: 5
                  }}
                >
                  <Text fw={500} size="sm">
                    {employee.name}
                  </Text>
                </td>
                {weekDays.map((day) => {
                  const dayData = livestreamData?.find(
                    (ls) =>
                      format(parseISO(ls.date), "yyyy-MM-dd") ===
                      format(day, "yyyy-MM-dd")
                  )

                  return (
                    <td
                      key={`${employee._id}-${day.toISOString()}`}
                      style={{
                        border: "1px solid #e0e0e0",
                        padding: "8px",
                        verticalAlign: "top"
                      }}
                    >
                      <Stack gap={4}>
                        {sortedPeriods?.map((period) => {
                          const snapshot = dayData?.snapshots.find(
                            (s) => s.period._id === period._id
                          )

                          const isAssigned =
                            snapshot?.assignee &&
                            snapshot?.assignee._id === employee._id

                          return (
                            <Button
                              key={period._id}
                              size="xs"
                              variant={isAssigned ? "filled" : "light"}
                              color={isAssigned ? roleColor : "gray"}
                              fullWidth
                              style={{
                                transition: "all 0.2s ease"
                              }}
                              styles={{
                                root: {
                                  "&:hover:not(:disabled)": {
                                    opacity: isAssigned ? 1 : 0.8,
                                    backgroundColor: isAssigned
                                      ? undefined
                                      : `var(--mantine-color-${roleColor}-1)`
                                  }
                                }
                              }}
                              disabled={!dayData?._id || isWeekFixed}
                              onClick={() =>
                                isAssigned
                                  ? onUnassignEmployee({
                                      livestreamId: dayData!._id,
                                      snapshotId: snapshot!._id
                                    })
                                  : onAssignEmployee({
                                      livestreamId: dayData!._id,
                                      snapshotId: snapshot?._id,
                                      periodId: period._id!,
                                      userId: employee._id,
                                      role
                                    })
                              }
                            >
                              <Text size="xs">
                                {formatTimeRange(
                                  period.startTime,
                                  period.endTime
                                )}{" "}
                              </Text>
                            </Button>
                          )
                        })}
                      </Stack>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </div>
  )
}
