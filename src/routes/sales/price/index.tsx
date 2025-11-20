import { createFileRoute } from "@tanstack/react-router"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { useSalesPriceItems } from "../../../hooks/useSalesPriceItems"
import { useItems } from "../../../hooks/useItems"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Box, Button, rem, Text, ActionIcon } from "@mantine/core"
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { Can } from "../../../components/common/Can"
import { CToast } from "../../../components/common/CToast"
import { useState, useMemo } from "react"
import { SalesPriceItemModal } from "../../../components/sales/SalesPriceItemModal"
import { CDataTable } from "../../../components/common/CDataTable"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

export const Route = createFileRoute("/sales/price/")({
  component: RouteComponent
})

function RouteComponent() {
  const { getSalesPriceItems, deleteSalesPriceItem } = useSalesPriceItems()
  const { searchStorageItems } = useItems()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchText, setSearchText] = useState("")

  const { data: priceItemsData, refetch } = useQuery({
    queryKey: ["getSalesPriceItems", page, limit],
    queryFn: () =>
      getSalesPriceItems({
        page,
        limit
      }),
    select: (data) => data.data
  })

  const { data: storageItemsData } = useQuery({
    queryKey: ["searchStorageItems"],
    queryFn: () =>
      searchStorageItems({
        searchText: "",
        deleted: false
      }),
    select: (data) => data.data
  })

  const storageItemsMap = useMemo(() => {
    const map = new Map()
    storageItemsData?.forEach((item) => {
      map.set(item._id, { code: item.code, name: item.name })
    })
    return map
  }, [storageItemsData])

  const enrichedPriceItems = useMemo(() => {
    return (
      priceItemsData?.data.map((item) => ({
        ...item,
        storageItem: storageItemsMap.get(item.itemId)
      })) || []
    )
  }, [priceItemsData, storageItemsMap])

  const filteredPriceItems = useMemo(() => {
    if (!searchText) return enrichedPriceItems
    const search = searchText.toLowerCase()
    return enrichedPriceItems.filter((item) => {
      const storageItem = item.storageItem
      if (!storageItem) return false
      return (
        storageItem.code?.toLowerCase().includes(search) ||
        storageItem.name?.toLowerCase().includes(search)
      )
    })
  }, [enrichedPriceItems, searchText])

  const { mutate: deletePriceItem } = useMutation({
    mutationFn: deleteSalesPriceItem,
    onSuccess: () => {
      CToast.success({ title: "Xóa báo giá thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi xóa báo giá" })
    }
  })

  const openPriceItemModal = (priceItem?: (typeof enrichedPriceItems)[0]) => {
    modals.open({
      title: <b>{priceItem ? "Chỉnh sửa báo giá" : "Tạo báo giá mới"}</b>,
      children: <SalesPriceItemModal priceItem={priceItem} refetch={refetch} />,
      size: "lg"
    })
  }

  const confirmDelete = (priceItem: (typeof enrichedPriceItems)[0]) => {
    modals.openConfirmModal({
      title: "Xác nhận xóa",
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa báo giá cho mặt hàng{" "}
          <strong>{priceItem.storageItem?.name}</strong>?
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => deletePriceItem(priceItem._id)
    })
  }

  const total = priceItemsData?.total || 0

  const columns: ColumnDef<(typeof enrichedPriceItems)[0]>[] = [
    {
      accessorKey: "storageItem.code",
      header: "Mã mặt hàng",
      cell: ({ row }) => (
        <Text fw={600} size="sm">
          {row.original.storageItem?.code || "-"}
        </Text>
      )
    },
    {
      accessorKey: "storageItem.name",
      header: "Tên mặt hàng",
      cell: ({ row }) => (
        <Text size="sm">{row.original.storageItem?.name || "-"}</Text>
      )
    },
    {
      accessorKey: "price",
      header: "Giá bán (VNĐ)",
      cell: ({ row }) => (
        <Text size="sm" fw={600} c="green">
          {row.original.price.toLocaleString("vi-VN")}
        </Text>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => (
        <Text size="sm" c="dimmed">
          {format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm")}
        </Text>
      )
    },
    {
      accessorKey: "updatedAt",
      header: "Cập nhật",
      cell: ({ row }) => (
        <Text size="sm" c="dimmed">
          {format(new Date(row.original.updatedAt), "dd/MM/yyyy HH:mm")}
        </Text>
      )
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <Can roles={["admin", "sales-leader"]}>
          <div className="flex gap-2">
            <ActionIcon
              variant="light"
              color="indigo"
              size="sm"
              onClick={() => openPriceItemModal(row.original)}
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              size="sm"
              onClick={() => confirmDelete(row.original)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </div>
        </Can>
      ),
      enableSorting: false
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
          <Text fw={700} fz="xl" mb={2}>
            Báo giá mặt hàng
          </Text>
          <Text c="dimmed" fz="sm">
            Quản lý giá bán các mặt hàng cho khách hàng
          </Text>
        </Box>

        {/* Content */}
        <Box px={{ base: 4, md: 28 }} pb={20}>
          <CDataTable
            columns={columns}
            data={filteredPriceItems}
            enableGlobalFilter={true}
            globalFilterValue={searchText}
            onGlobalFilterChange={setSearchText}
            page={page}
            totalPages={Math.ceil(total / limit)}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            initialPageSize={limit}
            pageSizeOptions={[10, 20, 50, 100]}
            extraActions={
              <Can roles={["admin", "sales-leader"]}>
                <Button
                  onClick={() => openPriceItemModal()}
                  leftSection={<IconPlus size={16} />}
                  size="sm"
                  radius="md"
                >
                  Thêm báo giá
                </Button>
              </Can>
            }
          />
        </Box>
      </Box>
    </SalesLayout>
  )
}
