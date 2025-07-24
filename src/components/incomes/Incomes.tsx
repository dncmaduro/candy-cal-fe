import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useIncomes } from "../../hooks/useIncomes"
import {
  Box,
  Button,
  Divider,
  Flex,
  Loader,
  Pagination,
  Table,
  Text,
  Group
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { format } from "date-fns"

export const Incomes = () => {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const { getIncomesByDate } = useIncomes()

  const { data: incomesData, isLoading } = useQuery({
    queryKey: ["getIncomesByDate", page, limit, startDate, endDate],
    queryFn: () =>
      getIncomesByDate({
        page,
        limit,
        startDate: startDate
          ? new Date(startDate.setHours(0, 0, 0, 0)).toISOString()
          : new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        endDate: endDate
          ? new Date(endDate.setHours(23, 59, 59, 999)).toISOString()
          : new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
      }),
    select: (data) => data.data
  })

  const columns = [
    { label: "Ngày ghi nhận", key: "date", width: 120 },
    { label: "Mã đơn hàng", key: "orderId", width: 140 },
    { label: "Khách hàng", key: "customer", width: 150 },
    { label: "Tỉnh thành", key: "province", width: 120 },
    { label: "Tổng số SP", key: "products", width: 100 },
    { label: "Chi tiết", key: "actions", width: 120 }
  ]

  return (
    <>
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
            Doanh thu bán hàng
          </Text>
          <Text c="dimmed" fz="sm">
            Xem và lọc danh sách đơn thu nhập theo ngày
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
          miw={900}
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
            ) : (incomesData?.incomes || []).length > 0 ? (
              (incomesData?.incomes || []).map((item: any) => (
                <Table.Tr key={item._id}>
                  <Table.Td>
                    {format(new Date(item.date), "dd/MM/yyyy")}
                  </Table.Td>
                  <Table.Td>{item.orderId}</Table.Td>
                  <Table.Td>{item.customer}</Table.Td>
                  <Table.Td>{item.province}</Table.Td>
                  <Table.Td>{item.products.length}</Table.Td>
                  <Table.Td>
                    <Button
                      variant="light"
                      size="xs"
                      onClick={() => {
                        // TODO: mở modal xem chi tiết đơn
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Flex justify="center" align="center" h={60}>
                    <Text c="dimmed">Không có đơn thu nhập nào</Text>
                  </Flex>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
        <Flex justify="center" mt={16}>
          <Pagination
            total={Math.ceil((incomesData?.total || 1) / limit)}
            value={page}
            onChange={setPage}
            size="md"
            radius="xl"
          />
        </Flex>
      </Box>
    </>
  )
}
