import { createFileRoute } from "@tanstack/react-router"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { useSystemLogs } from "../../../hooks/useSystemLogs"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import {
  Box,
  Divider,
  Flex,
  Group,
  Loader,
  NumberInput,
  Pagination,
  rem,
  ScrollArea,
  Select,
  Table,
  Text,
  Button
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { format } from "date-fns"
import { modals } from "@mantine/modals"
import { Helmet } from "react-helmet-async"

export const Route = createFileRoute("/marketing-storage/system-logs/")({
  component: RouteComponent
})

function RouteComponent() {
  useAuthGuard(["admin"]) // Chỉ admin được xem nhật ký hệ thống

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [userId, setUserId] = useState<string>("")
  const [type, setType] = useState<string>("")
  const [action, setAction] = useState<string>("")
  const [entity, setEntity] = useState<string>("")
  const [entityId, setEntityId] = useState<string>("")
  const [result, setResult] = useState<"success" | "failed" | null>(null)

  // Load options from backend
  const {
    getSystemLogs,
    listUsersOptions,
    listTypesOptions,
    listActionsOptions,
    listEntitiesOptions,
    listEntityIdsOptions
  } = useSystemLogs()

  const { data: usersOptions } = useQuery({
    queryKey: ["systemLogsUsersOptions"],
    queryFn: listUsersOptions,
    select: (d) => d.data.data
  })
  const { data: typesOptions } = useQuery({
    queryKey: ["systemLogsTypesOptions"],
    queryFn: listTypesOptions,
    select: (d) => d.data.data
  })
  const { data: actionsOptions } = useQuery({
    queryKey: ["systemLogsActionsOptions"],
    queryFn: listActionsOptions,
    select: (d) => d.data.data
  })
  const { data: entitiesOptions } = useQuery({
    queryKey: ["systemLogsEntitiesOptions"],
    queryFn: listEntitiesOptions,
    select: (d) => d.data.data
  })
  const { data: entityIdsOptions, isLoading: entityIdsLoading } = useQuery({
    queryKey: ["systemLogsEntityIdsOptions", entity],
    enabled: !!entity,
    queryFn: () => listEntityIdsOptions(entity),
    select: (d) => d.data.data
  })

  // Build lookup maps for labels
  const usersMap = useMemo(() => {
    const map: Record<string, string> = {}
    ;(Array.isArray(usersOptions) ? usersOptions : []).forEach(
      (o: any) => (map[o.value] = o.label)
    )
    return map
  }, [usersOptions])
  const typesMap = useMemo(() => {
    const map: Record<string, string> = {}
    ;(Array.isArray(typesOptions) ? typesOptions : []).forEach(
      (o: any) => (map[o.value] = o.label)
    )
    return map
  }, [typesOptions])
  const actionsMap = useMemo(() => {
    const map: Record<string, string> = {}
    ;(Array.isArray(actionsOptions) ? actionsOptions : []).forEach(
      (o: any) => (map[o.value] = o.label)
    )
    return map
  }, [actionsOptions])
  const entitiesMap = useMemo(() => {
    const map: Record<string, string> = {}
    ;(Array.isArray(entitiesOptions) ? entitiesOptions : []).forEach(
      (o: any) => (map[o.value] = o.label)
    )
    return map
  }, [entitiesOptions])

  const timeRange = useMemo(() => {
    const startTime = startDate
      ? new Date(startDate.setHours(0, 0, 0, 0)).toISOString()
      : undefined
    const endTime = endDate
      ? new Date(endDate.setHours(23, 59, 59, 999)).toISOString()
      : undefined
    return { startTime, endTime }
  }, [startDate, endDate])

  const { data: systemLogsData, isLoading } = useQuery({
    queryKey: [
      "systemLogs",
      page,
      limit,
      timeRange.startTime,
      timeRange.endTime,
      userId,
      type,
      action,
      entity,
      entityId,
      result
    ],
    queryFn: () =>
      getSystemLogs({
        page,
        limit,
        startTime: timeRange.startTime,
        endTime: timeRange.endTime,
        userId: userId || undefined,
        type: type || undefined,
        action: action || undefined,
        entity: entity || undefined,
        entityId: entityId || undefined,
        result: result ?? undefined
      }),
    select: (data) => data.data,
    refetchOnWindowFocus: true
  })

  const logs = systemLogsData?.data || []
  const total = systemLogsData?.total || 0

  const colCount = 9

  return (
    <AppLayout>
      <Helmet>
        <title>Hệ thống - Nhật ký | MyCandy</title>
      </Helmet>
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
          align="center"
          justify="space-between"
          pt={32}
          pb={8}
          px={{ base: 8, md: 28 }}
          direction={{ base: "column", md: "row" }}
          gap={12}
        >
          <Box>
            <Text fw={700} fz="xl" mb={2}>
              Nhật ký hệ thống
            </Text>
            <Text c="dimmed" fz="sm">
              Theo dõi hành động hệ thống theo thời gian và bộ lọc
            </Text>
          </Box>
          <Group gap={12} w={{ base: "100%", md: "auto" }} align="center">
            <DatePickerInput
              value={startDate}
              onChange={setStartDate}
              placeholder="Từ ngày"
              valueFormat="DD/MM/YYYY"
              size="md"
              radius="md"
              clearable
            />
            <DatePickerInput
              value={endDate}
              onChange={setEndDate}
              placeholder="Đến ngày"
              valueFormat="DD/MM/YYYY"
              size="md"
              radius="md"
              clearable
            />
          </Group>
        </Flex>
        <Divider my={0} />

        <Box px={{ base: 8, md: 28 }} py={16}>
          <Group gap={12} align="flex-end" wrap="wrap">
            <Select
              label="Người dùng"
              placeholder="Chọn người dùng"
              data={usersOptions ?? []}
              value={userId || null}
              onChange={(v) => setUserId(v ?? "")}
              clearable
              searchable
              w={260}
            />
            <Select
              label="Loại"
              placeholder="Chọn loại"
              data={typesOptions ?? []}
              value={type || null}
              onChange={(v) => setType(v ?? "")}
              clearable
              searchable
              w={200}
            />
            <Select
              label="Hành động"
              placeholder="Chọn hành động"
              data={actionsOptions ?? []}
              value={action || null}
              onChange={(v) => setAction(v ?? "")}
              clearable
              searchable
              w={220}
            />
            <Select
              label="Thực thể"
              placeholder="Chọn thực thể"
              data={entitiesOptions ?? []}
              value={entity || null}
              onChange={(v) => {
                setEntity(v ?? "")
                setEntityId("")
              }}
              clearable
              searchable
              w={220}
            />
            <Select
              label="ID thực thể"
              placeholder={entity ? "Chọn ID thực thể" : "Chọn thực thể trước"}
              data={entityIdsOptions ?? []}
              value={entityId || null}
              onChange={(v) => setEntityId(v ?? "")}
              clearable
              searchable
              w={240}
              disabled={!entity}
              rightSection={entityIdsLoading ? <Loader size={16} /> : null}
            />
            <Select
              label="Kết quả"
              placeholder="Chọn kết quả"
              data={[
                { label: "Thành công", value: "success" },
                { label: "Thất bại", value: "failed" }
              ]}
              value={result}
              onChange={(v) => setResult((v as "success" | "failed") ?? null)}
              clearable
              w={200}
            />
            <Group ml="auto" gap={12}>
              <Text c="dimmed">Tổng số dòng: {total}</Text>
              <Group>
                <Text>Số dòng/trang</Text>
                <NumberInput
                  value={limit}
                  onChange={(v) => setLimit(Number(v))}
                  w={100}
                />
              </Group>
            </Group>
          </Group>
        </Box>

        <Divider my={0} />
        <Box px={{ base: 4, md: 28 }} py={20}>
          <ScrollArea w="100%" type="auto" scrollbars="x" offsetScrollbars>
            <Table
              highlightOnHover
              striped
              withColumnBorders
              withTableBorder
              verticalSpacing="sm"
              horizontalSpacing="md"
              stickyHeader
              className="rounded-xl"
              miw={1100}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 170 }}>Thời gian</Table.Th>
                  <Table.Th style={{ width: 160 }}>Người dùng</Table.Th>
                  <Table.Th style={{ width: 140 }}>Loại</Table.Th>
                  <Table.Th style={{ width: 140 }}>Hành động</Table.Th>
                  <Table.Th style={{ width: 220 }}>Thực thể</Table.Th>
                  <Table.Th style={{ width: 120 }}>Kết quả</Table.Th>
                  <Table.Th style={{ width: 140 }}>IP</Table.Th>
                  <Table.Th style={{ width: 260 }}>Trình duyệt</Table.Th>
                  <Table.Th style={{ width: 120 }}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {isLoading ? (
                  <Table.Tr>
                    <Table.Td colSpan={colCount}>
                      <Flex justify="center" align="center" h={60}>
                        <Loader />
                      </Flex>
                    </Table.Td>
                  </Table.Tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <Table.Tr key={log._id}>
                      <Table.Td>
                        {format(new Date(log.time), "dd/MM/yyyy HH:mm:ss")}
                      </Table.Td>
                      <Table.Td>
                        {log.userId ? (
                          (usersMap[log.userId] ?? log.userId)
                        ) : (
                          <Text c="dimmed">-</Text>
                        )}
                      </Table.Td>
                      <Table.Td>{typesMap[log.type] ?? log.type}</Table.Td>
                      <Table.Td>
                        {actionsMap[log.action] ?? log.action}
                      </Table.Td>
                      <Table.Td>
                        {log.entity ? (
                          <>
                            <Text fw={600} span>
                              {entitiesMap[log.entity] ?? log.entity}
                            </Text>
                            {log.entityId ? (
                              <Text span c="dimmed">
                                {" " + log.entityId}
                              </Text>
                            ) : null}
                          </>
                        ) : (
                          <Text c="dimmed">-</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {log.result === "success" ? (
                          <Text c="green.7">Thành công</Text>
                        ) : log.result === "failed" ? (
                          <Text c="red.7">Thất bại</Text>
                        ) : (
                          <Text c="dimmed">-</Text>
                        )}
                      </Table.Td>
                      <Table.Td>{log.ip || <Text c="dimmed">-</Text>}</Table.Td>
                      <Table.Td>
                        <Text lineClamp={2} title={log.userAgent || undefined}>
                          {log.userAgent || <Text c="dimmed">-</Text>}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {log.meta ? (
                          <Button
                            variant="light"
                            size="xs"
                            radius="xl"
                            onClick={() =>
                              modals.open({
                                size: "lg",
                                title: <b>Meta chi tiết</b>,
                                children: (
                                  <Box>
                                    <pre style={{ whiteSpace: "pre-wrap" }}>
                                      {JSON.stringify(log.meta, null, 2)}
                                    </pre>
                                  </Box>
                                )
                              })
                            }
                          >
                            Xem meta
                          </Button>
                        ) : (
                          <Text c="dimmed">-</Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={colCount}>
                      <Flex justify="center" align="center" h={60}>
                        <Text c="dimmed">Không có log hệ thống nào</Text>
                      </Flex>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>

          <Flex justify="center" mt={16}>
            <Pagination
              total={Math.ceil((total || 1) / limit)}
              value={page}
              onChange={setPage}
            />
          </Flex>
        </Box>
      </Box>
    </AppLayout>
  )
}
