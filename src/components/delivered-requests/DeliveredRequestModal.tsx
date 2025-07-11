import {
  Box,
  Stack,
  Text,
  Divider,
  Group,
  Badge,
  Table,
  Flex,
  Paper,
  ScrollArea,
  Button
} from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { useItems } from "../../hooks/useItems"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { IconCheck } from "@tabler/icons-react"
import { useState } from "react"
import { StorageItemResponse } from "../../hooks/models"

interface Props {
  request: {
    _id: string
    date: Date
    items: {
      _id: string
      quantity: number
    }[]
    note?: string
    accepted?: boolean
    updatedAt?: Date
    comments?: {
      userId: string
      name: string
      text: string
      date: Date
    }[]
  }
  acceptRequest: () => void
}

export const DeliveredRequestModal = ({ request, acceptRequest }: Props) => {
  const { searchStorageItems } = useItems()
  const [accepted, setAccepted] = useState<boolean>(request.accepted || false)

  const { data: itemsData } = useQuery({
    queryKey: ["searchStorageItems"],
    queryFn: () => searchStorageItems(""),
    select: (data) => data.data
  })

  // Map itemId -> item info
  const itemsMap = (itemsData || []).reduce(
    (acc, item) => {
      acc[item._id] = item
      return acc
    },
    {} as Record<string, StorageItemResponse>
  )

  return (
    <Box p={0}>
      <Stack gap={10}>
        <Group justify="space-between">
          <Text fw={600} fz="lg">
            Yêu cầu xuất kho #{request._id}
          </Text>
          <Badge color={accepted ? "teal" : "yellow"} variant="light">
            {accepted ? "Đã duyệt" : "Chờ duyệt"}
          </Badge>
        </Group>
        <Text c="dimmed" fz="sm">
          Ngày tạo:{" "}
          {format(new Date(request.date), "dd/MM/yyyy HH:mm", { locale: vi })}
        </Text>
        {request.updatedAt && (
          <Text c="dimmed" fz="sm">
            Cập nhật gần nhất:{" "}
            {format(new Date(request.updatedAt), "dd/MM/yyyy HH:mm", {
              locale: vi
            })}
          </Text>
        )}

        {request.note && (
          <Paper bg="gray.1" radius="md" p={10} mb={4}>
            <Text c="indigo.8" fz="sm">
              <b>Ghi chú: </b>
              {request.note}
            </Text>
          </Paper>
        )}

        <Divider my={4} />

        {/* Danh sách mặt hàng */}
        <ScrollArea h={400}>
          <Table withColumnBorders withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tên mặt hàng</Table.Th>
                <Table.Th>Mã hàng</Table.Th>
                <Table.Th>Số lượng yêu cầu</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {request.items.map((item) => {
                const info = itemsMap[item._id]
                return (
                  <Table.Tr key={item._id}>
                    <Table.Td>{info?.name || <Text c="red">?</Text>}</Table.Td>
                    <Table.Td>{info?.code || "-"}</Table.Td>
                    <Table.Td>
                      <Text fw={600}>{item.quantity}</Text>
                    </Table.Td>
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {/* Comment section */}
        {request.comments && request.comments.length > 0 && (
          <>
            <Divider my={4} />
            <Text fw={600} fz="md" mt={8} mb={4}>
              Bình luận
            </Text>
            <Stack gap={8}>
              {request.comments.map((cmt, idx) => (
                <Box key={idx} p={8} bg="gray.0" className="rounded-md">
                  <Flex gap={8} align="center">
                    <Text fw={600} fz="sm">
                      {cmt.name}
                    </Text>
                    <Text c="dimmed" fz="xs">
                      {format(new Date(cmt.date), "dd/MM/yyyy HH:mm", {
                        locale: vi
                      })}
                    </Text>
                  </Flex>
                  <Text fz="sm" mt={2}>
                    {cmt.text}
                  </Text>
                </Box>
              ))}
            </Stack>
          </>
        )}
        <Group justify="flex-end">
          {!request.accepted && (
            <Button
              variant="light"
              color="green"
              onClick={() => {
                acceptRequest()
                setAccepted(true)
              }}
              leftSection={<IconCheck />}
            >
              Chấp nhận yêu cầu
            </Button>
          )}
        </Group>
      </Stack>
    </Box>
  )
}
