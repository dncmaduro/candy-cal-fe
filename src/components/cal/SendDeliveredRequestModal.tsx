import {
  Box,
  Button,
  Divider,
  Group,
  NumberInput,
  ScrollArea,
  Stack,
  Table,
  Text
} from "@mantine/core"
import { useState, useMemo } from "react"
import { useMutation } from "@tanstack/react-query"
import { CToast } from "../common/CToast"
import { useDeliveredRequests } from "../../hooks/useDeliveredRequests"
import { ItemResponse } from "../../hooks/models"

interface StorageItemInput {
  [storageKey: string]: number // use composite key: `${itemId}__${storageItemId}`
}

interface Props {
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
      _id: string
    }[]
  }[]
  allItems: ItemResponse[]
  date: Date
}

export const SendDeliveredRequestModal = ({ items, allItems, date }: Props) => {
  const { createDeliveredRequest } = useDeliveredRequests()

  const [quantities, setQuantities] = useState<StorageItemInput>({})

  const itemTotalByItemId = useMemo(() => {
    const map: Record<string, number> = {}
    items.forEach((item) => {
      const sum = item.storageItems.reduce((acc, si) => {
        const key = `${item._id}__${si._id}`
        return acc + (quantities[key] || 0)
      }, 0)
      map[item._id] = sum
    })
    return map
  }, [quantities, items])

  const isValid = items.every(
    (item) =>
      itemTotalByItemId[item._id] === item.quantity &&
      item.storageItems.every((si) => {
        const key = `${item._id}__${si._id}`
        const q = quantities[key] ?? 0
        return q >= 0 && q <= si.restQuantity.quantity
      })
  )

  const body = useMemo(() => {
    // Aggregate by storageItemId across all items
    const agg: Record<string, number> = {}
    items.forEach((item) => {
      item.storageItems.forEach((si) => {
        const key = `${item._id}__${si._id}`
        const q = quantities[key] || 0
        if (q > 0) {
          agg[si._id] = (agg[si._id] ?? 0) + q
        }
      })
    })
    return Object.entries(agg).map(([id, quantity]) => ({ _id: id, quantity }))
  }, [quantities, items])

  const { mutate: sendRequest, isPending } = useMutation({
    mutationFn: createDeliveredRequest,
    onSuccess: () => {
      CToast.success({ title: "Gửi yêu cầu xuất kho thành công" })
    },
    onError: () => {
      CToast.error({ title: "Gửi yêu cầu xuất kho thất bại" })
    }
  })

  return (
    <Box h={"80vh"}>
      <Text fw={700} fz="lg" mb={10}>
        Phân bổ số lượng từng kho cho từng mặt hàng
      </Text>
      <ScrollArea.Autosize h={"85%"} type="always">
        <Stack gap={18}>
          {items.map((item) => (
            <Box
              key={item._id}
              mb={8}
              p={10}
              style={{
                background: "#f9faff",
                borderRadius: 10,
                border: "1px solid #f1f3fa"
              }}
            >
              <Text fw={600} fz="md" mb={4}>
                {allItems.find((ai) => ai._id === item._id)?.name ?? item._id}{" "}
                <Text span c="dimmed" fz="sm">
                  (Cần: {item.quantity})
                </Text>
              </Text>
              <Table
                withTableBorder
                withColumnBorders
                verticalSpacing="sm"
                highlightOnHover
                miw={400}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Kho hàng</Table.Th>
                    <Table.Th>Đang còn</Table.Th>
                    <Table.Th>Số lượng sử dụng</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {item.storageItems.map((si) => {
                    const key = `${item._id}__${si._id}`
                    return (
                      <Table.Tr key={si._id}>
                        <Table.Td>{si.name}</Table.Td>
                        <Table.Td>{si.restQuantity.quantity}</Table.Td>
                        <Table.Td>
                          <NumberInput
                            min={0}
                            max={Math.min(
                              si.restQuantity.quantity,
                              item.quantity
                            )}
                            value={quantities[key] ?? 0}
                            onChange={(value) => {
                              setQuantities((q) => ({
                                ...q,
                                [key]: typeof value === "number" ? value : 0
                              }))
                            }}
                            disabled={isPending}
                            size="xs"
                            w={90}
                          />
                        </Table.Td>
                      </Table.Tr>
                    )
                  })}
                </Table.Tbody>
              </Table>
              <Group mt={8} gap={16}>
                <Text
                  c={
                    itemTotalByItemId[item._id] === item.quantity
                      ? "teal"
                      : "red"
                  }
                  fz="sm"
                >
                  Tổng đã chọn: {itemTotalByItemId[item._id] ?? 0}/
                  {item.quantity}
                </Text>
                {itemTotalByItemId[item._id] !== item.quantity && (
                  <Text c="red" fz="xs">
                    Tổng số lượng chưa đúng!
                  </Text>
                )}
              </Group>
            </Box>
          ))}
        </Stack>
      </ScrollArea.Autosize>
      <Divider my={20} />
      <Group justify="flex-end">
        <Button
          onClick={() => sendRequest({ items: body, date })}
          disabled={!isValid || isPending}
          loading={isPending}
          color="indigo"
          radius="xl"
        >
          Gửi yêu cầu
        </Button>
      </Group>
    </Box>
  )
}
