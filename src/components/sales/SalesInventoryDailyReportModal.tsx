import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { DatePickerInput } from "@mantine/dates"
import { Loader, ScrollArea, Stack, Table, Text } from "@mantine/core"
import { useSalesItems } from "../../hooks/useSalesItems"

type Props = {
  initialDate?: Date
}

export const SalesInventoryDailyReportModal = ({ initialDate }: Props) => {
  const { getDailySalesInventoryReport } = useSalesItems()
  const [date, setDate] = useState<Date | null>(initialDate || new Date())
  const { data, isLoading } = useQuery({
    queryKey: ["salesInventory", "daily-report", date?.toDateString()],
    queryFn: () => getDailySalesInventoryReport(date!),
    enabled: Boolean(date)
  })
  const rows = data?.data.data || []

  return (
    <Stack gap="md">
      <DatePickerInput
        label="Ngày báo cáo"
        value={date}
        onChange={setDate}
        valueFormat="DD/MM/YYYY"
        clearable={false}
      />
      {isLoading ? (
        <Loader size="sm" />
      ) : (
        <ScrollArea h={420}>
          <Table striped highlightOnHover withTableBorder stickyHeader>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Mã</Table.Th>
                <Table.Th>Tên hàng</Table.Th>
                <Table.Th ta="right">Tồn đầu</Table.Th>
                <Table.Th ta="right">Nhập</Table.Th>
                <Table.Th ta="right">Xuất</Table.Th>
                <Table.Th ta="right">Tồn cuối</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((item) => (
                <Table.Tr key={item.code}>
                  <Table.Td>{item.code}</Table.Td>
                  <Table.Td>{item.name}</Table.Td>
                  <Table.Td ta="right">
                    {item.openingQuantity.toLocaleString("vi-VN")}
                  </Table.Td>
                  <Table.Td ta="right">
                    {item.importedQuantity.toLocaleString("vi-VN")}
                  </Table.Td>
                  <Table.Td ta="right">
                    {item.exportedQuantity.toLocaleString("vi-VN")}
                  </Table.Td>
                  <Table.Td ta="right" fw={700}>
                    {item.closingQuantity.toLocaleString("vi-VN")}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          {!rows.length && (
            <Text c="dimmed" ta="center" mt="md">
              Không có dữ liệu tồn kho.
            </Text>
          )}
        </ScrollArea>
      )}
    </Stack>
  )
}
