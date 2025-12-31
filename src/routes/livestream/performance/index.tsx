import { createFileRoute } from "@tanstack/react-router"
import { LivestreamLayout } from "../../../components/layouts/LivestreamLayout"
import { useLivestreamPerformance } from "../../../hooks/useLivestreamPerformance"
import { useLivestreamCore } from "../../../hooks/useLivestreamCore"
import { useLivestreamChannels } from "../../../hooks/useLivestreamChannels"
import { useUsers } from "../../../hooks/useUsers"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Box,
  Button,
  Divider,
  Flex,
  Group,
  rem,
  Text,
  ActionIcon,
  Stack,
  NumberInput,
  Select,
  Paper,
  Center,
  Loader,
  SegmentedControl
} from "@mantine/core"
import {
  IconEdit,
  IconPlus,
  IconTrash,
  IconCalculator,
  IconChevronLeft,
  IconChevronRight
} from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { Can } from "../../../components/common/Can"
import { CToast } from "../../../components/common/CToast"
import { useState, useMemo, useEffect } from "react"
import { CDataTable } from "../../../components/common/CDataTable"
import { ColumnDef } from "@tanstack/react-table"
import { DatePickerInput } from "@mantine/dates"
import { useForm, Controller } from "react-hook-form"
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import type { SearchLivestreamPerformanceResponse } from "../../../hooks/models"
import { LivestreamCalendarTable } from "../../../components/livestream/LivestreamCalendarTable"
import { MonthlySalaryTable } from "../../../components/livestream/MonthlySalaryTable"
import { CalculateIncomeModal } from "../../../components/livestream/CalculateIncomeModal"
import { openLivestreamReportModal } from "../../../components/livestream/LivestreamReportModal"
import { notifications } from "@mantine/notifications"

type PerformanceRule = SearchLivestreamPerformanceResponse["data"][0]

export const Route = createFileRoute("/livestream/performance/")({
  component: RouteComponent
})

interface PerformanceFormData {
  minIncome: number
  maxIncome: number
  salaryPerHour: number
  bonusPercentage: number
}

