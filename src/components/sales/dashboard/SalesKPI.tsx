import {
  Box,
  rem,
  Text,
  Button,
  Select,
  ActionIcon,
  Tooltip
} from "@mantine/core"
import { useSalesDailyReports } from "../../../hooks/useSalesDailyReports"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useSalesChannels } from "../../../hooks/useSalesChannels"
import { CDataTable } from "../../common/CDataTable"
import { ColumnDef } from "@tanstack/react-table"
import { IconPlus, IconEdit } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { SalesKPIModal } from "./SalesKPIModal"

interface KpiData {
  _id: string
  month: number
  year: number
  channel: {
    _id: string
    channelName: string
    phoneNumber: string
  }
  kpi: number
}

export const SalesKPI = () => {
  const navigate = useNavigate()
  const search = useSearch({ from: "/sales/daily-reports/" })
  const { getMonthKpis } = useSalesDailyReports()
  const { searchSalesChannels } = useSalesChannels()

  const page = search.kpiPage || 1
  const limit = search.kpiLimit || 10
  const monthFilter = search.kpiMonth || ""
  const yearFilter = search.kpiYear || ""
  const channelFilter = search.kpiChannelId || ""

  const {
    data: kpisData,
    refetch,
    isLoading
  } = useQuery({
    queryKey: [
      "getMonthKpis",
      page,
      limit,
      monthFilter,
      yearFilter,
      channelFilter
    ],
    queryFn: () =>
      getMonthKpis({
        page,
        limit,
        month: monthFilter ? Number(monthFilter) : undefined,
        year: yearFilter ? Number(yearFilter) : undefined,
        channelId: channelFilter || undefined
      }),
    select: (data) => data.data
  })

  const { data: channelsData } = useQuery({
    queryKey: ["salesChannels", "all"],
    queryFn: () => searchSalesChannels({ page: 1, limit: 999 })
  })

  const currentYear = new Date().getFullYear()
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `Tháng ${i + 1}`
  }))

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i)
  }))

  const channelOptions = useMemo(() => {
    if (!channelsData?.data.data) return []
    return channelsData.data.data.map((channel) => ({
      value: channel._id,
      label: channel.channelName
    }))
  }, [channelsData])

  const openKPIModal = (kpi?: KpiData) => {
    modals.open({
      title: kpi ? "Chỉnh sửa KPI" : "Tạo KPI mới",
      size: "md",
      children: (
        <SalesKPIModal
          kpi={kpi}
          channels={channelsData?.data.data || []}
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      )
    })
  }

  const columns: ColumnDef<KpiData>[] = [
    {
      accessorKey: "month",
      header: "Tháng",
      cell: ({ row }) => `Tháng ${row.original.month}`
    },
    {
      accessorKey: "year",
      header: "Năm",
      cell: ({ row }) => row.original.year
    },
    {
      accessorKey: "channel",
      header: "Kênh",
      cell: ({ row }) => {
        return row.original.channel.channelName
      }
    },
    {
      accessorKey: "kpi",
      header: "KPI",
      cell: ({ row }) => {
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND"
        }).format(row.original.kpi)
      }
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Tooltip label="Chỉnh sửa">
          <ActionIcon
            variant="light"
            color="blue"
            onClick={(e) => {
              e.stopPropagation()
              openKPIModal(row.original)
            }}
          >
            <IconEdit size={16} />
          </ActionIcon>
        </Tooltip>
      ),
      size: 60
    }
  ]

  return (
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
          KPI Sales
        </Text>
      </Box>

      <Box px={{ base: 4, md: 28 }} pb={20}>
        <CDataTable
          columns={columns}
          data={kpisData?.data || []}
          page={page}
          totalPages={Math.ceil((kpisData?.total || 0) / limit)}
          onPageChange={(newPage) => {
            navigate({
              to: "/sales/daily-reports",
              search: {
                ...search,
                kpiPage: newPage
              },
              replace: true
            })
          }}
          onPageSizeChange={(newLimit) => {
            navigate({
              to: "/sales/daily-reports",
              search: {
                ...search,
                kpiLimit: newLimit,
                kpiPage: 1
              },
              replace: true
            })
          }}
          initialPageSize={limit}
          pageSizeOptions={[10, 20, 50]}
          hideSearch
          isLoading={isLoading}
          onRowClick={(row) => {
            navigate({ to: `/sales/dashboard/kpi/${row.original._id}` })
          }}
          extraFilters={
            <>
              <Select
                label="Tháng"
                placeholder="Tất cả tháng"
                data={monthOptions}
                value={monthFilter || null}
                onChange={(value) => {
                  navigate({
                    to: "/sales/daily-reports",
                    search: {
                      ...search,
                      kpiMonth: value || undefined,
                      kpiPage: 1
                    },
                    replace: true
                  })
                }}
                clearable
                style={{ width: 140 }}
              />
              <Select
                label="Năm"
                placeholder="Tất cả năm"
                data={yearOptions}
                value={yearFilter || null}
                onChange={(value) => {
                  navigate({
                    to: "/sales/daily-reports",
                    search: {
                      ...search,
                      kpiYear: value || undefined,
                      kpiPage: 1
                    },
                    replace: true
                  })
                }}
                clearable
                style={{ width: 140 }}
              />
              <Select
                label="Kênh"
                placeholder="Tất cả kênh"
                data={channelOptions}
                value={channelFilter || null}
                onChange={(value) => {
                  navigate({
                    to: "/sales/daily-reports",
                    search: {
                      ...search,
                      kpiChannelId: value || undefined,
                      kpiPage: 1
                    },
                    replace: true
                  })
                }}
                clearable
                searchable
                style={{ width: 250 }}
              />
            </>
          }
          extraActions={
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => openKPIModal()}
            >
              Tạo KPI
            </Button>
          }
        />
      </Box>
    </Box>
  )
}
