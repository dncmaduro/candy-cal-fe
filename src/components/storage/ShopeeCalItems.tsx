import { ScrollArea, Table } from "@mantine/core"

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
  return (
    <ScrollArea.Autosize mah={500}>
      <Table
        striped
        verticalSpacing="sm"
        horizontalSpacing="md"
        withTableBorder
        withColumnBorders
        className="rounded-xl"
        miw={320}
      >
        <Table.Thead bg="orange.0">
          <Table.Tr>
            <Table.Th style={{ width: 180 }}>Mặt hàng</Table.Th>
            <Table.Th>Số lượng</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item) => (
            <Table.Tr key={item._id}>
              <Table.Td fw={500}>{item.name || "N/A"}</Table.Td>
              <Table.Td>{item.quantity}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea.Autosize>
  )
}
