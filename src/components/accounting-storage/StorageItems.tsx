import { useQuery } from "@tanstack/react-query"
import { useItems } from "../../hooks/useItems"
import {
  Box,
  Button,
  Divider,
  Flex,
  Loader,
  Table,
  Text,
  TextInput,
  Tooltip,
  rem,
  Group,
  Select
} from "@mantine/core"
import { modals } from "@mantine/modals"
import { useEffect, useState } from "react"
import { IconPencil, IconPlus, IconSearch } from "@tabler/icons-react"
import { useDebouncedValue } from "@mantine/hooks"
import { StorageItemModal } from "./StorageItemModal"
import { StorageItemDetailModal } from "./StorageItemDetailModal"
import { MonthPickerInput } from "@mantine/dates"
import { format } from "date-fns"
import { MonthLogsModal } from "./MonthLogsModal"
import { Can } from "../common/Can"

type ShowMode = "both" | "quantity" | "real"

const MODE_OPTIONS = [
  { value: "both", label: "Hiển thị cả Số lượng & Thực tế" },
  { value: "quantity", label: "Chỉ Số lượng" },
  { value: "real", label: "Chỉ Thực tế" }
]

interface Props {
  readOnly?: boolean
  activeTab: string
}

export const StorageItems = ({ readOnly, activeTab }: Props) => {
  const { searchStorageItems } = useItems()
  const [searchText, setSearchText] = useState<string>("")
  const [debouncedSearchText] = useDebouncedValue(searchText, 300)
  const [showMode, setShowMode] = useState<ShowMode>("both")
  const [month, setMonth] = useState<Date | null>(new Date())

  const {
    data: itemsData,
    refetch,
    isLoading
  } = useQuery({
    queryKey: ["searchStorageItems", debouncedSearchText, activeTab],
    queryFn: () => searchStorageItems(debouncedSearchText),
    select: (data) => data.data
  })

  useEffect(() => {
    refetch()
  }, [debouncedSearchText])

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
  const colCount = 2 + 3 * (showMode === "both" ? 2 : 1) + 2

  return (
    <Box
      mt={40}
      mx="auto"
      px={{ base: 8, md: 0 }}
      w="100%"
      maw={1600}
      style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: rem(20),
        boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
        border: "1px solid #ececec"
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        pt={32}
        pb={8}
        px={{ base: 8, md: 28 }}
        direction={{ base: "column", sm: "row" }}
        gap={8}
      >
        <Box>
          <Text fw={700} fz="xl" mb={2}>
            Các mặt hàng đang có
          </Text>
          <Text c="dimmed" fz="sm">
            Quản lý và chỉnh sửa danh sách mặt hàng
          </Text>
        </Box>
        <Flex gap={12} align="center" w={{ base: "100%", sm: "auto" }}>
          <TextInput
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            leftSection={<IconSearch size={16} />}
            placeholder="Tìm kiếm mặt hàng..."
            size="md"
            w={{ base: "100%", sm: 240 }}
            radius="md"
            styles={{
              input: { background: "#f4f6fb", border: "1px solid #ececec" }
            }}
          />
          <Tooltip label="Thêm mặt hàng mới" withArrow>
            <Can roles={["admin", "accounting-emp"]}>
              <Button
                color="indigo"
                leftSection={<IconPlus size={18} />}
                radius="xl"
                hidden={readOnly}
                size="md"
                px={18}
                onClick={() =>
                  modals.open({
                    size: "lg",
                    title: (
                      <Text fw={700} fz="md">
                        Thêm sản phẩm mới
                      </Text>
                    ),
                    children: <StorageItemModal refetch={refetch} />
                  })
                }
                style={{
                  fontWeight: 600,
                  letterSpacing: 0.1
                }}
              >
                Thêm mặt hàng
              </Button>
            </Can>
          </Tooltip>
        </Flex>
      </Flex>

      <Divider my={0} />

      <Group
        px={{ base: 4, md: 28 }}
        py={14}
        justify="flex-end"
        align="flex-end"
      >
        <Select
          data={MODE_OPTIONS}
          value={showMode}
          onChange={(val) => setShowMode(val as ShowMode)}
          w={250}
          radius="md"
          label="Kiểu hiển thị"
        />
        <Divider mx={8} orientation="vertical" />
        <MonthPickerInput
          label="Xem số liệu theo tháng"
          value={month}
          onChange={setMonth}
          valueFormat="MM/YYYY"
        />
        <Button
          variant="outline"
          onClick={() =>
            modals.open({
              size: "lg",
              title: <b>Số liệu theo tháng {format(month!, "MM/yyyy")}</b>,
              children: <MonthLogsModal month={month} />
            })
          }
        >
          Xem
        </Button>
      </Group>

      <Box px={{ base: 4, md: 28 }} py={20}>
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
              <Table.Th rowSpan={2} className="border-[1px] border-[#dee2e6]" />
            </Table.Tr>
            {/* Header 2 */}
            <Table.Tr>
              {renderGroupCols()}
              {renderGroupCols()}
              {renderGroupCols()}
            </Table.Tr>
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
              itemsData.map((item) => (
                <Table.Tr key={item._id}>
                  <Table.Td fw={500}>{item.name}</Table.Td>
                  <Table.Td>{item.code}</Table.Td>
                  {/* Số lượng nhập kho */}
                  {renderDataGroup(item.receivedQuantity)}
                  {/* Số lượng xuất kho */}
                  {renderDataGroup(item.deliveredQuantity)}
                  {/* Số lượng tồn kho */}
                  {renderDataGroup(item.restQuantity)}
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
              ))
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
      </Box>
    </Box>
  )
}
