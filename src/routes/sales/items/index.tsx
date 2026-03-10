import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
  Button,
  Group,
  Text,
  Box,
  rem,
  ActionIcon,
  Tooltip,
  Select
} from "@mantine/core"
import { modals } from "@mantine/modals"
import { useDebouncedValue } from "@mantine/hooks"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  IconUpload,
  IconPlus,
  IconEdit,
  IconTrash,
  IconDownload
} from "@tabler/icons-react"
import { CDataTable } from "../../../components/common/CDataTable"
import { useSalesItems } from "../../../hooks/useSalesItems"
import {
  SalesItemFactory,
  SalesItemSource,
  SearchSalesItemsResponse
} from "../../../hooks/models"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { UploadSalesItemsModal } from "../../../components/sales/UploadSalesItemsModal"
import { SalesItemModal } from "../../../components/sales/SalesItemModal"
import { Can } from "../../../components/common/Can"
import { CToast } from "../../../components/common/CToast"

export const Route = createFileRoute("/sales/items/")({
  component: RouteComponent
})

type SalesItem = SearchSalesItemsResponse["data"][0]

function RouteComponent() {
  const navigate = useNavigate()
  const {
    searchSalesItems,
    deleteSalesItem,
    getSalesItemDetail,
    getSalesItemsFactory,
    getSalesItemsSource,
    exportSalesItemsToXlsx
  } = useSalesItems()

  // Table state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState("")
  const [factoryFilter, setFactoryFilter] = useState<SalesItemFactory | "">("")
  const [sourceFilter, setSourceFilter] = useState<SalesItemSource | "">("")

  // Debounce search text để tránh call API quá nhiều
  const [debouncedSearchText] = useDebouncedValue(searchText, 500)

  const { data: factoriesData } = useQuery({
    queryKey: ["salesItems", "factories"],
    queryFn: getSalesItemsFactory,
    staleTime: 60 * 1000
  })

  const { data: sourcesData } = useQuery({
    queryKey: ["salesItems", "sources"],
    queryFn: getSalesItemsSource,
    staleTime: 60 * 1000
  })

  // Load sales items data
  const { data, refetch, isLoading } = useQuery({
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteSalesItem,
    onSuccess: () => {
      CToast.success({ title: "Xóa sản phẩm thành công" })
      refetch()
    },
    onError: (error: any) => {
      CToast.error({
        title:
          error?.response?.data?.message || "Có lỗi xảy ra khi xóa sản phẩm"
      })
    }
  })

  const exportMutation = useMutation({
    mutationFn: exportSalesItemsToXlsx,
    onSuccess: (response) => {
      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            })

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `sales-items-${new Date().getTime()}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      CToast.success({ title: "Xuất file Excel thành công" })
    },
    onError: (error: any) => {
      CToast.error({
        title:
          error?.response?.data?.message || "Có lỗi xảy ra khi xuất file Excel"
      })
    }
  })

  // CRUD handlers
  const handleCreateItem = () => {
    modals.open({
      title: <b>Tạo sản phẩm mới</b>,
      children: (
        <SalesItemModal
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "lg"
    })
  }

  const handleUploadItems = () => {
    modals.open({
      title: <b>Upload danh sách sản phẩm</b>,
      children: (
        <UploadSalesItemsModal
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "md"
    })
  }

  const handleEditItem = async (item: SalesItem) => {
    try {
      const detailData = await getSalesItemDetail(item._id)
      modals.open({
        title: <b>Chỉnh sửa sản phẩm</b>,
        children: (
          <SalesItemModal
            item={detailData.data}
            onSuccess={() => {
              refetch()
              modals.closeAll()
            }}
          />
        ),
        size: "lg"
      })
    } catch (error: any) {
      CToast.error({
        title:
          error?.response?.data?.message ||
          "Có lỗi xảy ra khi tải thông tin sản phẩm"
      })
    }
  }

  const handleDeleteItem = (item: SalesItem) => {
    modals.openConfirmModal({
      title: "Xác nhận xóa sản phẩm",
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa sản phẩm <strong>{item.name.vn}</strong>{" "}
          không? Hành động này không thể hoàn tác.
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(item._id)
    })
  }

  const handleExportItems = () => {
    exportMutation.mutate({
      searchText: searchText || undefined,
      factory: factoryFilter || undefined,
      source: sourceFilter || undefined
    })
  }

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
      accessorKey: "size",
      header: "Kích thước",
      cell: ({ row }) => <Text size="sm">{row.original.size || "-"}</Text>
    },
    {
      accessorKey: "area",
      header: "Số khối",
      cell: ({ row }) => (
        <Text size="sm">
          {row.original.area ? `${row.original.area} m³` : "-"}
        </Text>
      )
    },
    {
      accessorKey: "mass",
      header: "Khối lượng",
      cell: ({ row }) => (
        <Text size="sm">
          {row.original.mass ? `${row.original.mass} kg` : "-"}
        </Text>
      )
    },
    {
      accessorKey: "specification",
      header: "Quy cách",
      cell: ({ row }) => (
        <Text size="sm">{row.original.specification || "-"}</Text>
      )
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
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const item = row.original
        return (
          <Can roles={["admin", "sales-emp"]}>
            <Group gap="xs">
              <Tooltip label="Chỉnh sửa" withArrow>
                <ActionIcon
                  variant="light"
                  color="blue"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditItem(item)
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Xóa" withArrow>
                <ActionIcon
                  variant="light"
                  color="red"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteItem(item)
                  }}
                  loading={deleteMutation.isPending}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Can>
        )
      }
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
            <Group gap="sm">
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
                variant="light"
              >
                Đồng bộ từ file
              </Button>
            </Group>
          </Group>
        </Box>

        {/* Content */}
        <Box px={{ base: 4, md: 28 }} pb={20}>
          <CDataTable
            columns={columns}
            data={data?.data.data || []}
            isLoading={isLoading}
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
            onRowClick={(row) =>
              navigate({ to: `/sales/items/${row.original._id}` })
            }
            extraFilters={
              <>
                <Select
                  label="Nhà máy"
                  placeholder="Tất cả nhà máy"
                  value={factoryFilter}
                  data={[
                    { value: "", label: "Tất cả nhà máy" },
                    ...(factoriesData?.data.data || []).map((item) => ({
                      value: item.value,
                      label: item.label
                    }))
                  ]}
                  onChange={(value) => {
                    setFactoryFilter((value as SalesItemFactory | "") || "")
                    setPage(1)
                  }}
                  clearable
                  style={{ width: 220 }}
                />
                <Select
                  label="Nguồn"
                  placeholder="Tất cả nguồn"
                  value={sourceFilter}
                  data={[
                    { value: "", label: "Tất cả nguồn" },
                    ...(sourcesData?.data.data || []).map((item) => ({
                      value: item.value,
                      label: item.label
                    }))
                  ]}
                  onChange={(value) => {
                    setSourceFilter((value as SalesItemSource | "") || "")
                    setPage(1)
                  }}
                  clearable
                  style={{ width: 200 }}
                />
              </>
            }
            extraActions={
              <Group gap="xs">
                <Can roles={["admin", "sales-emp", "system-emp"]}>
                  <Button
                    leftSection={<IconDownload size={16} />}
                    onClick={handleExportItems}
                    variant="light"
                    size="sm"
                    radius="md"
                    color="green"
                    loading={exportMutation.isPending}
                  >
                    Xuất XLSX
                  </Button>
                </Can>
                <Can roles={["admin", "sales-leader", "sales-emp"]}>
                  <Group gap="xs">
                    <Button
                      leftSection={<IconUpload size={16} />}
                      onClick={handleUploadItems}
                      variant="light"
                      size="sm"
                      radius="md"
                    >
                      Upload XLSX
                    </Button>
                    <Button
                      leftSection={<IconPlus size={16} />}
                      onClick={handleCreateItem}
                      size="sm"
                      radius="md"
                    >
                      Tạo sản phẩm
                    </Button>
                  </Group>
                </Can>
              </Group>
            }
          />
        </Box>
      </Box>
    </SalesLayout>
  )
}
