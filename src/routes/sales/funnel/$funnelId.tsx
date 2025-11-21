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
  Tooltip,
  Pagination
} from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  IconArrowLeft,
  IconEdit,
  IconProgress,
  IconCash,
  IconArrowRight,
  IconEye,
  IconPlus,
  IconPhone,
  IconMessage,
  IconDots
} from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { useMemo, useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { useSalesFunnel } from "../../../hooks/useSalesFunnel"
import { useSalesOrders } from "../../../hooks/useSalesOrders"
import { useSalesActivities } from "../../../hooks/useSalesActivities"
import { useUsers } from "../../../hooks/useUsers"
import { UpdateFunnelInfoModal } from "../../../components/sales/UpdateFunnelInfoModal"
import { UpdateStageModal } from "../../../components/sales/UpdateStageModal"
import { UpdateFunnelCostModal } from "../../../components/sales/UpdateFunnelCostModal"
import { MoveToContactedModal } from "../../../components/sales/MoveToContactedModal"
import { SalesActivitiesDrawer } from "../../../components/sales/SalesActivitiesDrawer"
import { CDataTable } from "../../../components/common/CDataTable"

export const Route = createFileRoute("/sales/funnel/$funnelId")({
  component: RouteComponent
})

const STAGE_BADGE_COLOR: Record<string, string> = {
  lead: "blue",
  contacted: "cyan",
  customer: "green",
  closed: "gray"
}

const STAGE_LABEL: Record<string, string> = {
  lead: "Lead",
  contacted: "Đã liên hệ",
  customer: "Khách hàng",
  closed: "Đã đóng"
}

function RouteComponent() {
  const { funnelId } = Route.useParams()
  const navigate = useNavigate()
  const { getFunnelById, checkPermissionOnFunnel } = useSalesFunnel()
  const { getOrdersByFunnel } = useSalesOrders()
  const { getSalesActivities } = useSalesActivities()
  const { getMe } = useUsers()

  const [activitiesDrawerOpen, setActivitiesDrawerOpen] = useState(false)
  const [activitiesPage, setActivitiesPage] = useState(1)
  const activitiesLimit = 5

  // Check permission first
  const { data: permissionData, isLoading: isCheckingPermission } = useQuery({
    queryKey: ["funnelPermission", funnelId],
    queryFn: () => checkPermissionOnFunnel({ id: funnelId }),
    enabled: !!funnelId
  })

  const hasPermission = permissionData?.data?.hasPermission ?? false

  // Redirect if no permission
  useEffect(() => {
    if (!isCheckingPermission && !hasPermission) {
      navigate({ to: "/access-denied" })
    }
  }, [hasPermission, isCheckingPermission, navigate])

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: getMe
  })

  const { data, refetch } = useQuery({
    queryKey: ["salesFunnel", funnelId],
    queryFn: () => getFunnelById({ id: funnelId }),
    enabled: !!funnelId && hasPermission
  })

  // Fetch order history
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["funnelOrders", funnelId],
    queryFn: () => getOrdersByFunnel(funnelId, { page: 1, limit: 100 }),
    enabled: !!funnelId && hasPermission
  })

  // Fetch activities
  const { data: activitiesData, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["salesActivities", funnelId, activitiesPage],
    queryFn: () =>
      getSalesActivities({
        salesFunnelId: funnelId!,
        page: activitiesPage,
        limit: activitiesLimit
      }),
    enabled: !!funnelId && hasPermission
  })

  const funnel = data?.data
  const me = meData?.data
  const isAdmin = me?.roles?.includes("admin") ?? false
  const isResponsibleUser = funnel?.user?._id === me?._id

  const canPerformActions = isAdmin || isResponsibleUser

  type OrderHistoryItem = {
    _id: string
    date: string
    total: number
    status: "draft" | "official"
    shippingCode?: string
    itemCount: number
    discount?: number
    tax?: number
    shippingCost?: number
  }

  const orderColumns = useMemo<ColumnDef<OrderHistoryItem>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Ngày đặt hàng",
        cell: ({ row }) => (
          <Text size="sm">
            {format(new Date(row.original.date), "dd/MM/yyyy")}
          </Text>
        )
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge
            color={row.original.status === "official" ? "green" : "gray"}
            size="sm"
          >
            {row.original.status === "official" ? "Chính thức" : "Báo giá"}
          </Badge>
        )
      },
      {
        accessorKey: "itemCount",
        header: "Số lượng SP",
        cell: ({ row }) => (
          <Badge variant="light" color="blue">
            {row.original.itemCount}
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
        accessorKey: "shippingCode",
        header: "Mã vận đơn",
        cell: ({ row }) => (
          <Text size="sm">{row.original.shippingCode || "Chưa có"}</Text>
        )
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <Tooltip label="Xem chi tiết" withArrow>
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() =>
                navigate({ to: `/sales/orders/${row.original._id}` })
              }
            >
              <IconEye size={18} />
            </ActionIcon>
          </Tooltip>
        )
      }
    ],
    [navigate]
  )

  const daysSinceLastPurchase = ordersData?.data.daysSinceLastPurchase

  const orderHistoryData = useMemo<OrderHistoryItem[]>(() => {
    if (!ordersData?.data?.data) return []
    return ordersData.data.data.map((order) => ({
      _id: order._id,
      date: order.date,
      total: order.total,
      status: order.status,
      shippingCode: order.shippingCode,
      itemCount: order.items.reduce(
        (sum: number, item) => sum + item.quantity,
        0
      ),
      discount: order.tax,
      tax: order.tax,
      shippingCost: order.shippingCost
    }))
  }, [ordersData])

  const handleUpdateInfo = () => {
    if (!funnel) return
    modals.open({
      title: <b>Cập nhật thông tin</b>,
      children: (
        <UpdateFunnelInfoModal
          funnelId={funnel._id}
          currentData={{
            name: funnel.name,
            province: funnel.province,
            phoneNumber: funnel.phoneNumber,
            secondaryPhoneNumbers: funnel.secondaryPhoneNumbers,
            address: funnel.address,
            channel: funnel.channel._id,
            hasBuyed: funnel.hasBuyed
          }}
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "lg"
    })
  }

  const handleUpdateStage = () => {
    if (!funnel) return
    modals.open({
      title: <b>Cập nhật giai đoạn</b>,
      children: (
        <UpdateStageModal
          funnelId={funnel._id}
          currentStage={funnel.stage}
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "lg"
    })
  }

  const handleUpdateCost = () => {
    if (!funnel) return
    modals.open({
      title: <b>Cập nhật chi phí marketing</b>,
      children: (
        <UpdateFunnelCostModal
          funnelId={funnel._id}
          currentCost={funnel.cost}
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "md"
    })
  }

  const handleMoveToContacted = () => {
    if (!funnel) return
    modals.open({
      title: <b>Chuyển sang Đã liên hệ</b>,
      children: (
        <MoveToContactedModal
          funnelId={funnel._id}
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "lg"
    })
  }

  if (isCheckingPermission || !funnel) {
    return (
      <SalesLayout>
        <Box p="xl">
          <Text>Đang tải...</Text>
        </Box>
      </SalesLayout>
    )
  }

  if (!hasPermission) {
    return null // Will redirect via useEffect
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
                onClick={() => navigate({ to: "/sales/funnel" })}
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
              <div>
                <Title order={2}>Chi tiết Funnel</Title>
                <Text c="dimmed" size="sm">
                  Thông tin chi tiết của khách hàng
                </Text>
              </div>
            </Group>
            {canPerformActions && (
              <Group>
                {funnel.stage === "lead" && (
                  <Tooltip label="Chuyển sang Đã liên hệ" withArrow>
                    <ActionIcon
                      variant="light"
                      color="cyan"
                      size="lg"
                      onClick={handleMoveToContacted}
                    >
                      <IconArrowRight size={20} />
                    </ActionIcon>
                  </Tooltip>
                )}
                <Tooltip label="Cập nhật thông tin" withArrow>
                  <ActionIcon
                    variant="light"
                    color="indigo"
                    size="lg"
                    onClick={handleUpdateInfo}
                  >
                    <IconEdit size={20} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Cập nhật giai đoạn" withArrow>
                  <ActionIcon
                    variant="light"
                    color="violet"
                    size="lg"
                    onClick={handleUpdateStage}
                  >
                    <IconProgress size={20} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Cập nhật chi phí marketing" withArrow>
                  <ActionIcon
                    variant="light"
                    color="yellow"
                    size="lg"
                    onClick={handleUpdateCost}
                  >
                    <IconCash size={20} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            )}
          </Group>
        </Box>

        {/* Content */}
        <Box px={{ base: 8, md: 28 }} pb={32}>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="lg" withBorder>
                <Title order={4} mb="md">
                  Thông tin cơ bản
                </Title>
                <Divider mb="md" />
                <Stack gap="md">
                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Tên khách hàng
                    </Text>
                    <Text fw={500}>{funnel.name}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Số điện thoại chính
                    </Text>
                    <Text>{funnel.phoneNumber || "N/A"}</Text>
                  </div>
                  {funnel.secondaryPhoneNumbers &&
                    funnel.secondaryPhoneNumbers.length > 0 && (
                      <div>
                        <Text size="sm" c="dimmed" mb={4}>
                          Số điện thoại phụ
                        </Text>
                        <Stack gap={4}>
                          {funnel.secondaryPhoneNumbers.map((phone, idx) => (
                            <Text key={idx}>{phone}</Text>
                          ))}
                        </Stack>
                      </div>
                    )}
                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Địa chỉ
                    </Text>
                    <Text>{funnel.address || "N/A"}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Tỉnh/Thành phố
                    </Text>
                    <Text>{funnel.province?.name || "N/A"}</Text>
                  </div>
                </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="lg" withBorder>
                <Title order={4} mb="md">
                  Thông tin bán hàng
                </Title>
                <Divider mb="md" />
                <Stack gap="md">
                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Giai đoạn
                    </Text>
                    <Badge color={STAGE_BADGE_COLOR[funnel.stage]} size="lg">
                      {STAGE_LABEL[funnel.stage]}
                    </Badge>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Kênh
                    </Text>
                    <Text>{funnel.channel?.channelName || "N/A"}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Nhân viên phụ trách
                    </Text>
                    <Text>{funnel.user?.name || "N/A"}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Đã mua hàng
                    </Text>
                    <Badge color={funnel.hasBuyed ? "green" : "gray"}>
                      {funnel.hasBuyed ? "Có" : "Chưa"}
                    </Badge>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Chi phí marketing
                    </Text>
                    <Text fw={500}>
                      {funnel.cost
                        ? `${funnel.cost.toLocaleString("vi-VN")}đ`
                        : "N/A"}
                    </Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Ngày tạo
                    </Text>
                    <Text>
                      {format(new Date(funnel.createdAt), "dd/MM/yyyy HH:mm")}
                    </Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Cập nhật lần cuối
                    </Text>
                    <Text>
                      {format(new Date(funnel.updatedAt), "dd/MM/yyyy HH:mm")}
                    </Text>
                  </div>
                </Stack>
              </Paper>
            </Grid.Col>

            {/* Activities History */}
            <Grid.Col span={12}>
              <Paper p="lg" withBorder>
                <Group justify="space-between" mb="md">
                  <Title order={4}>Hoạt động chăm sóc</Title>
                  <Group>
                    {activitiesData?.data?.data && (
                      <Badge size="lg" variant="light" color="blue">
                        {Array.isArray(activitiesData.data.data)
                          ? activitiesData.data.data.length
                          : 0}{" "}
                        hoạt động
                      </Badge>
                    )}
                    <ActionIcon
                      variant="filled"
                      color="blue"
                      size="lg"
                      onClick={() => setActivitiesDrawerOpen(true)}
                    >
                      <IconPlus size={18} />
                    </ActionIcon>
                  </Group>
                </Group>
                <Divider mb="md" />
                {isLoadingActivities ? (
                  <Text c="dimmed">Đang tải...</Text>
                ) : !activitiesData?.data?.data ||
                  (Array.isArray(activitiesData.data.data) &&
                    activitiesData.data.data.length === 0) ? (
                  <Box py="xl">
                    <Text c="dimmed" ta="center">
                      Chưa có hoạt động chăm sóc nào
                    </Text>
                  </Box>
                ) : (
                  <Stack gap="md">
                    {Array.isArray(activitiesData.data.data) &&
                      activitiesData.data.data.map((activity: any) => (
                        <Box
                          key={activity._id}
                          p="md"
                          style={{
                            border: "1px solid #e9ecef",
                            borderRadius: "8px",
                            backgroundColor: "#f8f9fa"
                          }}
                        >
                          <Group justify="space-between" mb="xs">
                            <Badge
                              color="blue"
                              variant="light"
                              leftSection={
                                activity.type === "call" ? (
                                  <IconPhone size={14} />
                                ) : activity.type === "message" ? (
                                  <IconMessage size={14} />
                                ) : (
                                  <IconDots size={14} />
                                )
                              }
                            >
                              {activity.type === "call"
                                ? "Gọi điện"
                                : activity.type === "message"
                                  ? "Tin nhắn"
                                  : "Khác"}
                            </Badge>
                            <Text size="xs" c="dimmed">
                              {format(
                                new Date(activity.time),
                                "dd/MM/yyyy HH:mm"
                              )}
                            </Text>
                          </Group>
                          {activity.note && (
                            <Text size="sm">{activity.note}</Text>
                          )}
                        </Box>
                      ))}
                  </Stack>
                )}
                {activitiesData?.data?.total &&
                  activitiesData.data.total > activitiesLimit && (
                    <Group justify="center" mt="lg">
                      <Pagination
                        total={Math.ceil(
                          activitiesData.data.total / activitiesLimit
                        )}
                        value={activitiesPage}
                        onChange={setActivitiesPage}
                        size="sm"
                      />
                    </Group>
                  )}
              </Paper>
            </Grid.Col>

            {/* Order History */}
            <Grid.Col span={12}>
              <Paper p="lg" withBorder>
                <Group justify="space-between" mb="md">
                  <Title order={4}>Lịch sử mua hàng</Title>
                  <Group>
                    <Text>
                      {daysSinceLastPurchase
                        ? `Phát sinh đơn cuối từ: ${daysSinceLastPurchase} ngày trước`
                        : "Chưa có đơn hàng nào"}
                    </Text>
                    {orderHistoryData.length > 0 && (
                      <Badge size="lg" variant="light" color="blue">
                        {orderHistoryData.length} đơn hàng
                      </Badge>
                    )}
                  </Group>
                </Group>
                <Divider mb="md" />
                {isLoadingOrders ? (
                  <Text c="dimmed">Đang tải...</Text>
                ) : orderHistoryData.length === 0 ? (
                  <Box py="xl">
                    <Text c="dimmed" ta="center">
                      Chưa có đơn hàng nào
                    </Text>
                  </Box>
                ) : (
                  <CDataTable
                    columns={orderColumns}
                    data={orderHistoryData}
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

      {/* Activities Drawer */}
      <SalesActivitiesDrawer
        opened={activitiesDrawerOpen}
        onClose={() => setActivitiesDrawerOpen(false)}
        funnelId={funnelId}
        funnelName={funnel?.name || ""}
      />
    </SalesLayout>
  )
}
