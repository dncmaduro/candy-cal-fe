import { createFileRoute } from "@tanstack/react-router"
import { LivestreamLayout } from "../../../components/layouts/LivestreamLayout"
import { useLivestreamCore } from "../../../hooks/useLivestreamCore"
import { useLivestreamChannels } from "../../../hooks/useLivestreamChannels"
import { useLivestreamAnalytics } from "../../../hooks/useLivestreamAnalytics"
import { useUsers } from "../../../hooks/useUsers"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
  Divider,
  Flex,
  Loader,
  rem,
  Text,
  Select,
  Paper,
  Stack,
  Center,
  Group,
  NumberFormatter,
  SegmentedControl
} from "@mantine/core"
import { DatePickerInput, MonthPickerInput } from "@mantine/dates"
import { useState, useMemo, useEffect } from "react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { CDataTable } from "../../../components/common/CDataTable"
import { ColumnDef } from "@tanstack/react-table"
import { HostRevenueRankingsChart } from "../../../components/livestream/HostRevenueRankingsChart"
import { AssistantRevenueRankingsChart } from "../../../components/livestream/AssistantRevenueRankingsChart"

type SearchParams = {
  mode?: "range" | "month"
  viewMode?: "reports" | "host-rankings" | "assistant-rankings"
  channelId?: string
  assigneeId?: string
  startDate?: string
  endDate?: string
  month?: string
}

