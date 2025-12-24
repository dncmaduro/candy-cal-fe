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
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
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
import { FormProvider, useForm } from "react-hook-form"

export const Route = createFileRoute("/sales/orders/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      createNew: search.createNew as string | undefined,
      channelId: search.channelId as string | undefined,
      funnelId: search.funnelId as string | undefined,
      items: search.items as string | undefined,
      orderDiscount: search.orderDiscount as string | undefined,
      otherDiscount: search.otherDiscount as string | undefined,
      deposit: search.deposit as string | undefined,
      refetch: search.refetch as string | undefined
    }
  }
})

type SalesOrderItem = SearchSalesOrderResponse["data"][0]

type CreateSalesOrderFormData = {
  salesFunnelId: string
  storage: "position_HaNam" | "position_MKT"
  date: Date
  orderDiscount?: number
  otherDiscount?: number
  deposit?: number
  // New customer info
  isNewCustomer?: boolean
  newCustomerName?: string
  newCustomerChannel?: string
  province?: string
  phoneNumber?: string
  address?: string
  funnelSource: "ads" | "seeding" | "referral"
  fromSystem?: boolean
  // Items and secondary phones as part of form
  items: { code: string; quantity: number; note?: string }[]
  secondaryPhones: string[]
}

function RouteComponent() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const {
    searchSalesOrders,
    deleteSalesOrder,
    exportXlsxSalesOrder,
    exportXlsxSalesOrderByIds
  } = useSalesOrders()
  const { searchFunnel, getFunnelByUser } = useSalesFunnel()
  const { getMe } = useUsers()
  const { searchSalesChannels, getMyChannel } = useSalesChannels()

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
  const [selectedOrders, setSelectedOrders] = useState<SalesOrderItem[]>([])

  const selectedOrderIds = selectedOrders.map((o) => o._id)

  // Get current user info
  const { data: meData } = useQuery({
    queryKey: ["getMe"],
    queryFn: getMe
  })

  const { data: channelsData } = useQuery({
    queryKey: ["salesChannels", "all"],
    queryFn: () => searchSalesChannels({ page: 1, limit: 999 }),
    staleTime: 100000
  })

  const { data: myChannelData } = useQuery({
    queryKey: ["getMyChannel"],
    queryFn: getMyChannel,
    select: (data) => data.data,
    enabled: !!meData?.data,
    staleTime: 100000
  })

  useEffect(() => {
    if (myChannelData?.channel?._id) {
      setChannelIdFilter(myChannelData.channel._id)
    }
  }, [myChannelData])

  const me = meData?.data

  // Check user roles
  const isAdmin = me?.roles.includes("admin")
  const isSystemEmp = me?.roles.includes("system-emp")
  const isSalesLeader = me?.roles.includes("sales-leader")
  const isSalesEmp = me?.roles.includes("sales-emp")

  const formMethods = useForm<CreateSalesOrderFormData>({
    defaultValues: {
      salesFunnelId: search.funnelId || "",
      storage: "position_HaNam",
      date: new Date(new Date().setHours(0, 0, 0, 0)),
      orderDiscount: search.orderDiscount ?? 0,
      otherDiscount: search.otherDiscount ?? 0,
      deposit: search.deposit ?? 0,
      isNewCustomer: false,
      newCustomerName: "",
      newCustomerChannel: "",
      province: "",
      phoneNumber: "",
      address: "",
      funnelSource: "ads",
      fromSystem: false,
      items:
        search.items && JSON.parse(search.items).length > 0
          ? JSON.parse(search.items)
          : [{ code: "", quantity: 1, note: "" }],
      secondaryPhones: []
    }
  })

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
    enabled: !!me,
    staleTime: 100000
  })

  // Load orders data with filters
  const { data, refetch, isLoading } = useQuery({
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
      channelIdFilter,
      search.refetch
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
      }),
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: false,
    refetchOnMount: false
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

  const { mutate: exportXlsxByIds } = useMutation({
    mutationFn: exportXlsxSalesOrderByIds,
    onSuccess: (response) => {
      const url = URL.createObjectURL(response.data)
      const link = document.createElement("a")
      link.href = url
      link.download = `Don_hang_da_chon_${format(new Date(), "ddMMyyyy")}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      CToast.success({ title: "Xuất file Excel (đã chọn) thành công" })
    },
    onError: () => CToast.error({ title: "Có lỗi xảy ra khi xuất file Excel" })
  })

  useEffect(() => {
    console.log("SalesLayout mounted")
    return () => console.log("SalesLayout unmounted")
  }, [])

  const ordersData = data?.data.data || []

  const funnelOptions =
    funnelData?.data.data.map((item: any) => ({
      value: item._id,
      label: `${item.name}${item.phoneNumber ? ` - ${item.phoneNumber}` : ""}`
    })) || []

  const channelOptions =
    channelsData?.data.data.map((channel) => ({
      value: channel._id,
      label: channel.channelName
    })) || []

  const handleCreateOrder = (channelId: string) => {
    modals.open({
      id: "create-sales-order",
      title: <b>Tạo đơn hàng mới</b>,
      children: (
        <FormProvider {...formMethods}>
          <CreateSalesOrderModal
            channelId={channelId}
            onSuccess={() => {
              refetch()
              modals.closeAll()
            }}
          />
        </FormProvider>
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

  const handleUpdateItems = useCallback(
    (item: SalesOrderItem) => {
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
    },
    [refetch]
  )

  const handleDeleteOrder = useCallback(
    (orderId: string) => {
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
                error?.response?.data?.message ||
                "Có lỗi xảy ra khi xóa đơn hàng"
            })
          }
        }
      })
    },
    [deleteSalesOrder, refetch]
  )

  const handleRowSelectionChange = useCallback(
    (rowsOnThisPageSelected: SalesOrderItem[]) => {
      setSelectedOrders((prev) => {
        // Tạo Map từ selection trước đó
        const prevMap = new Map(prev.map((o) => [o._id, o]))

        // Tạo Set các IDs đang được chọn ở trang hiện tại (từ table)
        const selectedIdsOnPage = new Set(
          rowsOnThisPageSelected.map((o) => o._id)
        )

        // IDs của orders ở trang hiện tại (từ data)
        const currentPageIds = new Set(ordersData.map((o) => o._id))

        // 1) Xóa các orders thuộc trang hiện tại MÀ không còn được chọn
        for (const id of currentPageIds) {
          if (!selectedIdsOnPage.has(id)) {
            prevMap.delete(id)
          }
        }

        // 2) Thêm/cập nhật các orders đang được chọn ở trang hiện tại
        for (const order of rowsOnThisPageSelected) {
          prevMap.set(order._id, order)
        }

        const result = Array.from(prevMap.values())

        // Chỉ update nếu thực sự có thay đổi (tránh re-render không cần thiết)
        if (
          result.length === prev.length &&
          result.every((o) => prev.find((p) => p._id === o._id))
        ) {
          return prev
        }

        return result
      })
    },
    [ordersData]
  )

  const getRowId = useCallback((row: SalesOrderItem) => row._id, [])

  const columns: ColumnDef<SalesOrderItem>[] = useMemo(
    () => [
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
            {row.original.storage === "position_HaNam"
              ? "Kho Hà Nội"
              : "Kho MKT"}
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
    ],
    [handleUpdateItems, handleDeleteOrder]
  )

  const normalizeQuoted = (v?: string) => {
    if (!v) return v
    // nếu kiểu: "true" hoặc "0" hoặc "[{...}]"
    if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) {
      try {
        return JSON.parse(v) // bỏ lớp quote ngoài
      } catch {
        return v
      }
    }
    return v
  }

  const parseBool = (v?: string) => {
    const s = normalizeQuoted(v)
    return s === "true" || s === "1"
  }

  const parseNumber = (v?: string, fallback = 0) => {
    const s = normalizeQuoted(v)
    const n = Number(s)
    return Number.isFinite(n) ? n : fallback
  }

  const parseItems = (
    v?: string
  ): { code: string; quantity: number; note?: string }[] => {
    if (!v) return []
    const s1 = normalizeQuoted(v)

    // case 1: s1 đã là JSON array string -> parse ra array
    try {
      const r1 = JSON.parse(s1)
      // nếu r1 lại là string (stringify 2 lần) -> parse tiếp
      if (typeof r1 === "string") {
        const r2 = JSON.parse(r1)
        return Array.isArray(r2) ? r2 : []
      }
      return Array.isArray(r1) ? r1 : []
    } catch {
      return []
    }
  }

  const openedFromUrlRef = useRef(false)

  useEffect(() => {
    if (openedFromUrlRef.current) return
    if (!parseBool(search.createNew)) return

    // cần channelId để mở modal
    const channelId =
      normalizeQuoted(search.channelId) || myChannelData?.channel?._id
    if (!channelId) return

    // set form values từ params
    formMethods.reset({
      salesFunnelId: normalizeQuoted(search.funnelId) || "",
      storage: "position_HaNam",
      date: new Date(new Date().setHours(0, 0, 0, 0)),
      orderDiscount: parseNumber(search.orderDiscount, 0),
      otherDiscount: parseNumber(search.otherDiscount, 0),
      deposit: parseNumber(search.deposit, 0),
      isNewCustomer: false,
      newCustomerName: "",
      newCustomerChannel: "",
      province: "",
      phoneNumber: "",
      address: "",
      funnelSource: "ads",
      fromSystem: false,
      items: (() => {
        const items = parseItems(search.items)
        return items.length > 0 ? items : [{ code: "", quantity: 1, note: "" }]
      })(),
      secondaryPhones: []
    })

    openedFromUrlRef.current = true
    handleCreateOrder(channelId)

    // (khuyến nghị) clear params để F5 / rerender không mở lại
    navigate({
      to: "/sales/orders",
      search: (prev: any) => ({
        ...prev,
        createNew: undefined,
        channelId: undefined,
        funnelId: undefined,
        items: undefined,
        orderDiscount: undefined,
        otherDiscount: undefined,
        deposit: undefined
      }),
      replace: true
    })
  }, [
    search,
    myChannelData?.channel?._id,
    handleCreateOrder,
    formMethods,
    navigate
  ])

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
            isLoading={isLoading}
            onRowClick={(row) =>
              navigate({ to: `/sales/orders/${row.original._id}` })
            }
            getRowId={getRowId}
            enableRowSelection={true}
            onRowSelectionChange={(rows) =>
              handleRowSelectionChange(rows as SalesOrderItem[])
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
                    const hasSelection = selectedOrderIds.length > 0

                    modals.openConfirmModal({
                      title: <b>Xác nhận xuất file Excel</b>,
                      children: (
                        <Box>
                          <Text mb="md">
                            {hasSelection
                              ? `Bạn đang chọn ${selectedOrderIds.length} đơn hàng. Xuất theo danh sách đã chọn?`
                              : "Bạn có chắc chắn muốn xuất file Excel với các bộ lọc hiện tại?"}
                          </Text>

                          {!hasSelection && (
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
                                  <strong>
                                    {format(endDate, "dd/MM/yyyy")}
                                  </strong>
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
                          )}
                        </Box>
                      ),
                      labels: { confirm: "Xuất Excel", cancel: "Hủy" },
                      confirmProps: { color: "green" },
                      onConfirm: () => {
                        if (hasSelection) {
                          exportXlsxByIds({ orderIds: selectedOrderIds })
                          return
                        }

                        exportXlsx({
                          page: 1,
                          limit: 9999,
                          searchText: searchText || undefined,
                          channelId: channelIdFilter || undefined,
                          userId: userIdFilter || undefined,
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
                  {selectedOrderIds.length > 0
                    ? `Xuất Excel (${selectedOrderIds.length} đã chọn)`
                    : "Xuất Excel"}
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
                    onClick={() =>
                      handleCreateOrder(myChannelData?.channel._id || "")
                    }
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
