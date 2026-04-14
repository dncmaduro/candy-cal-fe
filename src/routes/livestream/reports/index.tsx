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
  SegmentedControl,
  SimpleGrid,
  Collapse,
  Badge,
  Button
} from "@mantine/core"
import { DatePickerInput, MonthPickerInput } from "@mantine/dates"
import { useState, useMemo, useEffect } from "react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { CDataTable } from "../../../components/common/CDataTable"
import { ColumnDef } from "@tanstack/react-table"
import { LineChart } from "@mantine/charts"
import { HostRevenueRankingsChart } from "../../../components/livestream/HostRevenueRankingsChart"
import { AssistantRevenueRankingsChart } from "../../../components/livestream/AssistantRevenueRankingsChart"
import { ProductsQuantityStats } from "../../../components/incomes/ProductsQuantityStats"

type SearchParams = {
  mode?: "range" | "month"
  viewMode?:
    | "reports"
    | "host-rankings"
    | "assistant-rankings"
    | "top-products"
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
          | "assistant-rankings"
          | "top-products") || "reports",
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

  const { getLivestreamsByDateRange, getTopProductsLivestream } =
    useLivestreamCore()
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
    "reports" | "host-rankings" | "assistant-rankings" | "top-products"
  >(searchParams.viewMode || "reports")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(
    !!searchParams.assigneeId
  )

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
  useEffect(() => {
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

  // Fetch top products
  const { data: topProductsData, isLoading: isLoadingTopProducts } = useQuery({
    queryKey: ["getTopProductsLivestream", dateRange[0], dateRange[1], channelId],
    queryFn: async () => {
      if (!dateRange[0] || !dateRange[1]) return null
      const response = await getTopProductsLivestream({
        startDate: dateRange[0],
        endDate: dateRange[1],
        channel: channelId || undefined
      })
      return response.data
    },
    enabled: !!dateRange[0] && !!dateRange[1]
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
              : snapshot.altAssignee
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
  }, [livestreamData, assigneeId, employeesData])

  const trendData = useMemo(() => {
    const grouped = new Map<
      string,
      { date: string; income: number; realIncome: number; adsCost: number }
    >()

    tableData.forEach((row) => {
      if (row.isSummary) {
        grouped.set(row.dateKey, {
          date: row.date,
          income: row.income,
          realIncome: row.realIncome,
          adsCost: row.adsCost
        })
      }
    })

    return Array.from(grouped.values()).sort((a, b) => {
      const [da, ma, ya] = a.date.split("/")
      const [db, mb, yb] = b.date.split("/")
      return (
        new Date(Number(ya), Number(ma) - 1, Number(da)).getTime() -
        new Date(Number(yb), Number(mb) - 1, Number(db)).getTime()
      )
    })
  }, [tableData])

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

    const incomeRate =
      metricsData.kpi > 0 ? (metricsData.totalIncome / metricsData.kpi) * 100 : 0
    const adsRate =
      metricsData.totalIncome > 0
        ? (metricsData.totalAdsCost / metricsData.totalIncome) * 100
        : 0

    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4, xl: 4 }} spacing={14}>
        <Paper p={18} radius="md" withBorder>
          <Stack gap={6}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Tổng doanh thu / KPI
              </Text>
              <Badge variant="light" color={incomeRate >= 100 ? "green" : "blue"}>
                <NumberFormatter value={incomeRate} suffix="%" decimalScale={2} />
              </Badge>
            </Group>
            <Text fz={rem(34)} fw={900} c="blue.7" lh={1.08}>
              <NumberFormatter
                value={Math.round(metricsData.totalIncome)}
                thousandSeparator
                suffix=" VNĐ"
              />
            </Text>
            <Text size="sm" fw={700} c="dimmed">
              <NumberFormatter
                value={Math.round(metricsData.kpi)}
                thousandSeparator
                suffix=" VNĐ"
              />
            </Text>
          </Stack>
        </Paper>

        <Paper p={18} radius="md" withBorder>
          <Stack gap={6}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Tổng chi phí quảng cáo
              </Text>
              <Badge variant="light" color="orange">
                <NumberFormatter value={adsRate} suffix="%" decimalScale={2} />
              </Badge>
            </Group>
            <Text fz={rem(34)} fw={900} c="red.7" lh={1.08}>
              <NumberFormatter
                value={Math.round(metricsData.totalAdsCost)}
                thousandSeparator
                suffix=" VNĐ"
              />
            </Text>
          </Stack>
        </Paper>

        <Paper p={18} radius="md" withBorder>
          <Stack gap={6}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              Tổng đơn hàng
            </Text>
            <Text fz={rem(34)} fw={900} c="green.7" lh={1.08}>
              <NumberFormatter
                value={metricsData.totalOrders}
                thousandSeparator
              />
            </Text>
          </Stack>
        </Paper>

        <Paper p={18} radius="md" withBorder>
          <Stack gap={6}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              Tổng bình luận
            </Text>
            <Text fz={rem(34)} fw={900} c="teal.7" lh={1.08}>
              <NumberFormatter
                value={metricsData.totalComments}
                thousandSeparator
              />
            </Text>
          </Stack>
        </Paper>
      </SimpleGrid>
    )
  }

  // Enhanced table data for row styling and stable row id
  const enhancedTableData = useMemo(() => {
    return tableData.map((row, index) => ({
      ...row,
      _rowIndex: index
    }))
  }, [tableData])

  const styledColumns = useMemo<ColumnDef<(typeof enhancedTableData)[0]>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Ngày",
        size: 130,
        meta: {
          headerClassName: "lsr-sticky lsr-col-date",
          cellClassName: "lsr-sticky lsr-col-date"
        },
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
        size: 170,
        meta: {
          headerClassName: "lsr-sticky lsr-col-period",
          cellClassName: "lsr-sticky lsr-col-period"
        },
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
        size: 170,
        meta: {
          headerClassName: "lsr-sticky lsr-col-assignee",
          cellClassName: "lsr-sticky lsr-col-assignee"
        },
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
        meta: { isNumeric: true },
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
        meta: { isNumeric: true },
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
        meta: { isNumeric: true },
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
        meta: { isNumeric: true },
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
        id: "CAC",
        header: "Ads/DT",
        accessorFn: (row) =>
          row.income > 0 ? (row.adsCost / row.income) * 100 : 0,
        meta: { isNumeric: true },
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
        id: "AOV",
        header: "AOV",
        accessorFn: (row) =>
          row.orders > 0 ? (row.income - row.adsCost) / row.orders : 0,
        meta: { isNumeric: true },
        cell: ({ row }) => {
          const income = row.original.income as number
          const adsCost = row.original.adsCost as number
          const orders = row.original.orders as number
          const aov = orders > 0 ? (income - adsCost) / orders : 0
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
        id: "CPO",
        header: "CPO",
        accessorFn: (row) => (row.orders > 0 ? row.adsCost / row.orders : 0),
        meta: { isNumeric: true },
        cell: ({ row }) => {
          const adsCost = row.original.adsCost as number
          const orders = row.original.orders as number
          const cpo = orders > 0 ? adsCost / orders : 0
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
        meta: { isNumeric: true },
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
        meta: { isNumeric: true },
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
        meta: { isNumeric: true },
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
        meta: { isNumeric: true },
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
        mt={20}
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

        <Box px={{ base: 6, md: 20 }} py={16}>
          <Box mb={14}>{renderMetricsCards()}</Box>

          <Paper
            p={16}
            mb={12}
            radius="md"
            withBorder
            style={{
              background: "var(--mantine-color-body)",
              borderColor: "var(--mantine-color-gray-3)"
            }}
          >
            <Stack gap={10}>
              <Group align="end" grow wrap="wrap" gap={12}>
                <Stack gap={4} miw={180}>
                  <SegmentedControl
                    value={mode}
                    onChange={(value) => setMode(value as "range" | "month")}
                    size="sm"
                    data={[
                      { label: "Theo khoảng", value: "range" },
                      { label: "Theo tháng", value: "month" }
                    ]}
                  />
                </Stack>

                {mode === "range" ? (
                  <>
                    <Stack gap={4} miw={170}>
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
                    <Stack gap={4} miw={170}>
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
                  </>
                ) : (
                  <Stack gap={4} miw={170}>
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

                <Stack gap={4} miw={220}>
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
                <Group align="center" justify="flex-end" miw={100}>
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => setShowAdvancedFilters((v) => !v)}
                >
                  Host
                </Button>
                </Group>
              </Group>

              <Collapse in={showAdvancedFilters}>
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
              </Collapse>
            </Stack>
          </Paper>

          <Paper mb={12} p={6} radius="md" withBorder>
            <SegmentedControl
              value={viewMode}
              onChange={(value) =>
                setViewMode(
                  value as
                    | "reports"
                    | "host-rankings"
                    | "assistant-rankings"
                    | "top-products"
                )
              }
              size="sm"
              data={[
                { label: "Bảng báo cáo", value: "reports" },
                { label: "Xếp hạng host", value: "host-rankings" },
                { label: "Xếp hạng trợ live", value: "assistant-rankings" },
                { label: "Top sản phẩm", value: "top-products" }
              ]}
              fullWidth
            />
          </Paper>

          {/* Reports Table */}
          {viewMode === "reports" && (
            <Stack gap={12}>
              <Paper p={16} radius="md" withBorder>
                {trendData.length > 0 ? (
                  <LineChart
                    h={220}
                    data={trendData}
                    dataKey="date"
                    curveType="linear"
                    withLegend
                    withTooltip
                    series={[
                      { name: "income", label: "DT", color: "indigo.6" },
                      { name: "realIncome", label: "DT thực", color: "blue.6" },
                      { name: "adsCost", label: "Ads", color: "orange.6" }
                    ]}
                    valueFormatter={(value) =>
                      new Intl.NumberFormat("vi-VN").format(Number(value))
                    }
                  />
                ) : (
                  <Center h={220}>
                    <Loader size="sm" />
                  </Center>
                )}
              </Paper>
              <Paper p={16} radius="md" withBorder className="lsr-table-wrap">
              <style>
                {`
                  .lsr-table-wrap > .relative > .overflow-x-auto {
                    max-height: ${rem(560)};
                    overflow: auto;
                  }
                  .lsr-table-wrap .lsr-sticky {
                    position: sticky;
                    z-index: 2;
                    background: #ffffff;
                  }
                  .lsr-table-wrap thead .lsr-sticky {
                    z-index: 14;
                    background: #f8fafc;
                  }
                  .lsr-table-wrap .lsr-col-date {
                    left: 0;
                    min-width: 130px;
                    width: 130px;
                    box-shadow: 1px 0 0 #e2e8f0;
                  }
                  .lsr-table-wrap .lsr-col-period {
                    left: 130px;
                    min-width: 170px;
                    width: 170px;
                    box-shadow: 1px 0 0 #e2e8f0;
                  }
                  .lsr-table-wrap .lsr-col-assignee {
                    left: 300px;
                    min-width: 170px;
                    width: 170px;
                    box-shadow: 1px 0 0 #e2e8f0;
                  }
                  .lsr-table-wrap .lsr-row-zebra td {
                    background: #fbfdff !important;
                  }
                  .lsr-table-wrap .lsr-summary-row td {
                    background: #f1f5f9 !important;
                    border-top: 1px solid #cbd5e1;
                    border-bottom: 1px solid #cbd5e1;
                    font-weight: 600;
                  }
                  .lsr-table-wrap .lsr-row-zebra td.lsr-sticky {
                    background: #fbfdff !important;
                  }
                  .lsr-table-wrap .lsr-summary-row td.lsr-sticky {
                    background: #f1f5f9 !important;
                  }
                `}
              </style>
              <CDataTable
                columns={styledColumns}
                data={enhancedTableData}
                isLoading={isLoadingLivestreams}
                variant="default"
                page={1}
                totalPages={1}
                onPageChange={() => {}}
                onPageSizeChange={() => {}}
                initialPageSize={50}
                pageSizeOptions={[50, 100, 200]}
                hideSearch
                hidePaginationInformation
                hideColumnToggle={false}
                className="[&_th]:text-[11px]! [&_td]:text-xs! [&_td]:py-1.5! [&_th]:py-1.5!"
                getRowId={(row) =>
                  `${row.dateKey}-${row.period}-${row.isSummary ? "summary" : row.assigneeId}`
                }
                getRowClassName={(row) => {
                  if (row.original.isSummary) return "lsr-summary-row"
                  return row.original._rowIndex % 2 === 0 ? "lsr-row-zebra" : ""
                }}
              />
              </Paper>
            </Stack>
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

          {viewMode === "top-products" && (
            <Box>
              {isLoadingTopProducts ? (
                <Paper withBorder p="xl" radius="lg">
                  <Center h={140}>
                    <Loader size="md" />
                  </Center>
                </Paper>
              ) : (
                <ProductsQuantityStats
                  productsQuantity={topProductsData?.productsQuantity || {}}
                />
              )}
            </Box>
          )}
        </Box>
      </Box>
    </LivestreamLayout>
  )
}
