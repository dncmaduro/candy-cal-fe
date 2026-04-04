import { useEffect, useMemo, useState } from "react"
import { useDebouncedValue } from "@mantine/hooks"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Text,
  TextInput,
  rem,
  Tooltip,
  Switch
} from "@mantine/core"
import {
  IconPlus,
  IconSearch,
  IconRestore,
  IconEdit,
  IconTrash
} from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import type { ColumnDef } from "@tanstack/react-table"

import { useProducts } from "../../hooks/useProducts"
import { ProductItemsV2 } from "./ProductItemsV2"
import { ProductModalV2 } from "./ProductModalV2"
import { Can } from "../common/Can"
import { CToast } from "../common/CToast"

import { CDataTable } from "../common/CDataTable"
import { TIKTOKSHOP_EDITOR_ROLES } from "../../constants/navs"
import { TiktokXlsxCalculator } from "./TiktokXlsxCalculator"

type ProductRow = {
  _id: string
  name: string
  items: any[]
}

export const ProductsV2 = () => {
  const { searchProducts, deleteProduct, restoreProduct } = useProducts()

  const [searchText, setSearchText] = useState<string>("")
  const [debouncedSearchText] = useDebouncedValue(searchText, 300)

  const [showDeleted, setShowDeleted] = useState<boolean>(false)

  const {
    data: productsData,
    refetch,
    isLoading
  } = useQuery({
    queryKey: ["searchProducts", debouncedSearchText, showDeleted],
    queryFn: () =>
      searchProducts({ searchText: debouncedSearchText, deleted: showDeleted }),
    select: (data) => data.data
  })

  const rows: ProductRow[] = useMemo(() => productsData ?? [], [productsData])

  const { mutate: deleteMutation } = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      CToast.success({ title: "Xóa sản phẩm thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi xóa sản phẩm" })
    }
  })

  const { mutate: restoreMutation, isPending: restoring } = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => {
      CToast.success({ title: "Khôi phục sản phẩm thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi khôi phục sản phẩm" })
    }
  })

  useEffect(() => {
    refetch()
  }, [debouncedSearchText, showDeleted])

  const handleDeleteProduct = (productId: string, productName: string) => {
    modals.openConfirmModal({
      title: <b>Xác nhận xóa sản phẩm</b>,
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa sản phẩm "{productName}"? Hành động này
          không thể hoàn tác.
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation(productId)
    })
  }

  const columns: ColumnDef<ProductRow>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Tên sản phẩm",
        cell: ({ row }) => (
          <Text fw={500} className="whitespace-nowrap">
            {row.original.name}
          </Text>
        )
      },
      {
        id: "items",
        header: "Các mặt hàng",
        cell: ({ row }) => <ProductItemsV2 items={row.original.items} />
      },
      {
        id: "actions",
        header: "Hành động",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const product = row.original
          return (
            <Group gap={8} wrap="nowrap">
              {!showDeleted ? (
                <>
                  <Can roles={TIKTOKSHOP_EDITOR_ROLES}>
                    <Button
                      variant="light"
                      color="indigo"
                      size="xs"
                      radius="xl"
                      px={14}
                      leftSection={<IconEdit size={14} />}
                      onClick={() =>
                        modals.open({
                          title: (
                            <Text fw={700} fz="md">
                              Sửa sản phẩm
                            </Text>
                          ),
                          children: (
                            <ProductModalV2
                              product={product}
                              refetch={refetch}
                            />
                          ),
                          size: "lg"
                        })
                      }
                      style={{ fontWeight: 500 }}
                    >
                      Chỉnh sửa
                    </Button>
                  </Can>

                  <Can roles={["admin"]}>
                    <Button
                      variant="light"
                      color="red"
                      size="xs"
                      radius="xl"
                      px={14}
                      leftSection={<IconTrash size={14} />}
                      onClick={() =>
                        handleDeleteProduct(product._id, product.name)
                      }
                      style={{ fontWeight: 500 }}
                    >
                      Xóa
                    </Button>
                  </Can>
                </>
              ) : (
                <Can roles={["admin"]}>
                  <Button
                    variant="outline"
                    color="green"
                    size="xs"
                    radius="xl"
                    px={14}
                    onClick={() => restoreMutation({ id: product._id })}
                    leftSection={<IconRestore size={14} />}
                    style={{ fontWeight: 500 }}
                    loading={restoring}
                  >
                    Khôi phục
                  </Button>
                </Can>
              )}
            </Group>
          )
        }
      }
    ],
    [refetch, restoreMutation, restoring, showDeleted]
  )

  const extraFilters = (
    <Group gap={12} align="end" wrap="wrap">
      <TextInput
        value={searchText}
        onChange={(e) => setSearchText(e.currentTarget.value)}
        leftSection={<IconSearch size={16} />}
        placeholder="Tìm kiếm sản phẩm..."
        size="sm"
        w={{ base: "100%", sm: 260 }}
        radius="md"
        styles={{
          input: { background: "#f4f6fb", border: "1px solid #ececec" }
        }}
      />

      <Box
        p={8}
        style={{
          backgroundColor: showDeleted
            ? "rgba(255, 0, 0, 0.08)"
            : "rgba(0, 128, 0, 0.06)",
          borderRadius: rem(10),
          border: `1px solid ${
            showDeleted ? "rgba(255, 0, 0, 0.18)" : "rgba(0, 128, 0, 0.18)"
          }`,
          transition: "all 0.2s ease"
        }}
      >
        <Switch
          label="Hiển thị sản phẩm đã xóa"
          checked={showDeleted}
          onChange={(event) => setShowDeleted(event.currentTarget.checked)}
          color="red"
          size="sm"
        />
      </Box>
    </Group>
  )

  const extraActions = (
    <Group gap={10} align="end" wrap="wrap">
      {!showDeleted && (
        <Tooltip label="Thêm sản phẩm mới" withArrow>
          <Can roles={TIKTOKSHOP_EDITOR_ROLES}>
            <Button
              color="indigo"
              leftSection={<IconPlus size={18} />}
              radius="xl"
              size="sm"
              px={14}
              onClick={() =>
                modals.open({
                  title: (
                    <Text fw={700} fz="md">
                      Thêm sản phẩm mới
                    </Text>
                  ),
                  children: <ProductModalV2 refetch={refetch} />,
                  size: "lg"
                })
              }
              style={{ fontWeight: 600, letterSpacing: 0.1 }}
            >
              Thêm sản phẩm
            </Button>
          </Can>
        </Tooltip>
      )}

      {/* Excel actions in toolbar */}
      <TiktokXlsxCalculator compact />
    </Group>
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
            {showDeleted ? "Các sản phẩm đã xóa" : "Các sản phẩm đang có"}
          </Text>
          <Text c="dimmed" fz="sm">
            {showDeleted
              ? "Xem và khôi phục các sản phẩm đã bị xóa"
              : "Quản lý, chỉnh sửa và tìm kiếm sản phẩm"}
          </Text>
        </Box>
      </Flex>

      <Divider my={0} />

      <Box px={{ base: 8, md: 28 }} py={20}>
        <CDataTable<ProductRow, any>
          columns={columns}
          data={rows}
          isLoading={isLoading}
          loadingText="Đang tải danh sách sản phẩm..."
          enableGlobalFilter={false}
          enableRowSelection={false}
          extraFilters={extraFilters}
          extraActions={extraActions}
          initialPageSize={10}
          pageSizeOptions={[10, 20, 50, 100]}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  )
}
