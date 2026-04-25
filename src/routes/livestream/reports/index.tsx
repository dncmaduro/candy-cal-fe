import { createFileRoute } from "@tanstack/react-router"
import { LivestreamLayout } from "../../../components/layouts/LivestreamLayout"
import { useLivestreamCore } from "../../../hooks/useLivestreamCore"
import { useLivestreamChannels } from "../../../hooks/useLivestreamChannels"
import { useLivestreamAnalytics } from "../../../hooks/useLivestreamAnalytics"
import { useUsers } from "../../../hooks/useUsers"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
  Button,
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
  Progress,
  SegmentedControl,
  Tabs
} from "@mantine/core"
import { DatePickerInput, MonthPickerInput } from "@mantine/dates"
import { useState, useMemo, useEffect } from "react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { CDataTable } from "../../../components/common/CDataTable"
import { ColumnDef } from "@tanstack/react-table"
import { HostRevenueRankingsChart } from "../../../components/livestream/HostRevenueRankingsChart"
import { AssistantRevenueRankingsChart } from "../../../components/livestream/AssistantRevenueRankingsChart"
import { ProductsQuantityStats } from "../../../components/incomes/ProductsQuantityStats"
import {
  IconAdjustmentsHorizontal,
  IconDownload,
  IconFilter
} from "@tabler/icons-react"

