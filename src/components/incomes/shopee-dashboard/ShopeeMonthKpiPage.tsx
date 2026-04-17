import { useCallback, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  Alert,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Select,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  ActionIcon,
  rem
} from "@mantine/core"
import {
  IconAlertCircle,
  IconBuildingStore,
  IconChartBar,
  IconCash,
  IconEdit,
  IconPlus,
  IconRefresh,
  IconTargetArrow,
  IconTrash
} from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import type { ColumnDef } from "@tanstack/react-table"
import { SHOPEE_EDITOR_ROLES, SHOPEE_NAVS, SHOPEE_ROLES } from "../../../constants/navs"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import type { ShopeeMonthKpiRecord } from "../../../hooks/models"
import { useShopeeChannels } from "../../../hooks/useShopeeChannels"
import { useShopeeMonthKpis } from "../../../hooks/useShopeeMonthKpis"
import { useUsers } from "../../../hooks/useUsers"
import { AppLayout } from "../../layouts/AppLayout"
import { CDataTable } from "../../common/CDataTable"
import { CToast } from "../../common/CToast"
import { MetricStatCard } from "../analytics/MetricStatCard"
import { formatCurrency } from "../analytics/formatters"
import { ShopeeMonthKpiModal } from "./ShopeeMonthKpiModal"

export interface ShopeeMonthKpiSearchState {
  page: number
  limit: number
  month: string
  year: string
  channel?: string
}

interface ShopeeMonthKpiPageProps {
  search: ShopeeMonthKpiSearchState
  onSearchChange: (
    nextSearch: Partial<ShopeeMonthKpiSearchState>,
    replace?: boolean
  ) => void
}

const formatRoas = (value: number) => {
  return value.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

const getChannelId = (channel: ShopeeMonthKpiRecord["channel"]) => {
  return typeof channel === "string" ? channel : channel._id
}

const getChannelName = (channel: ShopeeMonthKpiRecord["channel"]) => {
  return typeof channel === "string" ? channel : channel.name
}

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data &&
    "message" in error.response.data
  ) {
    const message = error.response.data.message

    if (typeof message === "string" && message.trim()) return message
    if (Array.isArray(message)) return message.join(", ")
  }

  if (error instanceof Error && error.message) return error.message
  return "Vui lòng thử lại sau"
}

const createResponsiveGridStyle = (minColumnWidth: number) => ({
  display: "grid",
  gap: rem(16),
  gridTemplateColumns: `repeat(auto-fit, minmax(min(${rem(minColumnWidth)}, 100%), 1fr))`
})

const SummaryCardsSkeleton = () => (
  <Box style={createResponsiveGridStyle(220)}>
    {Array.from({ length: 4 }).map((_, index) => (
      <Skeleton key={index} height={154} radius="xl" />
    ))}
  </Box>
)

