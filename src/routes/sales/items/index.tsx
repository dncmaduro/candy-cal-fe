import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Button, Group, Text, Select, Badge, Box, rem } from "@mantine/core"
import { modals } from "@mantine/modals"
import { useDebouncedValue } from "@mantine/hooks"
import { useQuery } from "@tanstack/react-query"
import { IconUpload } from "@tabler/icons-react"
import { CDataTable } from "../../../components/common/CDataTable"
import { useSalesItems } from "../../../hooks/useSalesItems"
import { SearchSalesItemsResponse } from "../../../hooks/models"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { UploadSalesItemsModal } from "../../../components/sales/UploadSalesItemsModal"

export const Route = createFileRoute("/sales/items/")({
  component: RouteComponent
})

type SalesItem = SearchSalesItemsResponse["data"][0]

function RouteComponent() {
  const { searchSalesItems, getSalesItemsFactory, getSalesItemsSource } =
    useSalesItems()

  // Table state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState("")

  // Debounce search text để tránh call API quá nhiều
  const [debouncedSearchText] = useDebouncedValue(searchText, 500)

  // Filters
  const [factoryFilter, setFactoryFilter] = useState<string | null>(null)
  const [sourceFilter, setSourceFilter] = useState<string | null>(null)

  // Load factories and sources for filters
  const { data: factoriesData } = useQuery({
    queryKey: ["salesItemsFactories"],
    queryFn: getSalesItemsFactory
  })

  const { data: sourcesData } = useQuery({
    queryKey: ["salesItemsSources"],
    queryFn: getSalesItemsSource
  })

  // Load sales items data with filters
  const { data, refetch } = useQuery({
    queryKey: [
      "salesItems",
      page,
      pageSize,
      debouncedSearchText,
      factoryFilter,
      sourceFilter
    ],
    queryFn: () =>
      searchSalesItems({
        searchText: debouncedSearchText || undefined,
        factory: factoryFilter || undefined,
        source: sourceFilter || undefined,
        page,
        limit: pageSize
      })
  })

  // Columns
  const columns: ColumnDef<SalesItem>[] = [
    {
      accessorKey: "code",
      header: "Mã",
      cell: ({ row }) => (
        <Text size="sm" fw={500}>
          {row.original.code}
        </Text>
      )
    },
    {
      accessorKey: "name.vn",
      header: "Tên (VN)",
      cell: ({ row }) => (
        <Text size="sm" lineClamp={2}>
          {row.original.name.vn}
        </Text>
      )
    },
    {
      accessorKey: "name.cn",
      header: "Tên (CN)",
      cell: ({ row }) => (
        <Text size="sm" lineClamp={2}>
          {row.original.name.cn}
        </Text>
      )
    },
    {
      accessorKey: "factory",
      header: "Nhà máy",
      cell: ({ row }) => {
        const factoryLabel =
          factoriesData?.data.data.find((f) => f.value === row.original.factory)
            ?.label || row.original.factory
        return (
          <Badge variant="light" size="sm">
            {factoryLabel}
          </Badge>
        )
      }
    },
    {
      accessorKey: "source",
      header: "Nguồn",
      cell: ({ row }) => {
        const sourceLabel =
          sourcesData?.data.data.find((s) => s.value === row.original.source)
            ?.label || row.original.source
        return (
          <Badge
            variant="light"
            size="sm"
            color={row.original.source === "inside" ? "blue" : "orange"}
          >
            {sourceLabel}
          </Badge>
        )
      }
    },
    {
      accessorKey: "price",
      header: "Giá",
      cell: ({ row }) => (
        <Text size="sm" fw={500}>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
          }).format(row.original.price)}
        </Text>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => (
        <Text size="sm">
          {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
        </Text>
      )
    }
  ]

  return (
    <SalesLayout>
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
        {/* Header Section */}
        <Box pt={32} pb={16} px={{ base: 8, md: 28 }}>
          <Group justify="space-between" align="flex-start">
            <div>
              <Text fw={700} fz="xl" mb={2}>
                Quản lý sản phẩm
              </Text>
              <Text c="dimmed" fz="sm">
                Đồng bộ và quản lý danh sách sản phẩm
              </Text>
            </div>
            <Button
              leftSection={<IconUpload size={16} />}
              onClick={() => {
                modals.open({
                  title: <b>Đồng bộ từ file</b>,
                  children: (
                    <UploadSalesItemsModal
                      onSuccess={() => {
                        modals.closeAll()
                        refetch()
                      }}
                    />
                  ),
                  size: "md"
                })
              }}
              size="sm"
              radius="md"
            >
              Đồng bộ từ file
            </Button>
          </Group>
        </Box>

        {/* Content */}
        <Box px={{ base: 4, md: 28 }} pb={20}>
          <CDataTable
            columns={columns}
            data={data?.data.data || []}
            isLoading={!data}
            page={page}
            totalPages={Math.ceil((data?.data.total || 0) / pageSize)}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            initialPageSize={pageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            enableGlobalFilter={true}
            globalFilterValue={searchText}
            onGlobalFilterChange={(value) => {
              setSearchText(value)
              setPage(1)
            }}
            extraFilters={
              <>
                <Select
                  placeholder="Tất cả nhà máy"
                  data={[
                    { value: "", label: "Tất cả nhà máy" },
                    ...(factoriesData?.data.data || [])
                  ]}
                  value={factoryFilter || ""}
                  onChange={(value) => {
                    setFactoryFilter(value || null)
                    setPage(1)
                  }}
                  clearable
                  style={{ width: 200 }}
                />
                <Select
                  placeholder="Tất cả nguồn"
                  data={[
                    { value: "", label: "Tất cả nguồn" },
                    ...(sourcesData?.data.data || [])
                  ]}
                  value={sourceFilter || ""}
                  onChange={(value) => {
                    setSourceFilter(value || null)
                    setPage(1)
                  }}
                  clearable
                  style={{ width: 200 }}
                />
              </>
            }
            extraActions={
              <Button
                variant="light"
                onClick={() => refetch()}
                disabled={!data}
                size="sm"
                radius="md"
              >
                Làm mới
              </Button>
            }
          />
        </Box>
      </Box>
    </SalesLayout>
  )
}
