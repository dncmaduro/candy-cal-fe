import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { useIncomes } from "../../hooks/useIncomes"
import {
  Box,
  Divider,
  Flex,
  Loader,
  Pagination,
  Table,
  Text,
  Group,
  ScrollArea,
  Button,
  NumberInput,
  TextInput,
  Select,
  Badge,
  Paper
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { format } from "date-fns"
import { modals } from "@mantine/modals"
import { InsertIncomeModalV2 } from "./InsertIncomeModalV2"
import { DailyAdsModal } from "./DailyAdsModal"
import { IconDownload, IconPlus, IconX } from "@tabler/icons-react"
import { DeleteIncomeModal } from "./DeleteIncomeModal"
import { useProducts } from "../../hooks/useProducts"
import { PackingRulesBoxTypes } from "../../constants/rules"
import { ExportXlsxIncomesRequest } from "../../hooks/models"
import { CToast } from "../common/CToast"
import { Can } from "../common/Can"

export const Incomes = () => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [orderId, setOrderId] = useState<string>()
  const [productCode, setProductCode] = useState<string>()
  const [productSource, setProductSource] = useState<string>()
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d
  })
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const { getIncomesByDateRange, exportXlsxIncomes, getRangeStats } =
    useIncomes()
  const { searchProducts } = useProducts()

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
      orderId,
      productCode,
      productSource
    ],
    queryFn: () =>
      getIncomesByDateRange({
        page,
        limit,
        startDate: startDate
          ? startOfDayISO(startDate)
          : startOfDayISO(new Date()),
        endDate: endDate ? endOfDayISO(endDate) : endOfDayISO(new Date()),
        orderId,
        productCode,
        productSource
      }),
    select: (data) => data.data
  })

  const { data: productsData } = useQuery({
    queryKey: ["searchProducts", ""],
    queryFn: () => searchProducts({ searchText: "", deleted: false }),
    select: (data) => data.data
  })

  const { data: rangeStatsData } = useQuery({
    queryKey: ["getRangeStats", startDate, endDate],
    queryFn: () =>
      getRangeStats({
        startDate: startDate
          ? startOfDayISO(startDate)
          : startOfDayISO(new Date()),
        endDate: endDate ? endOfDayISO(endDate) : endOfDayISO(new Date())
      }),
    select: (data) => data.data,
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
      )}_${args.orderId ?? ""}_${args.productCode ?? ""}_${
        args.productSource ?? ""
      }.xlsx`
      link.click()
      URL.revokeObjectURL(url)
      CToast.success({ title: "Xuất file Excel thành công" })
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi xuất file Excel" })
    }
  })

  const productCodeOptions = useMemo(() => {
    return (
      productsData?.map((prod) => {
        return {
          value: prod.name,
          label: prod.name
        }
      }) || []
    )
  }, [productsData])

  const sourceOptions = useMemo(() => {
    return [
      {
        label: "Affiliate",
        value: "affiliate"
      },
      {
        label: "Affiliate Ads",
        value: "affiliate-ads"
      },
      {
        label: "Ads",
        value: "ads"
      },
      {
        label: "Khác",
        value: "other"
      }
    ]
  }, [])

  const columns = [
    { label: "Ngày xuất đơn", key: "date", width: 110 },
    { label: "Mã đơn hàng", key: "orderId", width: 130 },
    { label: "Khách hàng", key: "customer", width: 140 },
    { label: "Tỉnh thành", key: "province", width: 120 },
    { label: "Đơn vị vận chuyển", key: "shippingProvider", width: 150 },
    { label: "Mã sản phẩm", key: "code", width: 110 },
    // { label: "Tên sản phẩm", key: "name", width: 160 },
    { label: "Nguồn", key: "source", width: 140 },
    { label: "Số lượng", key: "quantity", width: 80 },
    { label: "Báo giá", key: "quotation", width: 90 },
    { label: "Giá bán", key: "price", width: 90 },
    { label: "Chiết khấu Platform", key: "platformDiscount", width: 120 },
    { label: "Chiết khấu Seller", key: "sellerDiscount", width: 120 },
    { label: "Giá sau chiết khấu", key: "priceAfterDiscount", width: 130 },
    { label: "Loại nội dung", key: "content", width: 110 },
    { label: "Quy cách đóng hộp", key: "box", width: 60 },
    { label: "Nhà sáng tạo", key: "creator", width: 90 },
    { label: "Phần trăm Affiliate", key: "affiliateAdsPercentage", width: 100 },
    { label: "Số tiền Affiliate", key: "affiliateAdsAmount", width: 100 },
    {
      label: "Phần trăm Affiliate tiêu chuẩn",
      key: "standardAffPercentage",
      width: 100
    },
    {
      label: "Số tiền Affiliate tiêu chuẩn",
      key: "standardAffAmount",
      width: 100
    }
  ]

  const openIncomeModal = () => {
    modals.closeAll()
    modals.open({
      id: "income-v2",
      title: <b>Thêm doanh thu theo ngày</b>,
      children: <InsertIncomeModalV2 refetch={refetch} />,
      size: "xl"
    })
  }

  useEffect(() => {
    setPage(1)
  }, [startDate, endDate, orderId, productCode, productSource])

  const sourceColors = {
    ads: "green",
    affiliate: "red",
    "affiliate-ads": "violet",
    other: "blue"
  }

  return (
    <Box
      mt={40}
      mx="auto"
      px={{ base: 8, md: 0 }}
      w="100%"
      style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: 20,
        boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
        border: "1px solid #ececec"
      }}
    >
      {/* Header Section */}
      <Flex
        align="center"
        justify="space-between"
        pt={32}
        pb={16}
        px={{ base: 8, md: 28 }}
        direction={{ base: "column", sm: "row" }}
        gap={12}
      >
        <Box>
          <Text fw={700} fz="xl" mb={2}>
            Quản lý doanh thu
          </Text>
          <Text c="dimmed" fz="sm">
            Quản lý và theo dõi dữ liệu doanh thu bán hàng
          </Text>
        </Box>

        {/* Quick Actions */}
        <Group gap={8} align="center" w={{ base: "100%", sm: "auto" }}>
          <Can roles={["admin", "accounting-emp"]}>
            <Button
              onClick={openIncomeModal}
              size="md"
              radius="xl"
              leftSection={<IconPlus size={16} />}
            >
              Thêm doanh thu
            </Button>
          </Can>
          <Can roles={["admin", "accounting-emp"]}>
            <Button
              onClick={() =>
                modals.open({
                  title: <b>Thêm chi phí quảng cáo</b>,
                  children: <DailyAdsModal refetch={refetch} />,
                  size: "xl"
                })
              }
              size="md"
              radius="xl"
              leftSection={<IconPlus size={16} />}
              color="teal"
            >
              Thêm chi phí ads
            </Button>
          </Can>
          <Can roles={["admin", "accounting-emp"]}>
            <Button
              leftSection={<IconX size={16} />}
              color="red"
              variant="outline"
              size="md"
              radius={"xl"}
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
        </Group>
      </Flex>
      <Divider my={0} />

      {/* Content */}
      <Box pt={16} pb={8} px={{ base: 8, md: 28 }}>
        <Group justify="space-between" align="center" mb={16}>
          <Text fw={600} fz="lg">
            Danh sách doanh thu bán hàng
          </Text>
        </Group>

        {/* Date Range and Filters */}
        <Paper withBorder p="md" radius="md" mb={16}>
          <Group justify="flex-end" align="end" gap={12} wrap="wrap">
            <DatePickerInput
              value={startDate}
              onChange={setStartDate}
              label="Từ ngày"
              placeholder="Chọn ngày bắt đầu"
              valueFormat="DD/MM/YYYY"
              size="md"
              radius="md"
              clearable
              style={{ minWidth: 160 }}
            />
            <DatePickerInput
              value={endDate}
              onChange={setEndDate}
              label="Đến ngày"
              placeholder="Chọn ngày kết thúc"
              valueFormat="DD/MM/YYYY"
              size="md"
              radius="md"
              clearable
              style={{ minWidth: 160 }}
            />
            <TextInput
              label="ID Đơn hàng"
              value={orderId}
              size="md"
              placeholder="Tìm kiếm theo ID đơn hàng"
              onChange={(e) => setOrderId(e.target.value ?? undefined)}
              style={{ minWidth: 180 }}
            />
            <Select
              label="Sản phẩm"
              data={productCodeOptions}
              value={productCode}
              onChange={(val) => setProductCode(val ?? undefined)}
              size="md"
              searchable
              placeholder="Tìm kiếm theo mã sản phẩm"
              clearable
              style={{ minWidth: 180 }}
            />
            <Select
              label="Nguồn sản phẩm"
              data={sourceOptions}
              value={productSource}
              onChange={(val) => setProductSource(val ?? undefined)}
              size="md"
              placeholder="Tìm kiếm theo nguồn sản phẩm"
              clearable
              style={{ minWidth: 160 }}
            />
            <Button
              color="green"
              size="md"
              leftSection={<IconDownload size={16} />}
              onClick={() => {
                exportXlsx({
                  startDate: startDate
                    ? startOfDayISO(startDate)
                    : startOfDayISO(new Date()),
                  endDate: endDate
                    ? endOfDayISO(endDate)
                    : endOfDayISO(new Date()),
                  orderId,
                  productCode,
                  productSource
                })
              }}
              variant="light"
              style={{ alignSelf: "end" }}
            >
              Xuất Excel
            </Button>
          </Group>
        </Paper>

        {/* Stats Display */}
        {rangeStatsData && (
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
        )}
      </Box>

      {/* Data Table */}
      <Box px={{ base: 4, md: 28 }} py={20} maw={"100%"}>
        <ScrollArea.Autosize scrollbars="x" offsetScrollbars>
          <Table
            highlightOnHover
            withTableBorder
            withColumnBorders
            verticalSpacing="sm"
            horizontalSpacing="md"
            stickyHeader
            className="rounded-xl"
            miw={2400}
          >
            <Table.Thead>
              <Table.Tr>
                {columns.map((col) => (
                  <Table.Th key={col.key} style={{ width: col.width }}>
                    {col.label}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={columns.length}>
                    <Flex justify="center" align="center" h={60}>
                      <Loader />
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              ) : (incomesData?.incomes || []).length > 0 ? (
                incomesData?.incomes.map((item) => {
                  const productLen = item.products.length
                  return item.products.map((prod, idx) => (
                    <Table.Tr key={item._id + "_" + prod.code + "_" + idx}>
                      {idx === 0 && (
                        <>
                          <Table.Td
                            rowSpan={productLen}
                            style={{ verticalAlign: "middle" }}
                          >
                            {format(new Date(item.date), "dd/MM/yyyy")}
                          </Table.Td>
                          <Table.Td
                            rowSpan={productLen}
                            style={{ verticalAlign: "middle" }}
                          >
                            {item.orderId}
                          </Table.Td>
                          <Table.Td
                            rowSpan={productLen}
                            style={{ verticalAlign: "middle" }}
                          >
                            {item.customer}
                          </Table.Td>
                          <Table.Td
                            rowSpan={productLen}
                            style={{ verticalAlign: "middle" }}
                          >
                            {item.province}
                          </Table.Td>
                          <Table.Td
                            rowSpan={productLen}
                            style={{ verticalAlign: "middle" }}
                          >
                            {item.shippingProvider || "-"}
                          </Table.Td>
                        </>
                      )}
                      <Table.Td>
                        <span>{prod.code}</span>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={sourceColors[prod.source]}
                          variant="outline"
                          size="xs"
                        >
                          {prod.source}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{prod.quantity}</Table.Td>
                      <Table.Td>{prod.quotation?.toLocaleString()}</Table.Td>
                      <Table.Td>{prod.price?.toLocaleString()}</Table.Td>
                      <Table.Td>
                        {prod.platformDiscount?.toLocaleString() || "0"}
                      </Table.Td>
                      <Table.Td>
                        {prod.sellerDiscount?.toLocaleString() || "0"}
                      </Table.Td>
                      <Table.Td>
                        {prod.priceAfterDiscount?.toLocaleString() || "0"}
                      </Table.Td>
                      <Table.Td>
                        <span
                          style={{
                            display: "inline-block",
                            maxWidth: 100,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {prod.content ?? "-"}
                        </span>
                      </Table.Td>
                      <Table.Td>
                        {PackingRulesBoxTypes.find((r) => r.value === prod.box)
                          ?.label ?? "-"}
                      </Table.Td>
                      <Table.Td>{prod.creator ?? "-"}</Table.Td>
                      <Table.Td>{prod.affiliateAdsPercentage ?? "-"}</Table.Td>
                      <Table.Td>
                        {prod.affiliateAdsAmount?.toLocaleString()}
                      </Table.Td>
                      <Table.Td>{prod.standardAffPercentage ?? "-"}</Table.Td>
                      <Table.Td>
                        {prod.standardAffAmount?.toLocaleString()}
                      </Table.Td>
                    </Table.Tr>
                  ))
                })
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={columns.length}>
                    <Flex justify="center" align="center" h={60}>
                      <Text c="dimmed">Không có đơn thu nhập nào</Text>
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea.Autosize>
        <Flex justify="space-between" mt={8} align={"center"}>
          <Text c="dimmed" mr={8}>
            Tổng số dòng: {incomesData?.total}
          </Text>
          <Pagination
            total={Math.ceil((incomesData?.total || 0) / limit)}
            value={page}
            onChange={setPage}
          />
          <Group gap={4}>
            <Text>Số dòng/trang </Text>
            <NumberInput
              value={limit}
              onChange={(val) => setLimit(Number(val))}
              min={10}
              max={100}
              w={120}
            />
          </Group>
        </Flex>
      </Box>
    </Box>
  )
}
