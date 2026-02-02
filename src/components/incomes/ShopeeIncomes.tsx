import { useMutation, useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useShopeeIncomes } from "../../hooks/useShopeeIncomes"
import { useLivestreamChannel } from "../../context/LivestreamChannelContext"
import {
  Box,
  Divider,
  Text,
  Button,
  Badge,
  rem,
  FileButton,
  Stack,
  Flex
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { format } from "date-fns"
import { modals } from "@mantine/modals"
import { IconUpload } from "@tabler/icons-react"
import { CToast } from "../common/CToast"
import { Can } from "../common/Can"
import { CDataTable } from "../common/CDataTable"
import { ColumnDef } from "@tanstack/react-table"

interface ShopeeIncomeRow {
  _id: string
  date: string | Date
  customer: string
  creator: string
  channel: {
    _id: string
    name: string
  }
  orderId: string
  products: {
    code: string
    quantity: number
    price: number
  }[]
  source: string
  total: number
  affPercentage: number
}

export const ShopeeIncomes = () => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchText, setSearchText] = useState("")
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d
  })
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const { searchShopeeIncome, insertIncomeShopee } = useShopeeIncomes()
  const { selectedChannelId } = useLivestreamChannel()

  const {
    data: incomesData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: [
      "searchShopeeIncome",
      page,
      limit,
      startDate,
      endDate,
      searchText,
      selectedChannelId
    ],
    queryFn: () =>
      searchShopeeIncome({
        page,
        limit,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        productCode: searchText || undefined,
        channelId: selectedChannelId || undefined
      }),
    select: (data) => data.data
  })

  const { mutate: uploadFile, isPending: isUploading } = useMutation({
    mutationFn: async (file: File) => {
      if (!selectedChannelId) {
        throw new Error("Vui lòng chọn kênh trước khi upload")
      }
      return insertIncomeShopee([file], { channel: selectedChannelId })
    },
    onSuccess: () => {
      CToast.success({ title: "Upload file Excel thành công" })
      refetch()
    },
    onError: (error: any) => {
      CToast.error({
        title: "Upload file Excel thất bại",
        subtitle: error?.message || "Vui lòng thử lại sau"
      })
    }
  })

  // Transform data for table
  const tableData: ShopeeIncomeRow[] = useMemo(() => {
    return (
      incomesData?.data.map((item) => ({
        _id: item._id,
        date: item.date,
        customer: item.customer,
        creator: item.creator,
        channel: {
          _id: item.channel._id,
          name: item.channel.name
        },
        orderId: item.orderId,
        products: item.products,
        source: item.source,
        total: item.total,
        affPercentage: item.affPercentage
      })) || []
    )
  }, [incomesData])

  const columns: ColumnDef<ShopeeIncomeRow>[] = useMemo(
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
        size: 150,
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
        cell: ({ getValue }) => (
          <Text size="sm" lineClamp={1}>
            {getValue<string>()}
          </Text>
        )
      },
      {
        accessorKey: "creator",
        header: "Người tạo",
        size: 120,
        cell: ({ getValue }) => <Text size="sm">{getValue<string>()}</Text>
      },
      {
        accessorKey: "channel",
        header: "Kênh",
        size: 120,
        cell: ({ row }) => <Text size="sm">{row.original.channel.name}</Text>
      },
      {
        id: "productCode",
        header: "SKU - Số lượng",
        size: 150,
        cell: ({ row }) => (
          <Stack>
            {row.original.products.map((product, idx) => (
              <Flex key={idx} justify={"space-between"} mr={8}>
                <Text size="sm" fw={500}>
                  {product.code}
                </Text>{" "}
                <Badge size="sm" fw={500}>
                  {product.quantity}
                </Badge>
              </Flex>
            ))}
          </Stack>
        )
      },
      {
        id: "productPrice",
        header: "Giá",
        size: 120,
        cell: ({ row }) => (
          <Box>
            {row.original.products.map((product, idx) => (
              <Text key={idx} size="sm" c="dimmed">
                {product.price.toLocaleString("vi-VN")}đ
              </Text>
            ))}
          </Box>
        )
      },
      {
        accessorKey: "affPercentage",
        header: "Aff %",
        size: 80,
        cell: ({ getValue }) => (
          <Text size="sm" c="dimmed">
            {getValue<number>()}%
          </Text>
        )
      },
      {
        accessorKey: "total",
        header: "Tổng tiền",
        size: 120,
        cell: ({ getValue }) => (
          <Text size="sm" fw={600} c="green.7">
            {getValue<number>().toLocaleString("vi-VN")}đ
          </Text>
        )
      }
    ],
    []
  )

  const handleFileSelect = (file: File | null) => {
    if (!file) return

    if (!selectedChannelId) {
      CToast.error({
        title: "Chưa chọn kênh",
        subtitle: "Vui lòng chọn kênh trước khi upload file"
      })
      return
    }

    modals.openConfirmModal({
      title: <b>Xác nhận upload file</b>,
      children: (
        <Box>
          <Text mb="md">Bạn có chắc chắn muốn upload file này?</Text>
          <Box
            style={{
              background: "#f8f9fa",
              padding: "12px",
              borderRadius: "8px"
            }}
          >
            <Text size="sm" fw={600} mb="xs">
              Thông tin file:
            </Text>
            <Text size="sm" mb={4}>
              • Tên file: <strong>{file.name}</strong>
            </Text>
            <Text size="sm" mb={4}>
              • Kích thước: <strong>{(file.size / 1024).toFixed(2)} KB</strong>
            </Text>
          </Box>
        </Box>
      ),
      labels: { confirm: "Upload", cancel: "Hủy" },
      confirmProps: { color: "blue" },
      onConfirm: () => uploadFile(file)
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
          Quản lý doanh thu Shopee
        </Text>
        <Text c="dimmed" fz="sm">
          Quản lý và theo dõi dữ liệu doanh thu từ Shopee
        </Text>
      </Box>
      <Divider my={0} />

      {/* Content */}
      <Box px={{ base: 4, md: 28 }} py={20}>
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
          extraFilters={
            <>
              <DatePickerInput
                value={startDate}
                onChange={(value) => {
                  const d = value
                    ? new Date(new Date(value).setHours(0, 0, 0, 0))
                    : null
                  setStartDate(d)
                }}
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
                onChange={(value) => {
                  const d = value
                    ? new Date(new Date(value).setHours(23, 59, 59, 999))
                    : null
                  setEndDate(d)
                }}
                label="Đến ngày"
                placeholder="Chọn ngày kết thúc"
                valueFormat="DD/MM/YYYY"
                size="sm"
                radius="md"
                clearable
                style={{ width: 160 }}
              />
            </>
          }
          extraActions={
            <>
              <Can roles={["admin", "accounting-emp"]}>
                <FileButton
                  onChange={handleFileSelect}
                  accept=".xlsx,.xls"
                  disabled={isUploading || !selectedChannelId}
                >
                  {(props) => (
                    <Button
                      {...props}
                      size="sm"
                      radius="md"
                      leftSection={<IconUpload size={16} />}
                      loading={isUploading}
                      color="green"
                    >
                      Upload file doanh thu
                    </Button>
                  )}
                </FileButton>
              </Can>
            </>
          }
        />
      </Box>
    </Box>
  )
}
