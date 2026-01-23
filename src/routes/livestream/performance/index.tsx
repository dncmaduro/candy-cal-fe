import { createFileRoute } from "@tanstack/react-router"
import { LivestreamLayout } from "../../../components/layouts/LivestreamLayout"
import { useLivestreamPerformance } from "../../../hooks/useLivestreamPerformance"
import { useLivestreamCore } from "../../../hooks/useLivestreamCore"
import { useLivestreamChannels } from "../../../hooks/useLivestreamChannels"
import { useUsers } from "../../../hooks/useUsers"
import { useLivestreamSalary } from "../../../hooks/useLivestreamSalary"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Box,
  Divider,
  Flex,
  Group,
  rem,
  Text,
  ActionIcon,
  Stack,
  Select,
  Paper,
  Center,
  Loader,
  SegmentedControl,
  Accordion
} from "@mantine/core"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { Can } from "../../../components/common/Can"
import { CToast } from "../../../components/common/CToast"
import { useState, useMemo, useEffect } from "react"
import { MonthPickerInput } from "@mantine/dates"
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { LivestreamCalendarRegion } from "../../../components/livestream/LivestreamCalendarRegion"
import { MonthlySalaryTable } from "../../../components/livestream/MonthlySalaryTable"
import { CalculateIncomeModal } from "../../../components/livestream/CalculateIncomeModal"
import { openLivestreamReportModal } from "../../../components/livestream/LivestreamReportModal"
import { notifications } from "@mantine/notifications"

export const Route = createFileRoute("/livestream/performance/")({
  component: RouteComponent
})

