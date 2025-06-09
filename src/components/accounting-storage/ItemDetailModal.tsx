import { ItemResponse } from "../../hooks/models"
import { Box, Stack, Text, Table, Divider } from "@mantine/core"

interface Props {
  item: ItemResponse
}

export const ItemDetailModal = ({ item }: Props) => {
  return (
    <Box style={{ width: "100%", margin: "0 auto" }}>
      <Stack gap={10}>
        <Stack gap={0}>
          <Text fz="sm">
            <b>Tên mặt hàng:</b> {item.name}
          </Text>
          <Text fz="sm">
            <b>Mã hàng:</b> {item.code}
          </Text>
        </Stack>

        <Divider mt={6} mb={8} />

        <Table
          withColumnBorders
          verticalSpacing={6}
          horizontalSpacing="md"
          miw={300}
          highlightOnHover={false}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th></Table.Th>
              <Table.Th>Sổ sách</Table.Th>
              <Table.Th>Thực tế</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>
                <b>Nhập kho</b>
              </Table.Td>
              <Table.Td>{item.receivedQuantity.quantity}</Table.Td>
              <Table.Td>{item.receivedQuantity.real}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>
                <b>Xuất kho</b>
              </Table.Td>
              <Table.Td>{item.deliveredQuantity.quantity}</Table.Td>
              <Table.Td>{item.deliveredQuantity.real}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>
                <b>Tồn kho</b>
              </Table.Td>
              <Table.Td>{item.restQuantity.quantity}</Table.Td>
              <Table.Td>{item.restQuantity.real}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>

        <Divider my={10} />

        <Text fz="sm" mb={0}>
          <b>Ghi chú:</b>{" "}
          {item.note?.trim() ? item.note : <i>Không có ghi chú</i>}
        </Text>
      </Stack>
    </Box>
  )
}
