import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../components/layouts/AppLayout"
import {
  Box,
  Button,
  Flex,
  Loader,
  Pagination,
  Table,
  Text
} from "@mantine/core"
import { useLogs } from "../../hooks/useLogs"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { format } from "date-fns"

export const Route = createFileRoute("/logs/")({
  component: RouteComponent
})

function RouteComponent() {
  const DATA_PER_PAGE = 2

  const { getLogs } = useLogs()
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["logs", page],
    queryFn: () => getLogs({ page, limit: DATA_PER_PAGE }),
    select: (data) => {
      return data.data
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
                    <Button variant="light">Xem chi tiết</Button>
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
