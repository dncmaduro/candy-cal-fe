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
  Table
} from "@mantine/core"
import { useMemo } from "react"
import type { CalculateLivestreamMonthSalaryResponse } from "../../hooks/models"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { IconInfoCircle, IconCash } from "@tabler/icons-react"

interface DailySalary {
  date: string
  total: number
  salaryPerHour: number
  bonusPercentage: number
  income: number
  snapshotsCount: number
}

interface MonthlySalaryTableProps {
  salaryData: CalculateLivestreamMonthSalaryResponse | undefined
  isLoading: boolean
  currentUserId?: string
  isAdmin: boolean
  dailyDetails?: Map<string, DailySalary[]>
}

export const MonthlySalaryTable = ({
  salaryData,
  isLoading,
  currentUserId,
  isAdmin,
  dailyDetails
}: MonthlySalaryTableProps) => {
  const displayData = useMemo(() => {
    if (!salaryData) return []
    if (isAdmin) return salaryData.users
    return salaryData.users.filter((user) => user.userId === currentUserId)
  }, [salaryData, currentUserId, isAdmin])

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
        <Text fw={700}>
          Tổng: {salaryData.totalSalaryPaid.toLocaleString("vi-VN")} VNĐ
        </Text>
      </Group>

      {displayData.map((userData) => {
        const days = dailyDetails?.get(userData.userId) ?? []
        const weeks: DailySalary[][] = days.reduce((rows, day, index) => {
          if (index % 7 === 0) rows.push([])
          rows[rows.length - 1].push(day)
          return rows
        }, [] as DailySalary[][])

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

              {dailyDetails && dailyDetails.has(userData.userId) ? (
                <ScrollArea offsetScrollbars type="auto">
                  <Table
                    withTableBorder={false}
                    withColumnBorders={false}
                    striped={false}
                    highlightOnHover={false}
                    style={{ minWidth: 720 }}
                  >
                    <Table.Tbody>
                      {weeks.map((week, weekIndex) => (
                        <Box component="tr" key={`week-${weekIndex}`}>
                          {/* Row: dates */}
                          <Table.Td p="xs" style={{ padding: 0 }} colSpan={7}>
                            <Table
                              withTableBorder={false}
                              withColumnBorders={false}
                            >
                              <Table.Tbody>
                                <Table.Tr>
                                  {week.map((day) => (
                                    <Table.Td
                                      key={`date-${day.date}`}
                                      ta="center"
                                      style={{ width: "14.28%", padding: 10 }}
                                    >
                                      <Text size="sm" fw={600}>
                                        {format(new Date(day.date), "dd/MM")}
                                      </Text>
                                      <Text size="xs" c="dimmed">
                                        {format(new Date(day.date), "EEE", {
                                          locale: vi
                                        })}
                                      </Text>
                                    </Table.Td>
                                  ))}
                                  {Array.from({ length: 7 - week.length }).map(
                                    (_, i) => (
                                      <Table.Td
                                        key={`empty-date-${weekIndex}-${i}`}
                                        style={{ width: "14.28%", padding: 10 }}
                                      />
                                    )
                                  )}
                                </Table.Tr>

                                {/* Row: totals */}
                                <Table.Tr>
                                  {week.map((day) => (
                                    <Table.Td
                                      key={`total-${day.date}`}
                                      ta="center"
                                      style={{ width: "14.28%", padding: 10 }}
                                    >
                                      <Group
                                        gap={6}
                                        justify="center"
                                        wrap="nowrap"
                                      >
                                        <Text size="sm" fw={700}>
                                          {day.total.toLocaleString("vi-VN")}
                                        </Text>

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
                                      </Group>
                                    </Table.Td>
                                  ))}
                                  {Array.from({ length: 7 - week.length }).map(
                                    (_, i) => (
                                      <Table.Td
                                        key={`empty-total-${weekIndex}-${i}`}
                                        style={{ width: "14.28%", padding: 10 }}
                                      />
                                    )
                                  )}
                                </Table.Tr>
                              </Table.Tbody>
                            </Table>
                          </Table.Td>
                        </Box>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              ) : (
                <Text size="sm" c="dimmed">
                  Chi tiết lương từng ngày chỉ hiển thị khi xem lịch livestream
                </Text>
              )}
            </Stack>
          </Paper>
        )
      })}
    </Stack>
  )
}
