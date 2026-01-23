import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { LivestreamLayout } from "../../../components/layouts/LivestreamLayout"
import { useLivestreamCore } from "../../../hooks/useLivestreamCore"
import { useLivestreamChannels } from "../../../hooks/useLivestreamChannels"
import { useLivestreamAltRequests } from "../../../hooks/useLivestreamAltRequests"
import { useUsers } from "../../../hooks/useUsers"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Loader,
  rem,
  Text,
  Select,
  Paper,
  Stack,
  Center,
  SegmentedControl,
  ActionIcon,
  Tooltip,
  SimpleGrid
} from "@mantine/core"
import {
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
  IconLock,
  IconLockOpen
} from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import { CToast } from "../../../components/common/CToast"
// import { LivestreamCalendarTable } from "../../../components/livestream/LivestreamCalendarTable"
import { LivestreamCalendarRegion } from "../../../components/livestream/LivestreamCalendarRegion"
import { openLivestreamReportModal } from "../../../components/livestream/LivestreamReportModal"
import { useState, useMemo, useEffect } from "react"
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  parseISO
} from "date-fns"
import { Can } from "../../../components/common/Can"
import { modals } from "@mantine/modals"

export const Route = createFileRoute("/livestream/calendar/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      date: search.date as string | undefined,
      channel: search.channel as string | undefined
    }
  }
})

