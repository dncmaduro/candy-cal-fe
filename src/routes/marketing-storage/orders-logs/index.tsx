import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../../components/layouts/AppLayout"
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Group,
  Loader,
  Pagination,
  Table,
  Text,
  Title,
  rem
} from "@mantine/core"
import { useLogs } from "../../../hooks/useLogs"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { format, isEqual } from "date-fns"
import { modals } from "@mantine/modals"
import { CalResultModal } from "../../../components/cal/CalResultModal"
import { DatePickerInput } from "@mantine/dates"
import { IconListDetails, IconCalendarSearch } from "@tabler/icons-react"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { Helmet } from "react-helmet-async"

export const Route = createFileRoute("/marketing-storage/orders-logs/")({
  component: RouteComponent
})

function RouteComponent() {
  useAuthGuard(["admin", "order-emp", "system-emp"])
  const DATA_PER_PAGE = 10

  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setHours(0, 0, 0, 0))
  )
  const [endDate, setEndDate] = useState<Date | null>(
    new Date(new Date().setHours(0, 0, 0, 0))
  )
  const { getLogs, getOrderLogs } = useLogs()
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["logs", page],
    queryFn: () => getLogs({ page, limit: DATA_PER_PAGE }),
    select: (data) => data.data
  })

  const { data: orderLogsData } = useQuery({
    queryKey: ["orderLogs", page],
    queryFn: () => getOrderLogs({ page, limit: DATA_PER_PAGE }),
    select: (data) => data.data
  })

  const viewLogsRange = (startDate: string, endDate: string) => {
    const modalTitle = isEqual(startDate, endDate)
      ? "Vận đơn ngày " + format(startDate, "dd/MM/yyyy")
      : "Vận đơn từ " +
        format(startDate, "dd/MM/yyyy") +
        " đến " +
        format(endDate, "dd/MM/yyyy")
    modals.open({
      title: modalTitle,
      children: (
        <CalResultModal readOnly startDate={startDate} endDate={endDate} />
      ),
      size: "xl",
      w: 1400
    })
  }

  useEffect(() => {
    if (logsData) {
      setTotalPages(Math.ceil(logsData.total / DATA_PER_PAGE))
    }
  }, [logsData])

  return (
    <AppLayout>
      <Helmet>
        <title>Đóng hàng - Lịch sử vận đơn | MyCandy</title>
      </Helmet>
      <Container size="1600" py={32}>
        <Box
          bg="white"
          style={{
            borderRadius: rem(18),
            boxShadow: "0 4px 24px 0 rgba(60,80,180,0.04)",
            border: "1px solid #ececec"
          }}
          px={{ base: 8, md: 32 }}
          w={"100%"}
          py={{ base: 16, md: 36 }}
        >
          <Flex
            align="center"
            justify="space-between"
            direction={{ base: "column", md: "row" }}
            gap={12}
            mb={14}
          >
            <Box>
              <Title order={2} fz={{ base: 20, md: 26 }} mb={2}>
                Lịch sử vận đơn
              </Title>
              <Text c="dimmed" fz="sm">
                Quản lý, tra cứu các vận đơn và chi tiết lịch sử đóng hàng
              </Text>
            </Box>
            <Group gap={8} align="end" wrap="wrap">
              <Text fw={500} c="dimmed" fz="sm">
                Tra cứu theo khoảng ngày
              </Text>
              <DatePickerInput
                value={startDate}
                onChange={setStartDate}
                valueFormat="DD/MM/YYYY"
                size="sm"
                radius="md"
                placeholder="Từ ngày"
                style={{ minWidth: 120 }}
              />
              <Text>-</Text>
              <DatePickerInput
                value={endDate}
                onChange={setEndDate}
                valueFormat="DD/MM/YYYY"
                size="sm"
                radius="md"
                placeholder="Đến ngày"
                style={{ minWidth: 120 }}
              />
              <Button
                size="sm"
                color="indigo"
                variant="light"
                leftSection={<IconCalendarSearch size={17} />}
                disabled={!startDate || !endDate}
                onClick={() => {
                  if (startDate && endDate) {
                    viewLogsRange(
                      startDate.toISOString(),
                      endDate.toISOString()
                    )
                  }
                }}
              >
                Xem
              </Button>
            </Group>
          </Flex>
          <Divider mb={16} />
          <Box style={{ overflowX: "auto" }}>
            <Table
              withTableBorder
              withColumnBorders
              striped
              highlightOnHover
              verticalSpacing="sm"
              horizontalSpacing="md"
              className="rounded-xl"
              miw={700}
              mt={4}
            >
              <Table.Thead bg="indigo.0">
                <Table.Tr>
                  <Table.Th>STT</Table.Th>
                  <Table.Th>Ngày vận đơn</Table.Th>
                  <Table.Th>Cập nhật lúc</Table.Th>
                  <Table.Th>Tổng số đơn</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {isLoading ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Flex justify="center" align="center" h={60}>
                        <Loader size="sm" />
                      </Flex>
                    </Table.Td>
                  </Table.Tr>
                ) : orderLogsData?.data?.length ? (
                  orderLogsData.data.map((log, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>
                        {index + 1 + (page - 1) * DATA_PER_PAGE}
                      </Table.Td>
                      <Table.Td>{format(log.date, "dd/MM/yyyy")}</Table.Td>
                      <Table.Td>
                        {format(log.updatedAt, "dd/MM/yyyy HH:mm:ss")}
                      </Table.Td>
                      <Table.Td>
                        {log.morning.orders.reduce(
                          (acc, o) => acc + o.quantity,
                          0
                        ) +
                          (log.afternoon
                            ? log.afternoon.orders.reduce(
                                (acc, o) => acc + o.quantity,
                                0
                              )
                            : 0)}
                      </Table.Td>
                      <Table.Td>
                        <Button
                          variant="light"
                          color="indigo"
                          size="xs"
                          radius="xl"
                          leftSection={<IconListDetails size={15} />}
                          onClick={() => {
                            viewLogsRange(log.date, log.date)
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Flex justify="center" align="center" h={60}>
                        <Text c="dimmed">Không có dữ liệu</Text>
                      </Flex>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Box>
          <Flex justify="center" mt={20}>
            <Pagination total={totalPages} value={page} onChange={setPage} />
          </Flex>
        </Box>
      </Container>
    </AppLayout>
  )
}
