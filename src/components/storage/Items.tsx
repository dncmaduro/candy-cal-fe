import { useQuery } from "@tanstack/react-query"
import { useItems } from "../../hooks/useItems"
import {
  Box,
  Button,
  Flex,
  Loader,
  Table,
  Text,
  TextInput
} from "@mantine/core"
import { modals } from "@mantine/modals"
import { ItemModal } from "./ItemModal"
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
    select: (data) => {
      return data.data
    }
  })

  useEffect(() => {
    refetch()
  }, [debouncedSearchText])

  return (
    <Box mt={32}>
      <Text className="!text-lg !font-bold">Các mặt hàng đang có</Text>
      <Flex justify="flex-end" gap={16}>
        <TextInput
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          leftSection={<IconSearch size={16} />}
        />
        <Button
          onClick={() =>
            modals.open({
              title: <Text className="!font-bold">Thêm sản phẩm mới</Text>,
              children: <ItemModal refetch={refetch} />
            })
          }
        >
          Thêm mặt hàng
        </Button>
      </Flex>
      <Table className="rounded-lg border border-gray-300" mt={40}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tên mặt hàng</Table.Th>
            <Table.Th>Số lượng/thùng</Table.Th>
            <Table.Th>Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {isLoading ? (
            <Loader p={16} mx={"auto"} />
          ) : (
            itemsData &&
            itemsData.map((item) => (
              <Table.Tr key={item._id}>
                <Table.Td>{item.name}</Table.Td>
                <Table.Td>{item.quantityPerBox}</Table.Td>
                <Table.Td>
                  <Button
                    variant="light"
                    onClick={() =>
                      modals.open({
                        title: <Text className="!font-bold">Sửa mặt hàng</Text>,
                        children: <ItemModal item={item} refetch={refetch} />
                      })
                    }
                  >
                    Chỉnh sửa
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </Box>
  )
}
