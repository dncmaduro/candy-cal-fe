import { useEffect, useState } from "react"
import { useProducts } from "../../hooks/useProducts"
import { useDebouncedValue } from "@mantine/hooks"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
  Button,
  Flex,
  Loader,
  Table,
  Text,
  TextInput
} from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { ProductItems } from "./ProductItems"
import { ProductModal } from "./ProductModal"

export const Products = () => {
  const { searchProducts } = useProducts()
  const [searchText, setSearchText] = useState<string>("")
  const [debouncedSearchText] = useDebouncedValue(searchText, 300)

  const {
    data: productsData,
    refetch,
    isLoading
  } = useQuery({
    queryKey: ["searchProducts", debouncedSearchText],
    queryFn: () => searchProducts(debouncedSearchText),
    select: (data) => {
      return data.data
    }
  })

  useEffect(() => {
    refetch()
  }, [debouncedSearchText])

  return (
    <Box mt={32}>
      <Text className="!text-lg !font-bold">Các sản phẩm đang có</Text>
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
              children: <ProductModal refetch={refetch} />,
              size: "lg"
            })
          }
        >
          Thêm sản phẩm
        </Button>
      </Flex>

      <Table className="rounded-lg border border-gray-300" mt={40}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tên sản phẩm</Table.Th>
            <Table.Th>Các mặt hàng</Table.Th>
            <Table.Th>Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {isLoading ? (
            <Loader p={16} mx="auto" />
          ) : (
            productsData &&
            productsData.map((product) => (
              <Table.Tr key={product._id}>
                <Table.Td>{product.name}</Table.Td>
                <Table.Td>
                  <ProductItems items={product.items} />
                </Table.Td>
                <Table.Td>
                  <Button
                    variant="light"
                    onClick={() =>
                      modals.open({
                        title: <Text className="!font-bold">Sửa mặt hàng</Text>,
                        children: (
                          <ProductModal product={product} refetch={refetch} />
                        ),
                        size: "lg"
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
