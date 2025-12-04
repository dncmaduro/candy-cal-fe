import { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"
import {
  Box,
  rem,
  Button,
  Select,
  Text,
  ActionIcon,
  Tooltip,
  Group
} from "@mantine/core"
import { IconTrash, IconReportAnalytics } from "@tabler/icons-react"
import { useUsers } from "../../../hooks/useUsers"
import { useSalesDailyReports } from "../../../hooks/useSalesDailyReports"
import { useSalesChannels } from "../../../hooks/useSalesChannels"
import { CToast } from "../../common/CToast"
import { modals } from "@mantine/modals"
import { CDataTable } from "../../common/CDataTable"
import { CreateSalesDailyReportModal } from "./CreateSalesDailyReportModal"
import { useNavigate } from "@tanstack/react-router"

type DailyReportItem = {
  _id: string
  date: string
  channel: string
  adsCost: number
  dateKpi: number
  revenue: number
  newFunnelRevenue: {
    ads: number
    other: number
  }
  returningFunnelRevenue: number
  newOrder: number
  returningOrder: number
  accumulatedRevenue: number
  accumulatedAdsCost: number
  accumulatedNewFunnelRevenue: {
    ads: number
    other: number
  }
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export const SalesDailyReports = () => {
  const { getSalesDailyReportsByMonth, deleteSalesDailyReport } =
    useSalesDailyReports()
  const { getMyChannel, searchSalesChannels } = useSalesChannels()
  const { getMe } = useUsers()
  const navigate = useNavigate()

  const currentDate = new Date()
  const [month, setMonth] = useState<string>(String(currentDate.getMonth() + 1))
  const [year, setYear] = useState<string>(String(currentDate.getFullYear()))
  const [channelId, setChannelId] = useState<string>("")
  const [showDeleted] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // Get user info
  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: getMe
  })

  // Get my channel for sales-emp
  const { data: myChannelData } = useQuery({
    queryKey: ["getMyChannel"],
    queryFn: getMyChannel,
    select: (data) => data.data,
    enabled: !!meData?.data
  })

  // Get all channels for filter
  const { data: channelsData } = useQuery({
    queryKey: ["salesChannels", "all"],
    queryFn: () => searchSalesChannels({ page: 1, limit: 999 }),
    select: (data) => data.data
  })

  // Get daily reports
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["salesDailyReports", month, year, channelId, showDeleted],
    queryFn: () =>
      getSalesDailyReportsByMonth({
        month: Number(month),
        year: Number(year),
        channelId: channelId,
        deleted: showDeleted
      })
    // enabled: !!month && !!year && !!channelId
  })

  const me = meData?.data
  const isAdmin = useMemo(() => {
    return me?.roles?.includes("admin") ?? false
  }, [me])
  const isSalesLeader = useMemo(() => {
    return me?.roles?.includes("sales-leader") ?? false
  }, [me])
  const isSystemEmp = useMemo(() => {
    return me?.roles?.includes("system-emp") ?? false
  }, [me])
  const isSalesEmp = useMemo(() => {
    return me?.roles?.includes("sales-emp") ?? false
  }, [me])

  // Check if user can see channel filter
  const showChannelFilter = isAdmin || isSalesLeader || isSystemEmp

  // Auto-apply channel for sales-emp
  useEffect(() => {
    if (
      isSalesEmp &&
      !isAdmin &&
      !isSalesLeader &&
      !isSystemEmp &&
      myChannelData?.channel?._id
    ) {
      setChannelId(myChannelData.channel._id)
    }
  }, [isSalesEmp, isAdmin, isSalesLeader, isSystemEmp, myChannelData])

  // Prepare options
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `Tháng ${i + 1}`
  }))

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentDate.getFullYear() - i),
    label: String(currentDate.getFullYear() - i)
  }))

  const channelOptions =
    channelsData?.data.map((channel) => ({
      value: channel._id,
      label: channel.channelName
    })) || []

  // Paginate data locally
  const allReports = data?.data.data || []
  const paginatedReports = useMemo(() => {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    return allReports.slice(startIndex, endIndex)
  }, [allReports, page, limit])

  const totalPages = Math.ceil(allReports.length / limit)

  // Delete mutation
  const { mutate: deleteReport } = useMutation({
    mutationFn: deleteSalesDailyReport,
    onSuccess: () => {
      CToast.success({ title: "Xóa báo cáo thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Xóa báo cáo thất bại" })
    }
  })

  const handleDeleteReport = (reportId: string, reportDate: string) => {
    modals.openConfirmModal({
      title: <b>Xác nhận xóa báo cáo</b>,
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa báo cáo ngày{" "}
          <b>{format(new Date(reportDate), "dd/MM/yyyy")}</b>?
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteReport({ id: reportId })
    })
  }

  const columns: ColumnDef<DailyReportItem>[] = [
    {
      accessorKey: "date",
      header: "Ngày",
      cell: ({ row }) => (
        <span style={{ fontWeight: 600 }}>
          {format(new Date(row.original.date), "dd/MM/yyyy")}
        </span>
      )
    },
    {
      accessorKey: "revenue",
      header: "Doanh thu",
      cell: ({ row }) => (
        <span style={{ color: "#228be6", fontWeight: 600 }}>
          {row.original.revenue.toLocaleString("vi-VN")}đ
        </span>
      )
    },
    {
      accessorKey: "newFunnelRevenue",
      header: "DT khách mới",
      cell: ({ row }) => {
        const total =
          row.original.newFunnelRevenue.ads +
          row.original.newFunnelRevenue.other
        return (
          <Box>
            <Text size="sm" fw={500}>
              {total.toLocaleString("vi-VN")}đ
            </Text>
            <Group gap={4}>
              <Text size="xs" c="dimmed">
                Ads: {row.original.newFunnelRevenue.ads.toLocaleString("vi-VN")}
                đ
              </Text>
              <Text size="xs" c="dimmed">
                • Khác:{" "}
                {row.original.newFunnelRevenue.other.toLocaleString("vi-VN")}đ
              </Text>
            </Group>
          </Box>
        )
      }
    },
    {
      accessorKey: "returningFunnelRevenue",
      header: "DT khách quay lại",
      cell: ({ row }) => (
        <span>
          {row.original.returningFunnelRevenue.toLocaleString("vi-VN")}đ
        </span>
      )
    },
    {
      accessorKey: "adsCost",
      header: "Chi phí quảng cáo",
      cell: ({ row }) => (
        <span style={{ color: "#fa5252", fontWeight: 500 }}>
          {row.original.adsCost.toLocaleString("vi-VN")}đ
        </span>
      )
    },
    {
      accessorKey: "dateKpi",
      header: "KPI ngày",
      cell: ({ row }) => (
        <span style={{ fontWeight: 500 }}>
          {row.original.dateKpi.toLocaleString("vi-VN")}đ
        </span>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => (
        <span style={{ fontSize: "0.875rem", color: "#868e96" }}>
          {format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm")}
        </span>
      )
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const item = row.original

        return (
          <Group gap="xs">
            <Tooltip label="Xóa báo cáo" withArrow>
              <ActionIcon
                variant="light"
                color="red"
                size="sm"
                onClick={() => handleDeleteReport(item._id, item.date)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )
      },
      enableSorting: false
    }
  ]

  const createSalesDailyReport = () => {
    modals.open({
      id: "create-sales-daily-report",
      title: <b>Tạo báo cáo hàng ngày</b>,
      children: <CreateSalesDailyReportModal />,
      size: 960
    })
  }
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
          Báo cáo hàng ngày
        </Text>
        <Text c="dimmed" fz="sm">
          Theo dõi và quản lý các báo cáo hàng ngày của kênh bán hàng
        </Text>
      </Box>

      {/* Table */}
      <Box px={{ base: 4, md: 28 }} pb={20}>
        <CDataTable
          columns={columns}
          data={paginatedReports}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(newLimit: number) => {
            setLimit(newLimit)
            setPage(1)
          }}
          isLoading={isLoading}
          hideSearch
          onRowClick={(row) => {
            navigate({
              to: "/sales/dashboard/$dailyReportId",
              params: { dailyReportId: row.original._id }
            })
          }}
          extraFilters={
            <>
              <Select
                label="Tháng"
                placeholder="Chọn tháng"
                data={monthOptions}
                value={month}
                onChange={(value) => {
                  setMonth(value || String(currentDate.getMonth() + 1))
                  setPage(1)
                }}
              />
              <Select
                label="Năm"
                placeholder="Chọn năm"
                data={yearOptions}
                value={year}
                onChange={(value) => {
                  setYear(value || String(currentDate.getFullYear()))
                  setPage(1)
                }}
              />
              {showChannelFilter && (
                <Select
                  label="Kênh"
                  placeholder="Chọn kênh"
                  data={channelOptions}
                  value={channelId}
                  onChange={(value) => {
                    setChannelId(value || "")
                    setPage(1)
                  }}
                  searchable
                  clearable
                />
              )}
              {/* <Switch
                label="Hiển thị đã xoá"
                checked={showDeleted}
                onChange={(event) => {
                  setShowDeleted(event.currentTarget.checked)
                  setPage(1)
                }}
                mt="xl"
              /> */}
            </>
          }
          extraActions={
            <Button
              color="yellow"
              leftSection={<IconReportAnalytics size={16} />}
              onClick={() => createSalesDailyReport()}
            >
              Tạo báo cáo hàng ngày
            </Button>
          }
        />
      </Box>
    </Box>
  )
}
