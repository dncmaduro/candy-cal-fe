import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  Badge,
  Button,
  Group,
  Box,
  rem,
  Text,
  Select,
  ActionIcon,
  Flex
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { modals } from "@mantine/modals"
import { format } from "date-fns"
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconDownload,
  IconFileUpload
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { Can } from "../../../components/common/Can"
import { CDataTable } from "../../../components/common/CDataTable"
import { useSalesOrders } from "../../../hooks/useSalesOrders"
import { useSalesFunnel } from "../../../hooks/useSalesFunnel"
import { useUsers } from "../../../hooks/useUsers"
import { CreateSalesOrderModal } from "../../../components/sales/CreateSalesOrderModal"
import { UpdateOrderItemsModal } from "../../../components/sales/UpdateOrderItemsModal"
import { UploadSalesOrdersModal } from "../../../components/sales/UploadSalesOrdersModal"
import { CToast } from "../../../components/common/CToast"
import { SearchSalesOrderResponse } from "../../../hooks/models"
import { useSalesChannels } from "../../../hooks/useSalesChannels"

export const Route = createFileRoute("/sales/orders/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      createNew: search.createNew as string | undefined,
      funnelId: search.funnelId as string | undefined,
      items: search.items as string | undefined,
      orderDiscount: search.orderDiscount as string | undefined,
      otherDiscount: search.otherDiscount as string | undefined,
      deposit: search.deposit as string | undefined
    }
  }
})

type SalesOrderItem = SearchSalesOrderResponse["data"][0]

