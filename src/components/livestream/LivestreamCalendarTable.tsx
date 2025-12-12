import { Button, Box, Stack, Text, ActionIcon, Group } from "@mantine/core"
import { IconEye, IconReport } from "@tabler/icons-react"
import { format, parseISO } from "date-fns"
import { vi } from "date-fns/locale"

type LivestreamEmployee = {
  _id: string
  name: string
  roles?: string[]
}

type LivestreamSnapshot = {
  _id: string
  period: {
    _id?: string
    startTime: { hour: number; minute: number }
    endTime: { hour: number; minute: number }
    channel: { _id: string; name: string }
    for: "host" | "assistant"
  }
  assignee?: {
    _id: string
    username: string
    name: string
  }
  income?: number
  adsCost?: number
  clickRate?: number
  avgViewingDuration?: number
  comments?: number
  ordersNote?: string
  rating?: string
}

type LivestreamData = {
  _id: string
  date: string
  snapshots: LivestreamSnapshot[]
  totalOrders: number
  totalIncome: number
  ads: number
}

interface LivestreamCalendarTableProps {
  role: "host" | "assistant"
  weekDays: Date[]
  employeesData: LivestreamEmployee[]
  livestreamData: LivestreamData[]
  onAssignEmployee: (params: {
    livestreamId: string
    snapshotId?: string
    periodId: string
    userId: string
    role: "host" | "assistant"
  }) => void
  onUnassignEmployee: (params: {
    livestreamId: string
    snapshotId: string
  }) => void
  viewMode: "assign" | "schedule"
  onOpenReport?: (livestreamId: string, snapshot: LivestreamSnapshot) => void
}

