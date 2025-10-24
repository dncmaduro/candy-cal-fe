import { useQuery } from "@tanstack/react-query"
import { usePackingRules } from "../../hooks/usePackingRules"
import { useDebouncedValue } from "@mantine/hooks"
import { useState } from "react"
import { PackingRulesBoxTypes } from "../../constants/rules"
import {
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Loader,
  ScrollArea,
  Select,
  Table,
  Text,
  TextInput
} from "@mantine/core"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { PackingRuleModal } from "./PackingRuleModal"
import { Can } from "../common/Can"

export const PackingRules = () => {
  const { searchRules } = usePackingRules()
  const [searchText, setSearchText] = useState<string>("")
  const debouncedSearchText = useDebouncedValue(searchText, 300)[0]
  const [packingType, setPackingType] = useState<string | null>(null)

  const { data: rulesData, refetch } = useQuery({
    queryKey: ["searchPackingRules", debouncedSearchText, packingType],
    queryFn: () =>
      searchRules({
        searchText: debouncedSearchText,
        packingType: packingType ?? undefined
      }),
    select: (data) => data.data
  })

  return (
    <Box
      mt={40}
      mx="auto"
      px={{ base: 8, md: 0 }}
      w="100%"
      style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: 20,
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
      >
        <Box>
          <Text fw={700} fz="xl" mb={2}>
            Quy cách đóng hàng
          </Text>
          <Text c="dimmed" fz="sm">
            Quản lý các quy cách đóng hàng để sử dụng trong đơn hàng
          </Text>
        </Box>
        <Group align="flex-end">
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
          <Select
            data={PackingRulesBoxTypes}
            label="Loại hộp"
            size="md"
            w={200}
            radius="md"
            value={packingType}
            clearable
            onChange={(value) => setPackingType(value)}
          />
          <Can roles={["admin", "accounting-emp"]}>
            <Button
              radius={"xl"}
              size="md"
              leftSection={<IconPlus size={16} />}
              onClick={() =>
                modals.open({
                  title: <b>Thêm quy cách đóng hàng</b>,
                  children: <PackingRuleModal refetch={refetch} />,
                  size: "lg"
                })
              }
            >
              Thêm quy tắc
            </Button>
          </Can>
        </Group>
      </Flex>
      <Divider my={0} />
      <Box px={{ base: 4, md: 28 }} py={20}>
        <ScrollArea w="100%" type="auto" scrollbars="x" offsetScrollbars>
          <Table
            highlightOnHover
            withTableBorder
            withColumnBorders
            verticalSpacing="sm"
            horizontalSpacing="md"
            stickyHeader
            className="rounded-xl"
            miw={700}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 180 }}>Mã sản phẩm</Table.Th>
                <Table.Th style={{ width: 220 }}>Số lượng (Min / Max)</Table.Th>
                <Table.Th style={{ width: 150 }}>Loại hộp</Table.Th>
                <Table.Th style={{ width: 100 }}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {!rulesData ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Flex justify="center" align="center" h={60}>
                      <Loader />
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              ) : rulesData.rules.length > 0 ? (
                rulesData.rules.flatMap((rule, ruleIdx) => {
                  const packingTypeLabel = PackingRulesBoxTypes.find(
                    (r) => r.value === rule.packingType
                  )?.label

                  return rule.products.map((product, productIdx) => (
                    <Table.Tr
                      key={`rule-${ruleIdx}-${productIdx}-${product.productCode}`}
                    >
                      <Table.Td style={{ fontWeight: 600 }}>
                        {product.productCode}
                      </Table.Td>

                      <Table.Td>
                        {`Min: ${product.minQuantity != null ? product.minQuantity : "-"} / Max: ${product.maxQuantity != null ? product.maxQuantity : "-"}`}
                      </Table.Td>

                      {productIdx === 0 && (
                        <Table.Td
                          rowSpan={rule.products.length}
                          style={{
                            verticalAlign: "middle",
                            border: "1px solid #ececec"
                          }}
                        >
                          {packingTypeLabel}
                        </Table.Td>
                      )}

                      {productIdx === 0 && (
                        <Table.Td
                          rowSpan={rule.products.length}
                          style={{
                            verticalAlign: "middle",
                            border: "1px solid #ececec"
                          }}
                        >
                          <Can roles={["admin", "accounting-emp"]}>
                            <Button
                              variant="light"
                              color="indigo"
                              size="xs"
                              radius="xl"
                              onClick={() =>
                                modals.open({
                                  size: "lg",
                                  title: (
                                    <Text
                                      fw={700}
                                      className="!font-bold"
                                      fz="md"
                                    >
                                      Chỉnh sửa quy tắc đóng hàng
                                    </Text>
                                  ),
                                  children: (
                                    <PackingRuleModal
                                      rule={rule}
                                      refetch={refetch}
                                    />
                                  )
                                })
                              }
                              style={{ fontWeight: 500 }}
                            >
                              Chỉnh sửa
                            </Button>
                          </Can>
                        </Table.Td>
                      )}
                    </Table.Tr>
                  ))
                })
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Flex justify="center" align="center" h={60}>
                      <Text c="dimmed">Không có quy cách nào</Text>
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Box>
    </Box>
  )
}
