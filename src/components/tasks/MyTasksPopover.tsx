import { useState, useMemo } from "react"
import {
  ActionIcon,
  Badge,
  Button,
  Flex,
  Group,
  Indicator,
  Loader,
  Popover,
  ScrollArea,
  Stack,
  Table,
  Text,
  Tooltip
} from "@mantine/core"
import {
  IconCheck,
  IconClock,
  IconListCheck,
  IconRefresh
} from "@tabler/icons-react"
import { useTasks } from "../../hooks/useTasks"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"

export const MyTasksPopover = () => {
  const { getOwnTasks, markTaskAsDone, getAllTasksDefinitions } = useTasks()
  const queryClient = useQueryClient()
  const [opened, setOpened] = useState(false)
  const [showCompleted, setShowCompleted] = useState(true)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["getOwnTasks", opened],
    queryFn: async () => {
      const res = await getOwnTasks()
      return res.data
    }
  })

  // Load definitions to determine task type (manual/http) and hide action for http
  const { data: defsData } = useQuery({
    queryKey: ["getAllTasksDefinitionsForPopover", opened],
    queryFn: async () => {
      const res = await getAllTasksDefinitions({ page: 1, limit: 1000 })
      return res.data.data
    },
    enabled: opened
  })
  const typeByCode = useMemo(
    () => Object.fromEntries((defsData ?? []).map((d) => [d.code, d.type])),
    [defsData]
  )

  const { mutate: completeTask, isPending: completing } = useMutation({
    mutationFn: (code: string) => markTaskAsDone({ code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getOwnTasks"] })
    }
  })

  const tasks = useMemo(() => {
    const list = data?.data.tasks || []
    return showCompleted ? list : list.filter((t) => t.status !== "done")
  }, [data, showCompleted])
  const summary = data?.data.summary

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      offset={8}
      withArrow
      withinPortal
      shadow="md"
    >
      <Popover.Target>
        {summary ? (
          <Indicator
            size="xs"
            color={summary.pending ? "yellow" : "teal"}
            variant="filled"
            label={`${summary.done}/${summary.total}`}
          >
            <ActionIcon
              variant="subtle"
              radius="xl"
              size="lg"
              onClick={() => setOpened((o) => !o)}
              aria-label="công việc"
            >
              <IconListCheck size={20} />
            </ActionIcon>
          </Indicator>
        ) : (
          <ActionIcon
            variant="subtle"
            radius="xl"
            size="lg"
            onClick={() => setOpened((o) => !o)}
            aria-label="công việc"
          >
            <IconListCheck size={20} />
          </ActionIcon>
        )}
      </Popover.Target>
      <Popover.Dropdown p={0} style={{ width: 520 }}>
        <Stack gap={6} p={12}>
          <Group justify="space-between" align="center" w="100%">
            <Text fw={600}>Công việc hôm nay</Text>
            <Group gap={6}>
              <Button
                leftSection={<IconRefresh size={14} />}
                size="xs"
                variant="light"
                onClick={() => refetch()}
                loading={isLoading}
              >
                Làm mới
              </Button>
              <Button
                size="xs"
                variant={showCompleted ? "light" : "outline"}
                color="gray"
                onClick={() => setShowCompleted((s) => !s)}
              >
                {showCompleted ? "Ẩn hoàn thành" : "Hiện hoàn thành"}
              </Button>
            </Group>
          </Group>
          <Group gap={8} wrap="wrap">
            <Badge size="sm" variant="light">
              Tổng {summary?.total ?? 0}
            </Badge>
            <Badge size="sm" color="teal" variant="light">
              Hoàn thành {summary?.done ?? 0}
            </Badge>
            <Badge size="sm" color="yellow" variant="light">
              Chờ {summary?.pending ?? 0}
            </Badge>
            <Badge size="sm" color="grape" variant="light">
              Tự động {summary?.auto ?? 0}
            </Badge>
            <Badge size="sm" color="red" variant="light">
              Hết hạn {summary?.expired ?? 0}
            </Badge>
          </Group>
          <ScrollArea h={320} offsetScrollbars>
            <Table
              withTableBorder
              withColumnBorders
              striped
              verticalSpacing="xs"
              horizontalSpacing="sm"
              miw={480}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 40 }}>#</Table.Th>
                  <Table.Th style={{ width: 200 }}>Task</Table.Th>
                  <Table.Th style={{ width: 110 }}>Trạng thái</Table.Th>
                  <Table.Th style={{ width: 130 }}>Thao tác</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {isLoading ? (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Flex justify="center" align="center" h={120}>
                        <Loader size={28} />
                      </Flex>
                    </Table.Td>
                  </Table.Tr>
                ) : tasks.length ? (
                  tasks.map((t, i) => {
                    const isHttp =
                      t?.type === "http" ||
                      Boolean(t?.http) ||
                      typeByCode[t.code] === "http"
                    return (
                      <Table.Tr
                        key={t.code}
                        opacity={t.status === "done" ? 0.55 : 1}
                      >
                        <Table.Td>{i + 1}</Table.Td>
                        <Table.Td>
                          <Stack gap={2}>
                            <Text fw={600} fz={13} lineClamp={2}>
                              {t.title}
                            </Text>
                            {t.completedAt && (
                              <Tooltip
                                label={format(t.completedAt, "HH:mm:ss dd/MM")}
                              >
                                <Text fz={10} c="dimmed">
                                  {format(t.completedAt, "HH:mm")}
                                </Text>
                              </Tooltip>
                            )}
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          {t.status === "done" ? (
                            <Badge
                              color="teal"
                              leftSection={<IconCheck size={12} />}
                            >
                              Hoàn thành
                            </Badge>
                          ) : t.status === "expired" ? (
                            <Badge
                              color="red"
                              leftSection={<IconClock size={12} />}
                            >
                              Hết hạn
                            </Badge>
                          ) : t.status === "auto" ? (
                            <Badge color="grape">Tự động</Badge>
                          ) : (
                            <Badge color="yellow">Chờ</Badge>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {!isHttp && (
                            <Button
                              size="xs"
                              variant="light"
                              color="teal"
                              disabled={t.status !== "pending"}
                              loading={completing}
                              onClick={() => completeTask(t.code)}
                            >
                              Xong
                            </Button>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    )
                  })
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Flex justify="center" align="center" h={120}>
                        <Text c="dimmed">Không có công việc</Text>
                      </Flex>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
          <Text c="dimmed" fz={10} ta="right">
            Cập nhật: {format(new Date(), "dd/MM/yyyy HH:mm:ss")}
          </Text>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}