function RouteComponent() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  console.log(search)
  const { searchSalesOrders, deleteSalesOrder, exportXlsxSalesOrder } =
    useSalesOrders()
  const { searchFunnel, getFunnelByUser } = useSalesFunnel()
  const { getMe } = useUsers()
  const { searchSalesChannels } = useSalesChannels()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchText, setSearchText] = useState("")
  const [returningFilter, setReturningFilter] = useState<string>("")
  const [funnelFilter, setFunnelFilter] = useState<string>("")
  const [shippingTypeFilter, setShippingTypeFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [userIdFilter, setUserIdFilter] = useState<string>("")
  const [channelIdFilter, setChannelIdFilter] = useState<string>("")

  // Get current user info
  const { data: meData } = useQuery({
    queryKey: ["getMe"],
    queryFn: getMe
  })

  const { data: channelsData } = useQuery({
    queryKey: ["salesChannels", "all"],
    queryFn: () => searchSalesChannels({ page: 1, limit: 999 })
  })

  const me = meData?.data

  // Check user roles
  const isAdmin = me?.roles.includes("admin")
  const isSystemEmp = me?.roles.includes("system-emp")
  const isSalesLeader = me?.roles.includes("sales-leader")
  const isSalesEmp = me?.roles.includes("sales-emp")

  // Determine if user can see all funnels or only their own
  const canSeeAllFunnels = isAdmin || isSystemEmp || isSalesLeader

  // Auto-apply user filter for sales-emp
  useEffect(() => {
    if (!canSeeAllFunnels && isSalesEmp && me?._id) {
      setUserIdFilter(me._id)
    }
  }, [canSeeAllFunnels, isSalesEmp, me?._id])

  // Load reference data - use appropriate query based on role
  const { data: funnelData } = useQuery({
    queryKey: ["salesFunnel", canSeeAllFunnels ? "all" : me?._id],
    queryFn: async () => {
      if (canSeeAllFunnels) {
        return await searchFunnel({
          page: 1,
          limit: 999
        })
      } else if (me?._id) {
        return await getFunnelByUser(me._id, {
          limit: 999
        })
      }
      return undefined
    },
    enabled: !!me
  })

  // Load orders data with filters
  const { data, refetch } = useQuery({
    queryKey: [
      "salesOrders",
      page,
      limit,
      searchText,
      returningFilter,
      funnelFilter,
      shippingTypeFilter,
      statusFilter,
      startDate,
      endDate,
      userIdFilter,
      channelIdFilter
    ],
    queryFn: () =>
      searchSalesOrders({
        page,
        limit,
        searchText: searchText || undefined,
        returning:
          returningFilter === "" ? undefined : returningFilter === "true",
        salesFunnelId: funnelFilter || undefined,
        shippingType:
          shippingTypeFilter === ""
            ? undefined
            : (shippingTypeFilter as "shipping_vtp" | "shipping_cargo"),
        status:
          statusFilter === ""
            ? undefined
            : (statusFilter as "draft" | "official"),
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
        userId: userIdFilter || undefined,
        channelId: channelIdFilter || undefined
      })
  })

  // Export Excel mutation
  const { mutate: exportXlsx } = useMutation({
    mutationFn: exportXlsxSalesOrder,
    onSuccess: (response) => {
      const url = URL.createObjectURL(response.data)
      const link = document.createElement("a")
      link.href = url
      link.download = `Don_hang_${format(new Date(), "ddMMyyyy")}_${
        startDate ? format(startDate, "ddMMyyyy") : ""
      }_${endDate ? format(endDate, "ddMMyyyy") : ""}.xlsx`
      link.click()
      URL.revokeObjectURL(url)
      CToast.success({ title: "Xuất file Excel thành công" })
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi xuất file Excel" })
    }
  })

  const ordersData = data?.data.data || []

  const funnelOptions =
    funnelData?.data.data.map((item: any) => ({
      value: item._id,
      label: `${item.name}${item.phoneNumber ? ` - ${item.phoneNumber}` : ""}`
    })) || []

  // Handle create order from deleted order
  useEffect(() => {
    if (search.createNew === "true" && search.funnelId && search.items) {
      try {
        const parsedItems = JSON.parse(search.items)
        const discount = search.discount
          ? parseFloat(search.discount)
          : undefined
        const deposit = search.deposit ? parseFloat(search.deposit) : undefined
        handleCreateOrder(search.funnelId, parsedItems, discount, deposit)
        // Clear search params
        navigate({
          to: "/sales/orders",
          search: {}
        })
      } catch (error) {
        console.error("Error parsing items:", error)
      }
    }
  }, [
    search.createNew,
    search.funnelId,
    search.items,
    search.discount,
    search.deposit
  ])

  const channelOptions =
    channelsData?.data.data.map((channel) => ({
      value: channel._id,
      label: channel.channelName
    })) || []

  const handleCreateOrder = (
    funnelId?: string,
    initialItems?: { code: string; quantity: number }[],
    initialOrderDiscount?: number,
    initialOtherDiscount?: number,
    initialDeposit?: number
  ) => {
    modals.open({
      title: <b>Tạo đơn hàng mới</b>,
      children: (
        <CreateSalesOrderModal
          salesFunnelId={funnelId}
          initialItems={initialItems}
          initialOrderDiscount={initialOrderDiscount}
          initialOtherDiscount={initialOtherDiscount}
          initialDeposit={initialDeposit}
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "xl"
    })
  }

  const handleUploadOrders = () => {
    modals.open({
      title: <b>Upload danh sách đơn hàng</b>,
      children: (
        <UploadSalesOrdersModal
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "md"
    })
  }

  const handleUpdateItems = (item: SalesOrderItem) => {
    modals.open({
      title: <b>Cập nhật sản phẩm, chiết khấu & tiền cọc</b>,
      children: (
        <UpdateOrderItemsModal
          orderId={item._id}
          currentItems={item.items.map((si) => ({
            code: si.code,
            quantity: si.quantity,
            note: si.note
          }))}
          currentOrderDiscount={item.orderDiscount}
          currentOtherDiscount={item.otherDiscount}
          currentDeposit={item.deposit}
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "xl"
    })
  }

  const handleDeleteOrder = (orderId: string) => {
    modals.openConfirmModal({
      title: <b>Xác nhận xóa</b>,
      children: <Text>Bạn có chắc chắn muốn xóa đơn hàng này?</Text>,
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteSalesOrder({ id: orderId })
          CToast.success({ title: "Xóa đơn hàng thành công" })
          refetch()
        } catch (error: any) {
          CToast.error({
            title:
              error?.response?.data?.message || "Có lỗi xảy ra khi xóa đơn hàng"
          })
        }
      }
    })
  }

  const columns: ColumnDef<SalesOrderItem>[] = [
    {
      accessorKey: "salesFunnelId.name",
      header: "Khách hàng",
      cell: ({ row }) => (
        <div>
          <Flex gap={4} align={"center"}>
            <Text fw={500} size="sm">
              {row.original.salesFunnelId.name}
            </Text>
            <Badge
              variant="light"
              size="xs"
              color={row.original.returning ? "violet" : "green"}
            >
              {row.original.returning ? "Khách cũ" : "Khách mới"}
            </Badge>
          </Flex>
          <Text size="xs" c="dimmed">
            {row.original.salesFunnelId.phoneNumber}
          </Text>
        </div>
      )
    },
    {
      accessorKey: "items",
      header: "Số SP",
      cell: ({ row }) => (
        <Badge variant="light" color="blue" size="sm">
          {row.original.items.length}
        </Badge>
      )
    },
    {
      accessorKey: "total",
      header: "Tổng tiền",
      cell: ({ row }) => (
        <Text fw={500} size="sm">
          {row.original.total.toLocaleString("vi-VN")}đ
        </Text>
      )
    },
    {
      accessorKey: "orderDiscount",
      header: "Chiết khấu",
      cell: ({ row }) => {
        const orderDiscount = row.original.orderDiscount || 0
        const otherDiscount = row.original.otherDiscount || 0
        const totalDiscount = orderDiscount + otherDiscount

        return totalDiscount > 0 ? (
          <Text size="sm">{totalDiscount.toLocaleString("vi-VN")}đ</Text>
        ) : (
          <Text size="sm" c="dimmed">
            -
          </Text>
        )
      }
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge
          variant="light"
          color={row.original.status === "official" ? "green" : "gray"}
          size="sm"
        >
          {row.original.status === "official" ? "Chính thức" : "Báo giá"}
        </Badge>
      )
    },
    {
      accessorKey: "shippingCode",
      header: "Mã vận đơn",
      cell: ({ row }) => (
        <Text size="sm">{row.original.shippingCode || "Chưa có"}</Text>
      )
    },
    {
      accessorKey: "shippingType",
      header: "Đơn vị vận chuyển",
      cell: ({ row }) =>
        row.original.shippingType ? (
          <Text size="sm">
            {row.original.shippingType === "shipping_vtp"
              ? "Viettel Post"
              : "Shipcode lên chành"}
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            Chưa có
          </Text>
        )
    },
    {
      accessorKey: "storage",
      header: "Kho",
      cell: ({ row }) => (
        <Text size="sm">
          {row.original.storage === "position_HaNam" ? "Kho Hà Nội" : "Kho MKT"}
        </Text>
      )
    },
    {
      accessorKey: "date",
      header: "Ngày đặt",
      cell: ({ row }) => (
        <Text size="sm" c="dimmed">
          {format(new Date(row.original.date), "dd/MM/yyyy")}
        </Text>
      )
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <Can roles={["admin", "sales-leader", "sales-emp"]}>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="indigo"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleUpdateItems(row.original)
              }}
              title="Cập nhật sản phẩm"
              hidden={row.original.status === "official"}
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteOrder(row.original._id)
              }}
              title="Xóa đơn hàng"
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
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
            Quản lý đơn hàng
          </Text>
          <Text c="dimmed" fz="sm">
            Quản lý tất cả đơn hàng từ khách hàng
          </Text>
        </Box>

        {/* Content */}
        <Box px={{ base: 4, md: 28 }} pb={20}>
          <CDataTable
            columns={columns}
            data={ordersData}
            enableGlobalFilter={true}
            globalFilterValue={searchText}
            onGlobalFilterChange={setSearchText}
            page={page}
            totalPages={Math.ceil((data?.data.total || 0) / limit)}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            initialPageSize={limit}
            pageSizeOptions={[10, 20, 50, 100]}
            onRowClick={(row) =>
              navigate({ to: `/sales/orders/${row.original._id}` })
            }
            extraFilters={
              <>
                <Select
                  label="Loại khách"
                  placeholder="Loại khách"
                  data={[
                    { value: "", label: "Tất cả" },
                    { value: "false", label: "Khách mới" },
                    { value: "true", label: "Khách cũ" }
                  ]}
                  value={returningFilter}
                  onChange={(value) => setReturningFilter(value || "")}
                  clearable
                  style={{ width: 200 }}
                />

                <Select
                  label="Khách hàng"
                  placeholder="Tất cả khách hàng"
                  data={[
                    { value: "", label: "Tất cả khách hàng" },
                    ...funnelOptions
                  ]}
                  value={funnelFilter}
                  onChange={(value) => setFunnelFilter(value || "")}
                  searchable
                  clearable
                  style={{ width: 250 }}
                />

                <Select
                  label="Đơn vị vận chuyển"
                  placeholder="Đơn vị vận chuyển"
                  data={[
                    { value: "", label: "Tất cả đơn vị" },
                    { value: "shipping_vtp", label: "Viettel Post" },
                    { value: "shipping_cargo", label: "Shipcode lên chành" }
                  ]}
                  value={shippingTypeFilter}
                  onChange={(value) => setShippingTypeFilter(value || "")}
                  clearable
                  style={{ width: 200 }}
                />

                <Select
                  label="Trạng thái"
                  placeholder="Trạng thái"
                  data={[
                    { value: "", label: "Tất cả trạng thái" },
                    { value: "draft", label: "Báo giá" },
                    { value: "official", label: "Chính thức" }
                  ]}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value || "")}
                  clearable
                  style={{ width: 180 }}
                />

                <Select
                  label="Kênh"
                  placeholder="Tất cả kênh"
                  data={[
                    { value: "", label: "Tất cả kênh" },
                    ...channelOptions
                  ]}
                  value={channelIdFilter}
                  onChange={(value) => setChannelIdFilter(value || "")}
                  searchable
                  clearable
                  style={{ width: 200 }}
                />

                <DatePickerInput
                  label="Từ ngày"
                  placeholder="Từ ngày"
                  value={startDate}
                  onChange={setStartDate}
                  clearable
                  valueFormat="DD/MM/YYYY"
                  style={{ width: 180 }}
                />

                <DatePickerInput
                  label="Đến ngày"
                  placeholder="Đến ngày"
                  value={endDate}
                  onChange={setEndDate}
                  clearable
                  valueFormat="DD/MM/YYYY"
                  style={{ width: 180 }}
                />
              </>
            }
            extraActions={
              <>
                <Button
                  onClick={() => {
                    modals.openConfirmModal({
                      title: <b>Xác nhận xuất file Excel</b>,
                      children: (
                        <Box>
                          <Text mb="md">
                            Bạn có chắc chắn muốn xuất file Excel với các bộ lọc
                            hiện tại?
                          </Text>
                          <Box
                            style={{
                              background: "#f8f9fa",
                              padding: "12px",
                              borderRadius: "8px"
                            }}
                          >
                            <Text size="sm" fw={600} mb="xs">
                              Thông tin xuất:
                            </Text>
                            <Text size="sm" mb={4}>
                              • Tổng số đơn hàng:{" "}
                              <strong>{data?.data.total || 0}</strong> đơn
                            </Text>
                            {searchText && (
                              <Text size="sm" mb={4}>
                                • Tìm kiếm: <strong>{searchText}</strong>
                              </Text>
                            )}
                            {returningFilter && (
                              <Text size="sm" mb={4}>
                                • Loại khách:{" "}
                                <strong>
                                  {returningFilter === "true"
                                    ? "Khách cũ"
                                    : "Khách mới"}
                                </strong>
                              </Text>
                            )}
                            {funnelFilter && (
                              <Text size="sm" mb={4}>
                                • Khách hàng:{" "}
                                <strong>
                                  {
                                    funnelOptions.find(
                                      (f) => f.value === funnelFilter
                                    )?.label
                                  }
                                </strong>
                              </Text>
                            )}
                            {shippingTypeFilter && (
                              <Text size="sm" mb={4}>
                                • Đơn vị vận chuyển:{" "}
                                <strong>
                                  {shippingTypeFilter === "shipping_vtp"
                                    ? "Viettel Post"
                                    : "Shipcode lên chành"}
                                </strong>
                              </Text>
                            )}
                            {statusFilter && (
                              <Text size="sm" mb={4}>
                                • Trạng thái:{" "}
                                <strong>
                                  {statusFilter === "draft"
                                    ? "Báo giá"
                                    : "Chính thức"}
                                </strong>
                              </Text>
                            )}
                            {startDate && (
                              <Text size="sm" mb={4}>
                                • Từ ngày:{" "}
                                <strong>
                                  {format(startDate, "dd/MM/yyyy")}
                                </strong>
                              </Text>
                            )}
                            {endDate && (
                              <Text size="sm" mb={4}>
                                • Đến ngày:{" "}
                                <strong>{format(endDate, "dd/MM/yyyy")}</strong>
                              </Text>
                            )}
                            {!searchText &&
                              !returningFilter &&
                              !funnelFilter &&
                              !shippingTypeFilter &&
                              !statusFilter &&
                              !startDate &&
                              !endDate && (
                                <Text size="sm" c="orange" mb={4}>
                                  ⚠️ Không có bộ lọc nào được áp dụng. Tất cả
                                  đơn hàng sẽ được xuất.
                                </Text>
                              )}
                          </Box>
                        </Box>
                      ),
                      labels: { confirm: "Xuất Excel", cancel: "Hủy" },
                      confirmProps: { color: "green" },
                      onConfirm: () => {
                        exportXlsx({
                          page: 1,
                          limit: 9999,
                          searchText: searchText || undefined,
                          returning:
                            returningFilter === ""
                              ? undefined
                              : returningFilter === "true",
                          salesFunnelId: funnelFilter || undefined,
                          shippingType:
                            shippingTypeFilter === ""
                              ? undefined
                              : (shippingTypeFilter as
                                  | "shipping_vtp"
                                  | "shipping_cargo"),
                          status:
                            statusFilter === ""
                              ? undefined
                              : (statusFilter as "draft" | "official"),
                          startDate: startDate
                            ? format(startDate, "yyyy-MM-dd")
                            : undefined,
                          endDate: endDate
                            ? format(endDate, "yyyy-MM-dd")
                            : undefined
                        })
                      }
                    })
                  }}
                  leftSection={<IconDownload size={16} />}
                  size="sm"
                  radius="md"
                  color="green"
                  variant="light"
                >
                  Xuất Excel
                </Button>
                <Can roles={["admin", "sales-leader", "sales-emp"]}>
                  <Button
                    onClick={handleUploadOrders}
                    leftSection={<IconFileUpload size={16} />}
                    size="sm"
                    radius="md"
                    variant="light"
                  >
                    Upload XLSX
                  </Button>
                  <Button
                    onClick={() => handleCreateOrder()}
                    leftSection={<IconPlus size={16} />}
                    size="sm"
                    radius="md"
                  >
                    Tạo đơn hàng
                  </Button>
                </Can>
              </>
            }
          />
        </Box>
      </Box>
    </SalesLayout>
  )
}
