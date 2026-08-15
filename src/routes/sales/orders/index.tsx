import {
  createFileRoute,
  useLocation,
  useNavigate
} from "@tanstack/react-router"
import {
  Badge,
  Button,
  Group,
  Box,
  rem,
  Text,
  Select,
  ActionIcon
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { modals } from "@mantine/modals"
import { format } from "date-fns"
import {
  IconPlus,
  IconEdit,
  IconEye,
  IconTrash,
  IconDownload,
  IconFileUpload
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { Can } from "../../../components/common/Can"
import { CDataTable } from "../../../components/common/CDataTable"
import { useSalesOrders } from "../../../hooks/useSalesOrders"
import { CreateSalesOrderModal } from "../../../components/sales/CreateSalesOrderModal"
import { UpdateOrderItemsModal } from "../../../components/sales/UpdateOrderItemsModal"
import { UploadSalesOrdersModal } from "../../../components/sales/UploadSalesOrdersModal"
import { CToast } from "../../../components/common/CToast"
import { SearchSalesOrderResponse } from "../../../hooks/models"
import { FormProvider, useForm } from "react-hook-form"
import { useSalesOrdersList } from "../../../hooks/useSalesOrdersList"
import { useSalesOrderReferenceData } from "../../../hooks/useSalesOrderReferenceData"
import { useUsers } from "../../../hooks/useUsers"
import { type SalesOrderDiscountType } from "../../../utils/salesOrderDiscount"
import {
  SALES_ORDER_STATUS_OPTIONS,
  getSalesOrderStatusColor,
  getSalesOrderStatusLabel
} from "../../../utils/salesOrderStatus"

export const Route = createFileRoute("/sales/orders/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    const parsePositiveInt = (value: unknown, fallback: number) => {
      const parsed = Number(value)
      return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
    }
    const parseSearchText = (value: unknown) => {
      if (typeof value !== "string") return undefined
      return value.length > 0 ? value : undefined
    }
    const parseString = (value: unknown) => {
      if (typeof value !== "string") return undefined
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : undefined
    }
    const parseOrderDiscountType = (value: unknown) =>
      value === "percent" || value === "value" ? value : undefined

    return {
      page: parsePositiveInt(search.page, 1),
      limit: parsePositiveInt(search.limit, 10),
      searchText: parseSearchText(search.searchText),
      funnelFilter: parseString(search.funnelFilter),
      shippingTypeFilter: parseString(search.shippingTypeFilter),
      statusFilter: parseString(search.statusFilter),
      startDate: parseString(search.startDate),
      endDate: parseString(search.endDate),
      userIdFilter: parseString(search.userIdFilter),
      createNew: search.createNew as string | undefined,
      channelId: search.channelId as string | undefined,
      funnelId: search.funnelId as string | undefined,
      items: search.items as string | undefined,
      orderDiscount: search.orderDiscount as string | undefined,
      orderDiscountType: parseOrderDiscountType(search.orderDiscountType),
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
  orderDiscountType?: SalesOrderDiscountType
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
  const location = useLocation()
  const search = Route.useSearch()
  const {
    deleteSalesOrder,
    exportXlsxSalesOrder,
    exportXlsxSalesOrderByIds,
    exportXlsxSalesOrderForAccounting
  } = useSalesOrders()

  const page = search.page
  const limit = search.limit
  const searchText = search.searchText ?? ""
  const funnelFilter = search.funnelFilter ?? ""
  const shippingTypeFilter = search.shippingTypeFilter ?? ""
  const statusFilter = search.statusFilter ?? ""
  const startDate = search.startDate ? new Date(search.startDate) : null
  const endDate = search.endDate ? new Date(search.endDate) : null
  const userIdFilter = search.userIdFilter ?? ""
  const [selectedOrders, setSelectedOrders] = useState<SalesOrderItem[]>([])
  const isOrdersListRoute =
    location.pathname === "/sales/orders" || location.pathname === "/sales/orders/"

  const selectedOrderIds = selectedOrders.map((o) => o._id)

  const {
    me,
    myChannelData,
    funnelData,
    canSeeAllFunnels,
    isSalesCs,
    isAccountingEmp
  } = useSalesOrderReferenceData({
    enabled: isOrdersListRoute
  })
  const { publicSearchUser } = useUsers()

  const { data: salesCsUsersData } = useQuery({
    queryKey: ["salesCsUsers", "orders-filter"],
    queryFn: () =>
      publicSearchUser({ page: 1, limit: 999, role: "sales-cs", status: "active" }),
    enabled: isOrdersListRoute && canSeeAllFunnels,
    staleTime: 5 * 60 * 1000
  })

  const formMethods = useForm<CreateSalesOrderFormData>({
    defaultValues: {
      salesFunnelId: search.funnelId || "",
      storage: "position_HaNam",
      date: new Date(new Date().setHours(0, 0, 0, 0)),
      orderDiscount: Number(search.orderDiscount) || 0,
      orderDiscountType: search.orderDiscountType ?? "value",
      otherDiscount: Number(search.otherDiscount) || 0,
      deposit: Number(search.deposit) || 0,
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

  // Auto-apply user filter for sales-cs
  useEffect(() => {
    if (!isOrdersListRoute) return
    if (!canSeeAllFunnels && isSalesCs && me?._id && !userIdFilter) {
      navigate({
        to: "/sales/orders",
        search: {
          ...search,
          userIdFilter: me._id,
          page: 1
        },
        replace: true
      })
    }
  }, [
    canSeeAllFunnels,
    isOrdersListRoute,
    isSalesCs,
    me?._id,
    navigate,
    userIdFilter,
    search
  ])

  // Load orders data with filters
  const { data, refetch, isLoading } = useSalesOrdersList({
    page,
    limit,
    searchText,
    funnelFilter,
    shippingTypeFilter,
    statusFilter,
    startDate,
    endDate,
    userIdFilter,
    refetchKey: search.refetch,
    enabled: isOrdersListRoute
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

  const { mutate: exportXlsxForAccounting } = useMutation({
    mutationFn: exportXlsxSalesOrderForAccounting,
    onSuccess: (response) => {
      const url = URL.createObjectURL(response.data)
      const link = document.createElement("a")
      link.href = url
      link.download = `Don_hang_ke_toan_${format(new Date(), "ddMMyyyy")}_${
        startDate ? format(startDate, "ddMMyyyy") : ""
      }_${endDate ? format(endDate, "ddMMyyyy") : ""}.xlsx`
      link.click()
      URL.revokeObjectURL(url)
      CToast.success({ title: "Xuất file Excel kế toán thành công" })
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi xuất file Excel kế toán" })
    }
  })

  const ordersData = data?.data.data || []

  const funnelOptions =
    funnelData?.data.data.map((item: any) => ({
      value: item._id,
      label: `${item.name}${item.phoneNumber ? ` - ${item.phoneNumber}` : ""}`
    })) || []

  const salesCsOptions =
    salesCsUsersData?.data.data.map((user) => ({
      value: user._id,
      label: user.name
    })) || []
  const selectedSalesCsLabel =
    salesCsOptions.find((user) => user.value === userIdFilter)?.label ||
    "Nhân viên CSKH đã chọn"
  const currentChannelId = myChannelData?.channel?._id || ""

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
            currentOrderDiscountType={item.orderDiscountType}
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

  const handleOpenFunnelDetail = useCallback(
    (funnelId?: string) => {
      if (!funnelId) return
      navigate({ to: `/sales/funnel/${funnelId}` })
    },
    [navigate]
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
        meta: {
          headerClassName: "w-[220px] max-w-[220px]",
          cellClassName: "w-[220px] max-w-[220px]"
        },
        cell: ({ row }) => {
          const funnelId = row.original.salesFunnelId?._id

          return (
            <Box style={{ maxWidth: rem(220) }}>
              <Text
                fw={500}
                size="sm"
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  cursor: funnelId ? "pointer" : undefined
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenFunnelDetail(funnelId)
                }}
              >
                {row.original.salesFunnelId.name}
              </Text>
              <Text
                size="xs"
                c="dimmed"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {row.original.salesFunnelId.phoneNumber}
              </Text>
            </Box>
          )
        }
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
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge
            variant="light"
            color={getSalesOrderStatusColor(row.original.status)}
            size="sm"
          >
            {getSalesOrderStatusLabel(row.original.status)}
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
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                navigate({ to: `/sales/orders/${row.original._id}` })
              }}
              title="Xem chi tiết"
            >
              <IconEye size={16} />
            </ActionIcon>
            <Can roles={["admin", "sales-cs"]}>
              <ActionIcon
                variant="light"
                color="indigo"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleUpdateItems(row.original)
                }}
                title="Cập nhật sản phẩm"
                hidden={row.original.status !== "draft"}
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
                hidden={row.original.status === "cancelled"}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Can>
          </Group>
        ),
        enableSorting: false
      }
    ],
    [handleUpdateItems, handleDeleteOrder, handleOpenFunnelDetail]
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

  const parseOrderDiscountType = (
    v?: string
  ): SalesOrderDiscountType | undefined => {
    const normalized = normalizeQuoted(v)

    return normalized === "percent" || normalized === "value"
      ? normalized
      : undefined
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
    if (!isOrdersListRoute) return
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
      orderDiscountType: parseOrderDiscountType(search.orderDiscountType) || "value",
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
      search: {
        ...search,
        createNew: undefined,
        channelId: undefined,
        funnelId: undefined,
        items: undefined,
        orderDiscount: undefined,
        orderDiscountType: undefined,
        otherDiscount: undefined,
        deposit: undefined
      },
      replace: true
    })
  }, [
    isOrdersListRoute,
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
            globalFilterDebounceMs={300}
            globalFilterMode="initial"
            globalFilterValue={searchText}
            onGlobalFilterChange={(value) =>
              navigate({
                to: "/sales/orders",
                search: {
                  ...search,
                  searchText: value || undefined,
                  page: 1
                },
                replace: true
              })
            }
            page={page}
            totalPages={Math.ceil((data?.data.total || 0) / limit)}
            onPageChange={(nextPage) =>
              navigate({
                to: "/sales/orders",
                search: {
                  ...search,
                  page: nextPage
                }
              })
            }
            onPageSizeChange={(nextLimit) =>
              navigate({
                to: "/sales/orders",
                search: {
                  ...search,
                  limit: nextLimit,
                  page: 1
                }
              })
            }
            initialPageSize={limit}
            pageSizeOptions={[10, 20, 50, 100]}
            isLoading={isLoading}
            getRowId={getRowId}
            enableRowSelection={true}
            onRowSelectionChange={(rows) =>
              handleRowSelectionChange(rows as SalesOrderItem[])
            }
            extraFilters={
              <>
                <Select
                  label="Khách hàng"
                  placeholder="Tất cả khách hàng"
                  data={[
                    { value: "", label: "Tất cả khách hàng" },
                    ...funnelOptions
                  ]}
                  value={funnelFilter}
                  onChange={(value) =>
                    navigate({
                      to: "/sales/orders",
                      search: {
                        ...search,
                        funnelFilter: value || undefined,
                        page: 1
                      }
                    })
                  }
                  searchable
                  clearable
                  style={{ width: 250 }}
                />

                {canSeeAllFunnels && (
                  <Select
                    label="Nhân viên CSKH"
                    placeholder="Tất cả nhân viên CSKH"
                    data={[
                      { value: "", label: "Tất cả nhân viên CSKH" },
                      ...salesCsOptions
                    ]}
                    value={userIdFilter}
                    onChange={(value) =>
                      navigate({
                        to: "/sales/orders",
                        search: {
                          ...search,
                          userIdFilter: value || undefined,
                          page: 1
                        }
                      })
                    }
                    searchable
                    clearable
                    style={{ width: 220 }}
                  />
                )}

                <Select
                  label="Đơn vị vận chuyển"
                  placeholder="Đơn vị vận chuyển"
                  data={[
                    { value: "", label: "Tất cả đơn vị" },
                    { value: "shipping_vtp", label: "Viettel Post" },
                    { value: "shipping_cargo", label: "Shipcode lên chành" }
                  ]}
                  value={shippingTypeFilter}
                  onChange={(value) =>
                    navigate({
                      to: "/sales/orders",
                      search: {
                        ...search,
                        shippingTypeFilter: value || undefined,
                        page: 1
                      }
                    })
                  }
                  clearable
                  style={{ width: 200 }}
                />

                <Select
                  label="Trạng thái"
                  placeholder="Trạng thái"
                  data={[
                    { value: "", label: "Tất cả trạng thái" },
                    ...SALES_ORDER_STATUS_OPTIONS.map((option) => ({
                      value: option.value,
                      label: option.label
                    }))
                  ]}
                  value={statusFilter}
                  onChange={(value) =>
                    navigate({
                      to: "/sales/orders",
                      search: {
                        ...search,
                        statusFilter: value || undefined,
                        page: 1
                      }
                    })
                  }
                  clearable
                  style={{ width: 180 }}
                />

                <DatePickerInput
                  label="Từ ngày"
                  placeholder="Từ ngày"
                  value={startDate}
                  onChange={(value) =>
                    navigate({
                      to: "/sales/orders",
                      search: {
                        ...search,
                        startDate: value
                          ? format(value, "yyyy-MM-dd")
                          : undefined,
                        page: 1
                      }
                    })
                  }
                  clearable
                  valueFormat="DD/MM/YYYY"
                  style={{ width: 180 }}
                />

                <DatePickerInput
                  label="Đến ngày"
                  placeholder="Đến ngày"
                  value={endDate}
                  onChange={(value) =>
                    navigate({
                      to: "/sales/orders",
                      search: {
                        ...search,
                        endDate: value
                          ? format(value, "yyyy-MM-dd")
                          : undefined,
                        page: 1
                      }
                    })
                  }
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
                              {userIdFilter && (
                                <Text size="sm" mb={4}>
                                  • Nhân viên CSKH: {" "}
                                  <strong>{selectedSalesCsLabel}</strong>
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
                                    {getSalesOrderStatusLabel(
                                      statusFilter as
                                        | "draft"
                                        | "confirmed"
                                        | "official"
                                    )}
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
                                !funnelFilter &&
                                !userIdFilter &&
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
                          userId: userIdFilter || undefined,
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
                              : (statusFilter as
                                  | "draft"
                                  | "confirmed"
                                  | "official"),
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
                {isAccountingEmp && (
                  <Button
                    onClick={() => {
                      modals.openConfirmModal({
                        title: <b>Xác nhận xuất file Excel kế toán</b>,
                        children: (
                          <Box>
                            <Text mb="md">
                              Bạn có chắc chắn muốn xuất file Excel kế toán với
                              các bộ lọc hiện tại?
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
                              {userIdFilter && (
                                <Text size="sm" mb={4}>
                                  • Nhân viên CSKH: {" "}
                                  <strong>{selectedSalesCsLabel}</strong>
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
                                    {getSalesOrderStatusLabel(
                                      statusFilter as
                                        | "draft"
                                        | "confirmed"
                                        | "official"
                                    )}
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
                                !funnelFilter &&
                                !userIdFilter &&
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
                        labels: {
                          confirm: "Xuất Excel kế toán",
                          cancel: "Hủy"
                        },
                        confirmProps: { color: "blue" },
                        onConfirm: () => {
                          exportXlsxForAccounting({
                            page: 1,
                            limit: 9999,
                            searchText: searchText || undefined,
                            userId: userIdFilter || undefined,
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
                                : (statusFilter as
                                    | "draft"
                                    | "confirmed"
                                    | "official"),
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
                    color="blue"
                    variant="light"
                  >
                    Xuất Excel kế toán
                  </Button>
                )}
                <Can roles={["admin", "sales-hunter", "sales-cs"]}>
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
                    onClick={() => handleCreateOrder(currentChannelId)}
                    leftSection={<IconPlus size={16} />}
                    size="sm"
                    radius="md"
                    disabled={!currentChannelId}
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
