import { useCallback, useEffect, useMemo, useState } from "react"
import { useShopeeProducts } from "../../hooks/useShopeeProducts"
import { useDebouncedValue } from "@mantine/hooks"
import { useMutation, useQuery } from "@tanstack/react-query"
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
  IconTrash,
  IconEdit
} from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import type { ColumnDef } from "@tanstack/react-table"
import { ShopeeProductItems } from "./ShopeeProductItems"
import { ShopeeProductModal } from "./ShopeeProductModal"
import { Can } from "../common/Can"
import { CToast } from "../common/CToast"
import { CDataTable } from "../common/CDataTable"
import { SHOPEE_EDITOR_ROLES } from "../../constants/navs"
import { ShopeeXlsxCalculator } from "./ShopeeXlsxCalculator"
import { useMe } from "../../context/MeContext"

type ShopeeProductRow = {
  _id: string
  name: string
  items: { _id: string; quantity: number }[]
}

export const ShopeeProducts = () => {
  const me = useMe()
  const canMutateShopeeSku = Boolean(
    me?.roles?.some((role) => SHOPEE_EDITOR_ROLES.includes(role))
  )
  const { searchShopeeProducts, deleteShopeeProduct } = useShopeeProducts()
  const [searchText, setSearchText] = useState<string>("")
  const [debouncedSearchText] = useDebouncedValue(searchText, 300)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [showDeleted, setShowDeleted] = useState<boolean>(false)

  const {
    data: shopeeProductsData,
    refetch,
    isLoading
  } = useQuery({
    queryKey: ["searchShopeeProducts", debouncedSearchText, page, limit, showDeleted],
    queryFn: () =>
      searchShopeeProducts({
        searchText: debouncedSearchText,
        page,
        limit,
        deleted: showDeleted
      }),
    select: (data) => data.data
  })

  const rows: ShopeeProductRow[] = useMemo(
    () => shopeeProductsData?.data ?? [],
    [shopeeProductsData]
  )

  const totalPages = Math.max(
    1,
    Math.ceil((shopeeProductsData?.total ?? 0) / limit)
  )

  const { mutate: deleteMutation } = useMutation({
    mutationFn: deleteShopeeProduct,
    onSuccess: () => {
      CToast.success({ title: "Xóa sản phẩm Shopee thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi xóa sản phẩm" })
    }
  })

  useEffect(() => {
    refetch()
  }, [debouncedSearchText, page, limit, showDeleted, refetch])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchText])

  const handleDeleteProduct = useCallback((productId: string, productName: string) => {
    modals.openConfirmModal({
      title: "Xác nhận xóa sản phẩm",
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
  }, [deleteMutation])

  const columns: ColumnDef<ShopeeProductRow>[] = useMemo(
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
        cell: ({ row }) => <ShopeeProductItems items={row.original.items} />
      },
      {
        id: "actions",
        header: "Hành động",
        enableSorting: false,
        enableHiding: false,
        enableColumnFilter: false,
        meta: { hideWhenDeleted: true },
        cell: ({ row }) => {
          const product = row.original
          if (showDeleted) return null
          return (
            <Group gap={8} wrap="nowrap">
              <Tooltip
                label={
                  canMutateShopeeSku
                    ? "Chỉnh sửa SKU"
                    : "Bạn chỉ có quyền xem dữ liệu Shopee"
                }
              >
                <Button
                  variant="light"
                  color="indigo"
                  size="xs"
                  radius="xl"
                  px={14}
                  leftSection={<IconEdit size={14} />}
                  onClick={() => {
                    if (!canMutateShopeeSku) return
                    modals.open({
                      title: (
                        <Text fw={700} fz="md">
                          Sửa sản phẩm Shopee
                        </Text>
                      ),
                      children: (
                        <ShopeeProductModal product={product} refetch={refetch} />
                      ),
                      size: "lg"
                    })
                  }}
                  disabled={!canMutateShopeeSku}
                  style={{ fontWeight: 500 }}
                >
                  Chỉnh sửa
                </Button>
              </Tooltip>

              <Can roles={["admin"]}>
                <Button
                  variant="light"
                  color="red"
                  size="xs"
                  radius="xl"
                  px={14}
                  onClick={() => handleDeleteProduct(product._id, product.name)}
                  leftSection={<IconTrash size={14} />}
                  style={{ fontWeight: 500 }}
                >
                  Xóa
                </Button>
              </Can>
            </Group>
          )
        }
      }
    ],
    [handleDeleteProduct, refetch, showDeleted]
  )

  const extraFilters = (
    <Group gap={12} align="end" wrap="wrap">
      <TextInput
        value={searchText}
        onChange={(e) => setSearchText(e.currentTarget.value)}
        leftSection={<IconSearch size={16} />}
        placeholder="Tìm kiếm SKU Shopee..."
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
        <Tooltip label="Thêm SKU Shopee mới" withArrow>
          <Button
            color="indigo"
            leftSection={<IconPlus size={18} />}
            radius="xl"
            size="sm"
            px={14}
            onClick={() => {
              if (!canMutateShopeeSku) return
              modals.open({
                title: (
                  <Text fw={700} fz="md">
                    Thêm SKU Shopee mới
                  </Text>
                ),
                children: <ShopeeProductModal refetch={refetch} />,
                size: "lg"
              })
            }}
            disabled={!canMutateShopeeSku}
            style={{ fontWeight: 600, letterSpacing: 0.1 }}
          >
            Thêm SKU
          </Button>
        </Tooltip>
      )}

      {!showDeleted && <ShopeeXlsxCalculator compact enableSaveLog={false} />}
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
            {showDeleted ? "Các SKU Shopee đã xóa" : "SKU (Shopee)"}
          </Text>
          <Text c="dimmed" fz="sm">
            {showDeleted
              ? "Xem danh sách các SKU Shopee đã bị xóa"
              : "Quản lý, chỉnh sửa và tìm kiếm SKU Shopee"}
          </Text>
        </Box>
      </Flex>

      <Divider my={0} />

      <Box px={{ base: 8, md: 28 }} py={20}>
        <CDataTable<ShopeeProductRow, unknown>
          columns={columns}
          data={rows}
          isLoading={isLoading}
          loadingText="Đang tải danh sách SKU Shopee..."
          enableGlobalFilter={false}
          enableRowSelection={false}
          extraFilters={extraFilters}
          extraActions={extraActions}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(n) => {
            setLimit(n)
            setPage(1)
          }}
          initialPageSize={limit}
          pageSizeOptions={[10, 20, 50, 100]}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  )
}
