import { useMutation, useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useIncomes } from "../../hooks/useIncomes"
import {
  Box,
  Divider,
  Text,
  Group,
  Button,
  Select,
  Badge,
  Paper,
  rem
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { format } from "date-fns"
import { modals } from "@mantine/modals"
import { InsertIncomeModalV2 } from "./InsertIncomeModalV2"
import { DailyAdsModal } from "./DailyAdsModal"
import { IconDownload, IconPlus, IconX } from "@tabler/icons-react"
import { DeleteIncomeModal } from "./DeleteIncomeModal"
import { ExportXlsxIncomesRequest } from "../../hooks/models"
import { CToast } from "../common/CToast"
import { Can } from "../common/Can"
import { CDataTable } from "../common/CDataTable"
import { ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "@tanstack/react-router"
import { useLivestreamChannel } from "../../context/LivestreamChannelContext"

interface IncomeRow {
  _id: string
  date: string
  orderId: string
  customer: string
  province: string
  shippingProvider: string
  channel: { _id: string; name: string } | null
  products: Array<{
    code: string
    source: string
    quantity: number
    price?: number
    platformDiscount?: number
    sellerDiscount?: number
    priceAfterDiscount?: number
  }>
  totalProducts: number
  totalRevenue: number
  totalDiscount: number
}

export const Incomes = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchText, setSearchText] = useState("")
  const [productSource, setProductSource] = useState<string>("")
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d
  })
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const { getIncomesByDateRange, exportXlsxIncomes, getRangeStats } =
    useIncomes()
  const { selectedChannelId } = useLivestreamChannel()

  const startOfDayISO = (d: Date) => {
    const dt = new Date(d)
    dt.setHours(0, 0, 0, 0)
    return dt.toISOString()
  }

  const endOfDayISO = (d: Date) => {
    const dt = new Date(d)
    dt.setHours(23, 59, 59, 999)
    return dt.toISOString()
  }

  const {
    data: incomesData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: [
      "getIncomesByDateRange",
      page,
      limit,
      startDate,
      endDate,
      searchText,
      productSource,
      selectedChannelId
    ],
    queryFn: () =>
      getIncomesByDateRange({
        page,
        limit,
        startDate: startDate
          ? startOfDayISO(startDate)
          : startOfDayISO(new Date()),
        endDate: endDate ? endOfDayISO(endDate) : endOfDayISO(new Date()),
        orderId: searchText || undefined,
        productSource,
        channelId: selectedChannelId || undefined
      }),
    select: (data) => data.data
  })

  const { data: rangeStatsData } = useQuery({
    queryKey: ["getRangeStats", startDate, endDate, selectedChannelId],
    queryFn: () => {
      if (!startDate || !endDate || !selectedChannelId) return null
      return getRangeStats({
        startDate: startOfDayISO(startDate),
        endDate: endOfDayISO(endDate),
        channelId: selectedChannelId
      })
    },
    select: (data) => (data ? data.data : null),
    enabled: !!startDate && !!endDate
  })

  const { mutate: exportXlsx } = useMutation({
    mutationFn: (req: ExportXlsxIncomesRequest) => exportXlsxIncomes(req),
    onSuccess: (response, args) => {
      const url = URL.createObjectURL(response.data)
      const link = document.createElement("a")
      link.href = url
      link.download = `Báo cáo doanh thu_${format(new Date(), "dd-MM-yyyy")}_${format(args.startDate, "ddMMyyyy")}_${format(
        args.endDate,
        "ddMMyyyy"
      )}_${args.productSource ?? ""}.xlsx`
      link.click()
      URL.revokeObjectURL(url)
      CToast.success({ title: "Xuất file Excel thành công" })
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi xuất file Excel" })
    }
  })

  const sourceOptions = useMemo(() => {
    return [
      { label: "Tất cả nguồn", value: "" },
      { label: "Affiliate", value: "affiliate" },
      { label: "Affiliate Ads", value: "affiliate-ads" },
      { label: "Ads", value: "ads" },
      { label: "Khác", value: "other" }
    ]
  }, [])

  // Transform data for table
  const tableData: IncomeRow[] = useMemo(() => {
    return (
      incomesData?.incomes.map((item) => {
        const totalProducts = item.products.length
        const totalRevenue = item.products.reduce(
          (sum, p) => sum + (p.priceAfterDiscount || 0) * p.quantity,
          0
        )
        const totalDiscount = item.products.reduce(
          (sum, p) =>
            sum + ((p.platformDiscount || 0) + (p.sellerDiscount || 0)),
          0
        )

        return {
          _id: item._id,
          date:
            typeof item.date === "string" ? item.date : item.date.toISOString(),
          orderId: item.orderId,
          customer: item.customer,
          province: item.province,
          shippingProvider: item.shippingProvider || "-",
          channel: item.channel || null,
          products: item.products,
          totalProducts,
          totalRevenue,
          totalDiscount
        }
      }) || []
    )
  }, [incomesData])

  const sourceColors: Record<string, string> = {
    ads: "green",
    affiliate: "red",
    "affiliate-ads": "violet",
    other: "blue"
  }

  const columns: ColumnDef<IncomeRow>[] = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Ngày",
        size: 110,
        cell: ({ getValue }) => (
          <Text size="sm">
            {format(new Date(getValue<string>()), "dd/MM/yyyy")}
          </Text>
        )
      },
      {
        accessorKey: "orderId",
        header: "Mã đơn hàng",
        size: 130,
        cell: ({ getValue }) => (
          <Text size="sm" fw={500}>
            {getValue<string>()}
          </Text>
        )
      },
      {
        accessorKey: "customer",
        header: "Khách hàng",
        size: 150,
        cell: ({ row }) => (
          <div>
            <Text size="sm" fw={500} lineClamp={1}>
              {row.original.customer}
            </Text>
            <Text size="xs" c="dimmed">
              {row.original.province}
            </Text>
          </div>
        )
      },
      {
        accessorKey: "channel",
        header: "Kênh",
        size: 120,
        cell: ({ row }) => (
          <Text size="sm">{row.original.channel?.name || "-"}</Text>
        )
      },
      {
        accessorKey: "totalProducts",
        header: "Số SP",
        size: 80,
        cell: ({ getValue }) => (
          <Badge variant="light" color="blue" size="sm">
            {getValue<number>()} SP
          </Badge>
        )
      },
      {
        accessorKey: "products",
        header: "Nguồn",
        size: 120,
        cell: ({ row }) => {
          const sources = Array.from(
            new Set(row.original.products.map((p) => p.source))
          )
          return (
            <Group gap={4}>
              {sources.map((source) => (
                <Badge
                  key={source}
                  color={sourceColors[source] || "gray"}
                  variant="light"
                  size="xs"
                >
                  {source}
                </Badge>
              ))}
            </Group>
          )
        }
      },
      {
        accessorKey: "totalRevenue",
        header: "Doanh thu",
        size: 120,
        cell: ({ getValue }) => (
          <Text size="sm" fw={600} c="green.7">
            {getValue<number>().toLocaleString("vi-VN")}đ
          </Text>
        )
      },
      {
        accessorKey: "totalDiscount",
        header: "Chiết khấu",
        size: 110,
        cell: ({ getValue }) => {
          const discount = getValue<number>()
          return discount > 0 ? (
            <Text size="sm" c="orange.7">
              {discount.toLocaleString("vi-VN")}đ
            </Text>
          ) : (
            <Text size="sm" c="dimmed">
              -
            </Text>
          )
        }
      },
      {
        accessorKey: "shippingProvider",
        header: "Vận chuyển",
        size: 120,
        cell: ({ getValue }) => <Text size="sm">{getValue<string>()}</Text>
      }
    ],
    []
  )

  const openIncomeModal = () => {
    modals.closeAll()
    modals.open({
      id: "income-v2",
      title: <b>Thêm doanh thu theo ngày</b>,
      children: <InsertIncomeModalV2 refetch={refetch} />,
      size: "xl"
    })
  }

  const handleExportExcel = () => {
    modals.openConfirmModal({
      title: <b>Xác nhận xuất file Excel</b>,
      children: (
        <Box>
          <Text mb="md">
            Bạn có chắc chắn muốn xuất file Excel với các bộ lọc hiện tại?
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
              • Tổng số đơn: <strong>{incomesData?.total || 0}</strong> đơn
            </Text>
            {searchText && (
              <Text size="sm" mb={4}>
                • Mã đơn hàng: <strong>{searchText}</strong>
              </Text>
            )}
            {productSource && (
              <Text size="sm" mb={4}>
                • Nguồn: <strong>{productSource}</strong>
              </Text>
            )}
            {startDate && (
              <Text size="sm" mb={4}>
                • Từ ngày: <strong>{format(startDate, "dd/MM/yyyy")}</strong>
              </Text>
            )}
            {endDate && (
              <Text size="sm" mb={4}>
                • Đến ngày: <strong>{format(endDate, "dd/MM/yyyy")}</strong>
              </Text>
            )}
          </Box>
        </Box>
      ),
      labels: { confirm: "Xuất Excel", cancel: "Hủy" },
      confirmProps: { color: "green" },
      onConfirm: () => {
        exportXlsx({
          startDate: startDate
            ? startOfDayISO(startDate)
            : startOfDayISO(new Date()),
          endDate: endDate ? endOfDayISO(endDate) : endOfDayISO(new Date()),
          orderId: searchText || undefined,
          productSource,
          channel: selectedChannelId || undefined
        })
      }
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
      {/* Header Section */}
      <Box pt={32} pb={16} px={{ base: 8, md: 28 }}>
        <Text fw={700} fz="xl" mb={2}>
          Quản lý doanh thu
        </Text>
        <Text c="dimmed" fz="sm">
          Quản lý và theo dõi dữ liệu doanh thu bán hàng
        </Text>
      </Box>
      <Divider my={0} />

      {/* Stats Display */}
      {rangeStatsData && (
        <Box px={{ base: 8, md: 28 }} pt={16}>
          <Paper withBorder p="lg" radius="md" mb={16} bg="blue.0">
            <Group justify="space-around" align="center" gap="xl" wrap="wrap">
              <Box style={{ textAlign: "center" }}>
                <Text size="sm" c="dimmed" mb={4}>
                  Tổng doanh thu (trước CK)
                </Text>
                <Text size="xl" fw={700} c="blue.7">
                  {(
                    rangeStatsData.current?.beforeDiscount?.totalIncome ?? 0
                  ).toLocaleString()}{" "}
                  VNĐ
                </Text>
              </Box>
              <Divider orientation="vertical" />
              <Box style={{ textAlign: "center" }}>
                <Text size="sm" c="dimmed" mb={4}>
                  Tổng chi phí Ads
                </Text>
                <Text size="xl" fw={700} c="orange.7">
                  {(
                    (rangeStatsData.current?.ads?.liveAdsCost ?? 0) +
                    (rangeStatsData.current?.ads?.shopAdsCost ?? 0)
                  ).toLocaleString()}{" "}
                  VNĐ
                </Text>
              </Box>
            </Group>
          </Paper>
        </Box>
      )}

      {/* Content */}
      <Box px={{ base: 4, md: 28 }} pb={20}>
        <CDataTable
          columns={columns}
          data={tableData}
          enableGlobalFilter={true}
          globalFilterValue={searchText}
          onGlobalFilterChange={setSearchText}
          page={page}
          totalPages={Math.ceil((incomesData?.total || 0) / limit)}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          initialPageSize={limit}
          pageSizeOptions={[10, 20, 50, 100]}
          isLoading={isLoading}
          onRowClick={(row) => {
            navigate({
              to: "/marketing-storage/incomes/$incomeId",
              params: { incomeId: row.original.orderId }
            })
          }}
          extraFilters={
            <>
              <DatePickerInput
                value={startDate}
                onChange={setStartDate}
                label="Từ ngày"
                placeholder="Chọn ngày bắt đầu"
                valueFormat="DD/MM/YYYY"
                size="sm"
                radius="md"
                clearable
                style={{ width: 160 }}
              />
              <DatePickerInput
                value={endDate}
                onChange={setEndDate}
                label="Đến ngày"
                placeholder="Chọn ngày kết thúc"
                valueFormat="DD/MM/YYYY"
                size="sm"
                radius="md"
                clearable
                style={{ width: 160 }}
              />
              <Select
                label="Nguồn sản phẩm"
                data={sourceOptions}
                value={productSource}
                onChange={(val) => setProductSource(val || "")}
                size="sm"
                placeholder="Chọn nguồn"
                clearable
                style={{ width: 180 }}
              />
            </>
          }
          extraActions={
            <>
              <Button
                color="green"
                size="sm"
                leftSection={<IconDownload size={16} />}
                onClick={handleExportExcel}
                variant="light"
                radius="md"
              >
                Xuất Excel
              </Button>
              <Can roles={["admin", "accounting-emp"]}>
                <Button
                  onClick={() =>
                    modals.open({
                      title: <b>Thêm chi phí quảng cáo</b>,
                      children: <DailyAdsModal refetch={refetch} />,
                      size: "xl"
                    })
                  }
                  size="sm"
                  radius="md"
                  leftSection={<IconPlus size={16} />}
                  color="teal"
                  variant="light"
                >
                  Thêm chi phí ads
                </Button>
              </Can>
              <Can roles={["admin", "accounting-emp"]}>
                <Button
                  leftSection={<IconX size={16} />}
                  color="red"
                  variant="light"
                  size="sm"
                  radius="md"
                  onClick={() =>
                    modals.open({
                      title: <b>Xoá doanh thu</b>,
                      children: <DeleteIncomeModal />,
                      size: "lg"
                    })
                  }
                >
                  Xoá doanh thu
                </Button>
              </Can>
              <Can roles={["admin", "accounting-emp"]}>
                <Button
                  onClick={openIncomeModal}
                  size="sm"
                  radius="md"
                  leftSection={<IconPlus size={16} />}
                >
                  Thêm doanh thu
                </Button>
              </Can>
            </>
          }
        />
      </Box>
    </Box>
  )
}