type SearchParams = {
  mode?: "range" | "month"
  viewMode?: "reports" | "host-rankings" | "assistant-rankings" | "top-products"
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
        role: "livestream-emp",
        status: "active"
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
        role: "livestream-ast",
        status: "active"
      }),
    select: (data) => data.data.data
  })

  const { data: livestreamLeaderData } = useQuery({
    queryKey: ["livestreamLeaders"],
    queryFn: () =>
      publicSearchUser({
        page: 1,
        limit: 100,
        role: "livestream-leader",
        status: "active"
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
    queryKey: [
      "getTopProductsLivestream",
      dateRange[0],
      dateRange[1],
      channelId
    ],
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

  type SnapshotRow = {
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
  }

  type DailyRow = {
    dateKey: string
    date: string
    dayOfWeek: string
    totalShifts: number
    income: number
    realIncome: number
    adsCost: number
    clickRate: number
    avgViewingDuration: number
    comments: number
    snapshotKpi: number
    orders: number
    snapshots: SnapshotRow[]
    _dateGroupIndex?: number
  }

  // Prepare daily table data with expandable snapshots
  const tableData = useMemo<DailyRow[]>(() => {
    if (!livestreamData) return []

    const dayMap = new Map<string, DailyRow>()

    livestreamData.forEach((livestream) => {
      const date = new Date(livestream.date)
      const dateStr = format(date, "dd/MM/yyyy")
      const dayOfWeekEn = format(date, "EEEE")
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

      const hostSnapshots = livestream.snapshots.filter(
        (s) => s.period.for === "host"
      )

      if (!dayMap.has(dateStr)) {
        dayMap.set(dateStr, {
          dateKey: dateStr,
          date: dateStr,
          dayOfWeek,
          totalShifts: 0,
          income: 0,
          realIncome: 0,
          adsCost: 0,
          clickRate: 0,
          avgViewingDuration: 0,
          comments: 0,
          snapshotKpi: 0,
          orders: 0,
          snapshots: []
        })
      }

      const day = dayMap.get(dateStr)!

      hostSnapshots.forEach((snapshot) => {
        if (assigneeId && snapshot.assignee?._id !== assigneeId) {
          return
        }

        const periodStr = `${String(snapshot.period.startTime.hour).padStart(2, "0")}:${String(snapshot.period.startTime.minute).padStart(2, "0")} - ${String(snapshot.period.endTime.hour).padStart(2, "0")}:${String(snapshot.period.endTime.minute).padStart(2, "0")}`

        const snapshotRow: SnapshotRow = {
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

        day.snapshots.push(snapshotRow)
        day.totalShifts += 1
        day.income += snapshotRow.income
        day.realIncome += snapshotRow.realIncome
        day.adsCost += snapshotRow.adsCost
        day.comments += snapshotRow.comments
        day.snapshotKpi += snapshotRow.snapshotKpi
        day.orders += snapshotRow.orders
        day.clickRate += snapshotRow.clickRate
        day.avgViewingDuration += snapshotRow.avgViewingDuration
      })
    })

    return Array.from(dayMap.values())
      .filter((day) => day.totalShifts > 0)
      .sort((a, b) => {
        const [ad, am, ay] = a.date.split("/").map(Number)
        const [bd, bm, by] = b.date.split("/").map(Number)
        return (
          new Date(ay, am - 1, ad).getTime() -
          new Date(by, bm - 1, bd).getTime()
        )
      })
      .map((day, index) => ({
        ...day,
        clickRate: day.totalShifts > 0 ? day.clickRate / day.totalShifts : 0,
        avgViewingDuration:
          day.totalShifts > 0 ? day.avgViewingDuration / day.totalShifts : 0,
        _dateGroupIndex: index
      }))
  }, [livestreamData, assigneeId, employeesData])

  const snapshotDetailColumns = useMemo<ColumnDef<SnapshotRow>[]>(
    () => [
      {
        accessorKey: "period",
        header: "Khung giờ",
        enableSorting: false
      },
      {
        accessorKey: "assignee",
        header: "Host",
        enableSorting: false
      },
      {
        accessorKey: "income",
        header: "Doanh thu",
        enableSorting: false,
        cell: ({ getValue }) => (
          <Text size="sm" fw={600} c="indigo">
            <NumberFormatter value={getValue() as number} thousandSeparator />
          </Text>
        )
      },
      {
        accessorKey: "adsCost",
        header: "Chi phí QC",
        enableSorting: false,
        cell: ({ getValue }) => (
          <Text size="sm" fw={600} c="red.6">
            <NumberFormatter value={getValue() as number} thousandSeparator />
          </Text>
        )
      },
      {
        accessorKey: "orders",
        header: "Số đơn",
        enableSorting: false,
        cell: ({ getValue }) => (
          <Text size="sm" fw={600} c="teal.6">
            <NumberFormatter value={getValue() as number} />
          </Text>
        )
      },
      {
        accessorKey: "clickRate",
        header: "Tỷ lệ click",
        enableSorting: false,
        cell: ({ getValue }) => (
          <Text size="sm">
            <NumberFormatter value={getValue() as number} decimalScale={2} />%
          </Text>
        )
      }
    ],
    []
  )

  const exportReport = () => {
    if (!tableData.length) return

    const csvHeaders = [
      "Ngày",
      "Thứ",
      "Khung giờ",
      "Host",
      "Doanh thu",
      "Doanh thu thực",
      "Chi phí QC",
      "Số đơn",
      "Tỷ lệ click",
      "Ghi chú",
      "Đánh giá"
    ]

    const toSafeValue = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`

    const csvRows = tableData.flatMap((row) => {
      const summaryRow = [
        row.date,
        row.dayOfWeek,
        `Tổng ${row.totalShifts} ca`,
        "",
        Math.round(row.income),
        Math.round(row.realIncome),
        Math.round(row.adsCost),
        row.orders,
        `${row.clickRate.toFixed(2)}%`,
        "",
        ""
      ]
        .map(toSafeValue)
        .join(",")

      const snapshotRows = row.snapshots.map((snapshot) =>
        [
          row.date,
          row.dayOfWeek,
          snapshot.period,
          snapshot.assignee,
          Math.round(snapshot.income),
          Math.round(snapshot.realIncome),
          Math.round(snapshot.adsCost),
          snapshot.orders,
          `${snapshot.clickRate.toFixed(2)}%`,
          snapshot.ordersNote,
          snapshot.rating
        ]
          .map(toSafeValue)
          .join(",")
      )

      return [summaryRow, ...snapshotRows]
    })

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n")
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;"
    })

    const objectUrl = URL.createObjectURL(blob)
    const downloadLink = document.createElement("a")
    const from = dateRange[0] ? format(dateRange[0], "yyyyMMdd") : "from"
    const to = dateRange[1] ? format(dateRange[1], "yyyyMMdd") : "to"
    downloadLink.href = objectUrl
    downloadLink.download = `livestream-report-${from}-${to}.csv`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(objectUrl)
  }

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

    const totalIncome = Math.round(metricsData.totalIncome)
    const totalAdsCost = Math.round(metricsData.totalAdsCost)
    const totalOrders = Math.round(metricsData.totalOrders)
    const kpi = Math.round(metricsData.kpi)
    const kpiRate = kpi > 0 ? (totalIncome / kpi) * 100 : 0
    const adsRatio = totalIncome > 0 ? (totalAdsCost / totalIncome) * 100 : 0
    // const roas = totalAdsCost > 0 ? totalIncome / totalAdsCost : 0

    return (
      <Group grow>
        <Paper
          p="md"
          radius="lg"
          withBorder
          style={{ borderColor: "#e7ecf6", background: "#ffffff" }}
        >
          <Stack gap={8}>
            <Text size="xs" c="dimmed" fw={600}>
              Tổng doanh thu
            </Text>
            <Text size="xl" fw={700} c="indigo.6">
              <NumberFormatter
                value={totalIncome}
                thousandSeparator
                suffix=" VNĐ"
              />
            </Text>
            <Group justify="space-between" align="center">
              <Text size="sm" c="dimmed" fw={600}>
                KPI:{" "}
                <NumberFormatter value={kpi} thousandSeparator suffix=" VNĐ" />
              </Text>
              <Text size="sm" c="indigo.7" fw={700}>
                <NumberFormatter value={kpiRate} decimalScale={2} suffix="%" />
              </Text>
            </Group>
            <Progress
              value={Math.min(kpiRate, 100)}
              color="indigo"
              radius="xl"
            />
          </Stack>
        </Paper>

        <Paper
          p="md"
          radius="lg"
          withBorder
          style={{ borderColor: "#e7ecf6", background: "#ffffff" }}
        >
          <Stack gap={4}>
            <Text size="xs" c="dimmed" fw={600}>
              Tổng chi phí quảng cáo
            </Text>
            <Text size="xl" fw={700} c="red.6">
              <NumberFormatter
                value={totalAdsCost}
                thousandSeparator
                suffix=" VNĐ"
              />
            </Text>
            <Text size="sm" c="red.6" fw={600}>
              <NumberFormatter value={adsRatio} decimalScale={2} suffix="%" />
            </Text>
          </Stack>
        </Paper>

        <Paper
          p="md"
          radius="lg"
          withBorder
          style={{ borderColor: "#e7ecf6", background: "#ffffff" }}
        >
          <Stack gap={4}>
            <Text size="xs" c="dimmed" fw={600}>
              Tổng đơn hàng
            </Text>
            <Text size="xl" fw={700} c="green.6">
              <NumberFormatter value={totalOrders} thousandSeparator />
            </Text>
            <Text size="sm" c="dimmed">
              Đơn hàng thành công
            </Text>
          </Stack>
        </Paper>
      </Group>
    )
  }

  const styledColumns = useMemo<ColumnDef<(typeof tableData)[0]>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Ngày",
        enableSorting: false,
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text size="sm" fw={600}>
              {row.original.date}
            </Text>
            <Text size="xs" c="dimmed">
              {row.original.dayOfWeek}
            </Text>
          </Stack>
        )
      },
      {
        accessorKey: "totalShifts",
        header: "Livestream",
        enableSorting: false,
        cell: ({ getValue }) => (
          <Text size="sm" fw={600} c="indigo.6">
            Tổng {getValue() as number} ca
          </Text>
        )
      },
      {
        accessorKey: "income",
        header: "Doanh thu (VND)",
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue() as number
          return (
            <Text size="sm" fw={700} c={value > 0 ? "indigo" : "dimmed"}>
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
        header: "Chi phí QC (VND)",
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue() as number
          return (
            <Text size="sm" fw={700} c={value > 0 ? "red.6" : "dimmed"}>
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
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue() as number
          return (
            <Text size="sm" fw={700} c={value > 0 ? "teal.6" : "dimmed"}>
              <NumberFormatter value={value} />
            </Text>
          )
        }
      },
      {
        accessorKey: "clickRate",
        header: "Tỷ lệ click (%)",
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue() as number
          return (
            <Text size="sm" c={value > 0 ? "black" : "dimmed"}>
              <NumberFormatter value={value} decimalScale={2} />%
            </Text>
          )
        }
      },
      {
        accessorKey: "snapshotKpi",
        header: "KPI",
        enableSorting: false,
        cell: ({ getValue, row }) => {
          const kpi = getValue() as number
          const percentage = kpi > 0 ? (row.original.income / kpi) * 100 : 0
          return (
            <Stack gap={0}>
              <Text size="sm" fw={700} c="black">
                <NumberFormatter value={kpi} thousandSeparator />
              </Text>
              <Text size="xs" c={percentage >= 100 ? "green" : "orange"}>
                ({percentage.toFixed(1)}%)
              </Text>
            </Stack>
          )
        }
      },
      {
        accessorKey: "comments",
        header: "Tổng bình luận",
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue() as number
          return (
            <Text size="sm" c={value > 0 ? "black" : "dimmed"}>
              <NumberFormatter value={value} thousandSeparator />
            </Text>
          )
        }
      },
      {
        accessorKey: "avgViewingDuration",
        header: "TG xem TB (giây)",
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <Text
              size="sm"
              c={row.original.avgViewingDuration > 0 ? "black" : "dimmed"}
            >
              <NumberFormatter
                value={row.original.avgViewingDuration}
                decimalScale={1}
              />
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
        mt={24}
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
          align="center"
          justify="space-between"
          pt={26}
          pb={18}
          px={{ base: 12, md: 28 }}
          direction="row"
          gap={16}
          wrap="wrap"
        >
          <Box>
            <Text fw={700} fz="xl" mb={2}>
              Báo cáo Livestream
            </Text>
            <Text c="dimmed" fz="sm">
              Xem thống kê và báo cáo chi tiết các ca livestream
            </Text>
          </Box>

          <Button
            variant="light"
            radius="md"
            leftSection={<IconDownload size={16} />}
            onClick={exportReport}
          >
            Xuất báo cáo
          </Button>
        </Flex>

        <Box px={{ base: 8, md: 28 }} py={20}>
          {/* Mode Selector */}
          <Paper
            p="md"
            mb="lg"
            radius="lg"
            withBorder
            style={{ borderColor: "#e7ecf6", background: "#fbfcff" }}
          >
            <SegmentedControl
              value={mode}
              onChange={(value) => setMode(value as "range" | "month")}
              size="sm"
              data={[
                { label: "Theo khoảng", value: "range" },
                { label: "Theo tháng", value: "month" }
              ]}
              w={260}
            />
          </Paper>

          {/* Filter Controls */}
          <Paper
            p="md"
            mb="lg"
            radius="lg"
            withBorder
            style={{
              background: "#ffffff",
              borderColor: "#e7ecf6"
            }}
          >
            <Stack gap="md">
              {/* Date Range or Month Picker */}
              {mode === "range" ? (
                <Group grow align="end">
                  <Stack gap={4}>
                    <Text size="xs" fw={600} c="dimmed">
                      Từ ngày
                    </Text>
                    <DatePickerInput
                      placeholder="Chọn ngày bắt đầu"
                      value={startDate}
                      onChange={setStartDate}
                      size="sm"
                      radius="md"
                      clearable
                      maxDate={endDate ?? undefined}
                      valueFormat="DD/MM/YYYY"
                    />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="xs" fw={600} c="dimmed">
                      Đến ngày
                    </Text>
                    <DatePickerInput
                      placeholder="Chọn ngày kết thúc"
                      value={endDate}
                      onChange={setEndDate}
                      size="sm"
                      radius="md"
                      clearable
                      minDate={startDate ?? undefined}
                      valueFormat="DD/MM/YYYY"
                    />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="xs" fw={600} c="dimmed">
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
                      searchable
                    />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="xs" fw={600} c="dimmed">
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
                </Group>
              ) : (
                <Group grow align="end">
                  <Stack gap={4}>
                    <Text size="xs" fw={600} c="dimmed">
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

                  <Stack gap={4}>
                    <Text size="xs" fw={600} c="dimmed">
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
                      searchable
                    />
                  </Stack>

                  <Stack gap={4}>
                    <Text size="xs" fw={600} c="dimmed">
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
                </Group>
              )}
            </Stack>
          </Paper>

          {/* Metrics Cards */}
          <Box mb="lg">{renderMetricsCards()}</Box>

          <Tabs
            value={viewMode}
            onChange={(value) =>
              value &&
              setViewMode(
                value as
                  | "reports"
                  | "host-rankings"
                  | "assistant-rankings"
                  | "top-products"
              )
            }
          >
            <Tabs.List>
              <Tabs.Tab value="reports">Bảng báo cáo</Tabs.Tab>
              <Tabs.Tab value="host-rankings">Xếp hạng host</Tabs.Tab>
              <Tabs.Tab value="assistant-rankings">Xếp hạng trợ live</Tabs.Tab>
              <Tabs.Tab value="top-products">Top sản phẩm</Tabs.Tab>
            </Tabs.List>

            <Box mt="md">
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
                `}
                  </style>
                  <CDataTable
                    variant="analytics"
                    columns={styledColumns}
                    data={tableData}
                    isLoading={isLoadingLivestreams}
                    page={1}
                    totalPages={1}
                    onPageChange={() => {}}
                    onPageSizeChange={() => {}}
                    initialPageSize={100}
                    pageSizeOptions={[10, 20, 50, 100]}
                    hideSearch
                    hideColumnToggle
                    enableExpanding
                    onRowClick={(row) => row.toggleExpanded()}
                    className="[&_th]:font-semibold! [&_th]:tracking-normal! [&_th]:text-black! [&_th]:normal-case!"
                    getRowId={(row) => row.dateKey}
                    getRowClassName={(row) => {
                      return (row.original._dateGroupIndex ?? 0) % 2 === 1
                        ? "date-group-odd"
                        : ""
                    }}
                    renderRowSubComponent={({ row }) => (
                      <Box px="sm" py="sm" bg="gray.0">
                        <CDataTable
                          columns={snapshotDetailColumns}
                          data={row.original.snapshots}
                          variant="compact"
                          hideSearch
                          hideColumnToggle
                          hidePagination
                          hidePaginationInformation
                          className="[&_th]:tracking-normal! [&_th]:text-black! [&_th]:normal-case!"
                        />
                      </Box>
                    )}
                    extraActions={
                      <Group gap="xs">
                        <Button
                          variant="light"
                          radius="md"
                          leftSection={<IconAdjustmentsHorizontal size={16} />}
                        >
                          Tùy chỉnh cột
                        </Button>
                        <Button
                          variant="default"
                          radius="md"
                          leftSection={<IconFilter size={16} />}
                        >
                          Bộ lọc
                        </Button>
                      </Group>
                    }
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
          </Tabs>
        </Box>
      </Box>
    </LivestreamLayout>
  )
}
