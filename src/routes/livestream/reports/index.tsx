import { createFileRoute } from "@tanstack/react-router"
import { LivestreamLayout } from "../../../components/layouts/LivestreamLayout"
import { useLivestream } from "../../../hooks/useLivestream"
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
import { DatePickerInput } from "@mantine/dates"
import { useState, useMemo } from "react"
import { format } from "date-fns"
import { CDataTable } from "../../../components/common/CDataTable"
import { ColumnDef } from "@tanstack/react-table"
import { HostRevenueRankingsChart } from "../../../components/livestream/HostRevenueRankingsChart"

export const Route = createFileRoute("/livestream/reports/")({
  component: RouteComponent
})

function RouteComponent() {
  const {
    getLivestreamsByDateRange,
    searchLivestreamChannels,
    getAggregatedMetrics,
    getHostRevenueRankings
  } = useLivestream()
  const { publicSearchUser } = useUsers()

  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const [channelId, setChannelId] = useState<string | null>(null)
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"reports" | "rankings">("reports")

  const dateRange = useMemo<[Date | null, Date | null]>(
    () => [startDate, endDate],
    [startDate, endDate]
  )

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
    const emps = [...(livestreamEmpData || []), ...(livestreamLeaderData || [])]
    return emps.filter((emp, index, self) => {
      return self.findIndex((e) => e._id === emp._id) === index
    })
  }, [livestreamEmpData, livestreamLeaderData])

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
  const { data: rankingsData, isLoading: isLoadingRankings } = useQuery({
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
      adsCost: number
      clickRate: number
      avgViewingDuration: number
      comments: number
      ordersNote: string
      rating: string
    }> = []

    livestreamData.forEach((livestream) => {
      const date = new Date(livestream.date)
      const dateStr = format(date, "dd/MM/yyyy")
      const dayOfWeek = format(date, "EEEE", { locale: undefined })

      // Filter only host snapshots
      const hostSnapshots = livestream.snapshots.filter(
        (s) => s.period.for === "host"
      )

      hostSnapshots.forEach((snapshot) => {
        const periodStr = `${String(snapshot.period.startTime.hour).padStart(2, "0")}:${String(snapshot.period.startTime.minute).padStart(2, "0")} - ${String(snapshot.period.endTime.hour).padStart(2, "0")}:${String(snapshot.period.endTime.minute).padStart(2, "0")}`

        // Filter by assignee if selected
        if (assigneeId && snapshot.assignee?._id !== assigneeId) {
          return
        }

        rows.push({
          dateKey: dateStr, // Use for grouping
          date: dateStr,
          dayOfWeek,
          period: periodStr,
          assignee: snapshot.assignee?.name || "Chưa phân",
          assigneeId: snapshot.assignee?._id || "",
          income: snapshot.income || 0,
          adsCost: snapshot.adsCost || 0,
          clickRate: snapshot.clickRate || 0,
          avgViewingDuration: snapshot.avgViewingDuration || 0,
          comments: snapshot.comments || 0,
          ordersNote: snapshot.ordersNote || "",
          rating: snapshot.rating || ""
        })
      })
    })

    return rows
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
                value={metricsData.totalIncome}
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
                value={metricsData.totalAdsCost}
                thousandSeparator
                suffix=" VNĐ"
              />
            </Text>
          </Stack>
        </Paper>

        <Paper p="md" radius="md" withBorder>
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
        accessorKey: "period",
        header: "Khung giờ",
        cell: ({ getValue }) => (
          <Text size="sm" fw={500}>
            {getValue() as string}
          </Text>
        )
      },
      {
        accessorKey: "assignee",
        header: "Host",
        cell: ({ getValue }) => <Text size="sm">{getValue() as string}</Text>
      },
      {
        accessorKey: "income",
        header: "Doanh thu",
        cell: ({ getValue }) => {
          const value = getValue() as number
          return (
            <Text size="sm" fw={600} c={value > 0 ? "blue.6" : "dimmed"}>
              <NumberFormatter value={value} thousandSeparator suffix=" VNĐ" />
            </Text>
          )
        }
      },
      {
        accessorKey: "adsCost",
        header: "Ads",
        cell: ({ getValue }) => {
          const value = getValue() as number
          return (
            <Text size="sm" fw={600} c={value > 0 ? "red.6" : "dimmed"}>
              <NumberFormatter value={value} thousandSeparator suffix=" VNĐ" />
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
            <Text size="sm" fw={600} c={cac > 0 ? "orange.6" : "dimmed"}>
              <NumberFormatter value={cac} decimalScale={2} />%
            </Text>
          )
        }
      },
      {
        accessorKey: "clickRate",
        header: "Tỷ lệ click (%)",
        cell: ({ getValue }) => {
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
        header: "Thời gian xem TB (giây)",
        cell: ({ getValue }) => {
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
        cell: ({ getValue }) => {
          const value = getValue() as number
          return (
            <Text size="sm" c={value > 0 ? undefined : "dimmed"}>
              <NumberFormatter value={value} thousandSeparator />
            </Text>
          )
        }
      },
      {
        accessorKey: "ordersNote",
        header: "Ghi chú đơn hàng",
        cell: ({ getValue }) => {
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
        cell: ({ getValue }) => {
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
              {/* Date Range */}
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

              {/* Channel select */}
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
              onChange={(value) => setViewMode(value as "reports" | "rankings")}
              data={[
                { label: "Bảng báo cáo", value: "reports" },
                { label: "Xếp hạng host", value: "rankings" }
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
                getRowId={(row) => `${row.dateKey}-${row.period}`}
                getRowClassName={(row) =>
                  row.original._dateGroupIndex % 2 === 1 ? "date-group-odd" : ""
                }
              />
            </Box>
          )}

          {/* Rankings Chart */}
          {viewMode === "rankings" && (
            <HostRevenueRankingsChart
              isLoadingRankings={isLoadingRankings}
              rankingsData={rankingsData}
            />
          )}
        </Box>
      </Box>
    </LivestreamLayout>
  )
}
