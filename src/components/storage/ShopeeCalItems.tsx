import { useMemo } from "react"
import { Badge, Box, Divider, Group, Paper, ScrollArea, Table, Text } from "@mantine/core"

interface Props {
  items: {
    _id: string
    name: string
    quantity: number
    storageItem: {
      code: string
      name: string
      receivedQuantity: {
        quantity: number
        real: number
      }
      deliveredQuantity: {
        quantity: number
        real: number
      }
      restQuantity: {
        quantity: number
        real: number
      }
      note?: string
    } | null
  }[]
}

export const ShopeeCalItems = ({ items }: Props) => {
  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  return (
    <Paper withBorder radius="lg" p="md">
      <Group justify="space-between" align="start" mb={10} wrap="wrap" gap={8}>
        <Box>
          <Text fw={700} fz="sm">
            Tổng hợp mặt hàng cần xử lý
          </Text>
          <Text c="dimmed" fz="xs" mt={2}>
            Kiểm tra danh sách tổng hợp trước khi chuyển sang bước đóng đơn.
          </Text>
        </Box>
        <Badge variant="light" color="orange">
          {items.length} loại
        </Badge>
      </Group>
      <Divider mb={10} />

      <ScrollArea.Autosize mah={460}>
        <Table
          striped
          verticalSpacing="xs"
          horizontalSpacing="md"
          withTableBorder
          miw={320}
        >
          <Table.Thead bg="orange.0">
            <Table.Tr>
              <Table.Th style={{ width: 220 }}>Mặt hàng</Table.Th>
              <Table.Th style={{ textAlign: "right", width: 120 }}>Số lượng</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((item) => (
              <Table.Tr key={item._id}>
                <Table.Td fw={500} style={{ whiteSpace: "normal" }}>
                  {item.name || "N/A"}
                </Table.Td>
                <Table.Td style={{ textAlign: "right", fontWeight: 600 }}>
                  {item.quantity}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea.Autosize>

      <Divider my={10} />
      <Group justify="space-between" align="center">
        <Text fz="sm" c="dimmed">
          Tổng số lượng
        </Text>
        <Text fw={700}>{totalQuantity}</Text>
      </Group>
    </Paper>
  )
}
