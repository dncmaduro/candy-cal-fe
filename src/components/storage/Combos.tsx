import { Box, Button, Flex, Table, Text, TextInput } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { IconSearch } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useCombos } from "../../hooks/useCombos"
import { modals } from "@mantine/modals"
import { ComboProducts } from "./ComboProducts"
import { ComboModal } from "./ComboModal"

export const Combos = () => {
  const { searchCombos } = useCombos()
  const [searchText, setSearchText] = useState<string>("")
  const [debouncedSearchText] = useDebouncedValue(searchText, 300)

  const { data: combosData, refetch } = useQuery({
    queryKey: ["searchCombos", debouncedSearchText],
    queryFn: () => searchCombos(debouncedSearchText),
    select: (data) => {
      return data.data
    }
  })

  useEffect(() => {
    refetch()
  }, [debouncedSearchText])

  return (
    <Box mt={32}>
      <Text className="!text-lg !font-bold">Các combo đang có</Text>
      <Flex justify="flex-end" gap={16}>
        <TextInput
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          leftSection={<IconSearch size={16} />}
        />
        <Button
          onClick={() =>
            modals.open({
              title: <Text className="!font-bold">Thêm combo mới</Text>,
              children: <ComboModal />,
              size: "lg"
            })
          }
        >
          Thêm combo
        </Button>
      </Flex>

      <Table className="rounded-lg border border-gray-300" mt={40}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tên combo</Table.Th>
            <Table.Th>Các sản phẩm</Table.Th>
            <Table.Th>Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {(combosData || []).map((combo) => (
            <Table.Tr key={combo._id}>
              <Table.Td>{combo.name}</Table.Td>
              <Table.Td>
                <ComboProducts products={combo.products} />
              </Table.Td>
              <Table.Td>
                <Button
                  variant="light"
                  onClick={() =>
                    modals.open({
                      title: <Text className="!font-bold">Sửa mặt hàng</Text>,
                      children: <ComboModal combo={combo} />,
                      size: "lg"
                    })
                  }
                >
                  Chỉnh sửa
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  )
}
