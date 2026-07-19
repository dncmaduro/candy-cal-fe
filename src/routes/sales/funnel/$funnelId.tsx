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
  Button,
  Skeleton,
  SimpleGrid
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useQuery, useMutation } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  IconArrowLeft,
  IconEdit,
  IconProgress,
  IconCash,
  IconArrowRight,
  IconEye,
  IconPhone,
  IconTrash,
  IconChevronDown,
  IconChevronUp,
  IconClipboardCheck,
  IconRepeat
} from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { notifications } from "@mantine/notifications"
import { useMemo, useEffect, useState, type ReactNode } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { useSalesFunnel } from "../../../hooks/useSalesFunnel"
import { useSalesOrders } from "../../../hooks/useSalesOrders"
import {
  getSalesOrderStatusColor,
  getSalesOrderStatusLabel
} from "../../../utils/salesOrderStatus"
import { useUsers } from "../../../hooks/useUsers"
import { UpdateFunnelInfoModal } from "../../../components/sales/UpdateFunnelInfoModal"
import { UpdateStageModal } from "../../../components/sales/UpdateStageModal"
import { UpdateFunnelCostModal } from "../../../components/sales/UpdateFunnelCostModal"
import { MoveToContactedModal } from "../../../components/sales/MoveToContactedModal"
import { LogSalesLeadCallModal } from "../../../components/sales/LogSalesLeadCallModal"
import { TransferSalesLeadModal } from "../../../components/sales/TransferSalesLeadModal"
import { CDataTable } from "../../../components/common/CDataTable"
import { useSalesLeads } from "../../../hooks/useSalesLeads"

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

const CALL_OUTCOME_LABEL: Record<string, string> = {
  no_answer: "Không nghe máy",
  not_interested: "Không quan tâm",
  call_back: "Hẹn gọi lại",
  considering: "Đang cân nhắc",
  closed: "Đã chốt",
  wrong_number: "Sai số",
  other: "Khác"
}

type SalesLeadCaseWithCalls = {
  _id: string
  calls?: Array<Record<string, unknown>>
}

const LoadingField = ({
  label,
  width = "100%"
}: {
  label: string
  width?: string | number
}) => (
  <div>
    <Text size="sm" c="dimmed" mb={4}>
      {label}
    </Text>
    <Skeleton height={14} width={width} radius="xl" />
  </div>
)

const detailCardStyle = {
  border: "1px solid var(--mantine-color-gray-3)",
  borderRadius: rem(12),
  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.03)"
}

const infoCellStyle = {
  minWidth: 0,
  padding: rem(12),
  borderRadius: rem(10),
  background: "var(--mantine-color-gray-0)"
}

function DetailField({
  label,
  children
}: {
  label: string
  children: ReactNode
}) {
  return (
    <Box style={infoCellStyle}>
      <Text size="xs" c="dimmed" fw={500} mb={4}>
        {label}
      </Text>
      <Box style={{ minWidth: 0 }}>{children}</Box>
    </Box>
  )
}

