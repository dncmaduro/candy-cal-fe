import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import {
  ActionIcon,
  Box,
  Button,
  Group,
  rem,
  Select,
  Tabs,
  Text,
  Tooltip
} from "@mantine/core"
import { IconEdit, IconMessage, IconReportAnalytics, IconTrash } from "@tabler/icons-react"
import { useSalesChannels } from "../../../hooks/useSalesChannels"
import { GetSalesDailyReportsByMonthResponse, SalesDailyAdsItem } from "../../../hooks/models"
import { useSalesDailyAds } from "../../../hooks/useSalesDailyAds"
import { useSalesDailyReports } from "../../../hooks/useSalesDailyReports"
import { useUsers } from "../../../hooks/useUsers"
import { SALES_ADS_COST_REPORT_ROLES, SALES_REVENUE_REPORT_ROLES } from "../../../constants/navs"
import { Can } from "../../common/Can"
import { CDataTable } from "../../common/CDataTable"
import { CToast } from "../../common/CToast"
import { modals } from "@mantine/modals"
import { CreateSalesRevenueDailyReportModal } from "./CreateSalesDailyReportModal"
import { DailyReportByText } from "./DailyReportByText"
import { SalesDailyAdsModal } from "./SalesDailyAdsModal"

type DailyReportItem = GetSalesDailyReportsByMonthResponse["data"][number]

const dateOptions = (currentDate: Date) => ({
  month: Array.from({ length: 12 }, (_, index) => ({ value: String(index + 1), label: `Tháng ${index + 1}` })),
  year: Array.from({ length: 5 }, (_, index) => ({ value: String(currentDate.getFullYear() - index), label: String(currentDate.getFullYear() - index) }))
})

