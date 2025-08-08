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
  Badge
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { format } from "date-fns"
import { modals } from "@mantine/modals"
import { InsertIncomeModal } from "./InsertIncomeModal"
import { IconBox, IconDownload, IconPlus, IconX } from "@tabler/icons-react"
import { AffTypeModal } from "./AffTypeModal"
import { DeleteIncomeModal } from "./DeleteIncomeModal"
import { useProducts } from "../../hooks/useProducts"
import { useMonthGoals } from "../../hooks/useMonthGoals"
import { KPIBox } from "./KPIBox"
import { BoxUpdateModal } from "./BoxUpdateModal"
import { PackingRulesBoxTypes } from "../../constants/rules"
import { ExportXlsxIncomesRequest } from "../../hooks/models"
import { CToast } from "../common/CToast"

export const Incomes = () => {
  const [step, setStep] = useState<"income" | "aff">()
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
  const {
    getIncomesByDateRange,
    getKPIPercentageByMonth,
    getTotalIncomesByMonth,
    getTotalQuantityByMonth,
    exportXlsxIncomes
  } = useIncomes()
  const { searchProducts } = useProducts()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() - 1
  const { getGoal } = useMonthGoals()

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
          ? new Date(startDate.setHours(0, 0, 0, 0)).toISOString()
          : new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        endDate: endDate
          ? new Date(endDate.setHours(23, 59, 59, 999)).toISOString()
          : new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
        orderId,
        productCode,
        productSource
      }),
    select: (data) => data.data
  })

  const { data: productsData } = useQuery({
    queryKey: ["searchProducts", ""],
    queryFn: () => searchProducts(""),
    select: (data) => data.data
  })

  const { data: KPIPercentageData } = useQuery({
    queryKey: ["getKPIPercentageByMonth", currentMonth, currentYear],
    queryFn: () =>
      getKPIPercentageByMonth({ month: currentMonth, year: currentYear }),
    select: (data) => data.data
  })

  const { data: totalQuantityData } = useQuery({
    queryKey: ["getTotalQuantityByMonth", currentMonth, currentYear],
    queryFn: () =>
      getTotalQuantityByMonth({ month: currentMonth, year: currentYear }),
    select: (data) => data.data
  })

  const { data: totalIncomesData } = useQuery({
    queryKey: ["getTotalIncomesByMonth", currentMonth, currentYear],
    queryFn: () =>
      getTotalIncomesByMonth({ month: currentMonth, year: currentYear }),
    select: (data) => data.data
  })

  const { data: monthGoalData } = useQuery({
    queryKey: ["getGoal", currentMonth, currentYear],
    queryFn: () => getGoal({ month: currentMonth, year: currentYear }),
    select: (data) => data.data
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
    { label: "Tổng số SP", key: "products", width: 90 },
    { label: "Mã sản phẩm", key: "code", width: 110 },
    // { label: "Tên sản phẩm", key: "name", width: 160 },
    { label: "Nguồn", key: "source", width: 100 },
    { label: "Số lượng", key: "quantity", width: 80 },
    { label: "Báo giá", key: "quotation", width: 90 },
    { label: "Giá bán", key: "price", width: 90 },
    { label: "Phần trăm Affiliate", key: "affliateAdsPercentage", width: 70 },
    { label: "Loại nội dung", key: "content", width: 110 },
    { label: "Quy cách đóng hộp", key: "box", width: 60 },
    { label: "Nhà sáng tạo", key: "creator", width: 90 }
  ]

  useEffect(() => {
    if (step === "income") {
      modals.closeAll()
      modals.open({
        title: <b>Thêm doanh thu</b>,
        children: (
          <InsertIncomeModal
            nextStep={() => setStep("aff")}
            refetch={refetch}
          />
        ),
        size: "xl"
      })
    }

    if (step === "aff") {
      modals.closeAll()
      modals.open({
        title: <b>Cập nhật trạng thái affiliate</b>,
        children: (
          <AffTypeModal
            resetStep={() => setStep(undefined)}
            refetch={refetch}
          />
        ),
        size: "xl"
      })
    }
  }, [step])

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
      <Flex
        align="center"
        justify="space-between"
        pt={32}
        pb={8}
        px={{ base: 8, md: 28 }}
        direction={{ base: "column", sm: "row" }}
        gap={8}
      >
        <Box>
          <Text fw={700} fz="xl" mb={2}>
            Doanh thu bán hàng
          </Text>
          <Text c="dimmed" fz="sm">
            Xem và lọc danh sách đơn thu nhập theo ngày
          </Text>
        </Box>
        <Group gap={12} align="center" w={{ base: "100%", sm: "auto" }}>
          <DatePickerInput
            value={startDate}
            onChange={setStartDate}
            placeholder="Từ ngày"
            valueFormat="DD/MM/YYYY"
            size="md"
            radius="md"
            clearable
          />
          <DatePickerInput
            value={endDate}
            onChange={setEndDate}
            placeholder="Đến ngày"
            valueFormat="DD/MM/YYYY"
            size="md"
            radius="md"
            clearable
          />
          <Button
            onClick={() => {
              setStep("income")
            }}
            size="md"
            radius={"xl"}
            leftSection={<IconPlus size={16} />}
          >
            Thêm doanh thu
          </Button>
          <Button
            color="blue"
            variant="light"
            size="md"
            radius="xl"
            leftSection={<IconBox size={16} />}
            onClick={() => {
              modals.open({
                title: <b>Cập nhật quy cách đóng hàng</b>,
                children: <BoxUpdateModal />,
                size: "lg"
              })
            }}
          >
            Cập nhật quy cách đóng hàng
          </Button>
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
        </Group>
      </Flex>
      <Divider my={0} />
      <Flex
        px={{ base: 8, md: 28 }}
        py={18}
        gap={18}
        wrap="wrap"
        justify="flex-start"
        align="center"
      >
        <KPIBox
          label="KPI tháng này"
          value={monthGoalData?.goal.toLocaleString() ?? "..."}
          unit="VNĐ"
          color="indigo"
        />
        <KPIBox
          label="Doanh thu đã đạt"
          value={totalIncomesData?.total.toLocaleString() ?? "..."}
          unit="VNĐ"
          color="teal"
        />
        <KPIBox
          label="Tổng số lượng sản phẩm"
          value={totalQuantityData?.total.toLocaleString() ?? "..."}
          unit="sp"
          color="cyan"
        />
        <KPIBox
          label="Tỉ lệ đạt KPI"
          value={
            KPIPercentageData?.percentage !== undefined
              ? `${KPIPercentageData.percentage}%`
              : "..."
          }
          color={
            KPIPercentageData?.percentage !== undefined &&
            KPIPercentageData.percentage >= 100
              ? "green"
              : KPIPercentageData?.percentage !== undefined &&
                  KPIPercentageData.percentage >= 70
                ? "yellow"
                : "red"
          }
        />
      </Flex>
      <Divider my={0} />
      <Flex
        justify={"flex-end"}
        align={"flex-end"}
        pt={16}
        pb={8}
        gap={8}
        px={{ base: 8, md: 28 }}
        direction={{ base: "column", sm: "row" }}
      >
        <TextInput
          label="ID Đơn hàng"
          value={orderId}
          size="md"
          placeholder="Tìm kiếm theo ID đơn hàng"
          onChange={(e) => setOrderId(e.target.value ?? undefined)}
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
        />
        <Select
          label="Nguồn sản phẩm"
          data={sourceOptions}
          value={productSource}
          onChange={(val) => setProductSource(val ?? undefined)}
          size="md"
          placeholder="Tìm kiếm theo nguồn sản phẩm"
          clearable
        />
        <Button
          color="green"
          size="md"
          leftSection={<IconDownload size={16} />}
          onClick={() => {
            exportXlsx({
              startDate: startDate
                ? new Date(startDate.setHours(0, 0, 0, 0)).toISOString()
                : new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
              endDate: endDate
                ? new Date(endDate.setHours(23, 59, 59, 999)).toISOString()
                : new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
              orderId,
              productCode,
              productSource
            })
          }}
          variant="light"
        >
          Xuất file Excel
        </Button>
      </Flex>
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
            miw={1600}
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
                            {item.products.length}
                          </Table.Td>
                        </>
                      )}
                      <Table.Td>
                        {/* <Tooltip label={prod.name} position="top" withArrow> */}
                        <span>{prod.code}</span>
                        {/* </Tooltip> */}
                      </Table.Td>
                      {/* <Table.Td>
                        <span
                          style={{
                            display: "inline-block",
                            maxWidth: 120,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {prod.name}
                        </span>
                      </Table.Td> */}
                      <Table.Td miw={140}>
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
                      <Table.Td>{prod.affliateAdsPercentage ?? "-"}</Table.Td>
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
