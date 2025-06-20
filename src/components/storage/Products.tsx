import { useEffect, useState } from "react"
import { useProducts } from "../../hooks/useProducts"
import { useDebouncedValue } from "@mantine/hooks"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
  Button,
  Divider,
  Flex,
  Loader,
  Table,
  Text,
  TextInput,
  rem,
  Tooltip,
  Badge
} from "@mantine/core"
import { IconPlus, IconSearch } from "@tabler/icons-react"
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
            Các sản phẩm đang có
          </Text>
          <Text c="dimmed" fz="sm">
            Quản lý, chỉnh sửa và tìm kiếm sản phẩm
          </Text>
        </Box>
        <Flex gap={12} align="center" w={{ base: "100%", sm: "auto" }}>
          <TextInput
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            leftSection={<IconSearch size={16} />}
            placeholder="Tìm kiếm sản phẩm..."
            size="md"
            w={{ base: "100%", sm: 260 }}
            radius="md"
            styles={{
              input: { background: "#f4f6fb", border: "1px solid #ececec" }
            }}
          />
          <Tooltip label="Thêm sản phẩm mới" withArrow>
            <Button
              color="indigo"
              leftSection={<IconPlus size={18} />}
              radius="xl"
              size="md"
              px={18}
              onClick={() =>
                modals.open({
                  title: (
                    <Text fw={700} fz="md">
                      Thêm sản phẩm mới
                    </Text>
                  ),
                  children: <ProductModal refetch={refetch} />,
                  size: "lg"
                })
              }
              style={{
                fontWeight: 600,
                letterSpacing: 0.1
              }}
            >
              Thêm sản phẩm
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
          miw={500}
        >
          <Table.Thead bg="indigo.0">
            <Table.Tr>
              <Table.Th style={{ width: 240 }}>Tên sản phẩm</Table.Th>
              <Table.Th>Các mặt hàng</Table.Th>
              <Table.Th>Hành động</Table.Th>
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
            ) : productsData && productsData.length > 0 ? (
              productsData.map((product) => (
                <Table.Tr key={product._id}>
                  <Table.Td fw={500} w={"30%"}>
                    <Flex align={"center"} gap={12}>
                      <Text>{product.name}</Text>
                      {product.isReady && (
                        <Badge
                          variant="outline"
                          color="red"
                          radius={"xl"}
                          size="xs"
                        >
                          Sẵn hàng
                        </Badge>
                      )}
                    </Flex>
                  </Table.Td>
                  <Table.Td>
                    <ProductItems items={product.items} />
                  </Table.Td>
                  <Table.Td>
                    <Button
                      variant="light"
                      color="indigo"
                      size="xs"
                      radius="xl"
                      px={14}
                      onClick={() =>
                        modals.open({
                          title: (
                            <Text fw={700} fz="md">
                              Sửa sản phẩm
                            </Text>
                          ),
                          children: (
                            <ProductModal product={product} refetch={refetch} />
                          ),
                          size: "lg"
                        })
                      }
                      style={{ fontWeight: 500 }}
                    >
                      Chỉnh sửa
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Flex justify="center" align="center" h={60}>
                    <Text c="dimmed">Không có sản phẩm nào</Text>
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
