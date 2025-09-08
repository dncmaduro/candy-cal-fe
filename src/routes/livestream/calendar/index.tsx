import { createFileRoute } from "@tanstack/react-router"
import { LivestreamLayout } from "../../../components/layouts/LivestreamLayout"
import { useLivestream } from "../../../hooks/useLivestream"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Loader,
  rem,
  Text,
  Badge,
  ActionIcon,
  Select,
  Paper,
  NumberInput,
  Table
} from "@mantine/core"
import {
  IconEdit,
  IconPlus,
  IconChevronDown,
  IconChevronUp,
  IconCheck,
  IconX
} from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { Can } from "../../../components/common/Can"
import { CToast } from "../../../components/common/CToast"
import { LivestreamRangeModal } from "../../../components/livestream/LivestreamRangeModal"
import { InlineEditableSnapshotsTable } from "../../../components/livestream/InlineEditableSnapshotsTable"
import { useState, useMemo } from "react"
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
  isToday
} from "date-fns"
import type { GetLivestreamByDateRangeResponse } from "../../../hooks/models"

type ViewType = "week" | "month"

type LivestreamData = GetLivestreamByDateRangeResponse["livestreams"][0]

export const Route = createFileRoute("/livestream/calendar/")({
  component: RouteComponent
})

function RouteComponent() {
  const { getLivestreamsByDateRange, setMetrics } = useLivestream()

  const [viewType, setViewType] = useState<ViewType>("week")
  const [weekDate, setWeekDate] = useState<Date | null>(new Date())
  const [monthValue, setMonthValue] = useState<string>(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
  })
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [editingMetrics, setEditingMetrics] = useState<{
    livestreamId: string
    totalOrders: number
    ads: number
  } | null>(null)

  // Calculate date range based on view type
  const dateRange = useMemo(() => {
    if (viewType === "week" && weekDate) {
      const start = startOfWeek(weekDate, { weekStartsOn: 1 })
      const end = endOfWeek(weekDate, { weekStartsOn: 1 })
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    } else if (viewType === "month" && monthValue) {
      const monthDate = new Date(monthValue)
      const start = startOfMonth(monthDate)
      const end = endOfMonth(monthDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
    return null
  }, [viewType, weekDate, monthValue])

  // Generate weeks for selection
  const weeks = useMemo(() => {
    const now = new Date()
    const arr = [] as { label: string; value: string }[]
    for (let i = 0; i < 52; i++) {
      const ref = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i * 7
      )
      const s = startOfWeek(ref, { weekStartsOn: 1 })
      const e = endOfWeek(ref, { weekStartsOn: 1 })
      s.setHours(0, 0, 0, 0)
      e.setHours(23, 59, 59, 999)
      arr.push({
        label: `${format(s, "dd/MM")} - ${format(e, "dd/MM/yyyy")}`,
        value: s.toISOString()
      })
    }
    return arr
  }, [])

  // Generate months for selection
  const months = useMemo(() => {
    const now = new Date()
    const arr = [] as { label: string; value: string }[]
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      arr.push({ label: format(d, "MM/yyyy"), value: d.toISOString() })
    }
    return arr
  }, [])

  // Fetch livestream data
  const {
    data: livestreamData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["getLivestreamsByDateRange", dateRange?.start, dateRange?.end],
    queryFn: async () => {
      if (!dateRange) return { data: { livestreams: [] } }
      return await getLivestreamsByDateRange({
        startDate: format(dateRange.start, "yyyy-MM-dd"),
        endDate: format(dateRange.end, "yyyy-MM-dd")
      })
    },
    select: (data: any) => data.data.livestreams as LivestreamData[],
    enabled: !!dateRange
  })

  const { mutate: updateMetrics } = useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string
      data: { totalOrders?: number; ads?: number }
    }) => setMetrics(id, data),
    onSuccess: () => {
      CToast.success({ title: "Cập nhật số liệu thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi cập nhật số liệu" })
    }
  })

  const openRangeModal = () => {
    modals.open({
      title: <b>Tạo lịch livestream mới</b>,
      children: <LivestreamRangeModal refetch={refetch} />,
      size: "lg"
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount)
  }

  const toggleRowExpansion = (livestreamId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(livestreamId)) {
        newSet.delete(livestreamId)
      } else {
        newSet.add(livestreamId)
      }
      return newSet
    })
  }

  const startEditingMetrics = (livestream: LivestreamData) => {
    setEditingMetrics({
      livestreamId: livestream._id,
      totalOrders: livestream.totalOrders,
      ads: livestream.ads
    })
  }

  const cancelEditingMetrics = () => {
    setEditingMetrics(null)
  }

  const saveMetricsChanges = () => {
    if (!editingMetrics) return

    updateMetrics({
      id: editingMetrics.livestreamId,
      data: {
        totalOrders: editingMetrics.totalOrders,
        ads: editingMetrics.ads
      }
    })
    setEditingMetrics(null)
  }

  const renderCalendarView = () => {
    if (isLoading) {
      return (
        <Flex justify="center" align="center" h={400}>
          <Loader />
        </Flex>
      )
    }

    if (!livestreamData || livestreamData.length === 0) {
      return (
        <Flex justify="center" align="center" h={400}>
          <Text c="dimmed">
            Không có dữ liệu livestream trong khoảng thời gian này
          </Text>
        </Flex>
      )
    }

    const colCount = 5

    return (
      <Table
        withColumnBorders
        withTableBorder
        verticalSpacing="sm"
        horizontalSpacing="md"
        stickyHeader
        className="rounded-xl"
        miw={800}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Ngày</Table.Th>
            <Table.Th>Tổng doanh thu</Table.Th>
            <Table.Th>Tổng đơn hàng</Table.Th>
            <Table.Th>Chi phí quảng cáo</Table.Th>
            <Table.Th style={{ width: 120 }}>Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {livestreamData.map((livestream: LivestreamData) => {
            const isExpanded = expandedRows.has(livestream._id)
            const isCurrentDay = isToday(parseISO(livestream.date))

            return (
              <>
                <Table.Tr
                  key={livestream._id}
                  // style={{
                  //   backgroundColor: isCurrentDay
                  //     ? "var(--mantine-color-blue-0)"
                  //     : undefined
                  // }}
                >
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => toggleRowExpansion(livestream._id)}
                        disabled={
                          editingMetrics?.livestreamId === livestream._id
                        }
                      >
                        {isExpanded ? (
                          <IconChevronUp size={16} />
                        ) : (
                          <IconChevronDown size={16} />
                        )}
                      </ActionIcon>
                      <div>
                        <Group gap="xs" align="center">
                          <Text fw={600}>
                            {format(parseISO(livestream.date), "dd/MM/yyyy")}
                          </Text>
                          {isCurrentDay && (
                            <Badge color="blue" size="xs">
                              Hôm nay
                            </Badge>
                          )}
                        </Group>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={600} c="green">
                      {formatCurrency(livestream.totalIncome)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {editingMetrics?.livestreamId === livestream._id ? (
                      <NumberInput
                        value={editingMetrics.totalOrders}
                        onChange={(value) =>
                          setEditingMetrics({
                            ...editingMetrics,
                            totalOrders: Number(value) || 0
                          })
                        }
                        size="sm"
                        min={0}
                        w={100}
                      />
                    ) : (
                      <Text fw={500}>{livestream.totalOrders}</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {editingMetrics?.livestreamId === livestream._id ? (
                      <NumberInput
                        value={editingMetrics.ads}
                        onChange={(value) =>
                          setEditingMetrics({
                            ...editingMetrics,
                            ads: Number(value) || 0
                          })
                        }
                        size="sm"
                        min={0}
                        thousandSeparator=","
                        w={120}
                      />
                    ) : (
                      <Text c="red">{formatCurrency(livestream.ads)}</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap={8}>
                      <Can roles={["admin", "livestream-leader"]}>
                        {editingMetrics?.livestreamId === livestream._id ? (
                          <>
                            <ActionIcon
                              variant="light"
                              color="green"
                              size="sm"
                              onClick={saveMetricsChanges}
                            >
                              <IconCheck size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="gray"
                              size="sm"
                              onClick={cancelEditingMetrics}
                            >
                              <IconX size={16} />
                            </ActionIcon>
                          </>
                        ) : (
                          <ActionIcon
                            variant="light"
                            color="indigo"
                            size="sm"
                            onClick={() => startEditingMetrics(livestream)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        )}
                      </Can>
                    </Group>
                  </Table.Td>
                </Table.Tr>

                {/* Expanded row with snapshots details */}
                {isExpanded && (
                  <Table.Tr>
                    <Table.Td colSpan={colCount}>
                      <InlineEditableSnapshotsTable
                        livestreamId={livestream._id}
                        livestreamDate={livestream.date}
                        snapshots={livestream.snapshots}
                        refetch={refetch}
                      />
                    </Table.Td>
                  </Table.Tr>
                )}
              </>
            )
          })}
        </Table.Tbody>
      </Table>
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
              Quản lý lịch phát sóng livestream và theo dõi số liệu
            </Text>
          </Box>
          <Can roles={["admin", "livestream-leader"]}>
            <Button
              onClick={openRangeModal}
              leftSection={<IconPlus size={16} />}
              size="md"
              radius={"xl"}
            >
              Tạo lịch mới
            </Button>
          </Can>
        </Flex>

        <Divider my={0} />

        <Box px={{ base: 4, md: 28 }} py={20}>
          {/* Filter Controls */}
          <Paper p="md" mb="lg" withBorder radius="md">
            <Group align="flex-end" gap={12}>
              <Select
                label="Hiển thị theo"
                value={viewType}
                onChange={(v) => setViewType((v as ViewType) || "week")}
                data={[
                  { label: "Tuần", value: "week" },
                  { label: "Tháng", value: "month" }
                ]}
                size="sm"
                w={140}
              />

              {viewType === "week" && (
                <Select
                  label="Tuần"
                  value={weekDate ? weekDate.toISOString() : ""}
                  onChange={(v) => setWeekDate(v ? new Date(v) : null)}
                  data={weeks}
                  size="sm"
                  w={220}
                />
              )}

              {viewType === "month" && (
                <Select
                  label="Tháng"
                  value={monthValue}
                  onChange={(v) => setMonthValue(v || "")}
                  data={months}
                  size="sm"
                  w={160}
                />
              )}
            </Group>
          </Paper>

          {/* Calendar View */}
          {renderCalendarView()}
        </Box>
      </Box>
    </LivestreamLayout>
  )
}
