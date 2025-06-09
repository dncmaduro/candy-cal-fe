import { Box, Table, Text, Loader, Flex } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { useLogs } from "../../hooks/useLogs"

interface Props {
  month: Date | null
}

export const MonthLogsModal = ({ month }: Props) => {
  const { getStorageLogsByMonth } = useLogs()

  const { data: monthlogsData, isFetching } = useQuery({
    queryKey: ["getStorageLogsByMonth", month],
    queryFn: () =>
      getStorageLogsByMonth(
        month
          ? { month: month.getMonth() + 1, year: month.getFullYear() }
          : { month: new Date().getMonth() + 1, year: new Date().getFullYear() }
      ),
    enabled: !!month,
    select: (data) => data.data
  })

  return (
    <Box py={16} px={8} w="100%" maw={640}>
      <Table
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
        verticalSpacing="sm"
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tên mặt hàng</Table.Th>
            <Table.Th>Nhập kho</Table.Th>
            <Table.Th>Xuất kho</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {isFetching ? (
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Flex justify="center" align="center" h={60}>
                  <Loader />
                </Flex>
              </Table.Td>
            </Table.Tr>
          ) : monthlogsData?.items && monthlogsData.items.length > 0 ? (
            monthlogsData.items.map((item) => (
              <Table.Tr key={item._id}>
                <Table.Td>{item.name}</Table.Td>
                <Table.Td>{item.receivedQuantity}</Table.Td>
                <Table.Td>{item.deliveredQuantity}</Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text c="dimmed" ta="center">
                  Không có dữ liệu cho tháng này
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Box>
  )
}