function RouteComponent() {
  const navigate = useNavigate()
  const searchParams = useSearch({ from: "/livestream/calendar/" })
  const queryClient = useQueryClient()

  const {
    getLivestreamsByDateRange,
    createLivestreamRange,
    addLivestreamSnapshot,
    updateLivestreamSnapshot,
    syncSnapshot,
    reportLivestream,
    fixLivestream,
    updateSnapshotAltRequest
  } = useLivestreamCore()
  const { searchLivestreamChannels } = useLivestreamChannels()
  const {
    createAltRequest,
    // updateAltRequests,
    getAltRequestBySnapshot,
    updateAltRequestStatus
    // deleteAltRequest
  } = useLivestreamAltRequests()
  const { publicSearchUser } = useUsers()
  const { getMe } = useUsers()
  const { data: me } = useQuery({
    queryKey: ["getMe"],
    queryFn: () => getMe(),
    select: (data) => data.data
  })

  // Initialize from URL params or defaults
  const [weekDate, setWeekDate] = useState<Date | null>(() => {
    if (searchParams.date) {
      try {
        return parseISO(searchParams.date)
      } catch {
        return new Date()
      }
    }
    return new Date()
  })
  const [channelId, setChannelId] = useState<string | null>(
    searchParams.channel || null
  )
  const [viewMode, setViewMode] = useState<"assign" | "schedule">("schedule")
  const [isWeekFixed, setIsWeekFixed] = useState(false)

  // Force schedule mode when week is fixed
  useMemo(() => {
    if (isWeekFixed && viewMode === "assign") {
      setViewMode("schedule")
    }
  }, [isWeekFixed, viewMode])

  // Calculate week range
  const weekRange = useMemo(() => {
    if (!weekDate) return null
    const start = startOfWeek(weekDate, { weekStartsOn: 1 })
    const end = endOfWeek(weekDate, { weekStartsOn: 1 })
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }, [weekDate])

  // Get all days in the week
  const weekDays = useMemo(() => {
    if (!weekRange) return []
    return eachDayOfInterval({ start: weekRange.start, end: weekRange.end })
  }, [weekRange])

  // Fetch channels
  const { data: channelsData } = useQuery({
    queryKey: ["searchLivestreamChannels"],
    queryFn: async () => {
      const response = await searchLivestreamChannels({ page: 1, limit: 100 })
      return response.data.data
    }
  })

  // Auto-select first channel
  useMemo(() => {
    if (channelsData && channelsData.length > 0 && !channelId) {
      const firstChannelId = channelsData[0]._id
      setChannelId(firstChannelId)
    }
  }, [channelsData, channelId])

  // Update URL when filters change
  useEffect(() => {
    const params: Record<string, string> = {}

    if (weekDate) {
      params.date = format(weekDate, "yyyy-MM-dd")
    }

    if (channelId) {
      params.channel = channelId
    }

    navigate({
      to: "/livestream/calendar",
      search: params as any,
      replace: true
    })
  }, [weekDate, channelId, navigate])

  // Fetch livestream employees
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

  const { data: livestreamAstData } = useQuery({
    queryKey: ["livestreamAssistants"],
    queryFn: () =>
      publicSearchUser({
        page: 1,
        limit: 100,
        role: "livestream-ast"
      }),
    select: (data) => data.data.data
  })

  // const { data: livestreamLeaderData } = useQuery({
  //   queryKey: ["livestreamLeaders"],
  //   queryFn: () =>
  //     publicSearchUser({
  //       page: 1,
  //       limit: 100,
  //       role: "livestream-leader"
  //     }),
  //   select: (data) => data.data.data
  // })

  const { mutate: reportLivestreamMutation, isPending: isReporting } =
    useMutation({
      mutationFn: async (payload: {
        livestreamId: string
        snapshotId: string
        reportData: {
          income: number
          adsCost?: number
          clickRate: number
          avgViewingDuration: number
          comments: number
          ordersNote: string
          orders: number
          rating?: string
        }
      }) => {
        const { livestreamId, snapshotId, reportData } = payload
        return reportLivestream(livestreamId, snapshotId, reportData)
      },
      onSuccess: () => {
        notifications.show({
          title: "Báo cáo thành công",
          message: "Đã lưu báo cáo ca livestream",
          color: "green"
        })
        queryClient.invalidateQueries({
          queryKey: ["getLivestreamsByDateRange"]
        })
        modals.closeAll()
      },
      onError: (error: any) => {
        notifications.show({
          title: "Báo cáo thất bại",
          message: error?.response?.data?.message || "Có lỗi khi lưu báo cáo",
          color: "red"
        })
      }
    })

  // filter duplicate employees
  const livestreamEmpOptions = useMemo(() => {
    const emps = livestreamEmpData || []
    return emps.filter((emp, index, self) => {
      return self.findIndex((e) => e._id === emp._id) === index
    })
  }, [livestreamEmpData])

  const livestreamAstOptions = useMemo(() => {
    const asts = livestreamAstData || []
    return asts.filter((ast, index, self) => {
      return self.findIndex((a) => a._id === ast._id) === index
    })
  }, [livestreamAstData])

  // Fetch livestream data for the week
  const {
    data: livestreamData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: [
      "getLivestreamsByDateRange",
      weekRange?.start,
      weekRange?.end,
      channelId
    ],
    queryFn: async () => {
      if (!weekRange) return []
      const response = await getLivestreamsByDateRange({
        startDate: format(weekRange.start, "yyyy-MM-dd"),
        endDate: format(weekRange.end, "yyyy-MM-dd"),
        ...(channelId && { channel: channelId })
      })

      // Check if any day in week is fixed
      const hasFixedDay = response.data.livestreams.some((ls) => ls.fixed)
      setIsWeekFixed(hasFixedDay)

      return response.data.livestreams
    },
    enabled: !!weekRange
  })

  // Create week range mutation
  const { mutate: createWeekRange, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      if (!weekRange) return
      if (channelId) {
        await createLivestreamRange({
          startDate: weekRange.start,
          endDate: weekRange.end,
          channel: channelId
        })
      }
    },
    onSuccess: () => {
      CToast.success({ title: "Tạo lịch tuần thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi khi tạo lịch tuần" })
    }
  })

  // Assign employee to snapshot mutation
  const { mutate: assignEmployee } = useMutation({
    mutationFn: async ({
      livestreamId,
      snapshotId,
      periodId,
      userId
    }: {
      livestreamId: string
      snapshotId?: string
      periodId: string
      userId: string
      role: "host" | "assistant"
    }) => {
      if (snapshotId) {
        // Update existing snapshot
        await updateLivestreamSnapshot(livestreamId, snapshotId, {
          assignee: userId
        })
      } else {
        // Create new snapshot
        await addLivestreamSnapshot(livestreamId, {
          period: periodId,
          assignee: userId,
          goal: 0
        })
      }
    },
    onSuccess: () => {
      CToast.success({ title: "Cập nhật ca làm việc thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi khi cập nhật ca làm việc" })
    }
  })

  // Unassign employee from snapshot mutation
  const { mutate: unassignEmployee } = useMutation({
    mutationFn: async ({
      livestreamId,
      snapshotId
    }: {
      livestreamId: string
      snapshotId: string
    }) => {
      await updateLivestreamSnapshot(livestreamId, snapshotId, {
        assignee: undefined
      })
    },
    onSuccess: () => {
      CToast.success({ title: "Cập nhật ca làm việc thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi khi cập nhật ca làm việc" })
    }
  })

  // Sync snapshot mutation
  const { mutate: syncSnapshotMutation, isPending: isSyncing } = useMutation({
    mutationFn: async () => {
      if (!weekRange || !channelId) {
        throw new Error("Vui lòng chọn tuần và kênh")
      }
      return await syncSnapshot({
        startDate: weekRange.start,
        endDate: weekRange.end,
        channel: channelId
      })
    },
    onSuccess: (response) => {
      notifications.show({
        title: "Đồng bộ thành công",
        message:
          response.data.message || `Đã cập nhật ${response.data.updated} ca`,
        color: "green"
      })
      refetch()
    },
    onError: (error: any) => {
      notifications.show({
        title: "Đồng bộ thất bại",
        message:
          error?.response?.data?.message || "Có lỗi khi đồng bộ snapshot",
        color: "red"
      })
    }
  })

  // Fix livestream mutation
  const { mutate: fixLivestreamMutation, isPending: isFixing } = useMutation({
    mutationFn: async () => {
      if (!weekRange || !channelId) {
        throw new Error("Vui lòng chọn tuần và kênh")
      }
      return await fixLivestream({
        startDate: weekRange.start,
        endDate: weekRange.end,
        channel: channelId
      })
    },
    onSuccess: () => {
      notifications.show({
        title: "Chốt lịch thành công",
        message: "Đã chốt lịch livestream cho tuần này",
        color: "green"
      })
      refetch()
    },
    onError: (error: any) => {
      notifications.show({
        title: "Chốt lịch thất bại",
        message: error?.response?.data?.message || "Có lỗi khi chốt lịch",
        color: "red"
      })
    }
  })

  // Handle opening report modal
  const handleOpenReport = (livestreamId: string, snapshot: any) => {
    openLivestreamReportModal({
      snapshot,
      isSubmitting: isReporting,
      onSubmit: (reportData) => {
        reportLivestreamMutation({
          livestreamId,
          snapshotId: snapshot._id,
          reportData
        })
      }
    })
  }

  // Week navigation functions
  const goToPreviousWeek = () => {
    if (!weekDate) return
    const newDate = new Date(weekDate)
    newDate.setDate(newDate.getDate() - 7)
    setWeekDate(newDate)
  }

  const goToNextWeek = () => {
    if (!weekDate) return
    const newDate = new Date(weekDate)
    newDate.setDate(newDate.getDate() + 7)
    setWeekDate(newDate)
  }

  const weekLabel = useMemo(() => {
    if (!weekRange) return ""
    return `${format(weekRange.start, "dd/MM")} - ${format(
      weekRange.end,
      "dd/MM/yyyy"
    )}`
  }, [weekRange])

  // Prepare channel options
  const channelOptions = useMemo(() => {
    if (!channelsData) return []
    return channelsData.map((channel) => ({
      label: channel.name,
      value: channel._id
    }))
  }, [channelsData])

  // Check if week has any livestream data
  const hasLivestreams = livestreamData && livestreamData.length > 0

  const renderCalendarGrid = () => {
    if (!channelId) {
      return (
        <Center h={400}>
          <Text c="dimmed">Vui lòng chọn kênh để xem lịch</Text>
        </Center>
      )
    }

    if (isLoading) {
      return (
        <Center h={400}>
          <Loader />
        </Center>
      )
    }

    if (!hasLivestreams) {
      return (
        <Center h={400}>
          <Stack align="center" gap="md">
            <Text c="dimmed" size="lg">
              Chưa có lịch livestream trong tuần này
            </Text>
            <Button
              onClick={() => createWeekRange()}
              leftSection={<IconPlus size={16} />}
              loading={isCreating}
              size="md"
            >
              Tạo lịch live trong tuần này
            </Button>
          </Stack>
        </Center>
      )
    }

    // Render 2 separate tables for Host and Assistant
    return (
      <Stack gap="xl">
        <Can
          roles={[
            "admin",
            "livestream-leader",
            "livestream-emp",
            "system-emp",
            "livestream-ast",
            "livestream-accounting"
          ]}
        >
          <SimpleGrid cols={{ base: 1, lg: 1 }} spacing="lg">
            {/* <LivestreamCalendarTable
              role="host"
              weekDays={weekDays}
              employeesData={livestreamEmpOptions || []}
              livestreamData={livestreamData || []}
              onAssignEmployee={assignEmployee}
              onUnassignEmployee={unassignEmployee}
              viewMode={viewMode}
              onOpenReport={handleOpenReport}
              isWeekFixed={isWeekFixed}
              currentUser={me}
              onUpdateAlt={updateSnapshotAltRequest}
              onCreateRequest={createAltRequest}
              onUpdateRequest={updateAltRequests}
              onDeleteRequest={deleteAltRequest}
              onUpdateRequestStatus={updateAltRequestStatus}
              onGetRequest={getAltRequestBySnapshot}
              onRefetch={refetch}
            /> */}
            <LivestreamCalendarRegion
              role="host"
              weekDays={weekDays}
              employeesData={livestreamEmpOptions || []}
              livestreamData={livestreamData || []}
              onAssignEmployee={assignEmployee}
              onUnassignEmployee={unassignEmployee}
              onOpenReport={handleOpenReport}
              isWeekFixed={isWeekFixed}
              currentUser={me}
              onUpdateAlt={updateSnapshotAltRequest}
              onCreateRequest={createAltRequest}
              onUpdateRequestStatus={updateAltRequestStatus}
              onGetRequest={getAltRequestBySnapshot}
              onRefetch={refetch}
            />
          </SimpleGrid>
        </Can>

        <Can
          roles={[
            "admin",
            "livestream-leader",
            "livestream-ast",
            "system-emp",
            "livestream-accounting",
            "livestream-emp"
          ]}
        >
          <SimpleGrid cols={{ base: 1, lg: 1 }} spacing="lg">
            {/* <LivestreamCalendarTable
              role="assistant"
              weekDays={weekDays}
              employeesData={livestreamAstOptions || []}
              livestreamData={livestreamData || []}
              onAssignEmployee={assignEmployee}
              onUnassignEmployee={unassignEmployee}
              viewMode={viewMode}
              onOpenReport={handleOpenReport}
              isWeekFixed={isWeekFixed}
              currentUser={me}
              onUpdateAlt={updateSnapshotAltRequest}
              onCreateRequest={createAltRequest}
              onUpdateRequest={updateAltRequests}
              onDeleteRequest={deleteAltRequest}
              onUpdateRequestStatus={updateAltRequestStatus}
              onGetRequest={getAltRequestBySnapshot}
              onRefetch={refetch}
            /> */}
            <LivestreamCalendarRegion
              role="assistant"
              weekDays={weekDays}
              employeesData={livestreamAstOptions || []}
              livestreamData={livestreamData || []}
              onAssignEmployee={assignEmployee}
              onUnassignEmployee={unassignEmployee}
              onOpenReport={handleOpenReport}
              isWeekFixed={isWeekFixed}
              currentUser={me}
              onUpdateAlt={updateSnapshotAltRequest}
              onCreateRequest={createAltRequest}
              onUpdateRequestStatus={updateAltRequestStatus}
              onGetRequest={getAltRequestBySnapshot}
              onRefetch={refetch}
            />
          </SimpleGrid>
        </Can>
      </Stack>
    )
  }

  return (
    <LivestreamLayout>
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
              Lịch Livestream
            </Text>
            <Text c="dimmed" fz="sm">
              Quản lý lịch phát sóng livestream theo tuần
            </Text>
          </Box>
        </Flex>

        <Divider my={0} />

        <Box px={{ base: 4, md: 28 }} py={20}>
          {/* Filter Controls */}
          <Paper
            p="md"
            mb="lg"
            radius="md"
            withBorder
            style={{
              background: "var(--mantine-color-body)",
              borderColor: "var(--mantine-color-gray-3)"
            }}
          >
            <Stack gap="md">
              {/* Row 1: Week navigation + View mode + Sync button */}
              <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                gap="md"
                align={{ base: "stretch", md: "flex-end" }}
              >
                {/* Week Navigation */}
                <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                    Tuần hiển thị
                  </Text>
                  <Group gap="xs" wrap="nowrap">
                    <ActionIcon
                      variant="subtle"
                      size="lg"
                      onClick={goToPreviousWeek}
                    >
                      <IconChevronLeft size={18} />
                    </ActionIcon>

                    <Paper
                      p="sm"
                      radius="md"
                      withBorder
                      style={{
                        flex: 1,
                        minWidth: 0,
                        borderColor: "var(--mantine-color-gray-3)"
                      }}
                    >
                      <Text
                        ta="center"
                        fw={600}
                        size="sm"
                        c="gray.8"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {weekLabel}
                      </Text>
                    </Paper>

                    <ActionIcon
                      variant="subtle"
                      size="lg"
                      onClick={goToNextWeek}
                    >
                      <IconChevronRight size={18} />
                    </ActionIcon>
                  </Group>
                </Stack>

                {/* View Mode */}
                <Can roles={["admin", "livestream-leader"]}>
                  <Stack
                    gap={4}
                    style={{
                      flexBasis: "260px",
                      flexShrink: 0
                    }}
                  >
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                      Chế độ xem
                    </Text>
                    <Tooltip
                      label="Không thể phân ca do đã chốt lịch"
                      disabled={!isWeekFixed}
                      position="bottom"
                    >
                      <SegmentedControl
                        value={viewMode}
                        onChange={(value) =>
                          setViewMode(value as "assign" | "schedule")
                        }
                        size="sm"
                        radius="md"
                        fullWidth
                        color="indigo"
                        disabled={isWeekFixed}
                        data={[
                          { label: "Phân ca", value: "assign" },
                          { label: "Xem lịch đã đặt", value: "schedule" }
                        ]}
                        styles={{
                          root: {
                            opacity: isWeekFixed ? 0.6 : 1,
                            cursor: isWeekFixed ? "not-allowed" : "pointer"
                          }
                        }}
                      />
                    </Tooltip>
                  </Stack>

                  {/* Sync Button */}
                  <Group gap="xs" style={{ flexShrink: 0 }}>
                    <Tooltip
                      label={
                        isWeekFixed
                          ? "Không thể đồng bộ do đã chốt lịch"
                          : !channelId || !weekRange
                            ? "Vui lòng chọn kênh và tuần"
                            : ""
                      }
                      disabled={!isWeekFixed && !!channelId && !!weekRange}
                      position="bottom"
                    >
                      <Button
                        leftSection={<IconRefresh size={16} />}
                        onClick={() => syncSnapshotMutation()}
                        loading={isSyncing}
                        disabled={!channelId || !weekRange || isWeekFixed}
                        size="sm"
                        variant="light"
                        color="indigo"
                      >
                        Đồng bộ
                      </Button>
                    </Tooltip>

                    {!isWeekFixed ? (
                      <Tooltip
                        label={
                          !channelId || !weekRange
                            ? "Vui lòng chọn kênh và tuần"
                            : !hasLivestreams
                              ? "Chưa có lịch livestream"
                              : ""
                        }
                        disabled={
                          !!channelId && !!weekRange && !!hasLivestreams
                        }
                        position="bottom"
                      >
                        <Button
                          leftSection={<IconLock size={16} />}
                          onClick={() => fixLivestreamMutation()}
                          loading={isFixing}
                          disabled={!channelId || !weekRange || !hasLivestreams}
                          size="sm"
                          variant="light"
                          color="orange"
                        >
                          Chốt lịch
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip
                        label="Lịch tuần này đã được chốt"
                        position="bottom"
                      >
                        <Button
                          leftSection={<IconLockOpen size={16} />}
                          size="sm"
                          variant="light"
                          color="gray"
                          disabled
                        >
                          Đã chốt
                        </Button>
                      </Tooltip>
                    )}
                  </Group>
                </Can>
              </Flex>

              {/* Row 2: Channel select */}
              <Stack gap={4}>
                <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                  Kênh livestream
                </Text>
                <Select
                  placeholder="Chọn kênh"
                  value={channelId || ""}
                  onChange={(v) => setChannelId(v || null)}
                  data={channelOptions}
                  size="sm"
                  radius="md"
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Calendar Grid */}
          {renderCalendarGrid()}
        </Box>
      </Box>
    </LivestreamLayout>
  )
}
