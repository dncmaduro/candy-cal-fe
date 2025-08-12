import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { useState } from "react"
import { useDeliveredRequests } from "../../../hooks/useDeliveredRequests"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  Box,
  Flex,
  Text,
  rem,
  Table,
  Loader,
  Pagination,
  Group,
  Divider,
  Button
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { format } from "date-fns"
import { useUsers } from "../../../hooks/useUsers"
import { IconArrowBackUp, IconCheck, IconEye } from "@tabler/icons-react"
import { CToast } from "../../../components/common/CToast"
import { modals } from "@mantine/modals"
import { DeliveredRequestModal } from "../../../components/delivered-requests/DeliveredRequestModal"
import { Helmet } from "react-helmet-async"

export const Route = createFileRoute("/marketing-storage/delivered-requests/")({
  component: RouteComponent
})

function RouteComponent() {
  useAuthGuard(["admin", "accounting-emp", "order-emp"])
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const { getMe } = useUsers()

  const { data: meData } = useQuery({
    queryKey: ["getMe"],
    queryFn: getMe,
    select: (data) => data.data
  })

  const { searchDeliveredRequests, acceptDeliveredRequest, undoAcceptRequest } =
    useDeliveredRequests()

  const {
    data: requestsData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["deliveredRequests", page, limit, startDate, endDate],
    queryFn: () =>
      searchDeliveredRequests({
        startDate: startDate
          ? new Date(startDate.setHours(0, 0, 0, 0)).toISOString()
          : undefined,
        endDate: endDate
          ? new Date(endDate.setHours(23, 59, 59, 999)).toISOString()
          : undefined,
        page,
        limit
      }),
    select: (data) => data.data
  })

  const { mutate: accept } = useMutation({
    mutationFn: acceptDeliveredRequest,
    onSuccess: () => {
      refetch()
      CToast.success({
        title: "Yêu cầu xuất kho đã được chấp nhận"
      })
    },
    onError: (error) => {
      CToast.error({
        title: "Có lỗi xảy ra khi chấp nhận yêu cầu xuất kho",
        subtitle: error.message || "Vui lòng thử lại sau"
      })
      refetch()
    }
  })

  const { mutate: undo } = useMutation({
    mutationFn: undoAcceptRequest,
    onSuccess: () => {
      refetch()
      CToast.success({
        title: "Yêu cầu xuất kho đã được hoàn tác"
      })
    },
    onError: (error) => {
      CToast.error({
        title: "Có lỗi xảy ra khi hoàn tác yêu cầu xuất kho",
        subtitle: error.message || "Vui lòng thử lại sau"
      })
      refetch()
    }
  })

  const requests = requestsData?.requests || []
  const total = requestsData?.total || 0

  // Table headers
  const columns = [
    { label: "Ngày xuất kho", key: "date", width: 110 },
    { label: "Số lượng mặt hàng", key: "itemsCount", width: 110 },
    { label: "Ghi chú", key: "note", width: 220 },
    { label: "Trạng thái", key: "accepted", width: 100 },
    { label: "Cập nhật", key: "updatedAt", width: 110 },
    { label: "Hành động", key: "actions", width: 120 }
  ]

  const handleAcceptRequest = (req: { _id: string; date: Date }) => {
    modals.openConfirmModal({
      title: <b>Xác nhận chấp nhận yêu cầu</b>,
      size: "lg",
      labels: {
        confirm: "Chấp nhận",
        cancel: "Hủy"
      },
      centered: true,
      onConfirm: () => accept({ requestId: req._id }),
      children: (
        <Text>
          Bạn chắc chắn muốn xác nhận yêu cầu xuất kho trong ngày{" "}
          {format(new Date(req.date), "dd/MM/yyyy")}?
        </Text>
      )
    })
  }

  const handleUndoRequest = (req: { _id: string; date: Date }) => {
    modals.openConfirmModal({
      title: <b>Xác nhận hoàn tác yêu cầu</b>,
      size: "lg",
      labels: {
        confirm: "Hoàn tác",
        cancel: "Hủy"
      },
      centered: true,
      onConfirm: () => undo({ requestId: req._id }),
      children: (
        <Text>
          Bạn chắc chắn muốn hoàn tác yêu cầu xuất kho trong ngày{" "}
          {format(new Date(req.date), "dd/MM/yyyy")}?
        </Text>
      )
    })
  }

  return (
    <AppLayout>
      <Helmet>
        <title>Kho - Yêu cầu xuất kho | MyCandy</title>
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
          direction={{ base: "column", sm: "row" }}
          gap={8}
        >
          <Box>
            <Text fw={700} fz="xl" mb={2}>
              Yêu cầu xuất kho
            </Text>
            <Text c="dimmed" fz="sm">
              Quản lý các yêu cầu xuất kho, có thể lọc theo ngày
            </Text>
          </Box>
          <Group gap={12} align="center" w={{ base: "100%", sm: "auto" }}>
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
        <Box px={{ base: 4, md: 28 }} py={20}>
          <Table
            highlightOnHover
            striped
            withTableBorder
            withColumnBorders
            verticalSpacing="sm"
            horizontalSpacing="md"
            stickyHeader
            className="rounded-xl"
            miw={880}
          >
            <Table.Thead>
              <Table.Tr>
                {columns.map((col) => (
                  <Table.Th key={col.key} style={{ width: col.width }}>
                    {col.label}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={columns.length}>
                    <Flex justify="center" align="center" h={60}>
                      <Loader />
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              ) : requests.length > 0 ? (
                requests.map((req) => {
                  return (
                    <Table.Tr key={req._id}>
                      <Table.Td>
                        {format(new Date(req.date), "dd/MM/yyyy")}
                      </Table.Td>
                      <Table.Td>{req.items.length}</Table.Td>
                      <Table.Td>
                        {req.note || <Text c="dimmed">-</Text>}
                      </Table.Td>
                      <Table.Td>
                        {!req.accepted ? (
                          <Text c="yellow.7">Chờ duyệt</Text>
                        ) : (
                          <Text c="green.7">Đã duyệt</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {req.updatedAt ? (
                          format(new Date(req.updatedAt), "dd/MM/yyyy")
                        ) : (
                          <Text c="dimmed">-</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Flex gap={8}>
                          <Button
                            variant="light"
                            leftSection={<IconEye />}
                            onClick={() =>
                              modals.open({
                                title: "Chi tiết yêu cầu xuất kho",
                                children: (
                                  <DeliveredRequestModal
                                    request={req}
                                    acceptRequest={() =>
                                      handleAcceptRequest(req)
                                    }
                                  />
                                ),
                                size: "xl"
                              })
                            }
                          >
                            Xem chi tiết
                          </Button>
                          {meData &&
                          ["admin", "accounting-emp"].includes(meData?.role) &&
                          !req.accepted ? (
                            <Button
                              color="green"
                              leftSection={<IconCheck />}
                              variant="light"
                              onClick={() => handleAcceptRequest(req)}
                            >
                              Chấp nhận yêu cầu
                            </Button>
                          ) : (
                            <Button
                              color="yellow"
                              variant="light"
                              leftSection={<IconArrowBackUp />}
                              onClick={() => handleUndoRequest(req)}
                            >
                              Hoàn tác yêu cầu
                            </Button>
                          )}
                        </Flex>
                      </Table.Td>
                    </Table.Tr>
                  )
                })
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={columns.length}>
                    <Flex justify="center" align="center" h={60}>
                      <Text c="dimmed">Không có yêu cầu xuất kho nào</Text>
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
          <Flex justify="center" mt={16}>
            <Pagination
              total={Math.ceil((total ?? 1) / limit)}
              value={page}
              onChange={setPage}
              size="md"
              radius="xl"
            />
          </Flex>
        </Box>
      </Box>
    </AppLayout>
  )
}
