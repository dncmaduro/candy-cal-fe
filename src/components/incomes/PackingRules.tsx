import { useQuery } from "@tanstack/react-query"
import { usePackingRules } from "../../hooks/usePackingRules"
import { useDebouncedValue } from "@mantine/hooks"
import { useState, useMemo } from "react"
import { PackingRulesBoxTypes } from "../../constants/rules"
import { Box, Button, Divider, Group, Text, Badge } from "@mantine/core"
import { IconEdit, IconPlus } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { PackingRuleModal } from "./PackingRuleModal"
import { Can } from "../common/Can"
import { CDataTable } from "../common/CDataTable"
import { ColumnDef } from "@tanstack/react-table"

type PackingRuleProduct = {
  productCode: string
  minQuantity: number | null
  maxQuantity: number | null
}

type PackingRuleRow = {
  _id: string
  packingType: string
  products: PackingRuleProduct[]
  productCode: string
  minQuantity: number | null
  maxQuantity: number | null
}

export const PackingRules = () => {
  const { searchRules } = usePackingRules()
  const [searchText, setSearchText] = useState<string>("")
  const debouncedSearchText = useDebouncedValue(searchText, 300)[0]

  const { data: rulesData, refetch } = useQuery({
    queryKey: ["searchPackingRules", debouncedSearchText],
    queryFn: () =>
      searchRules({
        searchText: debouncedSearchText
      }),
    select: (data) => data.data
  })

  // Transform rules data to flat structure for table
  const tableData = useMemo<PackingRuleRow[]>(() => {
    if (!rulesData?.rules) return []

    return rulesData.rules.flatMap((rule, ruleIndex) =>
      rule.products.map((product, index) => ({
        _id: `${rule.packingType}-${ruleIndex}-${index}`,
        packingType: rule.packingType,
        products: rule.products,
        productCode: product.productCode,
        minQuantity: product.minQuantity,
        maxQuantity: product.maxQuantity,
        isFirstProduct: index === 0,
        rowSpan: rule.products.length
      }))
    )
  }, [rulesData])

  const columns = useMemo<ColumnDef<PackingRuleRow>[]>(
    () => [
      {
        accessorKey: "productCode",
        header: "Mã sản phẩm",
        size: 180,
        cell: ({ getValue }) => (
          <Text size="sm" fw={600}>
            {getValue<string>()}
          </Text>
        )
      },
      {
        id: "quantity",
        header: "Số lượng (Min / Max)",
        size: 220,
        cell: ({ row }) => (
          <Text size="sm">
            Min:{" "}
            {row.original.minQuantity != null ? row.original.minQuantity : "-"}{" "}
            / Max:{" "}
            {row.original.maxQuantity != null ? row.original.maxQuantity : "-"}
          </Text>
        )
      },
      {
        accessorKey: "packingType",
        header: "Loại hộp",
        size: 150,
        cell: ({ getValue }) => {
          const packingTypeLabel = PackingRulesBoxTypes.find(
            (r) => r.value === getValue<string>()
          )?.label
          return (
            <Badge color="blue" variant="light" size="sm">
              {packingTypeLabel || getValue<string>()}
            </Badge>
          )
        }
      },
      {
        id: "actions",
        header: "",
        size: 100,
        cell: ({ row }) => {
          // Find the original rule
          const rule = rulesData?.rules.find(
            (r) =>
              r.packingType === row.original.packingType &&
              r.products.some((p) => p.productCode === row.original.productCode)
          )

          return (
            <Can roles={["admin", "accounting-emp"]}>
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
                        Chỉnh sửa quy tắc đóng hàng
                      </Text>
                    ),
                    children: <PackingRuleModal rule={rule} refetch={refetch} />
                  })
                }
              >
                Chỉnh sửa
              </Button>
            </Can>
          )
        }
      }
    ],
    [rulesData, refetch]
  )

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
      <Box pt={32} pb={16} px={{ base: 8, md: 28 }}>
        <Group justify="space-between" align="flex-start" mb="md">
          <Box>
            <Text fw={700} fz="xl" mb={2}>
              Quy cách đóng hàng
            </Text>
            <Text c="dimmed" fz="sm">
              Quản lý các quy cách đóng hàng để sử dụng trong đơn hàng
            </Text>
          </Box>
          <Can roles={["admin", "accounting-emp"]}>
            <Button
              radius="xl"
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
      </Box>
      <Divider my={0} />
      <Box px={{ base: 4, md: 28 }} py={20}>
        <CDataTable
          columns={columns}
          data={tableData}
          enableGlobalFilter={true}
          globalFilterValue={searchText}
          onGlobalFilterChange={setSearchText}
          page={1}
          totalPages={1}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          initialPageSize={100}
          pageSizeOptions={[50, 100, 200]}
        />
      </Box>
    </Box>
  )
}