function RouteComponent() {
  const { funnelId } = Route.useParams()
  const navigate = useNavigate()
  const { getFunnelById, checkPermissionOnFunnel, deleteFunnel } =
    useSalesFunnel()
  const { getOrdersByFunnel } = useSalesOrders()
  const { getMe } = useUsers()
  const { detailByFunnel } = useSalesLeads()

  const [orderStartDate, setOrderStartDate] = useState<Date | null>(null)
  const [orderEndDate, setOrderEndDate] = useState<Date | null>(null)
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersLimit, setOrdersLimit] = useState(10)

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
    queryKey: [
      "funnelOrders",
      funnelId,
      ordersPage,
      ordersLimit,
      orderStartDate?.toISOString() ?? null,
      orderEndDate?.toISOString() ?? null
    ],
    queryFn: () =>
      getOrdersByFunnel(funnelId, {
        page: ordersPage,
        limit: ordersLimit,
        startDate: orderStartDate
          ? format(orderStartDate, "yyyy-MM-dd")
          : undefined,
        endDate: orderEndDate ? format(orderEndDate, "yyyy-MM-dd") : undefined
      }),
    enabled: !!funnelId && hasPermission
  })

  // The new sales flow records calls on the lead case, not legacy activities.
  const {
    data: leadCaseData,
    isLoading: isLoadingCalls,
    refetch: refetchCalls
  } = useQuery({
    queryKey: ["salesLead", "byFunnel", funnelId],
    queryFn: () => detailByFunnel(funnelId),
    select: (response) => response.data as SalesLeadCaseWithCalls | null,
    enabled: !!funnelId && hasPermission,
    retry: false
  })

  const funnel = data?.data
  const leadCase = leadCaseData
  const calls = Array.isArray(leadCase?.calls) ? leadCase.calls : []
  const me = meData?.data
  const isAdmin = me?.roles?.includes("admin") ?? false
  const isSalesHunter = me?.roles?.includes("sales-hunter") ?? false
  const isSalesCs = me?.roles?.includes("sales-cs") ?? false
  const canLogCalls = me?.roles?.includes("sales-cs") ?? false
  const isResponsibleUser = funnel?.user?._id === me?._id

  const canPerformActions = isAdmin || isResponsibleUser
  const canTransfer =
    !!leadCase?._id &&
    !funnel?.deletedAt &&
    (isSalesHunter || isAdmin || me?.roles?.includes("sales-leader") || (isSalesCs && isResponsibleUser))

  const goBackToFunnelList = () => {
    if (window.history.length > 1) {
      window.history.back()
      return
    }
    navigate({ to: "/sales/funnel" })
  }

  type OrderHistoryItem = {
    _id: string
    date: string
    total: number
    status: "draft" | "confirmed" | "official"
    shippingCode?: string
    itemCount: number
    items: {
      code: string
      name: string
      price: number
      quantity: number
    }[]
  }

  const orderColumns = useMemo<ColumnDef<OrderHistoryItem>[]>(
    () => [
      {
        id: "expander",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label={
              row.getIsExpanded() ? "Thu gọn đơn hàng" : "Mở rộng đơn hàng"
            }
            onClick={(event) => {
              event.stopPropagation()
              row.toggleExpanded()
            }}
          >
            {row.getIsExpanded() ? (
              <IconChevronUp size={18} />
            ) : (
              <IconChevronDown size={18} />
            )}
          </ActionIcon>
        )
      },
      {
        accessorKey: "date",
        header: "Ngày đặt hàng",
        cell: ({ row }) => format(new Date(row.original.date), "dd/MM/yyyy")
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge
            color={getSalesOrderStatusColor(row.original.status)}
            size="sm"
          >
            {getSalesOrderStatusLabel(row.original.status)}
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
      items: order.items
    }))
  }, [ordersData])

  const orderStatistics = ordersData?.data

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
            channel: funnel.channel?._id ?? "",
            hasBuyed: funnel.hasBuyed,
            funnelSource: funnel.funnelSource,
            fromSystem: funnel.fromSystem
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

  const handleLogCall = () => {
    if (!leadCase?._id) return
    modals.open({
      title: <b>Ghi nhận cuộc gọi</b>,
      centered: true,
      children: (
        <LogSalesLeadCallModal
          leadCaseId={leadCase._id as string}
          onSuccess={() => void refetchCalls()}
        />
      )
    })
  }

  const handleTransfer = () => {
    if (!leadCase?._id) return
    modals.open({
      title: <b>Chuyển khách hàng</b>,
      centered: true,
      children: (
        <TransferSalesLeadModal
          leadCaseId={leadCase._id}
          currentSalesCsId={funnel?.user?._id}
          onSuccess={() => {
            void refetch()
            void refetchCalls()
          }}
        />
      )
    })
  }

  const { mutate: handleDeleteFunnel, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteFunnel({ id }),
    onSuccess: () => {
      notifications.show({
        title: "Thành công",
        message: "Xóa funnel thành công",
        color: "green"
      })
      goBackToFunnelList()
    },
    onError: () => {
      notifications.show({
        title: "Lỗi",
        message: "Xóa funnel thất bại",
        color: "red"
      })
    }
  })

  const confirmDelete = () => {
    if (!funnel) return
    modals.openConfirmModal({
      title: <b>Xác nhận xóa</b>,
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa funnel <b>{funnel.name}</b> không? Hành động
          này không thể hoàn tác.
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => handleDeleteFunnel(funnel._id)
    })
  }

  if (isCheckingPermission || !funnel) {
    return (
      <SalesLayout>
        <Box p="xl" maw={1200} mx="auto">
          <Group mb="md">
            <Skeleton height={20} width={220} radius="xl" />
          </Group>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="lg" withBorder>
                <Title order={4} mb="md">
                  Thông tin khách hàng
                </Title>
                <Divider mb="md" />
                <Stack gap={12}>
                  <LoadingField label="Tên khách hàng" width="70%" />
                  <LoadingField label="Số điện thoại" width="55%" />
                  <LoadingField label="Địa chỉ" width="95%" />
                  <LoadingField label="Kênh bán hàng" width="60%" />
                </Stack>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="lg" withBorder>
                <Title order={4} mb="md">
                  Thông tin Funnel
                </Title>
                <Divider mb="md" />
                <Stack gap={12}>
                  <LoadingField label="Giai đoạn" width="40%" />
                  <LoadingField label="Người phụ trách" width="55%" />
                  <LoadingField label="Nguồn khách" width="45%" />
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Box>
      </SalesLayout>
    )
  }

  if (!hasPermission) {
    return null // Will redirect via useEffect
  }

  const mapFunnelSource = {
    ads: "Ads",
    seeding: "Seeding",
    referral: "Giới thiệu"
  }

  return (
    <SalesLayout>
      <Box
        maw={1360}
        mt={24}
        mx="auto"
        px={{ base: "sm", md: "lg" }}
        pb="xl"
        w="100%"
      >
        {/* Header Section */}
        <Group justify="space-between" align="center" mb="md" wrap="wrap">
          <Group gap="sm">
            <Tooltip label="Quay lại" withArrow>
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={goBackToFunnelList}
                aria-label="Quay lại danh sách funnel"
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
            </Tooltip>
            <Box>
              <Title order={2} c={funnel.deletedAt ? "red" : undefined}>
                Chi tiết Funnel{funnel.deletedAt && " (Đã xóa)"}
              </Title>
              <Text size="sm" c="dimmed">
                Mã funnel: {funnel._id}
              </Text>
            </Box>
          </Group>
          {(canPerformActions || canTransfer) && (
            <Group gap="xs" wrap="wrap">
              {canTransfer && (
                <Button
                  variant="light"
                  color="orange"
                  leftSection={<IconRepeat size={17} />}
                  onClick={handleTransfer}
                >
                  Chuyển khách
                </Button>
              )}
              {canPerformActions && !funnel.deletedAt && (
                <Button
                  variant="light"
                  leftSection={<IconEdit size={17} />}
                  onClick={handleUpdateInfo}
                >
                  Cập nhật
                </Button>
              )}
              {canPerformActions && <Group gap={6}>
                {funnel.stage === "lead" && !funnel.deletedAt && (
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
                {!funnel.deletedAt && (
                  <>
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
                  </>
                )}
              </Group>}
              {canPerformActions && (isAdmin || isSalesHunter) && (
                <Button
                  variant="light"
                  color="red"
                  leftSection={<IconTrash size={17} />}
                  onClick={confirmDelete}
                  loading={isDeleting}
                >
                  Xóa
                </Button>
              )}
            </Group>
          )}
        </Group>

        <Stack gap="lg">
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="lg" withBorder style={detailCardStyle}>
                <Title order={4} mb="lg">
                  Thông tin cơ bản
                </Title>
                <Grid gutter="sm">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <DetailField label="Tên khách hàng">
                      <Text fw={600}>{funnel.name}</Text>
                    </DetailField>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <DetailField label="Số điện thoại chính">
                      <Text fw={600}>{funnel.phoneNumber || "N/A"}</Text>
                    </DetailField>
                  </Grid.Col>
                  {funnel.secondaryPhoneNumbers &&
                    funnel.secondaryPhoneNumbers.length > 0 && (
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <DetailField label="Số điện thoại phụ">
                          <Stack gap={4}>
                            {funnel.secondaryPhoneNumbers.map((phone, idx) => (
                              <Text key={idx} size="sm">
                                {phone}
                              </Text>
                            ))}
                          </Stack>
                        </DetailField>
                      </Grid.Col>
                    )}
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <DetailField label="Tỉnh/Thành phố">
                      <Text>{funnel.province?.name || "N/A"}</Text>
                    </DetailField>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <DetailField label="Nguồn khách">
                      <Text>
                        {mapFunnelSource[funnel.funnelSource] || "N/A"}
                      </Text>
                    </DetailField>
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <DetailField label="Địa chỉ">
                      <Text style={{ overflowWrap: "anywhere" }}>
                        {funnel.address || "N/A"}
                      </Text>
                    </DetailField>
                  </Grid.Col>
                </Grid>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="lg" withBorder style={detailCardStyle}>
                <Title order={4} mb="lg">
                  Thông tin bán hàng
                </Title>
                <Grid gutter="sm">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <DetailField label="Giai đoạn">
                      <Badge color={STAGE_BADGE_COLOR[funnel.stage]} size="lg">
                        {STAGE_LABEL[funnel.stage]}
                      </Badge>
                    </DetailField>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <DetailField label="Kênh">
                      <Text fw={500}>
                        {funnel.channel?.channelName || "N/A"}
                      </Text>
                    </DetailField>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <DetailField label="Nhân viên phụ trách">
                      <Text fw={500}>{funnel.user?.name || "N/A"}</Text>
                    </DetailField>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <DetailField label="Loại khách hàng">
                      <Badge color={funnel.fromSystem ? "green" : "gray"}>
                        {funnel.fromSystem ? "Khách hàng cũ" : "Khách hàng mới"}
                      </Badge>
                    </DetailField>
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
                      <Box
                        p="md"
                        style={{
                          borderRadius: rem(10),
                          background: "var(--mantine-color-green-0)"
                        }}
                      >
                        <Text size="xs" c="green.8" fw={500} mb={4}>
                          Doanh thu tháng này
                        </Text>
                        <Text fw={700} size="xl" c="green.8">
                          {(funnel.monthlyRevenue || 0).toLocaleString("vi-VN")}
                          đ
                        </Text>
                      </Box>
                      <Box
                        p="md"
                        style={{
                          borderRadius: rem(10),
                          background: "var(--mantine-color-teal-0)"
                        }}
                      >
                        <Text size="xs" c="teal.8" fw={500} mb={4}>
                          Tổng doanh thu
                        </Text>
                        <Text fw={700} size="xl" c="teal.8">
                          {(funnel.totalRevenue || 0).toLocaleString("vi-VN")}đ
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Grid.Col>
                  {funnel.deletedAt && (
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <DetailField label="Đã xóa lúc">
                        <Text c="red" fw={500}>
                          {format(
                            new Date(funnel.deletedAt),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </Text>
                      </DetailField>
                    </Grid.Col>
                  )}
                </Grid>
              </Paper>
            </Grid.Col>

            {/* Call history for the new sales-lead flow */}
            <Grid.Col span={12}>
              <Paper p="lg" withBorder style={detailCardStyle}>
                <Group justify="space-between" mb="lg" wrap="wrap">
                  <Title order={4}>Lịch sử cuộc gọi</Title>
                  <Group gap="sm">
                    <Badge size="lg" variant="light" color="blue">
                      {calls.length} cuộc gọi
                    </Badge>
                    {leadCase?._id && canLogCalls && (
                      <Button
                        leftSection={<IconPhone size={17} />}
                        size="sm"
                        color="blue"
                        onClick={handleLogCall}
                      >
                        Ghi nhận cuộc gọi
                      </Button>
                    )}
                  </Group>
                </Group>
                {isLoadingCalls ? (
                  <Stack gap="xs">
                    <Skeleton height={12} width="100%" radius="xl" />
                    <Skeleton height={12} width="90%" radius="xl" />
                    <Skeleton height={12} width="95%" radius="xl" />
                  </Stack>
                ) : !leadCase ? (
                  <Text c="dimmed" size="sm">
                    Funnel này chưa thuộc luồng lead mới nên chưa có call log.
                  </Text>
                ) : calls.length === 0 ? (
                  <Box py="md">
                    <Stack align="center" gap="xs">
                      <Box
                        p="sm"
                        style={{
                          borderRadius: rem(999),
                          background: "var(--mantine-color-blue-0)"
                        }}
                      >
                        <IconClipboardCheck
                          size={22}
                          color="var(--mantine-color-blue-6)"
                        />
                      </Box>
                      <Text fw={500}>Chưa có cuộc gọi nào</Text>
                    </Stack>
                  </Box>
                ) : (
                  <Stack gap="sm">
                    {calls.map((call: any) => (
                        <Box
                          key={call._id}
                          p="sm"
                          style={{
                            border: "1px solid var(--mantine-color-gray-3)",
                            borderRadius: rem(10),
                            backgroundColor: "var(--mantine-color-gray-0)"
                          }}
                        >
                          <Group justify="space-between" mb="xs">
                            <Badge
                              color="green"
                              variant="light"
                              leftSection={<IconPhone size={14} />}
                            >
                              {CALL_OUTCOME_LABEL[call.outcome] || "Cuộc gọi"}
                            </Badge>
                            <Text size="xs" c="dimmed">
                              {format(
                                new Date(call.calledAt),
                                "dd/MM/yyyy HH:mm"
                              )}
                            </Text>
                          </Group>
                          {call.note && (
                            <Text size="sm">{call.note}</Text>
                          )}
                        </Box>
                      ))}
                  </Stack>
                )}
              </Paper>
            </Grid.Col>

            {/* Order History */}
            <Grid.Col span={12}>
              <Paper p="lg" withBorder style={detailCardStyle}>
                <Group justify="space-between" mb="lg">
                  <Title order={4}>Lịch sử mua hàng</Title>
                </Group>
                <Group align="end" mb="lg" gap="sm" wrap="wrap">
                  <DatePickerInput
                    label="Từ ngày"
                    placeholder="Từ ngày"
                    value={orderStartDate}
                    onChange={(value) => {
                      setOrderStartDate(value)
                      setOrdersPage(1)
                    }}
                    clearable
                    valueFormat="DD/MM/YYYY"
                    w={{ base: "100%", sm: 180 }}
                  />
                  <DatePickerInput
                    label="Đến ngày"
                    placeholder="Đến ngày"
                    value={orderEndDate}
                    onChange={(value) => {
                      setOrderEndDate(value)
                      setOrdersPage(1)
                    }}
                    clearable
                    valueFormat="DD/MM/YYYY"
                    w={{ base: "100%", sm: 180 }}
                  />
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mb="lg">
                  <Paper withBorder p="md" style={{ borderRadius: rem(10) }}>
                    <Text size="xs" c="dimmed">
                      Tổng doanh thu
                    </Text>
                    <Text fw={700} size="xl" c="green.7">
                      {(orderStatistics?.totalRevenue || 0).toLocaleString(
                        "vi-VN"
                      )}
                      đ
                    </Text>
                  </Paper>
                  <Paper withBorder p="md" style={{ borderRadius: rem(10) }}>
                    <Text size="xs" c="dimmed">
                      Tổng số đơn hàng
                    </Text>
                    <Text fw={700} size="xl">
                      {orderStatistics?.total || 0}
                    </Text>
                  </Paper>
                  <Paper withBorder p="md" style={{ borderRadius: rem(10) }}>
                    <Text size="xs" c="dimmed" mb={4}>
                      Top 3 mặt hàng
                    </Text>
                    <Stack gap={2}>
                      {orderStatistics?.topProducts?.length ? (
                        orderStatistics.topProducts.map((product, index) => (
                          <Text key={product.code} size="sm" lineClamp={1}>
                            {index + 1}. {product.name} × {product.quantity}
                          </Text>
                        ))
                      ) : (
                        <Text size="sm" c="dimmed">
                          —
                        </Text>
                      )}
                    </Stack>
                  </Paper>
                </SimpleGrid>
                {isLoadingOrders ? (
                  <Stack gap="xs">
                    <Skeleton height={12} width="100%" radius="xl" />
                    <Skeleton height={12} width="90%" radius="xl" />
                    <Skeleton height={12} width="95%" radius="xl" />
                  </Stack>
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
                    initialPageSize={ordersLimit}
                    page={ordersPage}
                    totalPages={Math.max(
                      1,
                      Math.ceil((orderStatistics?.total || 0) / ordersLimit)
                    )}
                    onPageChange={setOrdersPage}
                    onPageSizeChange={(pageSize) => {
                      setOrdersLimit(pageSize)
                      setOrdersPage(1)
                    }}
                    enableExpanding
                    renderRowSubComponent={({ row }) => (
                      <Box p="sm" bg="gray.0">
                        <Stack gap="xs">
                          {row.original.items.map((item) => (
                            <Group
                              key={item.code}
                              justify="space-between"
                              gap="sm"
                            >
                              <Group gap={6}>
                                <Text size="sm">{item.name}</Text>
                                <Text size="sm" c="dimmed">
                                  × {item.quantity}
                                </Text>
                              </Group>
                              <Text size="sm" fw={500}>
                                {(item.price * item.quantity).toLocaleString(
                                  "vi-VN"
                                )}
                                đ
                              </Text>
                            </Group>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  />
                )}
              </Paper>
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>

    </SalesLayout>
  )
}
