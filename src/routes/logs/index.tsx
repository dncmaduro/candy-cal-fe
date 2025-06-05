import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../components/layouts/AppLayout"
import {
  Box,
  Button,
  Flex,
  Group,
  Loader,
  Pagination,
  Table,
  Text
} from "@mantine/core"
import { useLogs } from "../../hooks/useLogs"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { modals } from "@mantine/modals"
import { CalResultModal } from "../../components/cal/CalResultModal"
import { DatePickerInput } from "@mantine/dates"

export const Route = createFileRoute("/logs/")({
  component: RouteComponent
})

function RouteComponent() {
  const DATA_PER_PAGE = 10

  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setHours(0, 0, 0, 0))
  )
  const [endDate, setEndDate] = useState<Date | null>(
    new Date(new Date().setHours(0, 0, 0, 0))
  )
  const { getLogs, getLogsRange } = useLogs()
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["logs", page],
    queryFn: () => getLogs({ page, limit: DATA_PER_PAGE }),
    select: (data) => {
      return data.data
    }
  })

  const { mutate: viewLogsRange } = useMutation({
    mutationFn: ({
      startDate,
      endDate
    }: {
      startDate: string
      endDate: string
    }) => getLogsRange({ startDate, endDate }),
    onSuccess: (response) => {
      console.log("bb")
      console.log(response.data.items, response.data.orders)
      modals.open({
        title: `Vận đơn từ ngày ${format(response.data.startDate, "dd/MM/yyyy")} đến ${format(response.data.endDate, "dd/MM/yyyy")}`,
        children: (
          <CalResultModal
            readOnly
            items={response.data.items}
            orders={response.data.orders}
          />
        ),
        size: "xl",
        w: 1400
      })
    }
  })

  useEffect(() => {
    if (logsData) {
      setTotalPages(Math.ceil(logsData.total / DATA_PER_PAGE))
    }
  }, [logsData])

  return (
    <AppLayout>
      <Box mt={32}>
        <Text className="!text-lg !font-bold">Lịch sử vận đơn</Text>
        <Group>
          Xem vận đơn trong khoảng thời gian:
          <DatePickerInput
            value={startDate}
            onChange={setStartDate}
            valueFormat="DD/MM/YYYY"
          />
          -
          <DatePickerInput
            value={endDate}
            onChange={setEndDate}
            valueFormat="DD/MM/YYYY"
          />
          <Button
            onClick={() => {
              if (startDate && endDate) {
                viewLogsRange({
                  startDate: startDate?.toLocaleDateString(),
                  endDate: endDate?.toLocaleDateString()
                })
              }
            }}
          >
            Xem
          </Button>
        </Group>
        <Table
          className="rounded-lg border border-gray-300"
          mt={40}
          withTableBorder
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>STT</Table.Th>
              <Table.Th>Ngày vận đơn</Table.Th>
              <Table.Th>Cập nhật lúc</Table.Th>
              <Table.Th>Tổng số đơn</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Loader />
                </Table.Td>
              </Table.Tr>
            ) : (
              logsData?.data?.map((log, index) => (
                <Table.Tr key={index}>
                  <Table.Td>{index + 1}</Table.Td>
                  <Table.Td>{format(log.date, "dd/MM/yyyy")}</Table.Td>
                  <Table.Td>
                    {format(log.updatedAt, "dd/MM/yyyy HH:mm:ss")}
                  </Table.Td>
                  <Table.Td>
                    {log.orders.reduce((acc, o) => acc + o.quantity, 0)}
                  </Table.Td>
                  <Table.Td>
                    <Button
                      variant="light"
                      onClick={() => {
                        viewLogsRange({
                          startDate: log.date,
                          endDate: log.date
                        })
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
        <Flex justify={"center"} mt={16}>
          <Pagination total={totalPages} value={page} onChange={setPage} />
        </Flex>
      </Box>
    </AppLayout>
  )
}
