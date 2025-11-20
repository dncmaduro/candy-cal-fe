import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  Badge,
  Group,
  Box,
  rem,
  Text,
  Stack,
  Paper,
  Grid,
  Title,
  Divider,
  ActionIcon,
  Tooltip
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useQuery } from "@tanstack/react-query"
import { format, subMonths } from "date-fns"
import {
  IconArrowLeft,
  IconCalendar,
  IconEdit,
  IconTrash
} from "@tabler/icons-react"
import { useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { modals } from "@mantine/modals"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { useSalesItems } from "../../../hooks/useSalesItems"
import { CToast } from "../../../components/common/CToast"
import { Can } from "../../../components/common/Can"
import { SalesItemModal } from "../../../components/sales/SalesItemModal"
import { CDataTable } from "../../../components/common/CDataTable"

export const Route = createFileRoute("/sales/items/$itemId")({
  component: RouteComponent
})

const FACTORY_LABELS: Record<string, string> = {
  candy: "Xưởng kẹo mút",
  manufacturing: "Xưởng gia công",
  position_MongCai: "Kho Móng Cái",
  jelly: "Xưởng thạch",
  import: "Hàng nhập khẩu"
}

const SOURCE_LABELS: Record<string, string> = {
  inside: "Hàng trong nhà máy",
  outside: "Hàng ngoài nhà máy"
}

function RouteComponent() {
  const { itemId } = Route.useParams()
  const navigate = useNavigate()
  const {
    getSalesItemDetail,
    getSalesItemsQuantityByRange,
    getSalesItemsTopCustomersByRange,
    deleteSalesItem
  } = useSalesItems()

  // Date range for statistics
  const [statsEndDate, setStatsEndDate] = useState<Date>(new Date())
  const [statsStartDate, setStatsStartDate] = useState<Date>(
    subMonths(new Date(), 6)
  )

  // Date range for top customers
  const [customersEndDate, setCustomersEndDate] = useState<Date>(new Date())
  const [customersStartDate, setCustomersStartDate] = useState<Date>(
    subMonths(new Date(), 6)
  )

  // Fetch item detail
  const { data: itemData, refetch } = useQuery({
    queryKey: ["salesItem", itemId],
    queryFn: () => getSalesItemDetail(itemId),
    enabled: !!itemId
  })

  // Fetch quantity statistics
  const { data: quantityData } = useQuery({
    queryKey: ["salesItemQuantity", itemId, statsStartDate, statsEndDate],
    queryFn: () =>
      getSalesItemsQuantityByRange(itemData?.data?.code || "", {
        startDate: statsStartDate,
        endDate: statsEndDate
      }),
    enabled: !!itemData?.data?.code
  })

  // Fetch top customers
  const { data: topCustomersData } = useQuery({
    queryKey: [
      "salesItemTopCustomers",
      itemId,
      customersStartDate,
      customersEndDate
    ],
    queryFn: () =>
      getSalesItemsTopCustomersByRange(itemData?.data?.code || "", {
        startDate: customersStartDate,
        endDate: customersEndDate
      }),
    enabled: !!itemData?.data?.code
  })

  const item = itemData?.data
  const stats = quantityData?.data
  const topCustomers = topCustomersData?.data?.topCustomers || []

  const handleEditItem = () => {
    if (!item) return
    modals.open({
      title: <b>Chỉnh sửa sản phẩm</b>,
      children: (
        <SalesItemModal
          item={item}
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "md"
    })
  }

  const handleDeleteItem = () => {
    if (!item) return
    modals.openConfirmModal({
      title: <b>Xác nhận xóa sản phẩm</b>,
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa sản phẩm <strong>{item.name.vn}</strong>{" "}
          không? Hành động này không thể hoàn tác.
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteSalesItem(item._id)
          CToast.success({ title: "Xóa sản phẩm thành công" })
          navigate({ to: "/sales/items" })
        } catch (error: any) {
          CToast.error({
            title:
              error?.response?.data?.message || "Có lỗi xảy ra khi xóa sản phẩm"
          })
        }
      }
    })
  }

  type TopCustomerItem = {
    _id: string
    name: string
    province: string
    phoneNumber: string
    totalQuantity: number
    orderCount: number
  }

  const customerColumns = useMemo<ColumnDef<TopCustomerItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Tên khách hàng",
        cell: ({ row }) => (
          <Text fw={500} size="sm">
            {row.original.name}
          </Text>
        )
      },
      {
        accessorKey: "province",
        header: "Tỉnh/Thành phố",
        cell: ({ row }) => <Text size="sm">{row.original.province}</Text>
      },
      {
        accessorKey: "phoneNumber",
        header: "Số điện thoại",
        cell: ({ row }) => <Text size="sm">{row.original.phoneNumber}</Text>
      },
      {
        accessorKey: "totalQuantity",
        header: "Tổng số lượng",
        cell: ({ row }) => {
          console.log(row)
          return (
            <Badge variant="light" color="blue" size="lg">
              {row.original.totalQuantity} thùng
            </Badge>
          )
        }
      },
      {
        accessorKey: "orderCount",
        header: "Số đơn hàng",
        cell: ({ row }) => (
          <Badge variant="light" color="green" size="lg">
            {row.original.orderCount} đơn
          </Badge>
        )
      }
    ],
    []
  )

  const customerData = useMemo<TopCustomerItem[]>(() => {
    return topCustomers.map((customer) => ({
      _id: customer.funnel._id,
      name: customer.funnel.name,
      province: customer.funnel.province?.name || "N/A",
      phoneNumber: customer.funnel.phoneNumber || "N/A",
      totalQuantity: customer.totalQuantity,
      orderCount: customer.orderCount
    }))
  }, [topCustomers])

  if (!item) {
    return (
      <SalesLayout>
        <Box p="xl">
          <Text>Đang tải...</Text>
        </Box>
      </SalesLayout>
    )
  }

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
          <Group justify="space-between" mb="lg">
            <Group>
              <ActionIcon
                variant="subtle"
                onClick={() => navigate({ to: "/sales/items" })}
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
              <div>
                <Title order={2}>Chi tiết sản phẩm</Title>
                <Text c="dimmed" size="sm">
                  Thông tin chi tiết và thống kê sản phẩm
                </Text>
              </div>
            </Group>
            <Can roles={["admin", "sales-emp"]}>
              <Group>
                <Tooltip label="Chỉnh sửa sản phẩm" withArrow>
                  <ActionIcon
                    variant="light"
                    color="indigo"
                    size="lg"
                    onClick={handleEditItem}
                  >
                    <IconEdit size={20} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Xóa sản phẩm" withArrow>
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="lg"
                    onClick={handleDeleteItem}
                  >
                    <IconTrash size={20} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Can>
          </Group>
        </Box>

        {/* Content */}
        <Box px={{ base: 8, md: 28 }} pb={32}>
          <Grid>
            {/* Product Information */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="lg" withBorder>
                <Title order={4} mb="md">
                  Thông tin sản phẩm
                </Title>
                <Divider mb="md" />
                <Stack gap={12}>
                  <div>
                    <Text size="sm" c="dimmed">
                      Mã sản phẩm
                    </Text>
                    <Text fw={600} size="lg">
                      {item.code}
                    </Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Tên tiếng Việt
                    </Text>
                    <Text fw={500}>{item.name.vn}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Tên tiếng Trung
                    </Text>
                    <Text fw={500}>{item.name.cn}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Nhà máy
                    </Text>
                    <Badge variant="light" size="lg" color="blue">
                      {FACTORY_LABELS[item.factory] || item.factory}
                    </Badge>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Nguồn hàng
                    </Text>
                    <Badge
                      variant="light"
                      size="lg"
                      color={item.source === "inside" ? "green" : "orange"}
                    >
                      {SOURCE_LABELS[item.source] || item.source}
                    </Badge>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Giá bán
                    </Text>
                    <Text fw={600} size="lg" c="blue">
                      {item.price.toLocaleString("vi-VN")}đ
                    </Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Ngày tạo
                    </Text>
                    <Text>
                      {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")}
                    </Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Cập nhật lần cuối
                    </Text>
                    <Text>
                      {format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm")}
                    </Text>
                  </div>
                </Stack>
              </Paper>
            </Grid.Col>

            {/* Statistics */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="lg" withBorder>
                <Title order={4} mb="md">
                  Thống kê
                </Title>
                <Divider mb="md" />
                <Stack gap={12}>
                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Khoảng thời gian
                    </Text>
                    <Group>
                      <DatePickerInput
                        value={statsStartDate}
                        onChange={(date) => date && setStatsStartDate(date)}
                        placeholder="Từ ngày"
                        leftSection={<IconCalendar size={16} />}
                        valueFormat="DD/MM/YYYY"
                        maxDate={statsEndDate}
                        clearable={false}
                        styles={{ input: { width: rem(160) } }}
                      />
                      <Text size="sm" c="dimmed">
                        đến
                      </Text>
                      <DatePickerInput
                        value={statsEndDate}
                        onChange={(date) => date && setStatsEndDate(date)}
                        placeholder="Đến ngày"
                        leftSection={<IconCalendar size={16} />}
                        valueFormat="DD/MM/YYYY"
                        minDate={statsStartDate}
                        maxDate={new Date()}
                        clearable={false}
                        styles={{ input: { width: rem(160) } }}
                      />
                    </Group>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Tổng số lượng đã bán
                    </Text>
                    <Text fw={700} size="xl" c="blue">
                      {stats?.totalQuantity?.toLocaleString("vi-VN") || 0} thùng
                    </Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Số đơn hàng
                    </Text>
                    <Text fw={700} size="xl" c="green">
                      {stats?.orderCount?.toLocaleString("vi-VN") || 0} đơn
                    </Text>
                  </div>
                  {stats && stats.totalQuantity > 0 && stats.orderCount > 0 && (
                    <div>
                      <Text size="sm" c="dimmed">
                        Trung bình mỗi đơn
                      </Text>
                      <Text fw={600} size="lg" c="violet">
                        {Math.round(stats.totalQuantity / stats.orderCount)}{" "}
                        thùng/đơn
                      </Text>
                    </div>
                  )}
                  {stats && stats.totalQuantity > 0 && (
                    <div>
                      <Text size="sm" c="dimmed">
                        Doanh thu ước tính
                      </Text>
                      <Text fw={700} size="xl" c="orange">
                        {(stats.totalQuantity * item.price).toLocaleString(
                          "vi-VN"
                        )}
                        đ
                      </Text>
                    </div>
                  )}
                </Stack>
              </Paper>
            </Grid.Col>

            {/* Top Customers */}
            <Grid.Col span={12}>
              <Paper p="lg" withBorder>
                <Group justify="space-between" mb="md">
                  <div>
                    <Title order={4} mb={8}>
                      Top khách hàng mua nhiều nhất
                    </Title>
                    <Group>
                      <DatePickerInput
                        value={customersStartDate}
                        onChange={(date) => date && setCustomersStartDate(date)}
                        placeholder="Từ ngày"
                        leftSection={<IconCalendar size={16} />}
                        valueFormat="DD/MM/YYYY"
                        maxDate={customersEndDate}
                        clearable={false}
                        styles={{ input: { width: rem(160) } }}
                      />
                      <Text size="sm" c="dimmed">
                        đến
                      </Text>
                      <DatePickerInput
                        value={customersEndDate}
                        onChange={(date) => date && setCustomersEndDate(date)}
                        placeholder="Đến ngày"
                        leftSection={<IconCalendar size={16} />}
                        valueFormat="DD/MM/YYYY"
                        minDate={customersStartDate}
                        maxDate={new Date()}
                        clearable={false}
                        styles={{ input: { width: rem(160) } }}
                      />
                    </Group>
                  </div>
                  {customerData.length > 0 && (
                    <Badge size="lg" variant="light" color="blue">
                      {customerData.length} khách hàng
                    </Badge>
                  )}
                </Group>
                <Divider mb="md" />
                {customerData.length === 0 ? (
                  <Box py="xl">
                    <Text c="dimmed" ta="center">
                      Chưa có dữ liệu khách hàng
                    </Text>
                  </Box>
                ) : (
                  <CDataTable
                    columns={customerColumns}
                    data={customerData}
                    enableGlobalFilter={false}
                    pageSizeOptions={[10, 20, 50]}
                    initialPageSize={10}
                  />
                )}
              </Paper>
            </Grid.Col>
          </Grid>
        </Box>
      </Box>
    </SalesLayout>
  )
}