export const LivestreamCalendarTable = ({
  role,
  weekDays,
  employeesData,
  livestreamData,
  onAssignEmployee,
  onUnassignEmployee,
  viewMode,
  onOpenReport
}: LivestreamCalendarTableProps) => {
  const formatTimeRange = (
    start: { hour: number; minute: number },
    end: { hour: number; minute: number }
  ) => {
    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${pad(start.hour)}:${pad(start.minute)}-${pad(end.hour)}:${pad(end.minute)}`
  }

  // Collect unique periods from snapshots that match the role
  const uniquePeriods =
    livestreamData?.flatMap((ls) =>
      ls.snapshots.filter((s) => s.period.for === role).map((s) => s.period)
    ) || []

  // Remove duplicates by period._id
  const periods = uniquePeriods.filter(
    (period, index, self) =>
      index === self.findIndex((p) => p._id === period._id)
  )

  // Sort periods by start time
  const sortedPeriods = periods.sort((a, b) => {
    if (a.startTime.hour !== b.startTime.hour) {
      return a.startTime.hour - b.startTime.hour
    }
    return a.startTime.minute - b.startTime.minute
  })

  const roleLabel = role === "host" ? "Host" : "Trợ live"
  const roleColor = role === "host" ? "blue" : "green"

  // Don't render if there are no periods for this role
  if (sortedPeriods.length === 0) {
    return null
  }

  // Render for Schedule View Mode
  if (viewMode === "schedule") {
    return (
      <div>
        <Text fw={600} size="md" mb="md">
          {roleLabel}
        </Text>
        <Box style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #e0e0e0"
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    border: "1px solid #e0e0e0",
                    padding: "12px",
                    backgroundColor: "#f8f9fa",
                    position: "sticky",
                    left: 0,
                    zIndex: 10,
                    minWidth: "80px"
                  }}
                >
                  <Text size="xs" fw={600}>
                    Khung giờ
                  </Text>
                </th>
                {weekDays.map((day) => (
                  <th
                    key={day.toISOString()}
                    style={{
                      border: "1px solid #e0e0e0",
                      padding: "8px",
                      backgroundColor: "#f8f9fa",
                      minWidth: "120px"
                    }}
                  >
                    <div>
                      <Text fw={600} size="sm">
                        {format(day, "EEEE", { locale: vi })}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {format(day, "dd/MM/yyyy")}
                      </Text>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedPeriods.map((period) => (
                <tr key={period._id}>
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      padding: "8px",
                      backgroundColor: "#fff",
                      position: "sticky",
                      left: 0,
                      zIndex: 5
                    }}
                  >
                    <Text size="xs" fw={600}>
                      {formatTimeRange(period.startTime, period.endTime)}
                    </Text>
                  </td>
                  {weekDays.map((day) => {
                    const dayData = livestreamData?.find(
                      (ls) =>
                        format(parseISO(ls.date), "yyyy-MM-dd") ===
                        format(day, "yyyy-MM-dd")
                    )

                    const snapshot = dayData?.snapshots.find(
                      (s) => s.period._id === period._id
                    )

                    return (
                      <td
                        key={`${period._id}-${day.toISOString()}`}
                        style={{
                          border: "1px solid #e0e0e0",
                          padding: "8px",
                          verticalAlign: "middle",
                          backgroundColor: snapshot?.assignee
                            ? role === "host"
                              ? "rgba(34, 139, 230, 0.08)"
                              : "rgba(64, 192, 87, 0.08)"
                            : "#fff"
                        }}
                      >
                        {snapshot?.assignee ? (
                          <Group justify="space-between" wrap="nowrap" gap="xs">
                            <Text size="sm" fw={600} c={roleColor}>
                              {snapshot.assignee.name}
                            </Text>
                            {onOpenReport && dayData && (
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                color={
                                  snapshot.income !== undefined &&
                                  snapshot.clickRate !== undefined &&
                                  snapshot.avgViewingDuration !== undefined &&
                                  snapshot.comments !== undefined &&
                                  snapshot.ordersNote !== undefined
                                    ? "blue"
                                    : "gray"
                                }
                                onClick={() =>
                                  onOpenReport(dayData._id, snapshot)
                                }
                              >
                                {snapshot.income !== undefined &&
                                snapshot.clickRate !== undefined &&
                                snapshot.avgViewingDuration !== undefined &&
                                snapshot.comments !== undefined &&
                                snapshot.ordersNote !== undefined ? (
                                  <IconEye size={16} />
                                ) : (
                                  <IconReport size={16} />
                                )}
                              </ActionIcon>
                            )}
                          </Group>
                        ) : (
                          <Text size="xs" c="dimmed" fs="italic">
                            Chưa phân
                          </Text>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </div>
    )
  }

  // Render for Assign View Mode (default)
  return (
    <div>
      <Text fw={600} size="md" mb="md">
        {roleLabel}
      </Text>
      <Box style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #e0e0e0"
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #e0e0e0",
                  padding: "12px",
                  backgroundColor: "#f8f9fa",
                  position: "sticky",
                  left: 0,
                  zIndex: 10,
                  minWidth: "150px"
                }}
              >
                Nhân viên
              </th>
              {weekDays.map((day) => (
                <th
                  key={day.toISOString()}
                  style={{
                    border: "1px solid #e0e0e0",
                    padding: "12px",
                    backgroundColor: "#f8f9fa",
                    minWidth: "120px"
                  }}
                >
                  <div>
                    <Text fw={600} size="sm">
                      {format(day, "EEEE", { locale: vi })}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {format(day, "dd/MM/yyyy")}
                    </Text>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employeesData?.map((employee) => (
              <tr key={employee._id}>
                <td
                  style={{
                    border: "1px solid #e0e0e0",
                    padding: "12px",
                    backgroundColor: "#fff",
                    position: "sticky",
                    left: 0,
                    zIndex: 5
                  }}
                >
                  <Text fw={500} size="sm">
                    {employee.name}
                  </Text>
                </td>
                {weekDays.map((day) => {
                  const dayData = livestreamData?.find(
                    (ls) =>
                      format(parseISO(ls.date), "yyyy-MM-dd") ===
                      format(day, "yyyy-MM-dd")
                  )

                  return (
                    <td
                      key={`${employee._id}-${day.toISOString()}`}
                      style={{
                        border: "1px solid #e0e0e0",
                        padding: "8px",
                        verticalAlign: "top"
                      }}
                    >
                      <Stack gap={4}>
                        {sortedPeriods?.map((period) => {
                          const snapshot = dayData?.snapshots.find(
                            (s) => s.period._id === period._id
                          )

                          const isAssigned =
                            snapshot?.assignee &&
                            snapshot?.assignee._id === employee._id

                          return (
                            <Button
                              key={period._id}
                              size="xs"
                              variant={isAssigned ? "filled" : "light"}
                              color={isAssigned ? roleColor : "gray"}
                              fullWidth
                              style={{
                                transition: "all 0.2s ease"
                              }}
                              styles={{
                                root: {
                                  "&:hover:not(:disabled)": {
                                    opacity: isAssigned ? 1 : 0.8,
                                    backgroundColor: isAssigned
                                      ? undefined
                                      : `var(--mantine-color-${roleColor}-1)`
                                  }
                                }
                              }}
                              disabled={!dayData?._id}
                              onClick={() =>
                                isAssigned
                                  ? onUnassignEmployee({
                                      livestreamId: dayData!._id,
                                      snapshotId: snapshot!._id
                                    })
                                  : onAssignEmployee({
                                      livestreamId: dayData!._id,
                                      snapshotId: snapshot?._id,
                                      periodId: period._id!,
                                      userId: employee._id,
                                      role
                                    })
                              }
                            >
                              <Text size="xs">
                                {formatTimeRange(
                                  period.startTime,
                                  period.endTime
                                )}{" "}
                              </Text>
                            </Button>
                          )
                        })}
                      </Stack>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </div>
  )
}
