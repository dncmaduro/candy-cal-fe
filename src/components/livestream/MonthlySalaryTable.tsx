import {
  Box,
  Text,
  Stack,
  Group,
  Divider,
  Paper,
  Popover,
  ActionIcon,
  ScrollArea,
  Skeleton,
  ThemeIcon,
  Table,
  Button
} from "@mantine/core"
import { useMemo } from "react"
import type { CalculateLivestreamMonthSalaryResponse } from "../../hooks/models"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval
} from "date-fns"
import { IconInfoCircle, IconCash, IconDownload } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { useLivestreamPerformance } from "../../hooks/useLivestreamPerformance"
import { CToast } from "../common/CToast"

interface DailySalary {
  date: string
  total: number
  salaryPerHour: number
  bonusPercentage: number
  income: number
  realIncome: number
  snapshotsCount: number
  shifts?: Array<{
    snapshotId: string
    for: "host" | "assistant"
    channelId: string
    channelName: string
    startTime?: { hour: number; minute: number }
    endTime?: { hour: number; minute: number }
    income: number
    realIncome: number
    salaryPerHour: number
    bonusPercentage: number
    total: number
  }>
}

interface ChannelDailySalary {
  channelId: string
  channelName: string
  days: DailySalary[]
}

interface MonthlySalaryTableProps {
  salaryData: CalculateLivestreamMonthSalaryResponse | undefined
  isLoading: boolean
  currentUserId?: string
  isAdmin: boolean
  dailyDetails?: Map<string, DailySalary[]>
  channelDailyDetails?: Map<string, Map<string, ChannelDailySalary>>
  channelId?: string | null
  channelName?: string | null
}

