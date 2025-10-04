import { ScrollArea, Table, Text } from "@mantine/core"
import { SearchStorageItemResponse } from "../../hooks/models"

interface Props {
  allItems?: Record<string, SearchStorageItemResponse>
  items: {
    _id: string
    quantity: number
    storageItems: {
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
    }[]
  }[]
}

export const CalItemsV2 = ({ allItems, items }: Props) => {
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
        <Table.Thead bg="indigo.0">
          <Table.Tr>
            <Table.Th style={{ width: 180 }}>Mặt hàng</Table.Th>
            <Table.Th>Số lượng</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {allItems &&
            items.map((item) => (
              <Table.Tr key={item._id}>
                <Table.Td>
                  {allItems[item._id] ? (
                    allItems[item._id].deletedAt ? (
                      <Text c="red" fw={500}>
                        {allItems[item._id].name}
                      </Text>
                    ) : (
                      <Text fw={500}>{allItems[item._id].name}</Text>
                    )
                  ) : (
                    <Text c="dimmed">?</Text>
                  )}
                </Table.Td>
                <Table.Td>{item.quantity}</Table.Td>
              </Table.Tr>
            ))}
        </Table.Tbody>
      </Table>
    </ScrollArea.Autosize>
  )
}