export const SalesDailyReports = () => {
  const { getSalesDailyReportsByMonth, deleteSalesDailyReport } = useSalesDailyReports()
  const { getSalesDailyAdsByMonth } = useSalesDailyAds()
  const { getMyChannel, searchSalesChannels } = useSalesChannels()
  const { getMe } = useUsers()
  const navigate = useNavigate()
  const search = useSearch({ from: "/sales/daily-reports/" })
  const currentDate = new Date()
  const month = search.reportsMonth || String(currentDate.getMonth() + 1)
  const year = search.reportsYear || String(currentDate.getFullYear())
  const channelId = search.reportsChannelId || ""
  const [activeTab, setActiveTab] = useState<string | null>("revenue")
  const [showDeleted] = useState(false)
  const page = search.reportsPage || 1
  const limit = search.reportsLimit || 10

  const { data: meData } = useQuery({ queryKey: ["me"], queryFn: getMe })
  const { data: myChannelData } = useQuery({
    queryKey: ["getMyChannel"],
    queryFn: getMyChannel,
    select: (data) => data.data,
    enabled: !!meData?.data
  })
  const { data: channelsData } = useQuery({
    queryKey: ["salesChannels", "all"],
    queryFn: () => searchSalesChannels({ page: 1, limit: 999 }),
    select: (data) => data.data
  })

  const roles = meData?.data?.roles ?? []
  const showChannelFilter = ["admin", "sales-hunter", "system-emp", "facebook-ads-emp"].some((role) => roles.includes(role))
  const shouldUseMyChannel = roles.includes("sales-cs") && !["admin", "sales-hunter", "system-emp"].some((role) => roles.includes(role))
  const channelOptions = useMemo(() => channelsData?.data.map((item) => ({ value: item._id, label: item.channelName })) ?? [], [channelsData])
  const effectiveChannelId = shouldUseMyChannel
    ? myChannelData?.channel?._id || channelId
    : channelId || channelOptions[0]?.value || ""
  const reportQueryReady = shouldUseMyChannel ? !!effectiveChannelId : !showChannelFilter || !!effectiveChannelId || channelsData !== undefined

  useEffect(() => {
    const assignedChannelId = myChannelData?.channel?._id
    if (shouldUseMyChannel && assignedChannelId && channelId !== assignedChannelId) {
      navigate({ to: "/sales/daily-reports", search: { ...search, reportsChannelId: assignedChannelId, reportsPage: 1 }, replace: true })
    }
  }, [shouldUseMyChannel, myChannelData?.channel?._id, channelId, navigate, search])

  useEffect(() => {
    if (showChannelFilter && !shouldUseMyChannel && !channelId && channelOptions[0]?.value) {
      navigate({ to: "/sales/daily-reports", search: { ...search, reportsChannelId: channelOptions[0].value, reportsPage: 1 }, replace: true })
    }
  }, [showChannelFilter, shouldUseMyChannel, channelId, channelOptions, navigate, search])

  const { data: reportsData, isLoading: reportsLoading, refetch: refetchReports } = useQuery({
    queryKey: ["salesDailyReports", month, year, effectiveChannelId, showDeleted],
    queryFn: () => getSalesDailyReportsByMonth({ month: Number(month), year: Number(year), channelId: effectiveChannelId, deleted: showDeleted }),
    enabled: reportQueryReady
  })
  const { data: adsData, isLoading: adsLoading, refetch: refetchAds } = useQuery({
    queryKey: ["salesDailyAds", month, year],
    queryFn: () => getSalesDailyAdsByMonth({ month: Number(month), year: Number(year) })
  })

  const reports = reportsData?.data.data ?? []
  const ads = adsData?.data.data ?? []
  const paginatedReports = reports.slice((page - 1) * limit, page * limit)
  const paginatedAds = ads.slice((page - 1) * limit, page * limit)
  const updateSearch = (updates: Record<string, string | number | undefined>) => {
    navigate({ to: "/sales/daily-reports", search: { ...search, ...updates }, replace: true })
  }

  const { mutate: deleteReport } = useMutation({
    mutationFn: deleteSalesDailyReport,
    onSuccess: () => { CToast.success({ title: "Xóa báo cáo thành công" }); void refetchReports() },
    onError: () => CToast.error({ title: "Xóa báo cáo thất bại" })
  })

  const openAdsModal = (initialAds?: SalesDailyAdsItem) => {
    modals.open({
      id: initialAds ? `edit-sales-daily-ads-${initialAds.date}` : "create-sales-daily-ads",
      title: <b>{initialAds ? "Sửa báo cáo chi phí ads" : "Báo cáo chi phí ads"}</b>,
      children: <SalesDailyAdsModal initialAds={initialAds} onSaved={() => void refetchAds()} />,
      size: "sm"
    })
  }
  const openRevenueModal = () => modals.open({
    id: "create-sales-revenue-report",
    title: (
      <Box>
        <Text fw={600}>Tạo báo cáo doanh thu ngày</Text>
        <Text size="xs" c="dimmed">
          Kiểm tra dữ liệu tự động và nhập KPI ngày trước khi lưu
        </Text>
      </Box>
    ),
    children: <CreateSalesRevenueDailyReportModal />,
    size: 1080,
    styles: { body: { padding: 0 } }
  })

  const reportColumns: ColumnDef<DailyReportItem>[] = [
    { accessorKey: "date", header: "Ngày", cell: ({ row }) => <Text fw={600}>{format(new Date(row.original.date), "dd/MM/yyyy")}</Text> },
    { accessorKey: "channel", header: "Kênh", cell: ({ row }) => <Text>{typeof row.original.channel === "string" ? channelOptions.find((item) => item.value === row.original.channel)?.label || row.original.channel : row.original.channel.channelName}</Text> },
    { accessorKey: "revenue", header: "Doanh thu", cell: ({ row }) => <Text c="blue" fw={600}>{row.original.revenue.toLocaleString("vi-VN")}đ</Text> },
    { accessorKey: "newFunnelRevenue", header: "DT khách mới", cell: ({ row }) => <Text>{(row.original.newFunnelRevenue.ads + row.original.newFunnelRevenue.other).toLocaleString("vi-VN")}đ</Text> },
    { accessorKey: "returningFunnelRevenue", header: "DT khách quay lại", cell: ({ row }) => <Text>{row.original.returningFunnelRevenue.toLocaleString("vi-VN")}đ</Text> },
    { accessorKey: "dateKpi", header: "KPI ngày", cell: ({ row }) => <Text>{row.original.dateKpi.toLocaleString("vi-VN")}đ</Text> },
    {
      id: "actions", header: "Thao tác", enableSorting: false,
      cell: ({ row }) => <Group gap="xs">
        <Tooltip label="Xem tin nhắn báo cáo" withArrow><ActionIcon variant="light" color="blue" onClick={(event) => { event.stopPropagation(); modals.open({ id: "daily-report-message", title: <b>Tin nhắn báo cáo</b>, children: <DailyReportByText report={row.original} />, size: "lg" }) }}><IconMessage size={16} /></ActionIcon></Tooltip>
        <Can roles={["admin", "sales-hunter", "sales-cs", "system-emp"]}><Tooltip label="Xóa báo cáo" withArrow><ActionIcon variant="light" color="red" onClick={(event) => { event.stopPropagation(); modals.openConfirmModal({ title: <b>Xác nhận xóa báo cáo</b>, children: <Text size="sm">Bạn có chắc chắn muốn xóa báo cáo ngày <b>{format(new Date(row.original.date), "dd/MM/yyyy")}</b>?</Text>, labels: { confirm: "Xóa", cancel: "Hủy" }, confirmProps: { color: "red" }, onConfirm: () => deleteReport({ id: row.original._id }) }) }}><IconTrash size={16} /></ActionIcon></Tooltip></Can>
      </Group>
    }
  ]
  const adsColumns: ColumnDef<SalesDailyAdsItem>[] = [
    { accessorKey: "date", header: "Ngày", cell: ({ row }) => <Text fw={600}>{format(new Date(row.original.date), "dd/MM/yyyy")}</Text> },
    { accessorKey: "adsCost", header: "Chi phí ads", cell: ({ row }) => <Text c="orange" fw={600}>{row.original.adsCost.toLocaleString("vi-VN")}đ</Text> },
    { id: "actions", header: "Thao tác", enableSorting: false, cell: ({ row }) => <Can roles={SALES_ADS_COST_REPORT_ROLES}><Tooltip label="Sửa chi phí ads" withArrow><ActionIcon variant="light" color="orange" onClick={() => openAdsModal(row.original)}><IconEdit size={16} /></ActionIcon></Tooltip></Can> }
  ]
  const filters = (withChannel: boolean) => <>
    <Select label="Tháng" data={dateOptions(currentDate).month} value={month} onChange={(value) => updateSearch({ reportsMonth: value || String(currentDate.getMonth() + 1), reportsPage: 1 })} />
    <Select label="Năm" data={dateOptions(currentDate).year} value={year} onChange={(value) => updateSearch({ reportsYear: value || String(currentDate.getFullYear()), reportsPage: 1 })} />
    {withChannel && showChannelFilter && <Select label="Kênh" data={channelOptions} value={effectiveChannelId || null} clearable={false} allowDeselect={false} searchable onChange={(value) => value && updateSearch({ reportsChannelId: value, reportsPage: 1 })} />}
  </>
  const paginationProps = (total: number) => ({
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    onPageChange: (newPage: number) => updateSearch({ reportsPage: newPage }),
    onPageSizeChange: (newLimit: number) => updateSearch({ reportsLimit: newLimit, reportsPage: 1 }),
    initialPageSize: limit,
    pageSizeOptions: [10, 20, 50, 100] as number[],
    hideSearch: true
  })

  return (
    <Box mt={40} mx="auto" px={{ base: 8, md: 0 }} w="100%" style={{ background: "rgba(255,255,255,0.97)", borderRadius: rem(20), boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)", border: "1px solid #ececec" }}>
      <Box pt={32} pb={16} px={{ base: 8, md: 28 }}><Text fw={700} fz="xl">Báo cáo hàng ngày</Text><Text c="dimmed" fz="sm">Theo dõi báo cáo doanh thu theo kênh và chi phí ads toàn Sales</Text></Box>
      <Tabs value={activeTab} onChange={setActiveTab} px={{ base: 4, md: 28 }} pb={20}>
        <Tabs.List mb="md"><Tabs.Tab value="revenue">Báo cáo doanh thu</Tabs.Tab><Tabs.Tab value="ads">Chi phí ads</Tabs.Tab></Tabs.List>
        <Tabs.Panel value="revenue"><CDataTable columns={reportColumns} data={paginatedReports} isLoading={reportsLoading} {...paginationProps(reports.length)} extraFilters={filters(true)} extraActions={<Can roles={SALES_REVENUE_REPORT_ROLES}><Button color="yellow" leftSection={<IconReportAnalytics size={16} />} onClick={openRevenueModal}>Báo cáo doanh thu</Button></Can>} onRowClick={(row) => navigate({ to: "/sales/dashboard/$dailyReportId", params: { dailyReportId: row.original._id } })} /></Tabs.Panel>
        <Tabs.Panel value="ads"><CDataTable columns={adsColumns} data={paginatedAds} isLoading={adsLoading} {...paginationProps(ads.length)} extraFilters={filters(false)} extraActions={<Can roles={SALES_ADS_COST_REPORT_ROLES}><Button color="orange" leftSection={<IconReportAnalytics size={16} />} onClick={() => openAdsModal()}>Báo cáo chi phí ads</Button></Can>} /></Tabs.Panel>
      </Tabs>
    </Box>
  )
}