function RouteComponent() {
  const { calculateDailyPerformance, calculateLivestreamMonthSalary } =
    useLivestreamPerformance()

  const { searchLivestreamSalary } = useLivestreamSalary()
  const { getLivestreamsByDateRange, reportLivestream } = useLivestreamCore()
  const { searchLivestreamChannels } = useLivestreamChannels()
  const { getMe, publicSearchUser } = useUsers()
  const queryClient = useQueryClient()

  // Calendar filters
  const [weekDate, setWeekDate] = useState<Date>(new Date())
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null
  )
  const [viewMode, setViewMode] = useState<"calendar" | "salary">("calendar")

  // Salary view filter
  const [salaryMonth, setSalaryMonth] = useState<Date>(new Date())

  // Get current user
  const { data: me } = useQuery({
    queryKey: ["getMe"],
    queryFn: () => getMe(),
    select: (data) => data.data
  })

  const isAdmin = useMemo(() => {
    return me?.roles?.some((role) =>
      [
        "admin",
        "system-emp",
        "livestream-leader",
        "livestream-accounting"
      ].includes(role)
    )
  }, [me])

  useEffect(() => {
    setViewMode(isAdmin ? "calendar" : "salary")
  }, [me])

  // Fetch salary configurations
  const { data: salaryData, isLoading: isLoadingSalaryConfig } = useQuery({
    queryKey: ["searchLivestreamSalary"],
    queryFn: () =>
      searchLivestreamSalary({
        page: 1,
        limit: 1000
      }),
    select: (data) => data.data.data
  })

  // Mutation for daily salary calculation from calendar
  const {
    mutate: calculateDailyFromCalendar,
    isPending: calculatingDailySalary
  } = useMutation({
    mutationFn: calculateDailyPerformance,
    onSuccess: (response) => {
      const data = response.data
      CToast.success({
        title: "Tính lương thành công",
        subtitle: `Cập nhật: ${data.snapshotsUpdated}, Bỏ qua: ${data.snapshotsSkipped}`
      })
      // Invalidate calendar query to refetch data
      queryClient.invalidateQueries({ queryKey: ["getLivestreamsByDateRange"] })
      modals.closeAll()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi tính lương" })
    }
  })

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

  const handleCalculateDailySalary = (date: Date) => {
    calculateDailyFromCalendar({ date })
  }

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

  // Handle opening calculate income modal
  const handleCalculateIncome = (date: Date) => {
    modals.open({
      title: <b>Tính doanh thu thực</b>,
      children: (
        <CalculateIncomeModal
          date={date}
          refetch={() => {
            queryClient.invalidateQueries({
              queryKey: ["getLivestreamsByDateRange"]
            })
          }}
        />
      ),
      size: "xl"
    })
  }

  // Calculate week range for calendar
  const weekRange = useMemo(() => {
    const start = startOfWeek(weekDate, { weekStartsOn: 1 })
    const end = endOfWeek(weekDate, { weekStartsOn: 1 })
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }, [weekDate])

  // Get all days in the week
  const weekDays = useMemo(() => {
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
    if (channelsData && channelsData.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channelsData[0]._id)
    }
  }, [channelsData, selectedChannelId])

  // Fetch livestream data for the week
  const { data: livestreamData, isLoading: isLoadingCalendar } = useQuery({
    queryKey: [
      "getLivestreamsByDateRange",
      weekRange.start,
      weekRange.end,
      selectedChannelId
    ],
    queryFn: async () => {
      if (!selectedChannelId) return []
      const response = await getLivestreamsByDateRange({
        startDate: format(weekRange.start, "yyyy-MM-dd"),
        endDate: format(weekRange.end, "yyyy-MM-dd"),
        channel: selectedChannelId
      })
      return response.data.livestreams
    },
    enabled: !!selectedChannelId && viewMode === "calendar"
  })

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

  // Fetch monthly salary data
  const currentMonth = salaryMonth.getMonth() + 1
  const currentYear = salaryMonth.getFullYear()

  const { data: monthlySalaryData, isLoading: isLoadingSalary } = useQuery({
    queryKey: ["calculateLivestreamMonthSalary", currentMonth, currentYear],
    queryFn: () =>
      calculateLivestreamMonthSalary({
        month: currentMonth,
        year: currentYear
      }),
    select: (data) => data.data,
    enabled: viewMode === "salary"
  })

  // Fetch livestream data for the entire month to get daily salary details
  const { data: monthlyLivestreamData } = useQuery({
    queryKey: [
      "getLivestreamsByDateRange",
      "monthly",
      currentMonth,
      currentYear
    ],
    queryFn: async () => {
      const startDate = new Date(currentYear, currentMonth - 1, 1)
      const endDate = new Date(currentYear, currentMonth, 0)
      const response = await getLivestreamsByDateRange({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd")
      })
      return response.data.livestreams
    },
    enabled: viewMode === "salary"
  })

  // Process daily salary details from monthly livestream data
  const dailySalaryDetails = useMemo(() => {
    if (!monthlyLivestreamData) return undefined

    const detailsMap = new Map<
      string,
      Array<{
        date: string
        total: number
        salaryPerHour: number
        bonusPercentage: number
        income: number
        snapshotsCount: number
      }>
    >()

    monthlyLivestreamData.forEach((livestream) => {
      // Group snapshots by userId with correct priority logic
      const userSnapshotsMap = new Map<string, any[]>()

      livestream.snapshots.forEach((snapshot) => {
        if (!snapshot.salary?.total) return

        let userId: string | null = null

        // Priority logic:
        // 1. If altAssignee exists and is "other" -> skip (no salary)
        // 2. If altAssignee exists and is not "other" -> use altAssignee._id
        // 3. If no altAssignee -> use assignee._id
        if (snapshot.altAssignee) {
          if (snapshot.altAssignee === "other") {
            // Skip this snapshot - no salary for "other"
            return
          } else if (typeof snapshot.altAssignee === "string") {
            userId = snapshot.altAssignee
          }
        } else if (snapshot.assignee) {
          userId = snapshot.assignee._id
        }

        if (!userId) return

        if (!userSnapshotsMap.has(userId)) {
          userSnapshotsMap.set(userId, [])
        }
        userSnapshotsMap.get(userId)!.push(snapshot)
      })

      // Calculate daily totals for each user
      userSnapshotsMap.forEach((snapshots, userId) => {
        const dailyTotal = snapshots.reduce(
          (sum, s) => sum + (s.salary?.total || 0),
          0
        )
        const dailyIncome = snapshots.reduce(
          (sum, s) => sum + (s.income || 0),
          0
        )
        const avgSalaryPerHour =
          snapshots.reduce(
            (sum, s) => sum + (s.salary?.salaryPerHour || 0),
            0
          ) / snapshots.length
        const avgBonusPercentage =
          snapshots.reduce(
            (sum, s) => sum + (s.salary?.bonusPercentage || 0),
            0
          ) / snapshots.length

        if (!detailsMap.has(userId)) {
          detailsMap.set(userId, [])
        }

        detailsMap.get(userId)!.push({
          date: livestream.date,
          total: dailyTotal,
          salaryPerHour: avgSalaryPerHour,
          bonusPercentage: avgBonusPercentage,
          income: dailyIncome,
          snapshotsCount: snapshots.length
        })
      })
    })

    // Sort each user's daily data by date
    detailsMap.forEach((days) => {
      days.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    })

    return detailsMap
  }, [monthlyLivestreamData])

  // Week navigation
  const goToPreviousWeek = () => {
    const newDate = new Date(weekDate)
    newDate.setDate(newDate.getDate() - 7)
    setWeekDate(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(weekDate)
    newDate.setDate(newDate.getDate() + 7)
    setWeekDate(newDate)
  }

  const weekLabel = useMemo(() => {
    return `${format(weekRange.start, "dd/MM")} - ${format(
      weekRange.end,
      "dd/MM/yyyy"
    )}`
  }, [weekRange])

  const employeesData = useMemo(() => {
    const emps = [...(livestreamEmpData || []), ...(livestreamLeaderData || [])]
    return emps.filter((emp, index, self) => {
      return self.findIndex((e) => e._id === emp._id) === index
    })
  }, [livestreamEmpData, livestreamLeaderData])

  // Channel options
  const channelOptions = useMemo(() => {
    if (!channelsData) return []
    return channelsData.map((channel) => ({
      label: channel.name,
      value: channel._id
    }))
  }, [channelsData])

  return (
    <LivestreamLayout>
      {/* Salary Configuration Section */}
      <Can roles={["admin", "livestream-leader"]}>
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
          <Accordion defaultValue="">
            <Accordion.Item value="salary-config">
              <Accordion.Control>
                <Box>
                  <Text fw={700} fz="lg">
                    Cấu trúc lương Livestream
                  </Text>
                  <Text c="dimmed" fz="sm">
                    Quản lý cấu trúc lương cho từng nhân viên
                  </Text>
                </Box>
              </Accordion.Control>
              <Accordion.Panel>
                <Box px={{ base: 4, md: 28 }} py={20}>
                  {isLoadingSalaryConfig ? (
                    <Center h={200}>
                      <Loader />
                    </Center>
                  ) : !salaryData || salaryData.length === 0 ? (
                    <Center h={200}>
                      <Text c="dimmed" size="sm">
                        Chưa có cấu trúc lương nào
                      </Text>
                    </Center>
                  ) : (
                    <Stack gap="md">
                      {salaryData.map((salary, idx) => (
                        <Paper key={idx} p="lg" withBorder radius="md">
                          <Stack gap="md">
                            <Text fw={600} size="lg">
                              {salary.name}
                            </Text>

                            <Box>
                              <Text fw={500} size="sm" c="dimmed" mb={8}>
                                Nhân viên:
                              </Text>
                              <Text size="sm">
                                {salary.livestreamEmployees
                                  ?.map((e) => e.name)
                                  .join(", ") || "-"}
                              </Text>
                            </Box>

                            <Box>
                              <Text fw={500} size="sm" c="dimmed" mb={8}>
                                Bậc lương áp dụng:
                              </Text>
                              {salary.livestreamPerformances &&
                              salary.livestreamPerformances.length > 0 ? (
                                <Stack gap={4}>
                                  {salary.livestreamPerformances.map(
                                    (perf, perfIdx) => (
                                      <Text key={perfIdx} fz="sm" c="dimmed">
                                        {new Intl.NumberFormat("vi-VN").format(
                                          perf.minIncome
                                        )}{" "}
                                        -{" "}
                                        {new Intl.NumberFormat("vi-VN").format(
                                          perf.maxIncome
                                        )}{" "}
                                        VNĐ (
                                        {new Intl.NumberFormat("vi-VN").format(
                                          perf.salaryPerHour
                                        )}
                                        đ/h, {perf.bonusPercentage}%)
                                      </Text>
                                    )
                                  )}
                                </Stack>
                              ) : (
                                <Text size="sm" c="dimmed">
                                  Chưa có bậc lương
                                </Text>
                              )}
                            </Box>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Box>
      </Can>

      {/* Calendar View Section */}
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
        <Flex
          align="flex-start"
          justify="space-between"
          pt={32}
          pb={16}
          px={{ base: 8, md: 28 }}
          direction="row"
          gap={8}
        >
          <Box>
            <Text fw={700} fz="xl" mb={2}>
              {isAdmin ? "Lịch Livestream và xem lương" : "Xem lương"}
            </Text>
            <Text c="dimmed" fz="sm">
              {isAdmin
                ? "Xem lịch livestream và lương của nhân viên"
                : "Xem lương của bạn"}
            </Text>
          </Box>
        </Flex>

        <Divider my={0} />

        {/* Content */}
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
              {/* Mode toggle */}
              <Stack gap={4} hidden={!isAdmin}>
                <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                  Chế độ xem
                </Text>
                <SegmentedControl
                  value={viewMode}
                  onChange={(value) =>
                    setViewMode(value as "calendar" | "salary")
                  }
                  size="sm"
                  radius="md"
                  fullWidth
                  color="indigo"
                  data={
                    isAdmin
                      ? [
                          { label: "Xem lịch", value: "calendar" },
                          { label: "Xem lương", value: "salary" }
                        ]
                      : [{ label: "Xem lương", value: "salary" }]
                  }
                />
              </Stack>

              {viewMode === "calendar" && (
                <>
                  {/* Week navigation */}
                  <Stack gap={4}>
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

                  {/* Channel select */}
                  <Stack gap={4}>
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                      Kênh livestream
                    </Text>
                    <Select
                      placeholder="Chọn kênh"
                      value={selectedChannelId || ""}
                      onChange={(v) => setSelectedChannelId(v || null)}
                      data={channelOptions}
                      size="sm"
                      radius="md"
                    />
                  </Stack>
                </>
              )}

              {viewMode === "salary" && (
                <Stack gap={4}>
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                    Tháng xem lương
                  </Text>
                  <MonthPickerInput
                    placeholder="Chọn tháng"
                    value={salaryMonth}
                    onChange={(date) => setSalaryMonth(date || new Date())}
                    locale="vi"
                    size="sm"
                    radius="md"
                    maxDate={new Date()}
                    valueFormat="MM/YYYY"
                  />
                </Stack>
              )}
            </Stack>
          </Paper>

          {/* Calendar/Salary View */}
          {viewMode === "calendar" ? (
            !selectedChannelId ? (
              <Center h={400}>
                <Text c="dimmed">Vui lòng chọn kênh để xem lịch</Text>
              </Center>
            ) : isLoadingCalendar ? (
              <Center h={400}>
                <Loader />
              </Center>
            ) : !livestreamData || livestreamData.length === 0 ? (
              <Center h={400}>
                <Text c="dimmed" size="lg">
                  Chưa có lịch livestream trong tuần này
                </Text>
              </Center>
            ) : (
              <Stack gap="xl">
                <Can
                  roles={[
                    "admin",
                    "livestream-leader",
                    "livestream-emp",
                    "livestream-accounting",
                    "system-emp"
                  ]}
                >
                  <LivestreamCalendarRegion
                    role="host"
                    weekDays={weekDays}
                    employeesData={employeesData}
                    livestreamData={livestreamData}
                    onAssignEmployee={() => {}}
                    onUnassignEmployee={() => {}}
                    onOpenReport={handleOpenReport}
                    isWeekFixed={true}
                    currentUser={me}
                    onUpdateAlt={() => Promise.resolve({} as any)}
                    onCreateRequest={() => Promise.resolve({} as any)}
                    onUpdateRequestStatus={() => Promise.resolve({} as any)}
                    onGetRequest={() => Promise.resolve({} as any)}
                    onRefetch={() => {}}
                    onCalculateDailySalary={handleCalculateDailySalary}
                    isCalculatingSalary={calculatingDailySalary}
                    onCalculateIncome={handleCalculateIncome}
                    isCalculatingIncome={false}
                    hideEditButtons={true}
                  />
                </Can>

                <Can
                  roles={[
                    "admin",
                    "livestream-leader",
                    "livestream-ast",
                    "livestream-accounting",
                    "system-emp"
                  ]}
                >
                  <LivestreamCalendarRegion
                    role="assistant"
                    weekDays={weekDays}
                    employeesData={[]}
                    livestreamData={livestreamData}
                    onAssignEmployee={() => {}}
                    onUnassignEmployee={() => {}}
                    onOpenReport={handleOpenReport}
                    isWeekFixed={true}
                    currentUser={undefined}
                    onUpdateAlt={() => Promise.resolve({} as any)}
                    onCreateRequest={() => Promise.resolve({} as any)}
                    onUpdateRequestStatus={() => Promise.resolve({} as any)}
                    onGetRequest={() => Promise.resolve({} as any)}
                    onRefetch={() => {}}
                    hideEditButtons={true}
                  />
                </Can>
              </Stack>
            )
          ) : (
            <MonthlySalaryTable
              salaryData={monthlySalaryData}
              isLoading={isLoadingSalary}
              currentUserId={me?._id}
              isAdmin={isAdmin || false}
              dailyDetails={dailySalaryDetails}
            />
          )}
        </Box>
      </Box>
    </LivestreamLayout>
  )
}
