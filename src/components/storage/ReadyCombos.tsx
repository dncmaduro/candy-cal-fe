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
  Badge,
  Select
} from "@mantine/core"
import { IconSearch, IconPlus } from "@tabler/icons-react"
import { useProducts } from "../../hooks/useProducts"
import { useReadyCombos } from "../../hooks/useReadyCombos"
import { useDebouncedValue } from "@mantine/hooks"
import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { modals } from "@mantine/modals"
import { ReadyComboModal } from "./ReadyComboModal"
import { Can } from "../common/Can"

const READY_FILTERS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "true", label: "Đã đóng sẵn" },
  { value: "false", label: "Chưa đóng" }
]

export const ReadyCombos = () => {
  const { searchProducts } = useProducts()
  const { searchCombos } = useReadyCombos()
  const [searchText, setSearchText] = useState<string>("")
  const [debouncedSearchText] = useDebouncedValue(searchText, 300)
  const [readyFilter, setReadyFilter] = useState<"all" | "true" | "false">(
    "all"
  )

  const isReady = useMemo(() => {
    if (readyFilter === "all") return undefined
    return readyFilter === "true"
  }, [readyFilter])

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: () => searchProducts(""),
    select: (data) => data.data
  })

  const {
    data: combosData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["ready-combos", debouncedSearchText, isReady],
    queryFn: () => searchCombos({ searchText: debouncedSearchText, isReady }),
    select: (data) => data.data
  })

  const productsMap = (productsData || []).reduce(
    (acc, product) => {
      acc[product._id] = product
      return acc
    },
    {} as Record<string, any>
  )

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
            Các combo đóng sẵn
          </Text>
          <Text c="dimmed" fz="sm">
            Quản lý, chỉnh sửa và tìm kiếm combo đã đóng sẵn
          </Text>
        </Box>
        <Flex gap={12} align="center" w={{ base: "100%", sm: "auto" }}>
          <TextInput
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            leftSection={<IconSearch size={16} />}
            placeholder="Tìm kiếm combo..."
            size="md"
            w={{ base: "100%", sm: 260 }}
            radius="md"
            styles={{
              input: { background: "#f4f6fb", border: "1px solid #ececec" }
            }}
          />
          {/* Select filter trạng thái ready */}
          <Select
            value={readyFilter}
            onChange={(val) => setReadyFilter(val as "all" | "true" | "false")}
            data={READY_FILTERS}
            size="md"
            radius="md"
            w={160}
            allowDeselect={false}
          />
          <Tooltip label="Thêm combo mới" withArrow>
            <Can roles={["admin", "order-emp"]}>
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
                        Thêm combo mới
                      </Text>
                    ),
                    children: <ReadyComboModal refetch={refetch} />,
                    size: "lg"
                  })
                }
                style={{
                  fontWeight: 600,
                  letterSpacing: 0.1
                }}
              >
                Thêm combo
              </Button>
            </Can>
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
              <Table.Th>Các sản phẩm</Table.Th>
              <Table.Th>Trạng thái</Table.Th>
              <Table.Th>Hành động</Table.Th>
              <Table.Th>Ghi chú</Table.Th>
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
            ) : combosData && combosData.length > 0 ? (
              combosData.map((combo: any) => (
                <Table.Tr key={combo._id}>
                  <Table.Td>
                    <Flex direction="column" gap={4}>
                      {combo.products.map((prod: any) => (
                        <Flex key={prod._id} gap={6} align="center">
                          <Text fz="sm">
                            {productsMap[prod._id]?.name || "?"}{" "}
                            <Text span c="gray.6" fz="xs">
                              ×{prod.quantity}
                            </Text>
                          </Text>
                        </Flex>
                      ))}
                    </Flex>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={combo.isReady ? "teal" : "gray"}
                      variant={combo.isReady ? "filled" : "outline"}
                      radius="sm"
                    >
                      {combo.isReady ? "Đã đóng sẵn" : "Chưa đóng"}
                    </Badge>
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
                              Sửa combo
                            </Text>
                          ),
                          children: (
                            <ReadyComboModal combo={combo} refetch={refetch} />
                          ),
                          size: "lg"
                        })
                      }
                      style={{ fontWeight: 500 }}
                    >
                      Chỉnh sửa
                    </Button>
                  </Table.Td>
                  <Table.Td>
                    <Text c="dimmed" fz="xs">
                      {combo.note}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Flex justify="center" align="center" h={60}>
                    <Text c="dimmed">Không có combo nào</Text>
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
