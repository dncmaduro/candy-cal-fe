import { Badge, Button, Flex, Loader, Stack, Table, Text } from "@mantine/core"
import { modals } from "@mantine/modals"
import { IconPencil, IconSearch } from "@tabler/icons-react"
import { SearchStorageItemResponse } from "../../hooks/models"
import { Can } from "../common/Can"
import { StorageItemDetailModal } from "./StorageItemDetailModal"
import { StorageItemModal } from "./StorageItemModal"
import { format } from "date-fns"

type ShowMode = "both" | "quantity" | "real"

interface Props {
  itemsData: SearchStorageItemResponse[]
  isLoading: boolean
  showMode: ShowMode
  showDeleted: boolean
  readOnly?: boolean
  refetch: () => void
}

export const StorageItemsTable = ({
  itemsData,
  isLoading,
  showMode,
  showDeleted,
  readOnly,
  refetch
}: Props) => {
  // Render group columns
  const renderGroupCols = () => {
    if (showMode === "both") {
      return (
        <>
          <Table.Th>Số lượng</Table.Th>
          <Table.Th>Thực tế</Table.Th>
        </>
      )
    }
    if (showMode === "quantity") return <Table.Th>Số lượng</Table.Th>
    return <Table.Th>Thực tế</Table.Th>
  }

  // Render data cell group
  const renderDataGroup = (obj?: { quantity?: number; real?: number }) => {
    if (showMode === "both") {
      return (
        <>
          <Table.Td>{obj?.quantity ?? "-"}</Table.Td>
          <Table.Td>{obj?.real ?? "-"}</Table.Td>
        </>
      )
    }
    if (showMode === "quantity")
      return <Table.Td>{obj?.quantity ?? "-"}</Table.Td>
    return <Table.Td>{obj?.real ?? "-"}</Table.Td>
  }

  // Tính số cột để colspan empty/loading
  const colCount = showDeleted
    ? 2 + 2 + 1 + 2 // Tên, mã, nhập kho, deletedAt, actions
    : 2 + 3 * (showMode === "both" ? 2 : 1) + 1 + 2

  // Tính số thùng và lẻ
  const calculateBoxes = (quantity: number, quantityPerBox: number) => {
    if (!quantity || !quantityPerBox || quantityPerBox <= 0) {
      return { boxes: 0, remainder: 0 }
    }
    const boxes = Math.floor(quantity / quantityPerBox)
    const remainder = quantity % quantityPerBox
    return { boxes, remainder }
  }

  return (
    <Table
      highlightOnHover
      striped
      withColumnBorders
      withTableBorder
      verticalSpacing="sm"
      horizontalSpacing="md"
      stickyHeader
      className="rounded-xl"
      miw={showMode === "both" ? 980 : 800}
    >
      {/* Header 1 */}
      <Table.Thead>
        {showDeleted ? (
          <Table.Tr>
            <Table.Th style={{ minWidth: 160 }}>Tên mặt hàng</Table.Th>
            <Table.Th style={{ minWidth: 120 }}>Mã hàng</Table.Th>
            <Table.Th colSpan={showMode === "both" ? 2 : 1}>
              Số lượng nhập kho
            </Table.Th>
            <Table.Th style={{ minWidth: 150 }}>Ngày xóa</Table.Th>
            <Table.Th className="border-[1px] border-[#dee2e6]" />
          </Table.Tr>
        ) : (
          <>
            <Table.Tr>
              <Table.Th rowSpan={2} style={{ minWidth: 160 }}>
                Tên mặt hàng
              </Table.Th>
              <Table.Th rowSpan={2} style={{ minWidth: 120 }}>
                Mã hàng
              </Table.Th>
              <Table.Th colSpan={showMode === "both" ? 2 : 1}>
                Số lượng nhập kho
              </Table.Th>
              <Table.Th colSpan={showMode === "both" ? 2 : 1}>
                Số lượng xuất kho
              </Table.Th>
              <Table.Th colSpan={showMode === "both" ? 2 : 1}>
                Số lượng tồn kho
              </Table.Th>
              <Table.Th rowSpan={2} style={{ minWidth: 120 }}>
                Số thùng (tồn kho)
              </Table.Th>
              <Table.Th rowSpan={2} className="border-[1px] border-[#dee2e6]" />
            </Table.Tr>
            {/* Header 2 */}
            <Table.Tr>
              {renderGroupCols()}
              {renderGroupCols()}
              {renderGroupCols()}
            </Table.Tr>
          </>
        )}
      </Table.Thead>

      <Table.Tbody>
        {isLoading ? (
          <Table.Tr>
            <Table.Td colSpan={colCount}>
              <Flex justify="center" align="center" h={60}>
                <Loader />
              </Flex>
            </Table.Td>
          </Table.Tr>
        ) : itemsData && itemsData.length > 0 ? (
          itemsData.map((item: SearchStorageItemResponse) => {
            if (showDeleted) {
              return (
                <Table.Tr key={item._id}>
                  <Table.Td fw={500}>
                    <Stack gap={4}>
                      <Text>{item.name}</Text>
                      <Badge variant="light" color="red" size="xs">
                        Đã xóa
                      </Badge>
                    </Stack>
                  </Table.Td>
                  <Table.Td>{item.code}</Table.Td>
                  {/* Số lượng nhập kho */}
                  {renderDataGroup(item.receivedQuantity)}
                  {/* Ngày xóa */}
                  <Table.Td>
                    <Text fz="sm" c="red">
                      {item.deletedAt
                        ? format(new Date(item.deletedAt), "dd/MM/yyyy HH:mm")
                        : "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Flex justify="flex-end" gap={4}>
                      <Button
                        variant="light"
                        color="indigo"
                        size="xs"
                        radius="xl"
                        leftSection={<IconSearch size={16} />}
                        onClick={() => {
                          modals.open({
                            size: "lg",
                            title: (
                              <Text fw={700} fz="md">
                                Chi tiết mặt hàng
                              </Text>
                            ),
                            children: <StorageItemDetailModal item={item} />
                          })
                        }}
                      >
                        Chi tiết
                      </Button>
                      <Can roles={["admin", "accounting-emp"]}>
                        <Button
                          hidden={readOnly}
                          variant="light"
                          color="yellow"
                          leftSection={<IconPencil size={16} />}
                          size="xs"
                          radius="xl"
                          onClick={() =>
                            modals.open({
                              size: "lg",
                              title: (
                                <Text fw={700} fz="md">
                                  Chỉnh sửa mặt hàng
                                </Text>
                              ),
                              children: (
                                <StorageItemModal
                                  item={item}
                                  refetch={refetch}
                                />
                              )
                            })
                          }
                        >
                          Chỉnh sửa
                        </Button>
                      </Can>
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              )
            }

            const restQuantity =
              showMode === "real"
                ? (item.restQuantity?.real ?? 0)
                : (item.restQuantity?.quantity ?? 0)
            const { boxes, remainder } = calculateBoxes(
              restQuantity,
              item.quantityPerBox ?? 1
            )

            return (
              <Table.Tr key={item._id}>
                <Table.Td fw={500}>
                  <Stack gap={4}>
                    <Text>{item.name}</Text>
                    <Badge variant="light" color="blue" size="xs">
                      {item.quantityPerBox ?? 1}/hộp
                    </Badge>
                  </Stack>
                </Table.Td>
                <Table.Td>{item.code}</Table.Td>
                {/* Số lượng nhập kho */}
                {renderDataGroup(item.receivedQuantity)}
                {/* Số lượng xuất kho */}
                {renderDataGroup(item.deliveredQuantity)}
                {/* Số lượng tồn kho */}
                {renderDataGroup(item.restQuantity)}
                {/* Số thùng */}
                <Table.Td>
                  <Stack gap={2}>
                    <Text fz="sm" fw={500}>
                      {boxes} thùng
                    </Text>
                    {remainder > 0 && (
                      <Text fz="xs" c="dimmed">
                        + {remainder} lẻ
                      </Text>
                    )}
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Flex justify="flex-end" gap={4}>
                    <Button
                      variant="light"
                      color="indigo"
                      size="xs"
                      radius="xl"
                      leftSection={<IconSearch size={16} />}
                      onClick={() => {
                        modals.open({
                          size: "lg",
                          title: (
                            <Text fw={700} fz="md">
                              Chi tiết mặt hàng
                            </Text>
                          ),
                          children: <StorageItemDetailModal item={item} />
                        })
                      }}
                    >
                      Chi tiết
                    </Button>
                    <Can roles={["admin", "accounting-emp"]}>
                      <Button
                        hidden={readOnly}
                        variant="light"
                        color="yellow"
                        leftSection={<IconPencil size={16} />}
                        size="xs"
                        radius="xl"
                        onClick={() =>
                          modals.open({
                            size: "lg",
                            title: (
                              <Text fw={700} fz="md">
                                Chỉnh sửa mặt hàng
                              </Text>
                            ),
                            children: (
                              <StorageItemModal item={item} refetch={refetch} />
                            )
                          })
                        }
                      >
                        Chỉnh sửa
                      </Button>
                    </Can>
                  </Flex>
                </Table.Td>
              </Table.Tr>
            )
          })
        ) : (
          <Table.Tr>
            <Table.Td colSpan={colCount}>
              <Flex justify="center" align="center" h={60}>
                <Text c="dimmed">Không có mặt hàng nào</Text>
              </Flex>
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  )
}
