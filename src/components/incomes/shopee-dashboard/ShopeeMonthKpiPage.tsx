import { useCallback, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  Alert,
  Box,
  Button,
  Group,
  Select,
  Text,
  Tooltip,
  ActionIcon,
  rem
} from "@mantine/core"
import {
  IconAlertCircle,
  IconEdit,
  IconPlus,
  IconRefresh,
  IconTrash
} from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import type { ColumnDef } from "@tanstack/react-table"
import { SHOPEE_EDITOR_ROLES, SHOPEE_NAVS, SHOPEE_ROLES } from "../../../constants/navs"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { useMe } from "../../../context/MeContext"
import type { ShopeeMonthKpiRecord } from "../../../hooks/models"
import { useShopeeChannels } from "../../../hooks/useShopeeChannels"
import { useShopeeMonthKpis } from "../../../hooks/useShopeeMonthKpis"
import { AppLayout } from "../../layouts/AppLayout"
import { CDataTable } from "../../common/CDataTable"
import { CToast } from "../../common/CToast"
import { formatCurrency } from "../analytics/formatters"
import { ShopeeMonthKpiModal } from "./ShopeeMonthKpiModal"

export interface ShopeeMonthKpiSearchState {
  page: number
  limit: number
  month?: string
  year?: string
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

export const ShopeeMonthKpiPage = ({
  search,
  onSearchChange
}: ShopeeMonthKpiPageProps) => {
  useAuthGuard(SHOPEE_ROLES)
  const me = useMe()
  const canMutateShopeeKpi = Boolean(
    me?.roles?.some((role) => SHOPEE_EDITOR_ROLES.includes(role))
  )

  const { getShopeeMonthKpis, deleteShopeeMonthKpi } = useShopeeMonthKpis()
  const channelsQuery = useShopeeChannels({ page: 1, limit: 999 })

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
        month: search.month ? Number(search.month) : undefined,
        year: search.year ? Number(search.year) : undefined,
        channel: search.channel || undefined
      }),
    select: (response) => response.data
  })

  const deleteMutation = useMutation({
    mutationFn: deleteShopeeMonthKpi,
    onSuccess: () => {
      CToast.success({ title: "Xóa KPI Shopee thành công" })
      refetch()
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
              refetch()
              modals.closeAll()
            }}
          />
        )
      })
    },
    [channelsQuery.data?.channels, refetch]
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
          <Box pt={32} pb={16} px={{ base: 8, md: 28 }}>
            <Text fw={700} fz="xl" mb={2}>
              KPI Shopee theo tháng
            </Text>
            <Text c="dimmed" fz="sm">
              Quản lý KPI doanh thu, KPI chi phí ads và KPI ROAS theo từng shop
              Shopee.
            </Text>
          </Box>

          <Box px={{ base: 4, md: 28 }} pb={20}>
            {isError && !kpisData ? (
              <Alert
                mb="md"
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
                    onClick={() => {
                      void Promise.all([refetch(), channelsQuery.refetch()])
                    }}
                  >
                    Thử lại
                  </Button>
                </Group>
              </Alert>
            ) : null}

            <CDataTable
              columns={columns}
              data={kpisData?.data ?? []}
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
              extraFilters={
                <>
                  <Select
                    label="Tháng"
                    placeholder="Tất cả tháng"
                    data={monthOptions}
                    value={search.month ?? null}
                    onChange={(value) =>
                      onSearchChange(
                        {
                          month: value || undefined,
                          page: 1
                        },
                        true
                      )
                    }
                    clearable
                    style={{ width: 140 }}
                  />

                  <Select
                    label="Năm"
                    placeholder="Tất cả năm"
                    data={yearOptions}
                    value={search.year ?? null}
                    onChange={(value) =>
                      onSearchChange(
                        {
                          year: value || undefined,
                          page: 1
                        },
                        true
                      )
                    }
                    clearable
                    style={{ width: 140 }}
                  />

                  <Select
                    label="Shop Shopee"
                    placeholder="Tất cả kênh Shopee"
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
                    style={{ width: 280 }}
                  />
                </>
              }
              extraActions={
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
              }
              getRowClassName={(row) =>
                row.original.channel &&
                search.channel &&
                getChannelId(row.original.channel) === search.channel
                  ? "bg-blue-50/40"
                  : ""
              }
            />
          </Box>
        </Box>
      </AppLayout>
    </>
  )
}
