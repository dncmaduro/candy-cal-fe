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
  rem
} from "@mantine/core"
import { useItems } from "../../hooks/useItems"
import { useState } from "react"
import { useDebouncedValue } from "@mantine/hooks"
import { IconPlus, IconSearch, IconEdit } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { useQuery } from "@tanstack/react-query"
import { ItemModal } from "./ItemModal"
import { StorageItemResponse } from "../../hooks/models"

export const Items = () => {
  const { searchItems, searchStorageItems } = useItems()
  const [searchText, setSearchText] = useState<string>("")
  const [debouncedSearchText] = useDebouncedValue(searchText, 300)

  const {
    data: itemsData,
    refetch,
    isLoading
  } = useQuery({
    queryKey: ["searchItems", debouncedSearchText],
    queryFn: () => searchItems(debouncedSearchText),
    select: (data) => data.data
  })

  const { data: storageItemsData } = useQuery({
    queryKey: ["searchStorageItems"],
    queryFn: () => searchStorageItems(""),
    select: (data) => {
      return data.data.reduce(
        (acc, item) => {
          acc[item._id] = item
          return acc
        },
        {} as Record<string, StorageItemResponse>
      )
    }
  })

  return (
    <Box
      mt={40}
      mx="auto"
      px={{ base: 8, md: 0 }}
      w="100%"
      maw={1200}
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
            <Button
              color="indigo"
              leftSection={<IconPlus size={18} />}
              radius="xl"
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
                  children: <ItemModal refetch={refetch} />
                })
              }
              style={{
                fontWeight: 600,
                letterSpacing: 0.1
              }}
            >
              Thêm mặt hàng
            </Button>
          </Tooltip>
        </Flex>
      </Flex>

      <Divider my={0} />

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
          miw={600}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tên mặt hàng</Table.Th>
              <Table.Th>Các sản phẩm</Table.Th>
              <Table.Th>Ghi chú</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Flex justify="center" align="center" h={60}>
                    <Loader />
                  </Flex>
                </Table.Td>
              </Table.Tr>
            ) : itemsData && itemsData.length > 0 ? (
              itemsData.map((item) => (
                <Table.Tr key={item._id}>
                  <Table.Td fw={500}>{item.name}</Table.Td>
                  <Table.Td>
                    {item.variants && item.variants.length > 0 ? (
                      item.variants
                        .map(
                          (variantId) =>
                            storageItemsData?.[variantId]?.name || "Unknown"
                        )
                        .join(", ")
                    ) : (
                      <Text c="dimmed" fz="sm">
                        Không có sản phẩm
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {item.note || (
                      <Text c="dimmed" fz="sm">
                        Không có ghi chú
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Button
                      variant="light"
                      color="indigo"
                      size="xs"
                      radius="xl"
                      leftSection={<IconEdit size={16} />}
                      onClick={() =>
                        modals.open({
                          size: "lg",
                          title: (
                            <Text fw={700} fz="md">
                              Chỉnh sửa mặt hàng
                            </Text>
                          ),
                          children: <ItemModal item={item} refetch={refetch} />
                        })
                      }
                    >
                      Sửa
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4}>
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
