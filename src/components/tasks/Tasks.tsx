import { useQuery, useQueryClient } from "@tanstack/react-query"
import { modals } from "@mantine/modals"
import {
  Badge,
  Button,
  Divider,
  Flex,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Table,
  Text,
  ActionIcon,
  Pagination,
  NumberInput,
  Paper
} from "@mantine/core"
import { format } from "date-fns"
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react"
import { useTasks } from "../../hooks/useTasks"
import { CToast } from "../common/CToast"
import { Can } from "../common/Can"
import { TaskDefinitionModal } from "./TaskDefinitionModal.tsx"
import { useState } from "react"
import { GenerateTasks } from "./GenerateTasks.tsx"
import { TaskDefinition } from "../../hooks/models.ts"

export const Tasks = () => {
  const { getAllTasksDefinitions, deleteTaskDefinition } = useTasks()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const {
    data: defsData,
    isLoading: loadingDefs,
    refetch
  } = useQuery({
    queryKey: ["getAllTasksDefinitions", page, limit],
    queryFn: async () => {
      const res = await getAllTasksDefinitions({ page, limit })
      return res.data
    }
  })

  const openCreate = () => {
    modals.open({
      title: <Text fw={700}>Thêm task mới</Text>,
      children: <TaskDefinitionModal refetch={refetch} />,
      size: "xl",
      centered: true
    })
  }
  const openEdit = (def: TaskDefinition) => {
    modals.open({
      title: <Text fw={700}>Chỉnh sửa task: {def.code}</Text>,
      children: <TaskDefinitionModal taskDefinition={def} refetch={refetch} />,
      size: "xl",
      centered: true
    })
  }

  return (
    <Stack p={12} gap={16}>
      <Group justify="space-between" align="center" wrap="wrap">
        <Text fw={700} fz={20}>
          Định nghĩa Tasks
        </Text>
        <Can roles={["admin"]}>
          <Group>
            <Button
              leftSection={<IconPlus size={16} />}
              variant="light"
              color="cyan"
              onClick={() => {
                modals.open({
                  title: <Text fw={700}>Tạo task theo ngày</Text>,
                  children: <GenerateTasks />,
                  size: "xl",
                  centered: true
                })
              }}
            >
              Tạo task cho ngày
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              size="sm"
              onClick={openCreate}
            >
              Thêm
            </Button>
          </Group>
        </Can>
      </Group>
      <Divider my={4} />
      <Stack gap={14}>
        <ScrollArea h={560} offsetScrollbars>
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
              horizontalSpacing="md"
              miw={800}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 55 }}>#</Table.Th>
                  <Table.Th style={{ width: 210 }}>Code</Table.Th>
                  <Table.Th style={{ width: 240 }}>Tiêu đề</Table.Th>
                  <Table.Th style={{ width: 140 }}>Roles</Table.Th>
                  <Table.Th style={{ width: 90 }}>Kiểu</Table.Th>
                  <Table.Th style={{ width: 70 }}>Active</Table.Th>
                  <Table.Th style={{ width: 160 }}>HTTP</Table.Th>
                  <Table.Th style={{ width: 120 }}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {loadingDefs ? (
                  <Table.Tr>
                    <Table.Td colSpan={8}>
                      <Flex justify="center" align="center" h={120}>
                        <Loader />
                      </Flex>
                    </Table.Td>
                  </Table.Tr>
                ) : defsData?.data.length ? (
                  defsData.data
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((d, i) => (
                      <Table.Tr key={d.code} opacity={d.active ? 1 : 0.4}>
                        <Table.Td>{i + 1}</Table.Td>
                        <Table.Td>
                          <Text fz={13} fw={600}>
                            {d.code}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text fz={13}>{d.title}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4} wrap="wrap">
                            {d.roles.map((r) => (
                              <Badge key={r} size="xs" variant="light">
                                {r}
                              </Badge>
                            ))}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            size="sm"
                            color={d.type === "http" ? "violet" : "gray"}
                          >
                            {d.type === "http" ? "HTTP" : "Manual"}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {d.active ? (
                            <Badge color="teal" size="sm">
                              On
                            </Badge>
                          ) : (
                            <Badge color="gray" size="sm">
                              Off
                            </Badge>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {d.type === "http" && d.httpConfig ? (
                            <Stack gap={2}>
                              <Text fz={11} c="dimmed">
                                {d.httpConfig.endpointKey}
                              </Text>
                              <Text fz={11} c="dimmed">
                                {d.httpConfig.runAt}
                              </Text>
                            </Stack>
                          ) : (
                            <Text fz={11} c="dimmed">
                              —
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td style={{ width: 120 }}>
                          <Can roles={["admin"]}>
                            <Group gap={4}>
                              <ActionIcon
                                variant="subtle"
                                color="indigo"
                                onClick={() => openEdit(d)}
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => {
                                  modals.openConfirmModal({
                                    title: `Xoá ${d.code}?`,
                                    centered: true,
                                    labels: { confirm: "Xoá", cancel: "Huỷ" },
                                    confirmProps: { color: "red" },
                                    onConfirm: async () => {
                                      try {
                                        await deleteTaskDefinition(d.code)
                                        CToast.success({ title: "Đã xoá" })
                                        queryClient.invalidateQueries({
                                          queryKey: ["getAllTasksDefinitions"]
                                        })
                                      } catch {
                                        CToast.error({ title: "Xoá thất bại" })
                                      }
                                    }
                                  })
                                }}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                          </Can>
                        </Table.Td>
                      </Table.Tr>
                    ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={8}>
                      <Flex justify="center" align="center" h={120}>
                        <Text c="dimmed">Không có định nghĩa</Text>
                      </Flex>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </ScrollArea>
        <Flex justify="space-between" align="center" mt={12}>
          <Text c="dimmed" mr={8}>
            Tổng số dòng: {defsData?.total}
          </Text>
          <Pagination
            total={Math.ceil((defsData?.total ?? 1) / limit)}
            value={page}
            onChange={setPage}
          />
          <Group>
            <Text>Số dòng/trang</Text>
            <NumberInput
              value={limit}
              onChange={(val) => setLimit(Number(val) || 1)}
              w={90}
              min={1}
            />
          </Group>
        </Flex>
        <Text c="dimmed" fz={12}>
          Cập nhật: {format(new Date(), "dd/MM/yyyy HH:mm:ss")}
        </Text>
      </Stack>
    </Stack>
  )
}
