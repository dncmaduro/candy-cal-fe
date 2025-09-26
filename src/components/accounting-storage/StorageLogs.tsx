import {
  Box,
  Button,
  Divider,
  Flex,
  Loader,
  Pagination,
  Table,
  Text,
  Select,
  rem,
  Group,
  Tooltip,
  NumberInput
} from "@mantine/core"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo, useEffect } from "react"
import { modals } from "@mantine/modals"
import { IconPlus, IconEdit, IconTrash, IconNote } from "@tabler/icons-react"
import { useItems } from "../../hooks/useItems"
import { format } from "date-fns"
import { DatePickerInput } from "@mantine/dates"
import { StorageLogModal } from "./StorageLogModal"
import { useLogs } from "../../hooks/useLogs"
import {
  DELIVERED_TAG_OPTIONS,
  RECEIVED_TAG_OPTION
} from "../../constants/tags"
import { STATUS_OPTIONS } from "../../constants/status"
import { CToast } from "../common/CToast"
import { Can } from "../common/Can"
import { useDebouncedValue } from "@mantine/hooks"

interface Props {
  activeTab: string
}

export const StorageLogs = ({ activeTab }: Props) => {
  const TAG_OPTIONS = [...DELIVERED_TAG_OPTIONS, ...RECEIVED_TAG_OPTION]
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [debouncedLimit] = useDebouncedValue(limit, 300)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [itemId, setItemId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [tag, setTag] = useState<string | null>(null)

  const { searchStorageItems } = useItems()
  const { getStorageLogs, deleteStorageLog } = useLogs()

  const { data: itemsData } = useQuery({
    queryKey: [
      "searchStorageItems",
      activeTab,
      page,
      limit,
      startDate,
      endDate,
      status,
      tag,
      itemId
    ],
    queryFn: () => searchStorageItems({ searchText: "", deleted: true }),
    select: (data) => data.data
  })

  const itemsOptions = useMemo(() => {
    return itemsData
      ? itemsData.map((item) => ({
          value: item._id,
          label: item.name
        }))
      : []
  }, [itemsData])

  // Filter query
  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "storageLogs",
      page,
      debouncedLimit,
      startDate,
      endDate,
      status,
      tag,
      itemId
    ],
    queryFn: () =>
      getStorageLogs({
        page,
        limit: debouncedLimit,
        startDate: startDate
          ? new Date(startDate.setHours(0, 0, 0, 0)).toISOString()
          : undefined,
        endDate: endDate
          ? new Date(endDate.setHours(23, 59, 59, 999)).toISOString()
          : undefined,
        status: status || undefined,
        tag: tag || undefined,
        itemId: itemId || undefined
      }),
    select: (res) => res.data
  })

  // Items Map for name lookup
  const itemsMap = useMemo(() => {
    if (!itemsData) return {}
    return itemsData.reduce(
      (acc, item) => {
        acc[item._id] = item
        return acc
      },
      {} as Record<string, any>
    )
  }, [itemsData])

  const { mutate: remove } = useMutation({
    mutationFn: deleteStorageLog,
    onSuccess: () => {
      CToast.success({
        title: "Xóa log kho thành công"
      })
      refetch()
    }
  })

  const openModal = (log?: any) => {
    modals.open({
      size: "lg",
      title: (
        <Text fw={700} fz="md">
          {log ? "Chỉnh sửa log kho" : "Tạo log kho mới"}
        </Text>
      ),
      children: (
        <StorageLogModal
          itemsList={itemsData || []}
          log={log}
          onSuccess={() => {
            modals.closeAll()
            refetch()
            queryClient.invalidateQueries({
              queryKey: ["searchItems"]
            })
          }}
        />
      )
    })
  }

  // Table col count (name, status, date, items, note, action)
  const colCount = 6

  useEffect(() => {
    setPage(1)
  }, [startDate, endDate, status, tag, itemId, limit])

  return (
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
      {/* Header */}
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
            Nhật ký kho
          </Text>
          <Text c="dimmed" fz="sm">
            Quản lý các log nhập xuất kho, điều chỉnh số lượng
          </Text>
        </Box>
        <Button
          color="indigo"
          leftSection={<IconPlus size={18} />}
          radius="xl"
          size="md"
          px={18}
          onClick={() => openModal()}
          style={{
            fontWeight: 600,
            letterSpacing: 0.1
          }}
        >
          Thêm log kho
        </Button>
      </Flex>

      {/* Filter row */}
      <Group
        gap={16}
        align="flex-end"
        justify="flex-start"
        px={{ base: 8, md: 28 }}
        py={8}
        wrap="wrap"
        style={{
          borderRadius: 12,
          marginBottom: 8,
          marginTop: 0
        }}
      >
        <DatePickerInput
          value={startDate}
          onChange={setStartDate}
          placeholder="Từ ngày"
          valueFormat="DD/MM/YYYY"
          size="sm"
          radius="md"
          clearable
          w={130}
        />
        <DatePickerInput
          value={endDate}
          onChange={setEndDate}
          placeholder="Đến ngày"
          valueFormat="DD/MM/YYYY"
          size="sm"
          radius="md"
          clearable
          w={130}
        />
        <Select
          data={[{ value: "", label: "Tất cả" }, ...STATUS_OPTIONS]}
          value={status ?? ""}
          onChange={setStatus}
          placeholder="Trạng thái"
          label="Trạng thái"
          size="sm"
          radius="md"
          w={140}
        />
        <Select
          data={[{ value: "", label: "Tất cả" }, ...TAG_OPTIONS]}
          value={tag ?? ""}
          onChange={setTag}
          placeholder="Phân loại"
          label="Phân loại"
          size="sm"
          radius="md"
          w={160}
        />
        <Select
          data={itemsOptions}
          value={itemId ?? ""}
          onChange={setItemId}
          placeholder="Tìm kiếm mặt hàng"
          label="Mặt hàng"
          clearable
          size="sm"
          radius="md"
          w={200}
        />
      </Group>

      <Divider my={0} />

      <Box px={{ base: 4, md: 28 }} py={20}>
        <Table
          withColumnBorders
          withTableBorder
          verticalSpacing="sm"
          horizontalSpacing="md"
          stickyHeader
          className="rounded-xl"
          miw={900}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Ngày</Table.Th>
              <Table.Th>Trạng thái</Table.Th>
              <Table.Th>Mặt hàng</Table.Th>
              <Table.Th>Số lượng</Table.Th>
              <Table.Th>Phân loại</Table.Th>
              <Table.Th></Table.Th>
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
            ) : data?.data && data.data.length > 0 ? (
              data.data.map((log) => {
                // Support both old format (single item) and new format (items array)
                const logItems = log.item ? [log.item] : log.items
                const itemsLen = logItems.length

                if (itemsLen === 0) {
                  // Fallback for logs without items
                  return (
                    <Table.Tr key={log._id}>
                      <Table.Td>
                        {format(new Date(log.date), "dd/MM/yyyy")}
                      </Table.Td>
                      <Table.Td>
                        {STATUS_OPTIONS.find((s) => s.value === log.status)
                          ?.label ?? log.status}
                      </Table.Td>
                      <Table.Td>-</Table.Td>
                      <Table.Td>-</Table.Td>
                      <Table.Td>
                        {TAG_OPTIONS.find((t) => t.value === log.tag)?.label ||
                          ""}
                      </Table.Td>
                      <Table.Td>
                        <Group gap={8}>
                          <Can roles={["admin", "accounting-emp"]}>
                            <Button
                              variant="light"
                              color="yellow"
                              size="xs"
                              radius="xl"
                              leftSection={<IconEdit size={16} />}
                              onClick={() => openModal(log)}
                            >
                              Sửa
                            </Button>
                          </Can>
                          <Can roles={["admin", "accounting-emp"]}>
                            {log.tag === "deliver-tiktokshop" ? (
                              <Tooltip label="Xoá log xuất của TiktokShop bằng cách hoàn tác yêu cầu xuất hàng">
                                <Button
                                  variant="light"
                                  color="red"
                                  size="xs"
                                  radius="xl"
                                  leftSection={<IconTrash size={16} />}
                                  disabled
                                >
                                  Xóa
                                </Button>
                              </Tooltip>
                            ) : (
                              <Button
                                variant="light"
                                color="red"
                                size="xs"
                                radius="xl"
                                leftSection={<IconTrash size={16} />}
                                onClick={() => remove(log._id)}
                              >
                                Xóa
                              </Button>
                            )}
                          </Can>
                          {log.note && (
                            <Tooltip label={log.note}>
                              <IconNote size={16} />
                            </Tooltip>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  )
                }

                // Render grouped rows for multiple items
                return logItems.map((item, idx: number) => (
                  <Table.Tr key={`${log._id}_${item._id || idx}`}>
                    {idx === 0 && (
                      <>
                        <Table.Td
                          rowSpan={itemsLen}
                          style={{ verticalAlign: "middle" }}
                        >
                          {format(new Date(log.date), "dd/MM/yyyy")}
                        </Table.Td>
                        <Table.Td
                          rowSpan={itemsLen}
                          style={{ verticalAlign: "middle" }}
                        >
                          {STATUS_OPTIONS.find((s) => s.value === log.status)
                            ?.label ?? log.status}
                        </Table.Td>
                      </>
                    )}
                    <Table.Td>{itemsMap[item._id]?.name || "Unknown"}</Table.Td>
                    <Table.Td>{item.quantity ?? ""}</Table.Td>
                    {idx === 0 && (
                      <>
                        <Table.Td
                          rowSpan={itemsLen}
                          style={{ verticalAlign: "middle" }}
                          className="border-l border-gray-200"
                        >
                          {TAG_OPTIONS.find((t) => t.value === log.tag)
                            ?.label || ""}
                        </Table.Td>
                        <Table.Td
                          rowSpan={itemsLen}
                          style={{ verticalAlign: "middle" }}
                        >
                          <Group gap={8}>
                            <Can roles={["admin", "accounting-emp"]}>
                              <Button
                                variant="light"
                                color="yellow"
                                size="xs"
                                radius="xl"
                                leftSection={<IconEdit size={16} />}
                                onClick={() => openModal(log)}
                              >
                                Sửa
                              </Button>
                            </Can>
                            <Can roles={["admin", "accounting-emp"]}>
                              {log.tag === "deliver-tiktokshop" ? (
                                <Tooltip label="Xoá log xuất của TiktokShop bằng cách hoàn tác yêu cầu xuất hàng">
                                  <Button
                                    variant="light"
                                    color="red"
                                    size="xs"
                                    radius="xl"
                                    leftSection={<IconTrash size={16} />}
                                    disabled
                                  >
                                    Xóa
                                  </Button>
                                </Tooltip>
                              ) : (
                                <Button
                                  variant="light"
                                  color="red"
                                  size="xs"
                                  radius="xl"
                                  leftSection={<IconTrash size={16} />}
                                  onClick={() => remove(log._id)}
                                >
                                  Xóa
                                </Button>
                              )}
                            </Can>
                            {log.note && (
                              <Tooltip label={log.note}>
                                <IconNote size={16} />
                              </Tooltip>
                            )}
                          </Group>
                        </Table.Td>
                      </>
                    )}
                  </Table.Tr>
                ))
              })
            ) : (
              <Table.Tr>
                <Table.Td colSpan={colCount}>
                  <Flex justify="center" align="center" h={60}>
                    <Text c="dimmed">Không có log kho nào</Text>
                  </Flex>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>

        <Flex justify="space-between" mt={16} align="center">
          <Text c="dimmed" mr={8}>
            Tổng số dòng: {data?.total}
          </Text>
          <Pagination
            total={Math.ceil((data?.total ?? 1) / limit)}
            value={page}
            onChange={setPage}
          />
          <Group gap={4}>
            <Text>Số dòng/trang </Text>
            <NumberInput
              value={limit}
              onChange={(val) => setLimit(Number(val))}
              min={1}
              max={100}
              w={120}
            />
          </Group>
        </Flex>
      </Box>
    </Box>
  )
}
