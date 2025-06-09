import { useQuery } from "@tanstack/react-query"
import { useItems } from "../../hooks/useItems"
import {
  Box,
  Divider,
  Flex,
  Loader,
  Table,
  Text,
  TextInput,
  rem
} from "@mantine/core"
import { useEffect, useState } from "react"
import { IconSearch } from "@tabler/icons-react"
import { useDebouncedValue } from "@mantine/hooks"

export const Items = () => {
  const { searchItems } = useItems()
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

  useEffect(() => {
    refetch()
  }, [debouncedSearchText])

  return (
    <Box
      mt={40}
      mx="auto"
      px={{ base: 8, md: 0 }}
      w="100%"
      maw={900}
      style={{
        background: "rgba(255,255,255,0.95)",
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
          miw={420}
        >
          <Table.Thead bg="indigo.0">
            <Table.Tr>
              <Table.Th style={{ width: 240 }}>Tên mặt hàng</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Flex justify="center" align="center" h={60}>
                    <Loader />
                  </Flex>
                </Table.Td>
              </Table.Tr>
            ) : itemsData && itemsData.length > 0 ? (
              itemsData.map((item) => (
                <Table.Tr key={item._id}>
                  <Table.Td fw={500}>{item.name}</Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={3}>
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