export const Route = createFileRoute("/livestream/reports/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      mode: (search.mode as "range" | "month") || "range",
      viewMode:
        (search.viewMode as
          | "reports"
          | "host-rankings"
          | "assistant-rankings") || "reports",
      channelId: search.channelId as string,
      assigneeId: search.assigneeId as string,
      startDate: search.startDate as string,
      endDate: search.endDate as string,
      month: search.month as string
    }
  }
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const searchParams = Route.useSearch()

  const { getLivestreamsByDateRange } = useLivestreamCore()
  const { searchLivestreamChannels } = useLivestreamChannels()
  const {
    getAggregatedMetrics,
    getHostRevenueRankings,
    getAssistantRevenueRankings
  } = useLivestreamAnalytics()
  const { publicSearchUser } = useUsers()

  // Initialize state from URL params
  const [mode, setMode] = useState<"range" | "month">(
    searchParams.mode || "range"
  )
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(
    searchParams.month ? new Date(searchParams.month) : new Date()
  )
  const [startDate, setStartDate] = useState<Date | null>(
    searchParams.startDate ? new Date(searchParams.startDate) : new Date()
  )
  const [endDate, setEndDate] = useState<Date | null>(
    searchParams.endDate ? new Date(searchParams.endDate) : new Date()
  )
  const [channelId, setChannelId] = useState<string | null>(
    searchParams.channelId || null
  )
  const [assigneeId, setAssigneeId] = useState<string | null>(
    searchParams.assigneeId || null
  )
  const [viewMode, setViewMode] = useState<
    "reports" | "host-rankings" | "assistant-rankings"
  >(searchParams.viewMode || "reports")

  // Sync state to URL
  useEffect(() => {
    const params: SearchParams = {
      mode,
      viewMode,
      channelId: channelId || undefined,
      assigneeId: assigneeId || undefined
    }

    if (mode === "range") {
      params.startDate = startDate ? format(startDate, "yyyy-MM-dd") : undefined
      params.endDate = endDate ? format(endDate, "yyyy-MM-dd") : undefined
    } else {
      params.month = selectedMonth
        ? format(selectedMonth, "yyyy-MM")
        : undefined
    }

    navigate({
      search: params,
      replace: true
    })
  }, [
    mode,
    viewMode,
    channelId,
    assigneeId,
    startDate,
    endDate,
    selectedMonth,
    navigate
  ])

  // Calculate date range based on mode
  const dateRange = useMemo<[Date | null, Date | null]>(() => {
    if (mode === "month" && selectedMonth) {
      return [startOfMonth(selectedMonth), endOfMonth(selectedMonth)]
    }
    return [startDate, endDate]
  }, [mode, selectedMonth, startDate, endDate])

  // Fetch channels
  const { data: channelsData } = useQuery({
    queryKey: ["searchLivestreamChannels"],
    queryFn: async () => {
      const response = await searchLivestreamChannels({ page: 1, limit: 100 })
      return response.data.data
    }
  })

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

  // Fetch livestream assistants
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

  // Combine and deduplicate employees
  const employeesData = useMemo(() => {
    const emps = [
      ...(livestreamEmpData || []),
      ...(livestreamAstData || []),
      ...(livestreamLeaderData || [])
    ]
    return emps.filter((emp, index, self) => {
      return self.findIndex((e) => e._id === emp._id) === index
    })
  }, [livestreamEmpData, livestreamAstData, livestreamLeaderData])

  // Auto-select first channel
  useMemo(() => {
    if (channelsData && channelsData.length > 0 && !channelId) {
      setChannelId(channelsData[0]._id)
    }
  }, [channelsData, channelId])

  // Prepare channel options
  const channelOptions = useMemo(() => {
    if (!channelsData) return []
    return channelsData.map((channel) => ({
      label: channel.name,
      value: channel._id
    }))
  }, [channelsData])

  // Prepare employee options
  const employeeOptions = useMemo(() => {
    if (!employeesData) return []
    return employeesData.map((emp) => ({
      label: emp.name,
      value: emp._id
    }))
  }, [employeesData])

  // Fetch aggregated metrics
  const { data: metricsData, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["getAggregatedMetrics", dateRange[0], dateRange[1], channelId],
    queryFn: async () => {
      if (!dateRange[0] || !dateRange[1] || !channelId) return null
      const response = await getAggregatedMetrics({
        startDate: dateRange[0],
        endDate: dateRange[1],
        channel: channelId,
        for: "host",
        assignee: assigneeId ?? undefined
      })
      return response.data
    },
    enabled: !!dateRange[0] && !!dateRange[1] && !!channelId
  })

  // Fetch host revenue rankings
  const { data: hostRankingsData, isLoading: isLoadingHostRankings } = useQuery(
    {
      queryKey: ["getHostRevenueRankings", dateRange[0], dateRange[1]],
      queryFn: async () => {
        if (!dateRange[0] || !dateRange[1]) return null
        const response = await getHostRevenueRankings({
          startDate: format(dateRange[0], "yyyy-MM-dd"),
          endDate: format(dateRange[1], "yyyy-MM-dd")
        })
        return response.data
      },
      enabled: !!dateRange[0] && !!dateRange[1]
    }
  )

  const { data: assistantRankingsData, isLoading: isLoadingAssistantRankings } =
    useQuery({
      queryKey: ["getAssistantRevenueRankings", dateRange[0], dateRange[1]],
      queryFn: async () => {
        if (!dateRange[0] || !dateRange[1]) return null
        const response = await getAssistantRevenueRankings({
          startDate: format(dateRange[0], "yyyy-MM-dd"),
          endDate: format(dateRange[1], "yyyy-MM-dd")
        })
        return response.data
      },
      enabled: !!dateRange[0] && !!dateRange[1]
    })

  // Fetch livestream data
  const { data: livestreamData, isLoading: isLoadingLivestreams } = useQuery({
    queryKey: [
      "getLivestreamsByDateRange",
      dateRange[0],
      dateRange[1],
      channelId
    ],
    queryFn: async () => {
      if (!dateRange[0] || !dateRange[1] || !channelId) return []
      const response = await getLivestreamsByDateRange({
        startDate: format(dateRange[0], "yyyy-MM-dd"),
        endDate: format(dateRange[1], "yyyy-MM-dd"),
        channel: channelId
      })
      return response.data.livestreams
    },
    enabled: !!dateRange[0] && !!dateRange[1] && !!channelId
  })

  // Prepare table data - only host snapshots
  const tableData = useMemo(() => {
    if (!livestreamData) return []

    const rows: Array<{
      dateKey: string
      date: string
      dayOfWeek: string
      period: string
      assignee: string
      assigneeId: string
      income: number
      realIncome: number
      adsCost: number
      clickRate: number
      avgViewingDuration: number
      comments: number
      ordersNote: string
      rating: string
      snapshotKpi: number
      orders: number
      isSummary?: boolean
    }> = []

    // Group snapshots by date
    const dateGroups = new Map<string, typeof rows>()

    livestreamData.forEach((livestream) => {
      const date = new Date(livestream.date)
      const dateStr = format(date, "dd/MM/yyyy")
      // day of week return by format is in Vietnamese
      const dayOfWeekEn = format(date, "EEEE")
      // TODO: translate day of week to Vietnamese
      const dayOfWeek =
        dayOfWeekEn === "Monday"
          ? "Thứ 2"
          : dayOfWeekEn === "Tuesday"
            ? "Thứ 3"
            : dayOfWeekEn === "Wednesday"
              ? "Thứ 4"
              : dayOfWeekEn === "Thursday"
                ? "Thứ 5"
                : dayOfWeekEn === "Friday"
                  ? "Thứ 6"
                  : dayOfWeekEn === "Saturday"
                    ? "Thứ 7"
                    : dayOfWeekEn === "Sunday"
                      ? "Chủ nhật"
                      : dayOfWeekEn

      // Filter only host snapshots
      const hostSnapshots = livestream.snapshots.filter(
        (s) => s.period.for === "host"
      )

      if (!dateGroups.has(dateStr)) {
        dateGroups.set(dateStr, [])
      }

      hostSnapshots.forEach((snapshot) => {
        const periodStr = `${String(snapshot.period.startTime.hour).padStart(2, "0")}:${String(snapshot.period.startTime.minute).padStart(2, "0")} - ${String(snapshot.period.endTime.hour).padStart(2, "0")}:${String(snapshot.period.endTime.minute).padStart(2, "0")}`

        // Filter by assignee if selected
        if (assigneeId && snapshot.assignee?._id !== assigneeId) {
          return
        }

        const rowData = {
          dateKey: dateStr,
          date: dateStr,
          dayOfWeek,
          period: periodStr,
          assignee:
            snapshot.altAssignee === "other"
              ? snapshot.altOtherAssignee || "Khác"
              : !!snapshot.altAssignee
                ? employeesData.find((e) => e._id === snapshot.altAssignee)
                    ?.name || "Khác"
                : snapshot.assignee?.name || "Chưa phân",
          assigneeId: snapshot.assignee?._id || "",
          income: snapshot.income || 0,
          realIncome: snapshot.realIncome || 0,
          adsCost: snapshot.adsCost || 0,
          clickRate: snapshot.clickRate || 0,
          avgViewingDuration: snapshot.avgViewingDuration || 0,
          comments: snapshot.comments || 0,
          ordersNote: snapshot.ordersNote || "",
          rating: snapshot.rating || "",
          snapshotKpi: snapshot.snapshotKpi || 0,
          orders: snapshot.orders || 0
        }

        rows.push(rowData)
        dateGroups.get(dateStr)!.push(rowData)
      })
    })

    // Add summary rows for each date
    const finalRows: typeof rows = []
    const sortedDates = Array.from(dateGroups.keys()).sort()

    sortedDates.forEach((dateStr) => {
      const dateRows = dateGroups.get(dateStr)!

      // Add all rows for this date
      finalRows.push(...dateRows)

      // Calculate and add summary row
      const totalIncome = dateRows.reduce((sum, row) => sum + row.income, 0)
      const totalRealIncome = dateRows.reduce(
        (sum, row) => sum + row.realIncome,
        0
      )
      const totalAdsCost = dateRows.reduce((sum, row) => sum + row.adsCost, 0)
      const totalComments = dateRows.reduce((sum, row) => sum + row.comments, 0)
      const totalKpi = dateRows.reduce((sum, row) => sum + row.snapshotKpi, 0)
      const totalOrders = dateRows.reduce((sum, row) => sum + row.orders, 0)

      // const firstRow = dateRows[0]
      finalRows.push({
        dateKey: dateStr,
        date: dateStr,
        dayOfWeek: "",
        period: `Tổng ${dateRows.length} ca`,
        assignee: "",
        assigneeId: "",
        income: totalIncome,
        realIncome: totalRealIncome,
        adsCost: totalAdsCost,
        clickRate: 0,
        avgViewingDuration: 0,
        comments: totalComments,
        ordersNote: "",
        rating: "",
        snapshotKpi: totalKpi,
        orders: totalOrders,
        isSummary: true
      })
    })

    return finalRows
  }, [livestreamData, assigneeId])

  const renderMetricsCards = () => {
    if (isLoadingMetrics) {
      return (
        <Center h={120}>
          <Loader />
        </Center>
      )
    }

    if (!metricsData) {
      return (
        <Center h={120}>
          <Text c="dimmed">Chọn khoảng ngày và kênh để xem thống kê</Text>
        </Center>
      )
    }

    return (
      <Group grow>
        <Paper p="md" radius="md" withBorder>
          <Stack gap={4}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Tổng doanh thu
            </Text>
            <Text size="xl" fw={700} c="blue.6">
              <NumberFormatter
                value={Math.round(metricsData.totalIncome)}
                thousandSeparator
                suffix=" VNĐ"
              />
            </Text>
          </Stack>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Stack gap={4}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Tổng chi phí quảng cáo
            </Text>
            <Text size="xl" fw={700} c="red.6">
              <NumberFormatter
                value={Math.round(metricsData.totalAdsCost)}
                thousandSeparator
                suffix=" VNĐ"
              />{" "}
              (
              <NumberFormatter
                value={
                  (metricsData.totalAdsCost / metricsData.totalIncome) * 100
                }
                suffix="%"
                decimalScale={2}
              />
              )
            </Text>
          </Stack>
        </Paper>

        {/* <Paper p="md" radius="md" withBorder>
          <Stack gap={4}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Tổng bình luận
            </Text>
            <Text size="xl" fw={700} c="green.6">
              <NumberFormatter
                value={metricsData.totalComments}
                thousandSeparator
              />
            </Text>
          </Stack>
        </Paper> */}

        <Paper p="md" radius="md" withBorder>
          <Stack gap={4}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Tổng đơn hàng
            </Text>
            <Text size="xl" fw={700} c="green.6">
              <NumberFormatter
                value={metricsData.totalOrders}
                thousandSeparator
              />
            </Text>
          </Stack>
        </Paper>
      </Group>
    )
  }

  // Enhanced table data with background styling for date groups
  const enhancedTableData = useMemo(() => {
    const uniqueDates = [...new Set(tableData.map((r) => r.dateKey))]
    const dateColorMap = new Map<string, number>()
    uniqueDates.forEach((date, idx) => {
      dateColorMap.set(date, idx)
    })

    return tableData.map((row) => ({
      ...row,
      _dateGroupIndex: dateColorMap.get(row.dateKey) || 0
    }))
  }, [tableData])

  // Custom columns - simplified without individual cell backgrounds
  const styledColumns = useMemo<ColumnDef<(typeof enhancedTableData)[0]>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Ngày",
        cell: ({ row }) => {
          if (row.original.isSummary) {
            return null // Don't show date for summary row
          }
          return (
            <Stack gap={0}>
              <Text size="sm" fw={600}>
                {row.original.date}
              </Text>
              <Text size="xs" c="dimmed">
                {row.original.dayOfWeek}
              </Text>
            </Stack>
          )
        }
      },
      {
        accessorKey: "period",
        header: "Khung giờ",
        cell: ({ getValue, row }) => (
          <Text
            size="sm"
            fw={row.original.isSummary ? 700 : 500}
            c={row.original.isSummary ? "indigo" : undefined}
          >
            {getValue() as string}
          </Text>
        )
      },
      {
        accessorKey: "assignee",
        header: "Host",
        cell: ({ getValue, row }) => {
          if (row.original.isSummary) {
            return null
          }
          return <Text size="sm">{getValue() as string}</Text>
        }
      },
      {
        accessorKey: "income",
        header: "DT",
        cell: ({ getValue, row }) => {
          const value = getValue() as number
          return (
            <Text
              size="sm"
              fw={row.original.isSummary ? 700 : 600}
              c={value > 0 ? "indigo" : "dimmed"}
            >
              <NumberFormatter
                value={value}
                thousandSeparator
                decimalScale={0}
              />
            </Text>
          )
        }
      },
      {
        accessorKey: "realIncome",
        header: "DT thực",
        cell: ({ getValue, row }) => {
          const value = getValue() as number
          return (
            <Text
              size="sm"
              fw={row.original.isSummary ? 700 : 600}
              c={value > 0 ? "blue" : "dimmed"}
            >
              <NumberFormatter
                value={value}
                thousandSeparator
                decimalScale={0}
              />
            </Text>
          )
        }
      },
      {
        accessorKey: "adsCost",
        header: "Ads",
        cell: ({ getValue, row }) => {
          const value = getValue() as number
          return (
            <Text
              size="sm"
              fw={row.original.isSummary ? 700 : 600}
              c={value > 0 ? "orange" : "dimmed"}
            >
              <NumberFormatter
                value={value}
                thousandSeparator
                decimalScale={0}
              />
            </Text>
          )
        }
      },
      {
        accessorKey: "orders",
        header: "Số đơn",
        cell: ({ getValue, row }) => {
          const value = getValue() as number
          return (
            <Text
              size="sm"
              fw={row.original.isSummary ? 700 : 600}
              c={value > 0 ? "teal" : "dimmed"}
            >
              <NumberFormatter value={value} />
            </Text>
          )
        }
      },
      {
        accessorKey: "CAC",
        header: "Ads/DT",
        cell: ({ row }) => {
          const income = row.original.income as number
          const adsCost = row.original.adsCost as number
          const cac = income > 0 ? (adsCost / income) * 100 : 0
          return (
            <Text
              size="sm"
              fw={row.original.isSummary ? 700 : 600}
              c={cac > 0 ? "black" : "dimmed"}
            >
              <NumberFormatter value={cac} decimalScale={2} />%
            </Text>
          )
        }
      },
      {
        accessorKey: "AOV",
        header: "AOV",
        cell: ({ row }) => {
          const income = row.original.income as number
          const adsCost = row.original.adsCost as number
          const orders = row.original.orders as number
          const aov = (income - adsCost) / orders
          return (
            <Text
              size="sm"
              fw={row.original.isSummary ? 700 : 600}
              c={aov > 0 ? "black" : "dimmed"}
            >
              <NumberFormatter value={aov} thousandSeparator decimalScale={0} />
            </Text>
          )
        }
      },
      {
        accessorKey: "CPO",
        header: "CPO",
        cell: ({ row }) => {
          const adsCost = row.original.adsCost as number
          const orders = row.original.orders as number
          const cpo = adsCost / orders
          return (
            <Text
              size="sm"
              fw={row.original.isSummary ? 700 : 600}
              c={cpo > 0 ? "black" : "dimmed"}
            >
              <NumberFormatter value={cpo} thousandSeparator decimalScale={0} />
            </Text>
          )
        }
      },
      {
        accessorKey: "snapshotKpi",
        header: "KPI",
        cell: ({ row }) => {
          const kpi = row.original.snapshotKpi || 0
          const income = row.original.income || 0
          const percentage = kpi > 0 ? (income / kpi) * 100 : 0

          if (row.original.isSummary) {
            return (
              <Stack gap={0}>
                <Text size="sm" fw={700} c="black">
                  <NumberFormatter value={kpi} thousandSeparator />
                </Text>
                <Text size="xs" c="dimmed">
                  ({percentage.toFixed(1)}%)
                </Text>
              </Stack>
            )
          }

          return (
            <Stack gap={0}>
              <Text size="sm" fw={600} c="black">
                <NumberFormatter value={kpi} thousandSeparator />
              </Text>
              {kpi > 0 && (
                <Text size="xs" c={percentage >= 100 ? "green" : "orange"}>
                  ({percentage.toFixed(1)}%)
                </Text>
              )}
            </Stack>
          )
        }
      },
      {
        accessorKey: "clickRate",
        header: "Tỷ lệ click (%)",
        cell: ({ getValue, row }) => {
          if (row.original.isSummary) {
            return null
          }
          const value = getValue() as number
          return (
            <Text size="sm" c={value > 0 ? undefined : "dimmed"}>
              <NumberFormatter value={value} decimalScale={2} />%
            </Text>
          )
        }
      },
      {
        accessorKey: "avgViewingDuration",
        header: "TGXTB (giây)",
        cell: ({ getValue, row }) => {
          if (row.original.isSummary) {
            return null
          }
          const value = getValue() as number
          return (
            <Text size="sm" c={value > 0 ? undefined : "dimmed"}>
              <NumberFormatter value={value} decimalScale={1} />
            </Text>
          )
        }
      },
      {
        accessorKey: "comments",
        header: "Bình luận",
        cell: ({ getValue, row }) => {
          const value = getValue() as number
          return (
            <Text
              size="sm"
              fw={row.original.isSummary ? 700 : undefined}
              c={value > 0 ? undefined : "dimmed"}
            >
              <NumberFormatter value={value} thousandSeparator />
            </Text>
          )
        }
      },
      {
        accessorKey: "ordersNote",
        header: "Ghi chú",
        cell: ({ getValue, row }) => {
          if (row.original.isSummary) {
            return null
          }
          const value = getValue() as string
          return (
            <Text size="sm" c={value ? undefined : "dimmed"} lineClamp={2}>
              {value || "—"}
            </Text>
          )
        }
      },
      {
        accessorKey: "rating",
        header: "Đánh giá",
        cell: ({ getValue, row }) => {
          if (row.original.isSummary) {
            return null
          }
          const value = getValue() as string
          return (
            <Text size="sm" c={value ? undefined : "dimmed"} lineClamp={2}>
              {value || "—"}
            </Text>
          )
        }
      }
    ],
    []
  )

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
              Báo cáo Livestream
            </Text>
            <Text c="dimmed" fz="sm">
              Xem thống kê và báo cáo chi tiết các ca livestream
            </Text>
          </Box>
        </Flex>

        <Divider my={0} />

        <Box px={{ base: 4, md: 28 }} py={20}>
          {/* Mode Selector */}
          <Box mb="lg">
            <SegmentedControl
              value={mode}
              onChange={(value) => setMode(value as "range" | "month")}
              size="sm"
              data={[
                { label: "Theo khoảng", value: "range" },
                { label: "Theo tháng", value: "month" }
              ]}
              fullWidth
            />
          </Box>

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
              {/* Date Range or Month Picker */}
              {mode === "range" ? (
                <Group grow>
                  <Stack gap={4}>
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                      Từ ngày
                    </Text>
                    <DatePickerInput
                      placeholder="Chọn ngày bắt đầu"
                      value={startDate}
                      onChange={setStartDate}
                      size="sm"
                      radius="md"
                      clearable
                      valueFormat="DD/MM/YYYY"
                    />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                      Đến ngày
                    </Text>
                    <DatePickerInput
                      placeholder="Chọn ngày kết thúc"
                      value={endDate}
                      onChange={setEndDate}
                      size="sm"
                      radius="md"
                      clearable
                      valueFormat="DD/MM/YYYY"
                    />
                  </Stack>
                </Group>
              ) : (
                <Stack gap={4}>
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                    Chọn tháng
                  </Text>
                  <MonthPickerInput
                    placeholder="Chọn tháng"
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                    size="sm"
                    radius="md"
                    clearable
                    valueFormat="MM/YYYY"
                  />
                </Stack>
              )}

              {/* Channel select */}
              <Stack gap={4}>
                <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                  Kênh livestream
                </Text>
                <Select
                  placeholder="Chọn kênh"
                  value={channelId || ""}
                  clearable
                  onChange={(v) => setChannelId(v || null)}
                  data={channelOptions}
                  size="sm"
                  radius="md"
                />
              </Stack>

              {/* Assignee select */}
              <Stack gap={4}>
                <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                  Host
                </Text>
                <Select
                  placeholder="Tất cả host"
                  value={assigneeId || ""}
                  onChange={(v) => setAssigneeId(v || null)}
                  data={employeeOptions}
                  size="sm"
                  radius="md"
                  clearable
                  searchable
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Metrics Cards */}
          <Box mb="lg">{renderMetricsCards()}</Box>

          {/* View Mode Selector */}
          <Box mb="lg">
            <SegmentedControl
              value={viewMode}
              onChange={(value) =>
                setViewMode(
                  value as "reports" | "host-rankings" | "assistant-rankings"
                )
              }
              size="sm"
              data={[
                { label: "Bảng báo cáo", value: "reports" },
                { label: "Xếp hạng host", value: "host-rankings" },
                { label: "Xếp hạng trợ live", value: "assistant-rankings" }
              ]}
              fullWidth
            />
          </Box>

          {/* Reports Table */}
          {viewMode === "reports" && (
            <Box>
              <style>
                {`
                  .date-group-odd {
                    background-color: var(--mantine-color-gray-0) !important;
                  }
                  .date-group-odd:hover {
                    background-color: var(--mantine-color-gray-1) !important;
                  }
                  .summary-row {
                    background-color: var(--mantine-color-indigo-0) !important;
                    font-weight: 600;
                  }
                  .summary-row:hover {
                    background-color: var(--mantine-color-indigo-1) !important;
                  }
                `}
              </style>
              <CDataTable
                columns={styledColumns}
                data={enhancedTableData}
                isLoading={isLoadingLivestreams}
                page={1}
                totalPages={1}
                onPageChange={() => {}}
                onPageSizeChange={() => {}}
                initialPageSize={100}
                pageSizeOptions={[50, 100, 200]}
                hideSearch
                className="[&_th]:text-xs!"
                getRowId={(row) =>
                  `${row.dateKey}-${row.period}-${row.isSummary ? "summary" : row.assigneeId}`
                }
                getRowClassName={(row) => {
                  if (row.original.isSummary) return "summary-row"
                  return row.original._dateGroupIndex % 2 === 1
                    ? "date-group-odd"
                    : ""
                }}
              />
            </Box>
          )}

          {/* Rankings Chart */}
          {viewMode === "host-rankings" && (
            <HostRevenueRankingsChart
              isLoadingRankings={isLoadingHostRankings}
              rankingsData={hostRankingsData}
            />
          )}

          {/* Assistants Chart */}
          {viewMode === "assistant-rankings" && (
            <AssistantRevenueRankingsChart
              isLoadingRankings={isLoadingAssistantRankings}
              rankingsData={assistantRankingsData}
            />
          )}
        </Box>
      </Box>
    </LivestreamLayout>
  )
}
