import { useQuery } from "@tanstack/react-query"
import { useItems } from "../../hooks/useItems"
import { Table } from "@mantine/core"
import { ItemResponse } from "../../hooks/models"

interface Props {
  items: {
    _id: string
    quantity: number
  }[]
}

export const CalResultModal = ({ items }: Props) => {
  const { getAllItems } = useItems()
  console.log(items)
  const { data: allItems } = useQuery({
    queryKey: ["getAllItems"],
    queryFn: getAllItems,
    select: (data) => {
      return data.data.reduce(
        (acc, item) => ({ ...acc, [item._id]: item }),
        {} as Record<string, ItemResponse>
      )
    }
  })

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Sản phẩm</Table.Th>
          <Table.Th>Số lượng</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {allItems &&
          items.map((item) => (
            <Table.Tr key={item._id}>
              <Table.Td>{allItems[item._id].name}</Table.Td>
              <Table.Td>{item.quantity}</Table.Td>
            </Table.Tr>
          ))}
      </Table.Tbody>
    </Table>
  )
}
