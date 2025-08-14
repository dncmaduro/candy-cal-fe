import { useMemo, useState } from "react"
import {
  Badge,
  Button,
  Flex,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
  Paper
} from "@mantine/core"
import { modals } from "@mantine/modals"
import { DatePickerInput } from "@mantine/dates"
import { IconCheck, IconListDetails, IconSearch } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { useTasks } from "../../hooks/useTasks"
import { UserTasksDetailModal } from "./UserTasksDetailModal"
import { useSystemLogs } from "../../hooks/useSystemLogs"

export const UsersTasks = () => {
  const { getAllUsersTasks } = useTasks()
  const { listUsersOptions } = useSystemLogs()
  const [date, setDate] = useState<Date | null>(new Date())

  const {
    data: usersTasks,
    isLoading,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["getAllUsersTasks", date?.toDateString()],
    queryFn: async () => getAllUsersTasks({ date: date as Date }),
    select: (res) => res.data,
    enabled: !!date
  })

  const { data: usersOptions } = useQuery({
    queryKey: ["listUsersOptions"],
    queryFn: listUsersOptions,
    select: (d) => d.data.data
  })

  const items = usersTasks?.data.items ?? []
  const dateLabel = useMemo(
    () => (date ? format(date, "dd/MM/yyyy") : ""),
    [date]
  )

  const openDetail = (userId: string) => {
    const displayName = findUserName(userId)
    modals.open({
      title: (
        <Text fw={700}>
          Công việc của {displayName} ({dateLabel})
        </Text>
      ),
      size: "xl",
      children: <UserTasksDetailModal userId={userId} date={date as Date} />
    })
  }

  const findUserName = (userId: string) => {
    const user = usersOptions?.find((u) => u.value === userId)
    return user ? user.label : userId
  }

  return (
    <Stack>
      <Group justify="space-between" align="center" mb="sm">
        <Title order={4}>Công việc theo người dùng</Title>
        <Group align="flex-end">
          <DatePickerInput
            value={date}
            onChange={(d) => setDate(d)}
            valueFormat="DD/MM/YYYY"
            label="Ngày"
            placeholder="Chọn ngày"
            maw={280}
            rightSection={<IconSearch size={16} />}
            clearable={false}
          />
          <Button
            variant="light"
            onClick={() => refetch()}
            loading={isLoading || isFetching}
          >
            Tải lại
          </Button>
        </Group>
      </Group>

      <ScrollArea h={"70vh"} offsetScrollbars>
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
            miw={640}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 60 }}>#</Table.Th>
                <Table.Th style={{ width: 320 }}>Người dùng</Table.Th>
                <Table.Th style={{ width: 120 }}>Tổng</Table.Th>
                <Table.Th style={{ width: 140 }}>Hoàn thành</Table.Th>
                <Table.Th style={{ width: 120 }}>Thao tác</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Flex justify="center" align="center" h={160}>
                      <Loader size={28} />
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              ) : items.length ? (
                items.map((u, idx) => (
                  <Table.Tr key={u.userId}>
                    <Table.Td>{idx + 1}</Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text fw={600}>{findUserName(u.userId)}</Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light">{u.total}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="teal" leftSection={<IconCheck size={12} />}>
                        {u.done}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group justify="flex-end">
                        <Button
                          size="xs"
                          leftSection={<IconListDetails size={14} />}
                          onClick={() => openDetail(u.userId)}
                        >
                          Chi tiết
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Flex justify="center" align="center" h={160}>
                      <Text c="dimmed">Không có dữ liệu</Text>
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      </ScrollArea>
    </Stack>
  )
}