export const MonthlySalaryTable = ({
  salaryData,
  isLoading,
  currentUserId,
  isAdmin,
  dailyDetails,
  channelDailyDetails,
  channelId,
  channelName
}: MonthlySalaryTableProps) => {
  const { exportMonthlySalaryToXlsx } = useLivestreamPerformance()

  const { mutate: exportXlsx, isPending: isExporting } = useMutation({
    mutationFn: async () => {
      if (!salaryData) throw new Error("Missing salary data")
      const response = await exportMonthlySalaryToXlsx({
        month: salaryData.month,
        year: salaryData.year,
        channelId: channelId || undefined
      })

      const safeChannel =
        channelId && channelName
          ? channelName
          : channelId
            ? channelId
            : "tat-ca"
      const filename = `bang-luong-livestream-${salaryData.month}-${salaryData.year}-${safeChannel}.xlsx`

      const blob = response.data instanceof Blob ? response.data : new Blob([])
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    },
    onSuccess: () => {
      CToast.success({ title: "Đã export file lương (.xlsx)" })
    },
    onError: (error: any) => {
      CToast.error({
        title: "Export thất bại",
        subtitle: error?.response?.data?.message || error?.message
      })
    }
  })

  const displayData = useMemo(() => {
    if (!salaryData) return []
    if (isAdmin) return salaryData.users
    return salaryData.users.filter((user) => user.userId === currentUserId)
  }, [salaryData, currentUserId, isAdmin])

  type DayCell = DailySalary | null

  const weekdayLabel = (date: Date) => {
    const labels = [
      "Chủ nhật",
      "Thứ hai",
      "Thứ ba",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
      "Thứ bảy"
    ] as const
    return labels[date.getDay()]
  }

  const monthGridDates = useMemo(() => {
    if (!salaryData) return []
    const monthStart = startOfMonth(
      new Date(salaryData.year, salaryData.month - 1, 1)
    )
    const monthEnd = endOfMonth(monthStart)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [salaryData])

  const toWeeks = (cells: DayCell[]) =>
    cells.reduce((rows, cell, index) => {
      if (index % 7 === 0) rows.push([])
      rows[rows.length - 1].push(cell)
      return rows
    }, [] as DayCell[][])

  const buildMonthCells = (days: DailySalary[]) => {
    if (!salaryData) return []

    const monthStart = startOfMonth(
      new Date(salaryData.year, salaryData.month - 1, 1)
    )
    const monthEnd = endOfMonth(monthStart)

    const byDate = new Map<string, DailySalary>()
    days.forEach((d) => {
      byDate.set(format(new Date(d.date), "yyyy-MM-dd"), d)
    })

    return monthGridDates.map((d) => {
      const inMonth = d >= monthStart && d <= monthEnd
      if (!inMonth) return null

      const key = format(d, "yyyy-MM-dd")
      const existing = byDate.get(key)
      if (existing) return existing

      return {
        date: key,
        total: 0,
        salaryPerHour: 0,
        bonusPercentage: 0,
        income: 0,
        realIncome: 0,
        snapshotsCount: 0
      }
    })
  }

  const weekdayHeaders = useMemo(() => {
    const labels = [
      "Chủ nhật",
      "Thứ hai",
      "Thứ ba",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
      "Thứ bảy"
    ] as const
    return labels
  }, [])

  const fmtTime = (t?: { hour: number; minute: number }) => {
    if (!t) return "--:--"
    const hh = String(t.hour).padStart(2, "0")
    const mm = String(t.minute).padStart(2, "0")
    return `${hh}:${mm}`
  }

  const shiftRoleLabel = (role: "host" | "assistant") =>
    role === "host" ? "Host" : "Assistant"

  if (isLoading) {
    return (
      <Stack gap="md">
        <Group justify="space-between">
          <Skeleton height={24} width={240} />
          <Skeleton height={24} width={180} />
        </Group>
        <Skeleton height={120} radius="md" />
        <Skeleton height={120} radius="md" />
      </Stack>
    )
  }

  if (!salaryData || displayData.length === 0) {
    return (
      <Paper withBorder radius="md" p="xl">
        <Stack align="center" gap={6}>
          <ThemeIcon variant="light" size="lg">
            <IconCash size={18} />
          </ThemeIcon>
          <Text fw={600}>Không có dữ liệu lương</Text>
          <Text size="sm" c="dimmed">
            Hãy chọn tháng hoặc kiểm tra quyền truy cập.
          </Text>
        </Stack>
      </Paper>
    )
  }

  return (
    <Stack gap="md">
      {/* Header */}
      <Group justify="space-between" align="baseline" wrap="wrap">
        <Text fw={700}>
          Bảng lương tháng {salaryData.month}/{salaryData.year}
        </Text>
        <Group gap="sm" wrap="wrap">
          <Text fw={700}>
            Tổng: {salaryData.totalSalaryPaid.toLocaleString("vi-VN")} VNĐ
          </Text>
          <Button
            variant="light"
            leftSection={<IconDownload size={16} />}
            loading={isExporting}
            onClick={() => exportXlsx()}
            color="green"
          >
            Xuất file lương
          </Button>
        </Group>
      </Group>

      {displayData.map((userData) => {
        const hasChannelBreakdown =
          !!channelDailyDetails && channelDailyDetails.has(userData.userId)
        const days = dailyDetails?.get(userData.userId) ?? []
        const weeks = toWeeks(buildMonthCells(days))

        return (
          <Paper
            key={userData.userId}
            p="md"
            radius="md"
            withBorder
            style={{ background: "transparent" }}
          >
            <Stack gap="xs">
              {/* User header */}
              <Group justify="space-between" align="baseline" wrap="wrap">
                <Box>
                  <Text fw={600}>{userData.userName}</Text>
                  <Text size="xs" c="dimmed">
                    {userData.snapshotsCount} ca
                  </Text>
                </Box>
                <Text fw={700}>
                  {userData.totalSalary.toLocaleString("vi-VN")} VNĐ
                </Text>
              </Group>

              <Divider />

              {(() => {
                const renderWeeks = (weeksToRender: DayCell[][]) => (
                  <ScrollArea offsetScrollbars type="auto">
                    <Table
                      withTableBorder={false}
                      withColumnBorders={false}
                      striped={false}
                      highlightOnHover={false}
                      style={{ minWidth: 900, tableLayout: "fixed" }}
                    >
                      <Table.Thead>
                        <Table.Tr>
                          {weekdayHeaders.map((label) => (
                            <Table.Th
                              key={label}
                              ta="center"
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "var(--mantine-color-dimmed)",
                                padding: "10px 8px"
                              }}
                            >
                              {label}
                            </Table.Th>
                          ))}
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {weeksToRender.map((week, weekIndex) => (
                          <Table.Tr key={`week-${weekIndex}`}>
                            {week.map((day, idx) => {
                              const key =
                                day?.date ?? `empty-${weekIndex}-${idx}`
                              const isWeekend =
                                day &&
                                [0, 6].includes(new Date(day.date).getDay())

                              return (
                                <Table.Td
                                  key={key}
                                  style={{
                                    padding: 8,
                                    verticalAlign: "top"
                                  }}
                                >
                                  {day ? (
                                    <Paper
                                      radius="md"
                                      p="sm"
                                      withBorder
                                      style={{
                                        height: "100%",
                                        background:
                                          day.snapshotsCount === 0
                                            ? "var(--mantine-color-gray-0)"
                                            : "white",
                                        borderColor: isWeekend
                                          ? "var(--mantine-color-gray-4)"
                                          : "var(--mantine-color-gray-3)"
                                      }}
                                    >
                                      <Stack gap={6}>
                                        <Group
                                          justify="space-between"
                                          align="baseline"
                                          wrap="nowrap"
                                        >
                                          <Text size="sm" fw={700}>
                                            {format(
                                              new Date(day.date),
                                              "dd/MM"
                                            )}
                                          </Text>
                                          <Text size="xs" c="dimmed">
                                            {weekdayLabel(new Date(day.date))}
                                          </Text>
                                        </Group>

                                        <Group
                                          justify="space-between"
                                          align="center"
                                          wrap="nowrap"
                                          gap={8}
                                        >
                                          <Text
                                            size="sm"
                                            fw={700}
                                            c={
                                              day.snapshotsCount === 0
                                                ? "dimmed"
                                                : undefined
                                            }
                                          >
                                            {day.total.toLocaleString("vi-VN")}
                                          </Text>

                                          {day.snapshotsCount > 0 ? (
                                            <Popover
                                              width={280}
                                              position="bottom"
                                              withArrow
                                              shadow="md"
                                            >
                                              <Popover.Target>
                                                <ActionIcon
                                                  variant="subtle"
                                                  color="gray"
                                                  size="sm"
                                                >
                                                  <IconInfoCircle size={16} />
                                                </ActionIcon>
                                              </Popover.Target>
                                              <Popover.Dropdown>
                                                <Stack gap="xs">
                                                  <Text size="sm" fw={600}>
                                                    {format(
                                                      new Date(day.date),
                                                      "dd/MM/yyyy"
                                                    )}
                                                  </Text>
                                                  <Divider />
                                                  {day.shifts?.length ? (
                                                    <>
                                                      <Text
                                                        size="xs"
                                                        c="dimmed"
                                                        fw={600}
                                                      >
                                                        Chi tiết từng ca
                                                      </Text>
                                                      <Stack gap={6}>
                                                        {day.shifts.map(
                                                          (s, i) => (
                                                            <Paper
                                                              key={
                                                                s.snapshotId ??
                                                                `${day.date}-${i}`
                                                              }
                                                              withBorder
                                                              radius="sm"
                                                              p="xs"
                                                            >
                                                              <Stack gap={2}>
                                                                <Group
                                                                  justify="space-between"
                                                                  gap="xs"
                                                                  wrap="nowrap"
                                                                >
                                                                  <Text
                                                                    size="xs"
                                                                    fw={600}
                                                                  >
                                                                    {fmtTime(
                                                                      s.startTime
                                                                    )}{" "}
                                                                    -{" "}
                                                                    {fmtTime(
                                                                      s.endTime
                                                                    )}
                                                                  </Text>
                                                                  <Text
                                                                    size="xs"
                                                                    c="dimmed"
                                                                  >
                                                                    {shiftRoleLabel(
                                                                      s.for
                                                                    )}
                                                                  </Text>
                                                                </Group>

                                                                <Group
                                                                  justify="space-between"
                                                                  gap="xs"
                                                                  wrap="nowrap"
                                                                >
                                                                  <Text
                                                                    size="xs"
                                                                    c="dimmed"
                                                                  >
                                                                    Lương
                                                                  </Text>
                                                                  <Text
                                                                    size="xs"
                                                                    fw={700}
                                                                  >
                                                                    {s.total.toLocaleString(
                                                                      "vi-VN"
                                                                    )}{" "}
                                                                    VNĐ
                                                                  </Text>
                                                                </Group>

                                                                <Group
                                                                  justify="space-between"
                                                                  gap="xs"
                                                                  wrap="nowrap"
                                                                >
                                                                  <Text
                                                                    size="xs"
                                                                    c="dimmed"
                                                                  >
                                                                    Doanh thu
                                                                  </Text>
                                                                  <Text
                                                                    size="xs"
                                                                    fw={600}
                                                                  >
                                                                    {s.income.toLocaleString(
                                                                      "vi-VN"
                                                                    )}{" "}
                                                                    VNĐ
                                                                  </Text>
                                                                </Group>
                                                              </Stack>
                                                            </Paper>
                                                          )
                                                        )}
                                                      </Stack>
                                                      <Divider />
                                                    </>
                                                  ) : null}
                                                  <Group justify="space-between">
                                                    <Text size="xs" c="dimmed">
                                                      Số ca
                                                    </Text>
                                                    <Text size="xs" fw={600}>
                                                      {day.snapshotsCount}
                                                    </Text>
                                                  </Group>
                                                  <Group justify="space-between">
                                                    <Text size="xs" c="dimmed">
                                                      Doanh thu
                                                    </Text>
                                                    <Text size="xs" fw={600}>
                                                      {day.income.toLocaleString(
                                                        "vi-VN"
                                                      )}{" "}
                                                      VNĐ
                                                    </Text>
                                                  </Group>
                                                  <Group justify="space-between">
                                                    <Text size="xs" c="dimmed">
                                                      Doanh thu thực
                                                    </Text>
                                                    <Text size="xs" fw={600}>
                                                      {day.realIncome.toLocaleString(
                                                        "vi-VN"
                                                      )}{" "}
                                                      VNĐ
                                                    </Text>
                                                  </Group>
                                                  <Group justify="space-between">
                                                    <Text size="xs" c="dimmed">
                                                      Lương/giờ
                                                    </Text>
                                                    <Text size="xs" fw={600}>
                                                      {day.salaryPerHour.toLocaleString(
                                                        "vi-VN"
                                                      )}{" "}
                                                      VNĐ
                                                    </Text>
                                                  </Group>
                                                  <Group justify="space-between">
                                                    <Text size="xs" c="dimmed">
                                                      % Thưởng
                                                    </Text>
                                                    <Text size="xs" fw={600}>
                                                      {day.bonusPercentage}%
                                                    </Text>
                                                  </Group>
                                                  <Divider />
                                                  <Group justify="space-between">
                                                    <Text size="sm" fw={700}>
                                                      Tổng
                                                    </Text>
                                                    <Text size="sm" fw={700}>
                                                      {day.total.toLocaleString(
                                                        "vi-VN"
                                                      )}{" "}
                                                      VNĐ
                                                    </Text>
                                                  </Group>
                                                </Stack>
                                              </Popover.Dropdown>
                                            </Popover>
                                          ) : null}
                                        </Group>
                                      </Stack>
                                    </Paper>
                                  ) : (
                                    <Paper
                                      radius="md"
                                      p="sm"
                                      withBorder
                                      style={{
                                        height: "100%",
                                        background: "transparent",
                                        borderStyle: "dashed",
                                        borderColor:
                                          "var(--mantine-color-gray-3)"
                                      }}
                                    />
                                  )}
                                </Table.Td>
                              )
                            })}
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                )

                if (hasChannelBreakdown) {
                  const channels = Array.from(
                    channelDailyDetails!.get(userData.userId)!.values()
                  ).sort((a, b) =>
                    a.channelName.localeCompare(b.channelName, "vi")
                  )

                  if (channels.length === 0) {
                    return (
                      <Text size="sm" c="dimmed">
                        Chi tiết lương từng ngày chỉ hiển thị khi xem lịch
                        livestream
                      </Text>
                    )
                  }

                  return (
                    <Stack gap="sm">
                      {channels.map((ch, idx) => {
                        const channelCells = buildMonthCells(ch.days)
                        const channelTotal = channelCells.reduce((sum, d) => {
                          if (!d) return sum
                          return sum + (d.total || 0)
                        }, 0)

                        return (
                          <Stack gap="xs" key={ch.channelId}>
                            <Group
                              justify="space-between"
                              align="baseline"
                              wrap="wrap"
                            >
                              <Text fw={600} size="sm">
                                {ch.channelName}
                              </Text>
                              <Text fw={700} size="sm">
                                {channelTotal.toLocaleString("vi-VN")} VNĐ
                              </Text>
                            </Group>

                            {renderWeeks(toWeeks(channelCells))}

                            {idx < channels.length - 1 && <Divider />}
                          </Stack>
                        )
                      })}
                    </Stack>
                  )
                }

                if (dailyDetails && dailyDetails.has(userData.userId)) {
                  return renderWeeks(weeks)
                }

                return (
                  <Text size="sm" c="dimmed">
                    Chi tiết lương từng ngày chỉ hiển thị khi xem lịch
                    livestream
                  </Text>
                )
              })()}
            </Stack>
          </Paper>
        )
      })}
    </Stack>
  )
}
