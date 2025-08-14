import {
  Badge,
  Flex,
  Loader,
  ScrollArea,
  Stack,
  Table,
  Text,
  Paper
} from "@mantine/core"
import { IconCheck, IconClock } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { useTasks } from "../../hooks/useTasks"

export function UserTasksDetailModal({
  userId,
  date
}: {
  userId: string
  date: Date
}) {
  const { getUserTasks } = useTasks()

  const { data: userDetail, isLoading } = useQuery({
    queryKey: ["getUserTasks", userId, date.toDateString()],
    queryFn: async () => getUserTasks(userId, { date }),
    select: (res) => res.data.data
  })

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h={160}>
        <Loader size={28} />
      </Flex>
    )
  }

  if (!userDetail) {
    return <Text c="dimmed">Không có dữ liệu</Text>
  }

  return (
    <Stack>
      <GroupBadges
        total={userDetail.summary.total}
        done={userDetail.summary.done}
        pending={userDetail.summary.pending}
        auto={userDetail.summary.auto}
        expired={userDetail.summary.expired}
      />
      <ScrollArea h={360} offsetScrollbars>
        <Paper
          withBorder
          radius="md"
          p="sm"
          shadow="xs"
          style={{ background: "var(--mantine-color-body)" }}
        >
          <Table
            withTableBorder
            withColumnBorders
            striped
            highlightOnHover
            verticalSpacing="xs"
            horizontalSpacing="sm"
            miw={600}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 60 }}>#</Table.Th>
                <Table.Th style={{ width: 320 }}>Task</Table.Th>
                <Table.Th style={{ width: 140 }}>Trạng thái</Table.Th>
                <Table.Th style={{ width: 140 }}>Hoàn thành lúc</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {userDetail.tasks.map((t, i) => (
                <Table.Tr key={t.code} opacity={t.status === "done" ? 0.55 : 1}>
                  <Table.Td>{i + 1}</Table.Td>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text fw={600} fz={13} lineClamp={2}>
                        {t.title}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    {t.status === "done" ? (
                      <Badge color="teal" leftSection={<IconCheck size={12} />}>
                        Hoàn thành
                      </Badge>
                    ) : t.status === "expired" ? (
                      <Badge color="red" leftSection={<IconClock size={12} />}>
                        Hết hạn
                      </Badge>
                    ) : t.status === "auto" ? (
                      <Badge color="grape">Tự động</Badge>
                    ) : (
                      <Badge color="yellow">Chờ</Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {t.completedAt ? (
                      format(t.completedAt, "HH:mm dd/MM")
                    ) : (
                      <Text c="dimmed">-</Text>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </ScrollArea>
    </Stack>
  )
}

function GroupBadges({
  total,
  done,
  pending,
  auto,
  expired
}: {
  total: number
  done: number
  pending: number
  auto: number
  expired: number
}) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Badge size="sm" variant="light">
        Tổng {total}
      </Badge>
      <Badge size="sm" color="teal" variant="light">
        Hoàn thành {done}
      </Badge>
      <Badge size="sm" color="yellow" variant="light">
        Chờ {pending}
      </Badge>
      <Badge size="sm" color="grape" variant="light">
        Tự động {auto}
      </Badge>
      <Badge size="sm" color="red" variant="light">
        Hết hạn {expired}
      </Badge>
    </div>
  )
}