function PerformanceModal({
  performance,
  refetch
}: {
  performance?: PerformanceRule
  refetch: () => void
}) {
  const { createLivestreamPerformance, updateLivestreamPerformance } =
    useLivestreamPerformance()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<PerformanceFormData>({
    defaultValues: {
      minIncome: performance?.minIncome || 0,
      maxIncome: performance?.maxIncome || 0,
      salaryPerHour: performance?.salaryPerHour || 0,
      bonusPercentage: performance?.bonusPercentage || 0
    }
  })

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: createLivestreamPerformance,
    onSuccess: () => {
      CToast.success({ title: "Thêm bậc lương thành công" })
      modals.closeAll()
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi thêm bậc lương" })
    }
  })

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateLivestreamPerformance(id, data),
    onSuccess: () => {
      CToast.success({ title: "Cập nhật bậc lương thành công" })
      modals.closeAll()
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi cập nhật bậc lương" })
    }
  })

  const onSubmit = (data: PerformanceFormData) => {
    if (performance) {
      update({ id: performance._id, data })
    } else {
      create(data)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md">
        <Group grow>
          <Controller
            control={control}
            name="minIncome"
            rules={{ required: "Vui lòng nhập doanh thu tối thiểu" }}
            render={({ field }) => (
              <NumberInput
                {...field}
                label="Doanh thu tối thiểu (VNĐ)"
                placeholder="Nhập doanh thu tối thiểu"
                error={errors.minIncome?.message}
                thousandSeparator=","
                min={0}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="maxIncome"
            rules={{ required: "Vui lòng nhập doanh thu tối đa" }}
            render={({ field }) => (
              <NumberInput
                {...field}
                label="Doanh thu tối đa (VNĐ)"
                placeholder="Nhập doanh thu tối đa"
                error={errors.maxIncome?.message}
                thousandSeparator=","
                min={0}
                required
              />
            )}
          />
        </Group>

        <Group grow>
          <Controller
            control={control}
            name="salaryPerHour"
            rules={{ required: "Vui lòng nhập lương theo giờ" }}
            render={({ field }) => (
              <NumberInput
                {...field}
                label="Lương theo giờ (VNĐ)"
                placeholder="Nhập lương theo giờ"
                error={errors.salaryPerHour?.message}
                thousandSeparator=","
                min={0}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="bonusPercentage"
            rules={{ required: "Vui lòng nhập % thưởng" }}
            render={({ field }) => (
              <NumberInput
                {...field}
                label="Phần trăm thưởng (%)"
                placeholder="Nhập % thưởng"
                error={errors.bonusPercentage?.message}
                min={0}
                max={100}
                decimalScale={2}
                required
              />
            )}
          />
        </Group>

        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            onClick={() => modals.closeAll()}
            disabled={creating || updating}
          >
            Hủy
          </Button>
          <Button type="submit" loading={creating || updating}>
            {performance ? "Cập nhật" : "Thêm mới"}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}

function RouteComponent() {
  const {
    searchLivestreamPerformance,
    deleteLivestreamPerformance,
    calculateDailyPerformance,
    calculateLivestreamMonthSalary
  } = useLivestreamPerformance()

  const { getLivestreamsByDateRange, reportLivestream } = useLivestreamCore()
  const { searchLivestreamChannels } = useLivestreamChannels()
  const { getMe } = useUsers()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [sortOrder] = useState<"asc" | "desc">("asc")

  // Calendar filters
  const [weekDate, setWeekDate] = useState<Date>(new Date())
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null
  )
  const [viewMode, setViewMode] = useState<"calendar" | "salary">("calendar")

  // Get current user
  const { data: me } = useQuery({
    queryKey: ["getMe"],
    queryFn: () => getMe(),
    select: (data) => data.data
  })

  const isAdmin = useMemo(() => {
    return me?.roles?.some((role) =>
      ["admin", "system-emp", "livestream-leader"].includes(role)
    )
  }, [me])

  useEffect(() => {
    setViewMode(isAdmin ? "calendar" : "salary")
  }, [me])

  const {
    data: performanceData,
    refetch,
    isLoading
  } = useQuery({
    queryKey: ["searchLivestreamPerformance", page, limit, sortOrder],
    queryFn: () =>
      searchLivestreamPerformance({
        page,
        limit,
        sortOrder
      }),
    select: (data) => data.data
  })

  const { mutate: deletePerformance } = useMutation({
    mutationFn: deleteLivestreamPerformance,
    onSuccess: () => {
      CToast.success({ title: "Xóa bậc lương thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi xóa bậc lương" })
    }
  })

  const { mutate: calculateDaily, isPending: calculating } = useMutation({
    mutationFn: calculateDailyPerformance,
    onSuccess: (response) => {
      const data = response.data
      CToast.success({
        title: "Tính toán hiệu suất thành công",
        subtitle: `Cập nhật: ${data.snapshotsUpdated}, Bỏ qua: ${data.snapshotsSkipped}`
      })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi tính toán hiệu suất" })
    }
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
        refetch()
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

  const openPerformanceModal = (performance?: PerformanceRule) => {
    modals.open({
      title: (
        <b>{performance ? "Chỉnh sửa bậc lương" : "Thêm bậc lương mới"}</b>
      ),
      children: (
        <PerformanceModal performance={performance} refetch={refetch} />
      ),
      size: "lg"
    })
  }

  const openCalculateModal = () => {
    let selectedDate: Date | null = new Date()

    modals.open({
      title: <b>Tính toán hiệu suất hàng ngày</b>,
      children: (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Tính toán lương cho tất cả các livestream snapshot trong ngày được
            chọn dựa trên bậc lương đã cấu hình.
          </Text>
          <DatePickerInput
            label="Ngày"
            placeholder="Chọn ngày"
            value={selectedDate}
            onChange={(date) => (selectedDate = date)}
            locale="vi"
            required
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => modals.closeAll()}>
              Hủy
            </Button>
            <Button
              loading={calculating}
              onClick={() => {
                if (selectedDate) {
                  calculateDaily({
                    date: selectedDate
                  })
                  modals.closeAll()
                }
              }}
            >
              Tính toán
            </Button>
          </Group>
        </Stack>
      ),
      size: "md"
    })
  }

  const confirmDelete = (performance: PerformanceRule) => {
    modals.openConfirmModal({
      title: "Xác nhận xóa",
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa bậc lương từ{" "}
          <strong>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND"
            }).format(performance.minIncome)}
          </strong>{" "}
          đến{" "}
          <strong>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND"
            }).format(performance.maxIncome)}
          </strong>
          ?
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => deletePerformance({ id: performance._id })
    })
  }

  const performances = performanceData?.data || []
  const totalPerformances = performanceData?.total || 0

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

  // Fetch monthly salary data
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

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
      // Group snapshots by userId
      const userSnapshotsMap = new Map<string, any[]>()

      livestream.snapshots.forEach((snapshot) => {
        if (snapshot.assignee && snapshot.salary?.total) {
          const userId = snapshot.assignee._id
          if (!userSnapshotsMap.has(userId)) {
            userSnapshotsMap.set(userId, [])
          }
          userSnapshotsMap.get(userId)!.push(snapshot)
        }
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

  // Channel options
  const channelOptions = useMemo(() => {
    if (!channelsData) return []
    return channelsData.map((channel) => ({
      label: channel.name,
      value: channel._id
    }))
  }, [channelsData])

  const columns = useMemo<ColumnDef<PerformanceRule>[]>(
    () => [
      {
        accessorKey: "minIncome",
        header: "Doanh thu tối thiểu",
        cell: ({ row }) => (
          <Text fw={500}>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND"
            }).format(row.original.minIncome)}
          </Text>
        )
      },
      {
        accessorKey: "maxIncome",
        header: "Doanh thu tối đa",
        cell: ({ row }) => (
          <Text fw={500}>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND"
            }).format(row.original.maxIncome)}
          </Text>
        )
      },
      {
        accessorKey: "salaryPerHour",
        header: "Lương/giờ",
        cell: ({ row }) => (
          <Text fw={600} c="indigo">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND"
            }).format(row.original.salaryPerHour)}
          </Text>
        )
      },
      {
        accessorKey: "bonusPercentage",
        header: "% Thưởng",
        cell: ({ row }) => (
          <Text fw={600} c="teal">
            {row.original.bonusPercentage}%
          </Text>
        )
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <Group gap="xs">
            <Can roles={["admin", "livestream-leader"]}>
              <ActionIcon
                variant="light"
                color="indigo"
                size="sm"
                onClick={() => openPerformanceModal(row.original)}
              >
                <IconEdit size={16} />
              </ActionIcon>
              <ActionIcon
                variant="light"
                color="red"
                size="sm"
                onClick={() => confirmDelete(row.original)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Can>
          </Group>
        )
      }
    ],
    [openPerformanceModal, confirmDelete]
  )

  return (
    <LivestreamLayout>
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
                Bậc lương Livestream
              </Text>
              <Text c="dimmed" fz="sm">
                Quản lý các bậc lương dựa trên doanh thu
              </Text>
            </Box>

            <Group>
              <Can roles={["admin", "livestream-leader"]}>
                <Button
                  leftSection={<IconCalculator size={16} />}
                  variant="light"
                  onClick={openCalculateModal}
                  loading={calculating}
                  size="md"
                  radius="xl"
                >
                  Tính toán tự động
                </Button>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => openPerformanceModal()}
                  size="md"
                  radius="xl"
                >
                  Thêm bậc lương
                </Button>
              </Can>
            </Group>
          </Flex>

          <Divider my={0} />

          {/* Content */}
          <Box px={{ base: 4, md: 28 }} py={20}>
            <CDataTable
              columns={columns}
              data={performances}
              isLoading={isLoading}
              page={page}
              totalPages={Math.ceil(totalPerformances / limit)}
              onPageChange={setPage}
              onPageSizeChange={setLimit}
              initialPageSize={limit}
              hideSearch
              getRowId={(row) => row._id}
            />

            {/* Summary */}
            {performances.length > 0 && (
              <Flex justify="space-between" align="center" mt={16}>
                <Text c="dimmed" fz="sm">
                  Hiển thị {performances.length} / {totalPerformances} bậc lương
                </Text>
              </Flex>
            )}
          </Box>
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
              Lịch Livestream
            </Text>
            <Text c="dimmed" fz="sm">
              Xem lịch phát sóng livestream theo tuần
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
              <Stack gap={4}>
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
                    "system-emp"
                  ]}
                >
                  <LivestreamCalendarTable
                    role="host"
                    weekDays={weekDays}
                    employeesData={[]}
                    livestreamData={livestreamData}
                    onAssignEmployee={() => {}}
                    onUnassignEmployee={() => {}}
                    viewMode="schedule"
                    onOpenReport={handleOpenReport}
                    isWeekFixed={true}
                    currentUser={me}
                    onUpdateAlt={() => Promise.resolve({} as any)}
                    onCreateRequest={() => Promise.resolve({} as any)}
                    onUpdateRequest={() => Promise.resolve({} as any)}
                    onDeleteRequest={() => Promise.resolve({} as any)}
                    onUpdateRequestStatus={() => Promise.resolve({} as any)}
                    onGetRequest={() => Promise.resolve({} as any)}
                    onRefetch={() => {}}
                    onCalculateDailySalary={handleCalculateDailySalary}
                    isCalculatingSalary={calculatingDailySalary}
                    onCalculateIncome={handleCalculateIncome}
                    hideEditButtons={true}
                  />
                </Can>

                <Can
                  roles={[
                    "admin",
                    "livestream-leader",
                    "livestream-ast",
                    "system-emp"
                  ]}
                >
                  <LivestreamCalendarTable
                    role="assistant"
                    weekDays={weekDays}
                    employeesData={[]}
                    livestreamData={livestreamData}
                    onAssignEmployee={() => {}}
                    onUnassignEmployee={() => {}}
                    viewMode="schedule"
                    onOpenReport={handleOpenReport}
                    isWeekFixed={true}
                    currentUser={undefined}
                    onUpdateAlt={() => Promise.resolve({} as any)}
                    onCreateRequest={() => Promise.resolve({} as any)}
                    onUpdateRequest={() => Promise.resolve({} as any)}
                    onDeleteRequest={() => Promise.resolve({} as any)}
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