export const ShopeeMonthKpiPage = ({
  search,
  onSearchChange
}: ShopeeMonthKpiPageProps) => {
  useAuthGuard(SHOPEE_ROLES)
  const { getMe } = useUsers()
  const { data: meData } = useQuery({
    queryKey: ["getMe"],
    queryFn: getMe,
    select: (data) => data.data
  })
  const canMutateShopeeKpi = Boolean(
    meData?.roles?.some((role) => SHOPEE_EDITOR_ROLES.includes(role))
  )

  const { getShopeeMonthKpis, deleteShopeeMonthKpi } = useShopeeMonthKpis()
  const channelsQuery = useShopeeChannels({ page: 1, limit: 999 })
  const selectedMonth = Number(search.month)
  const selectedYear = Number(search.year)

  const {
    data: kpisData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: [
      "shopeeMonthKpis",
      search.page,
      search.limit,
      search.month,
      search.year,
      search.channel
    ],
    queryFn: () =>
      getShopeeMonthKpis({
        page: search.page,
        limit: search.limit,
        month: selectedMonth,
        year: selectedYear,
        channel: search.channel || undefined
      }),
    select: (response) => response.data
  })

  const {
    data: allKpisData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary
  } = useQuery({
    queryKey: ["shopeeMonthKpisSummary", search.month, search.year, search.channel],
    queryFn: () =>
      getShopeeMonthKpis({
        page: 1,
        limit: 999,
        month: selectedMonth,
        year: selectedYear,
        channel: search.channel || undefined
      }),
    select: (response) => response.data.data
  })

  const deleteMutation = useMutation({
    mutationFn: deleteShopeeMonthKpi,
    onSuccess: () => {
      CToast.success({ title: "Xóa KPI Shopee thành công" })
      void Promise.all([refetch(), refetchSummary()])
    },
    onError: (error) => {
      CToast.error({
        title: "Xóa KPI Shopee thất bại",
        subtitle: getErrorMessage(error)
      })
    }
  })

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        value: String(index + 1),
        label: `Tháng ${index + 1}`
      })),
    []
  )

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()

    return Array.from({ length: 5 }, (_, index) => ({
      value: String(currentYear - 2 + index),
      label: String(currentYear - 2 + index)
    }))
  }, [])

  const channelOptions = useMemo(() => {
    const channels = channelsQuery.data?.channels ?? []

    return [
      {
        value: "",
        label: "Tất cả kênh Shopee"
      },
      ...channels.map((channel) => ({
        value: channel._id,
        label: channel.name
      }))
    ]
  }, [channelsQuery.data?.channels])

  const openKpiModal = useCallback(
    (kpi?: ShopeeMonthKpiRecord) => {
      modals.open({
        title: <b>{kpi ? "Chỉnh sửa KPI Shopee" : "Tạo KPI Shopee"}</b>,
        size: "lg",
        children: (
          <ShopeeMonthKpiModal
            kpi={kpi}
            channels={channelsQuery.data?.channels ?? []}
            onSuccess={() => {
              void Promise.all([refetch(), refetchSummary()])
              modals.closeAll()
            }}
            defaultValues={{
              month: selectedMonth,
              year: selectedYear,
              channel: search.channel
            }}
          />
        )
      })
    },
    [channelsQuery.data?.channels, refetch, refetchSummary, search.channel, selectedMonth, selectedYear]
  )

  const confirmDelete = useCallback(
    (kpi: ShopeeMonthKpiRecord) => {
      modals.openConfirmModal({
        title: "Xác nhận xóa KPI Shopee",
        children: (
          <Text size="sm">
            Bạn có chắc chắn muốn xóa KPI tháng {kpi.month}/{kpi.year} của shop{" "}
            {getChannelName(kpi.channel)}?
          </Text>
        ),
        labels: { confirm: "Xóa", cancel: "Hủy" },
        confirmProps: { color: "red" },
        onConfirm: () => deleteMutation.mutate({ id: kpi._id })
      })
    },
    [deleteMutation]
  )

  const kpiRows = kpisData?.data ?? []
  const allKpis = allKpisData ?? []

  const summary = useMemo(() => {
    const totals = allKpis.reduce(
      (acc, item) => {
        acc.revenueKpi += item.revenueKpi
        acc.adsCostKpi += item.adsCostKpi
        return acc
      },
      {
        revenueKpi: 0,
        adsCostKpi: 0
      }
    )

    return {
      revenueKpi: totals.revenueKpi,
      adsCostKpi: totals.adsCostKpi,
      roasKpi:
        totals.adsCostKpi > 0 ? totals.revenueKpi / totals.adsCostKpi : 0,
      shopCount: allKpis.length
    }
  }, [allKpis])

  const handleRefresh = useCallback(() => {
    void Promise.all([refetch(), refetchSummary(), channelsQuery.refetch()])
  }, [channelsQuery, refetch, refetchSummary])

  const columns = useMemo<ColumnDef<ShopeeMonthKpiRecord>[]>(
    () => [
      {
        accessorKey: "month",
        header: "Tháng",
        cell: ({ row }) => `Tháng ${row.original.month}`
      },
      {
        accessorKey: "year",
        header: "Năm"
      },
      {
        id: "channel",
        header: "Shop Shopee",
        cell: ({ row }) => getChannelName(row.original.channel)
      },
      {
        accessorKey: "revenueKpi",
        header: "KPI doanh thu",
        cell: ({ row }) => formatCurrency(row.original.revenueKpi)
      },
      {
        accessorKey: "adsCostKpi",
        header: "KPI ads",
        cell: ({ row }) => formatCurrency(row.original.adsCostKpi)
      },
      {
        accessorKey: "roasKpi",
        header: "KPI ROAS",
        cell: ({ row }) => formatRoas(row.original.roasKpi)
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Group gap="xs" justify="flex-end" wrap="nowrap">
            <Tooltip
              label={
                canMutateShopeeKpi
                  ? "Chỉnh sửa KPI"
                  : "Bạn chỉ có quyền xem dữ liệu Shopee"
              }
            >
              <ActionIcon
                variant="light"
                color="blue"
                onClick={(event) => {
                  event.stopPropagation()
                  if (!canMutateShopeeKpi) return
                  openKpiModal(row.original)
                }}
                disabled={channelsQuery.isLoading || !canMutateShopeeKpi}
              >
                <IconEdit size={16} />
              </ActionIcon>
            </Tooltip>

            <Tooltip
              label={
                canMutateShopeeKpi
                  ? "Xóa KPI"
                  : "Bạn chỉ có quyền xem dữ liệu Shopee"
              }
            >
              <ActionIcon
                variant="light"
                color="red"
                onClick={(event) => {
                  event.stopPropagation()
                  if (!canMutateShopeeKpi) return
                  confirmDelete(row.original)
                }}
                loading={deleteMutation.isPending}
                disabled={!canMutateShopeeKpi}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        ),
        size: 88
      }
    ],
    [
      canMutateShopeeKpi,
      channelsQuery.isLoading,
      confirmDelete,
      deleteMutation.isPending,
      openKpiModal
    ]
  )

  const totalPages = Math.max(1, Math.ceil((kpisData?.total ?? 0) / search.limit))

  return (
    <>
      <Helmet>
        <title>KPI Shopee | MyCandy</title>
      </Helmet>

      <AppLayout navs={SHOPEE_NAVS}>
        <Stack mt={40} gap="xl">
          {isError && !kpisData ? (
            <Alert
              color="red"
              variant="light"
              radius="lg"
              icon={<IconAlertCircle size={18} />}
            >
              <Group justify="space-between" align="flex-start" gap="md">
                <div>
                  <Text fw={700}>Không tải được KPI Shopee</Text>
                  <Text size="sm" mt={4}>
                    Hệ thống chưa lấy được danh sách KPI. Thử tải lại để đồng
                    bộ dữ liệu.
                  </Text>
                </div>

                <Button
                  variant="white"
                  color="red"
                  leftSection={<IconRefresh size={16} />}
                  onClick={handleRefresh}
                >
                  Thử lại
                </Button>
              </Group>
            </Alert>
          ) : null}

          <Paper
            withBorder
            radius={24}
            p="lg"
            style={{
              borderColor: "#dbe4f0",
              background: "#ffffff",
              boxShadow: "0 12px 34px rgba(15, 23, 42, 0.05)"
            }}
          >
            <Stack gap="md">
              <Group justify="space-between" align="flex-start" gap="md">
                <div>
                  <Text fz="sm" fw={600} c="#475569">
                    Bộ lọc dữ liệu
                  </Text>
                  <Text fw={700} fz="xl" mt={4} c="#0f172a">
                    Chọn tháng KPI cần theo dõi
                  </Text>
                </div>

                <Badge variant="light" color="orange" radius="xl" size="lg">
                  Bộ lọc tháng là bắt buộc
                </Badge>
              </Group>

              <Group justify="space-between" align="end" gap="md" wrap="wrap">
                <Group gap="md" align="end" wrap="wrap">
                  <Select
                    label="Tháng"
                    data={monthOptions}
                    value={search.month}
                    onChange={(value) => {
                      if (!value) return
                      onSearchChange({ month: value, page: 1 }, true)
                    }}
                    withAsterisk
                    style={{ width: 140 }}
                  />

                  <Select
                    label="Năm"
                    data={yearOptions}
                    value={search.year}
                    onChange={(value) => {
                      if (!value) return
                      onSearchChange({ year: value, page: 1 }, true)
                    }}
                    style={{ width: 140 }}
                  />

                  <Select
                    label="Shop Shopee"
                    placeholder="Tất cả shop Shopee"
                    data={channelOptions}
                    value={search.channel ?? null}
                    onChange={(value) =>
                      onSearchChange(
                        {
                          channel: value || undefined,
                          page: 1
                        },
                        true
                      )
                    }
                    clearable
                    searchable
                    style={{ width: 320 }}
                  />
                </Group>

                <Group gap="sm" align="center">
                  <Button
                    variant="light"
                    color="gray"
                    leftSection={<IconRefresh size={16} />}
                    onClick={handleRefresh}
                  >
                    Làm mới
                  </Button>

                  <Tooltip
                    label={
                      canMutateShopeeKpi
                        ? "Tạo KPI Shopee"
                        : "Bạn chỉ có quyền xem dữ liệu Shopee"
                    }
                  >
                    <Button
                      leftSection={<IconPlus size={16} />}
                      onClick={() => {
                        if (!canMutateShopeeKpi) return
                        openKpiModal()
                      }}
                      disabled={
                        channelsQuery.isLoading ||
                        !channelsQuery.data?.channels.length ||
                        !canMutateShopeeKpi
                      }
                    >
                      Tạo KPI
                    </Button>
                  </Tooltip>
                </Group>
              </Group>
            </Stack>
          </Paper>

          {isSummaryLoading && !allKpisData ? (
            <SummaryCardsSkeleton />
          ) : (
            <Box style={createResponsiveGridStyle(220)}>
              <MetricStatCard
                label="Tổng KPI doanh thu"
                value={formatCurrency(summary.revenueKpi)}
                tone="blue"
                icon={<IconCash size={20} />}
                hint="Cộng gộp KPI doanh thu của toàn bộ shop theo bộ lọc hiện tại."
              />
              <MetricStatCard
                label="Tổng KPI ads"
                value={formatCurrency(summary.adsCostKpi)}
                tone="orange"
                icon={<IconChartBar size={20} />}
                hint="Tổng ngân sách ads mục tiêu của các shop trong tháng đã chọn."
              />
              <MetricStatCard
                label="ROAS mục tiêu tổng hợp"
                value={formatRoas(summary.roasKpi)}
                tone="grape"
                icon={<IconTargetArrow size={20} />}
                hint="Tính theo tổng KPI doanh thu chia cho tổng KPI ads, không cộng dồn ROAS từng shop."
              />
              <MetricStatCard
                label="Số shop có KPI"
                value={summary.shopCount.toLocaleString("vi-VN")}
                tone="teal"
                icon={<IconBuildingStore size={20} />}
                hint="Số lượng shop Shopee đang có KPI trong kỳ lọc hiện tại."
              />
            </Box>
          )}

          <Paper
            withBorder
            radius={24}
            p="lg"
            style={{
              borderColor: "#dbe4f0",
              background: "#ffffff",
              boxShadow: "0 12px 34px rgba(15, 23, 42, 0.05)"
            }}
          >
            <Stack gap="md">
              <div>
                <Text fz="sm" fw={600} c="#475569">
                  Bảng chi tiết
                </Text>
                <Text fw={700} fz="xl" mt={4} c="#0f172a">
                  Danh sách KPI theo từng shop
                </Text>
              </div>

              <CDataTable
                columns={columns}
                data={kpiRows}
                page={search.page}
                totalPages={totalPages}
                onPageChange={(page) => onSearchChange({ page }, true)}
                onPageSizeChange={(limit) =>
                  onSearchChange({ limit, page: 1 }, true)
                }
                initialPageSize={search.limit}
                pageSizeOptions={[10, 20, 50]}
                hideSearch
                isLoading={isLoading}
                getRowId={(row) => row._id}
                getRowClassName={(row) =>
                  row.original.channel &&
                  search.channel &&
                  getChannelId(row.original.channel) === search.channel
                    ? "bg-blue-50/40"
                    : ""
                }
              />
            </Stack>
          </Paper>
        </Stack>
      </AppLayout>
    </>
  )
}
