import { createFileRoute } from "@tanstack/react-router"
import {
  Badge,
  Button,
  Group,
  Box,
  rem,
  Text,
  Select,
  ActionIcon,
  Flex,
  Collapse,
  Table,
  TextInput,
  Pagination
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"
import { modals } from "@mantine/modals"
import { format } from "date-fns"
import {
  IconPlus,
  IconEdit,
  IconTruck,
  IconTrash,
  IconChevronDown,
  IconChevronRight,
  IconSearch,
  IconDownload
} from "@tabler/icons-react"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { Can } from "../../../components/common/Can"
import { useSalesOrders } from "../../../hooks/useSalesOrders"
import { useSalesFunnel } from "../../../hooks/useSalesFunnel"
import { CreateSalesOrderModal } from "../../../components/sales/CreateSalesOrderModal"
import { UpdateShippingCodeModal } from "../../../components/sales/UpdateShippingCodeModal"
import { UpdateOrderItemsModal } from "../../../components/sales/UpdateOrderItemsModal"
import { CToast } from "../../../components/common/CToast"

export const Route = createFileRoute("/sales/orders/")({
  component: RouteComponent
})

type SalesOrderItem = {
  _id: string
  salesFunnelId: {
    _id: string
    name: string
  }
  items: {
    code: string
    name: string
    price: number
    quantity: number
    factory?: string
    source?: string
  }[]
  returning: boolean
  shippingCode?: string
  shippingType?: "shipping_vtp" | "shipping_cargo"
  storage: "position_HaNam" | "position_MKT"
  date: string
  total: number
  createdAt: string
  updatedAt: string
}

type EnrichedSalesOrderItem = SalesOrderItem & {
  customerName: string
  customerFacebook: string
}

function RouteComponent() {
  const { searchSalesOrders, deleteSalesOrder, exportXlsxSalesOrder } =
    useSalesOrders()
  const { searchFunnel } = useSalesFunnel()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchText, setSearchText] = useState("")
  const [returningFilter, setReturningFilter] = useState<string>("")
  const [funnelFilter, setFunnelFilter] = useState<string>("")
  const [shippingTypeFilter, setShippingTypeFilter] = useState<string>("")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  // Load reference data
  const { data: funnelData } = useQuery({
    queryKey: ["salesFunnel", "all"],
    queryFn: () =>
      searchFunnel({
        page: 1,
        limit: 999
      })
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
      startDate,
      endDate
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
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined
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

  // Enrich data with funnel info
  const enrichedData = useMemo(() => {
    if (!data?.data.data) return []

    const funnels = funnelData?.data.data || []

    return data.data.data.map((item) => {
      const funnel = funnels.find((f) => f._id === item.salesFunnelId._id)
      return {
        ...item,
        customerName: funnel?.name || "N/A",
        customerFacebook: funnel?.facebook || "N/A"
      }
    })
  }, [data, funnelData])

  const funnelOptions =
    funnelData?.data.data.map((item) => ({
      value: item._id,
      label: `${item.name} - ${item.facebook}`
    })) || []

  const toggleRow = (orderId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }))
  }

  const handleCreateOrder = () => {
    modals.open({
      title: <b>Tạo đơn hàng mới</b>,
      children: (
        <CreateSalesOrderModal
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "lg"
    })
  }

  const handleUpdateShippingInfo = (
    orderId: string,
    currentShippingCode?: string,
    currentShippingType?: "shipping_vtp" | "shipping_cargo"
  ) => {
    modals.open({
      title: <b>Cập nhật thông tin vận chuyển</b>,
      children: (
        <UpdateShippingCodeModal
          orderId={orderId}
          currentShippingCode={currentShippingCode}
          currentShippingType={currentShippingType}
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "md"
    })
  }

  const handleUpdateItems = (item: EnrichedSalesOrderItem) => {
    modals.open({
      title: <b>Cập nhật sản phẩm</b>,
      children: (
        <UpdateOrderItemsModal
          orderId={item._id}
          currentItems={item.items.map((si) => ({
            code: si.code,
            quantity: si.quantity
          }))}
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "lg"
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

  const factoryDisplay = useCallback((factory: string) => {
    const factories: Record<string, string> = {
      candy: "Xưởng kẹo mút",
      manufacturing: "Xưởng gia công",
      position_MongCai: "Kho Móng Cái",
      jelly: "Xưởng thạch",
      import: "Hàng nhập khẩu"
    }

    return factories[factory] || factory
  }, [])

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
          {/* Filters */}
          <Flex gap="sm" mb="md" wrap="wrap">
            <TextInput
              placeholder="Tìm kiếm..."
              leftSection={<IconSearch size={16} />}
              value={searchText}
              onChange={(e) => setSearchText(e.currentTarget.value)}
              style={{ minWidth: 220 }}
            />

            <Select
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

            <DatePickerInput
              placeholder="Từ ngày"
              value={startDate}
              onChange={setStartDate}
              clearable
              valueFormat="DD/MM/YYYY"
              style={{ width: 180 }}
            />

            <DatePickerInput
              placeholder="Đến ngày"
              value={endDate}
              onChange={setEndDate}
              clearable
              valueFormat="DD/MM/YYYY"
              style={{ width: 180 }}
            />

            <Box style={{ marginLeft: "auto" }}>
              <Group gap="xs">
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
                <Can roles={["admin", "sale-leader"]}>
                  <Button
                    onClick={handleCreateOrder}
                    leftSection={<IconPlus size={16} />}
                    size="sm"
                    radius="md"
                  >
                    Tạo đơn hàng
                  </Button>
                </Can>
              </Group>
            </Box>
          </Flex>

          {/* Custom Table with Expandable Rows */}
          <Box
            style={{
              border: "1px solid #e9ecef",
              borderRadius: 12,
              overflow: "hidden"
            }}
          >
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 40 }}></Table.Th>
                  <Table.Th>Khách hàng</Table.Th>
                  <Table.Th>Số SP</Table.Th>
                  <Table.Th>Tổng tiền</Table.Th>
                  <Table.Th>Mã vận đơn</Table.Th>
                  <Table.Th>Đơn vị vận chuyển</Table.Th>
                  <Table.Th>Kho</Table.Th>
                  <Table.Th>Ngày đặt</Table.Th>
                  <Table.Th>Thao tác</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {enrichedData.map((item) => (
                  <>
                    <Table.Tr key={item._id}>
                      <Table.Td>
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          onClick={() => toggleRow(item._id)}
                        >
                          {expandedRows[item._id] ? (
                            <IconChevronDown size={16} />
                          ) : (
                            <IconChevronRight size={16} />
                          )}
                        </ActionIcon>
                      </Table.Td>
                      <Table.Td>
                        <div>
                          <Flex gap={4} align={"center"}>
                            <Text fw={500} size="sm">
                              {item.customerName}
                            </Text>
                            <Badge
                              variant="light"
                              size="xs"
                              color={item.returning ? "violet" : "green"}
                            >
                              {item.returning ? "Khách cũ" : "Khách mới"}
                            </Badge>
                          </Flex>
                          <Text size="xs" c="dimmed">
                            {item.customerFacebook}
                          </Text>
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="blue" size="lg">
                          {item.items.length}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={500} size="sm">
                          {item.total.toLocaleString("vi-VN")}đ
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{item.shippingCode || "Chưa có"}</Text>
                      </Table.Td>
                      <Table.Td>
                        {item.shippingType ? (
                          <Text size="sm">
                            {item.shippingType === "shipping_vtp"
                              ? "Viettel Post"
                              : "Shipcode lên chành"}
                          </Text>
                        ) : (
                          <Text size="sm" c="dimmed">
                            Chưa có
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {item.storage === "position_HaNam"
                            ? "Kho Hà Nam"
                            : "Kho MKT"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {format(new Date(item.date), "dd/MM/yyyy")}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Can roles={["admin", "sale-leader"]}>
                          <Group gap="xs">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              size="sm"
                              onClick={() =>
                                handleUpdateShippingInfo(
                                  item._id,
                                  item.shippingCode,
                                  item.shippingType
                                )
                              }
                              title="Cập nhật thông tin vận chuyển"
                            >
                              <IconTruck size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="indigo"
                              size="sm"
                              onClick={() => handleUpdateItems(item)}
                              title="Cập nhật sản phẩm"
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="red"
                              size="sm"
                              onClick={() => handleDeleteOrder(item._id)}
                              title="Xóa đơn hàng"
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Can>
                      </Table.Td>
                    </Table.Tr>

                    {/* Expanded Row - Items Detail */}
                    {expandedRows[item._id] && (
                      <Table.Tr>
                        <Table.Td colSpan={9} style={{ padding: 0 }}>
                          <Collapse in={expandedRows[item._id]}>
                            <Box p="md" bg="#fafbfc">
                              <Text fw={600} size="sm" mb="sm">
                                Chi tiết sản phẩm:
                              </Text>
                              <Table
                                withTableBorder
                                bg={"white"}
                                withColumnBorders
                                style={{ fontSize: "0.875rem" }}
                              >
                                <Table.Thead>
                                  <Table.Tr>
                                    <Table.Th>Mã SP</Table.Th>
                                    <Table.Th>Tên SP</Table.Th>
                                    <Table.Th>Số lượng</Table.Th>
                                    <Table.Th>Đơn giá</Table.Th>
                                    <Table.Th>Thành tiền</Table.Th>
                                    <Table.Th>Factory</Table.Th>
                                    <Table.Th>Source</Table.Th>
                                  </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                  {item.items.map((subItem, idx) => (
                                    <Table.Tr key={idx}>
                                      <Table.Td>
                                        <Text size="sm" fw={500}>
                                          {subItem.code}
                                        </Text>
                                      </Table.Td>
                                      <Table.Td>
                                        <Text size="sm">{subItem.name}</Text>
                                      </Table.Td>
                                      <Table.Td>
                                        <Text size="sm">
                                          {subItem.quantity}
                                        </Text>
                                      </Table.Td>
                                      <Table.Td>
                                        <Text size="sm">
                                          {subItem.price.toLocaleString(
                                            "vi-VN"
                                          )}
                                          đ
                                        </Text>
                                      </Table.Td>
                                      <Table.Td>
                                        <Text size="sm" fw={500}>
                                          {(
                                            subItem.price * subItem.quantity
                                          ).toLocaleString("vi-VN")}
                                          đ
                                        </Text>
                                      </Table.Td>
                                      <Table.Td>
                                        <Text size="sm">
                                          {factoryDisplay(
                                            subItem.factory || ""
                                          )}
                                        </Text>
                                      </Table.Td>
                                      <Table.Td>
                                        <Text size="sm">
                                          {subItem.source === "inside"
                                            ? "Hàng trong nhà máy"
                                            : "Hàng ngoài nhà máy"}
                                        </Text>
                                      </Table.Td>
                                    </Table.Tr>
                                  ))}
                                </Table.Tbody>
                              </Table>
                            </Box>
                          </Collapse>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </>
                ))}
              </Table.Tbody>
            </Table>
          </Box>

          {/* Pagination */}
          <Flex justify="space-between" align="center" mt="md">
            <Text size="sm" c="dimmed">
              Trang {page} / {Math.ceil((data?.data.total || 0) / limit)} · Tổng{" "}
              {data?.data.total || 0} đơn hàng
            </Text>
            <Pagination
              total={Math.ceil((data?.data.total || 0) / limit)}
              value={page}
              onChange={setPage}
              withEdges
            />
            <Select
              style={{ width: 100 }}
              value={String(limit)}
              onChange={(value) => setLimit(Number(value) || 10)}
              data={["10", "20", "50", "100"]}
            />
          </Flex>
        </Box>
      </Box>
    </SalesLayout>
  )
}
