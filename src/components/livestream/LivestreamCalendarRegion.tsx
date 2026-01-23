import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
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
  IconCircleDashedCheck,
  IconCircleDashedX,
  IconCalculator,
  IconEye,
  IconPencil,
  IconRefresh,
  IconReport,
  IconTrash,
  IconUserEdit
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

interface LivestreamCalendarRegionProps {
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
  onCalculateDailySalary?: (date: Date) => void
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

export const LivestreamCalendarRegion = ({
  role,
  weekDays,
  employeesData,
  livestreamData,
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
  const queryClient = useQueryClient()
  const { addExternalSnapshot, deleteSnapshot, updateTimeDirect } =
    useLivestreamCore()

  const roleLabel = role === "host" ? "Host" : "Trợ live"
  const roleColor = role === "host" ? "blue" : "green"
  const [pxPerMinute, setPxPerMinute] = useState(2)
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
  const viewportHeightPx = 800
  const timelineHeight = (timeRange.endMin - timeRange.startMin) * pxPerMinute
  const timelineScrollRef = useRef<HTMLDivElement | null>(null)
  const minPxPerMinute = Math.max(0.75, viewportHeightPx / (24 * 60))
  const maxPxPerMinute = 6

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
      modals.closeAll()
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
        modals.closeAll()
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
      modals.closeAll()
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "Cập nhật giờ thất bại",
        message: getErrorMessage(error) || "Có lỗi xảy ra",
        color: "red"
      })
    }
  })

  const defaultNewSnapshotMinutes = 60

  const openEditSnapshotModal = (opts: {
    dayData: LivestreamData
    snapshot: LivestreamSnapshot
  }) => {
    modals.open({
      title: "Chỉnh snapshot",
      children: (
        <EditSnapshotModalContent
          dayData={opts.dayData}
          snapshot={opts.snapshot}
        />
      )
    })
  }

  const EditSnapshotModalContent = ({
    dayData,
    snapshot
  }: {
    dayData: LivestreamData
    snapshot: LivestreamSnapshot
  }) => {
    const [startStr, setStartStr] = useState(
      formatTimeString(snapshot.period.startTime)
    )
    const [endStr, setEndStr] = useState(
      formatTimeString(snapshot.period.endTime)
    )

    return (
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          {format(new Date(dayData.date), "dd/MM/yyyy")} · {roleLabel}
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
        <Divider />
        <Group justify="space-between">
          <Button
            variant="light"
            color="red"
            leftSection={<IconTrash size={14} />}
            loading={deletingSnapshot}
            onClick={() =>
              mutateDeleteSnapshot({
                livestreamId: dayData._id,
                snapshotId: snapshot._id
              })
            }
          >
            Xóa
          </Button>
          <Group>
            <Button variant="outline" onClick={() => modals.closeAll()}>
              Hủy
            </Button>
            <Button
              loading={updatingTime}
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
                mutateUpdateTime({
                  livestreamId: dayData._id,
                  snapshotId: snapshot._id,
                  req: { startTime: s, endTime: e }
                })
              }}
            >
              Lưu giờ
            </Button>
          </Group>
        </Group>
      </Stack>
    )
  }

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

  const SnapshotActions = ({
    dayData,
    snapshot
  }: {
    dayData: LivestreamData
    snapshot: LivestreamSnapshot
  }) => {
    const hasAltAssignee = !!snapshot.altAssignee
    const altEmployee = employeesData.find(
      (e) => e._id === snapshot.altAssignee
    )
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

    const openCreateRequestModal = () => {
      let reason = ""
      modals.open({
        title: "Yêu cầu thay đổi nhân sự",
        children: (
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              {snapshot.assignee?.name} ·{" "}
              {format(new Date(dayData.date), "dd/MM/yyyy")}
            </Text>
            <TextInput
              placeholder="Nhập lý do..."
              onChange={(e) => (reason = e.currentTarget.value)}
            />
            <Group justify="flex-end">
              <Button variant="outline" onClick={() => modals.closeAll()}>
                Hủy
              </Button>
              <Button
                onClick={async () => {
                  if (!reason.trim()) {
                    notifications.show({
                      title: "Thiếu thông tin",
                      message: "Vui lòng nhập lý do",
                      color: "red"
                    })
                    return
                  }
                  try {
                    await onCreateRequest({
                      livestreamId: dayData._id,
                      snapshotId: snapshot._id,
                      altNote: reason.trim()
                    })
                    notifications.show({
                      title: "Tạo yêu cầu thành công",
                      message: "Yêu cầu thay đổi đã được gửi",
                      color: "green"
                    })
                    queryClient.invalidateQueries({
                      queryKey: [
                        "getAltRequestBySnapshot",
                        snapshot._id,
                        dayData._id
                      ]
                    })
                    modals.closeAll()
                    onRefetch()
                  } catch (error: unknown) {
                    notifications.show({
                      title: "Tạo yêu cầu thất bại",
                      message: getErrorMessage(error) || "Có lỗi xảy ra",
                      color: "red"
                    })
                  }
                }}
              >
                Gửi
              </Button>
            </Group>
          </Stack>
        )
      })
    }

    const openRequestInfoModal = (req: GetAltRequestBySnapshotResponse) => {
      let selectedAlt: string | null = null
      modals.open({
        title: "Yêu cầu thay đổi nhân sự",
        children: (
          <Stack gap="sm">
            <Group gap={8}>
              <ActionIcon
                variant="light"
                color={
                  req.status === "pending"
                    ? "yellow"
                    : req.status === "accepted"
                      ? "green"
                      : "red"
                }
              >
                {req.status === "pending" ? (
                  <IconAlertCircle size={16} />
                ) : req.status === "accepted" ? (
                  <IconCircleDashedCheck size={16} />
                ) : (
                  <IconCircleDashedX size={16} />
                )}
              </ActionIcon>
              <Text size="sm" fw={600}>
                {req.status === "pending"
                  ? "Đang chờ duyệt"
                  : req.status === "accepted"
                    ? "Đã chấp nhận"
                    : "Đã từ chối"}
              </Text>
            </Group>

            <Text size="xs">
              <strong>Người tạo:</strong> {req.createdBy?.name}
            </Text>
            <Text size="xs">
              <strong>Lý do:</strong> {req.altNote}
            </Text>

            {req.status === "pending" && isAdminOrLeader && (
              <>
                <Select
                  placeholder="Chọn người thay thế"
                  value={selectedAlt}
                  onChange={(v) => (selectedAlt = v)}
                  data={employeesData
                    .map((e) => ({ label: e.name, value: e._id }))
                    .filter((e) => e.value !== req.createdBy?._id)}
                  searchable
                  comboboxProps={{ withinPortal: false }}
                />
                <Group justify="apart">
                  <Button
                    size="xs"
                    variant="light"
                    color="red"
                    onClick={async () => {
                      try {
                        await onUpdateRequestStatus(req._id, {
                          status: "rejected"
                        })
                        notifications.show({
                          title: "Đã từ chối",
                          message: "Yêu cầu đã được từ chối",
                          color: "orange"
                        })
                        queryClient.invalidateQueries({
                          queryKey: [
                            "getAltRequestBySnapshot",
                            snapshot._id,
                            dayData._id
                          ]
                        })
                        modals.closeAll()
                        onRefetch()
                      } catch (error: unknown) {
                        notifications.show({
                          title: "Lỗi",
                          message: getErrorMessage(error) || "Có lỗi xảy ra",
                          color: "red"
                        })
                      }
                    }}
                  >
                    Từ chối
                  </Button>
                  <Button
                    size="xs"
                    color="green"
                    disabled={!selectedAlt}
                    onClick={async () => {
                      if (!selectedAlt) return
                      try {
                        await onUpdateRequestStatus(req._id, {
                          status: "accepted",
                          altAssignee: selectedAlt
                        })
                        notifications.show({
                          title: "Đã chấp nhận",
                          message: "Yêu cầu đã được chấp nhận",
                          color: "green"
                        })
                        queryClient.invalidateQueries({
                          queryKey: [
                            "getAltRequestBySnapshot",
                            snapshot._id,
                            dayData._id
                          ]
                        })
                        modals.closeAll()
                        onRefetch()
                      } catch (error: unknown) {
                        notifications.show({
                          title: "Lỗi",
                          message: getErrorMessage(error) || "Có lỗi xảy ra",
                          color: "red"
                        })
                      }
                    }}
                  >
                    Chấp nhận
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        )
      })
    }

    return (
      <Group gap={4} justify="space-between" wrap="nowrap">
        <Text
          size="xs"
          fw={600}
          c={hasAltAssignee ? "orange" : roleColor}
          lineClamp={1}
        >
          {displayName || "Chưa phân"}
        </Text>

        <Group gap={4} wrap="nowrap">
          {!hideEditButtons &&
            isWeekFixed &&
            snapshot.assignee &&
            canEditSnapshot(snapshot) &&
            !hasAltAssignee &&
            !requestData?.data && (
              <ActionIcon
                size="sm"
                variant="subtle"
                color="yellow"
                title="Tạo yêu cầu thay thế"
                onClick={(e) => {
                  e.stopPropagation()
                  openCreateRequestModal()
                }}
              >
                <IconAlertCircle size={16} />
              </ActionIcon>
            )}

          {!hideEditButtons && requestData?.data && (
            <ActionIcon
              size="sm"
              variant="subtle"
              color={
                requestData.data.status === "pending"
                  ? "yellow"
                  : requestData.data.status === "accepted"
                    ? "green"
                    : "red"
              }
              title="Xem yêu cầu"
              onClick={(e) => {
                e.stopPropagation()
                openRequestInfoModal(requestData.data)
              }}
            >
              {requestData.data.status === "pending" ? (
                <IconAlertCircle size={16} />
              ) : requestData.data.status === "accepted" ? (
                <IconCircleDashedCheck size={16} />
              ) : (
                <IconCircleDashedX size={16} />
              )}
            </ActionIcon>
          )}

          {!hideEditButtons && snapshot.assignee && (
            <ActionIcon
              size="sm"
              variant="subtle"
              color="gray"
              title="Chỉnh giờ / xóa"
              onClick={(e) => {
                e.stopPropagation()
                openEditSnapshotModal({ dayData, snapshot })
              }}
            >
              <IconPencil size={16} />
            </ActionIcon>
          )}

          {!hideEditButtons && isWeekFixed && isAdminOrLeader && dayData && (
            <ActionIcon
              size="sm"
              variant="subtle"
              color="indigo"
              title="Chỉ định người thay thế"
              onClick={async (e) => {
                e.stopPropagation()
                const currentAlt = snapshot.altAssignee || ""
                const currentAltOther = snapshot.altOtherAssignee || ""
                const currentNote = snapshot.altNote || ""
                let selectedAlt = currentAlt || null
                let altOtherName = currentAltOther
                let altNote = currentNote

                modals.open({
                  title: "Chỉ định người thay thế",
                  children: (
                    <Stack gap="sm">
                      <Select
                        placeholder="Chọn người thay thế"
                        value={selectedAlt}
                        onChange={(v) => (selectedAlt = v)}
                        data={employeesData
                          .map((emp) => ({ label: emp.name, value: emp._id }))
                          .filter((emp) => emp.value !== snapshot.assignee?._id)
                          .concat({ label: "Khác", value: "other" })}
                        searchable
                        comboboxProps={{ withinPortal: false }}
                      />
                      {selectedAlt === "other" && (
                        <TextInput
                          placeholder="Nhập tên người thay thế"
                          defaultValue={altOtherName}
                          onChange={(e) =>
                            (altOtherName = e.currentTarget.value)
                          }
                          size="sm"
                        />
                      )}
                      <TextInput
                        placeholder="Lý do (tùy chọn)"
                        defaultValue={altNote}
                        onChange={(e) => (altNote = e.currentTarget.value)}
                        size="sm"
                      />
                      <Group justify="apart">
                        <Button
                          size="xs"
                          onClick={async () => {
                            if (!selectedAlt) return
                            if (
                              selectedAlt === "other" &&
                              !altOtherName.trim()
                            ) {
                              notifications.show({
                                title: "Thiếu thông tin",
                                message: "Vui lòng nhập tên người thay thế",
                                color: "red"
                              })
                              return
                            }
                            try {
                              await onUpdateAlt(dayData._id, snapshot._id, {
                                altAssignee: selectedAlt || undefined,
                                altOtherAssignee:
                                  selectedAlt === "other"
                                    ? altOtherName.trim()
                                    : undefined,
                                altNote: altNote?.trim() || undefined
                              })
                              notifications.show({
                                title: "Cập nhật thành công",
                                message: "Đã cập nhật người thay thế",
                                color: "green"
                              })
                              modals.closeAll()
                              onRefetch()
                            } catch (error: unknown) {
                              notifications.show({
                                title: "Cập nhật thất bại",
                                message:
                                  getErrorMessage(error) || "Có lỗi xảy ra",
                                color: "red"
                              })
                            }
                          }}
                        >
                          Lưu
                        </Button>
                        {!!snapshot.altAssignee && (
                          <Button
                            size="xs"
                            variant="light"
                            color="red"
                            onClick={async () => {
                              try {
                                await onUpdateAlt(dayData._id, snapshot._id, {
                                  altAssignee: undefined,
                                  altOtherAssignee: undefined,
                                  altNote: undefined
                                })
                                notifications.show({
                                  title: "Xóa thành công",
                                  message: "Đã xóa người thay thế",
                                  color: "green"
                                })
                                modals.closeAll()
                                onRefetch()
                              } catch (error: unknown) {
                                notifications.show({
                                  title: "Xóa thất bại",
                                  message:
                                    getErrorMessage(error) || "Có lỗi xảy ra",
                                  color: "red"
                                })
                              }
                            }}
                            leftSection={<IconTrash size={14} />}
                          >
                            Xóa
                          </Button>
                        )}
                      </Group>
                    </Stack>
                  )
                })
              }}
            >
              <IconUserEdit size={16} />
            </ActionIcon>
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
              style={{ height: viewportHeightPx, overflowY: "auto" }}
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
                          const top =
                            ((preview?.startMin ?? startMin) -
                              timeRange.startMin) *
                            pxPerMinute
                          const height =
                            ((preview?.endMin ?? endMin) -
                              (preview?.startMin ?? startMin)) *
                            pxPerMinute
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
                                  ? "rgba(255, 193, 7, 0.18)"
                                  : role === "host"
                                    ? "rgba(34, 139, 230, 0.12)"
                                    : "rgba(64, 192, 87, 0.12)",
                                border: "1px solid rgba(0,0,0,0.08)",
                                borderLeft: `3px solid var(--mantine-color-${roleColor}-6)`,
                                borderRadius: 8,
                                padding: "6px 8px",
                                cursor: hideEditButtons ? "default" : "pointer",
                                userSelect: "none",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (suppressSnapshotClickRef.current) return
                                if (!dayData || hideEditButtons) return
                                openEditSnapshotModal({ dayData, snapshot })
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
                                        background: "rgba(0,0,0,0.18)"
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
                                        background: "rgba(0,0,0,0.18)"
                                      }}
                                    />
                                  </Box>
                                )}

                              <Text size="xs" c="dimmed" mb={4}>
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
                                <SnapshotActions
                                  dayData={dayData}
                                  snapshot={snapshot}
                                />
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
