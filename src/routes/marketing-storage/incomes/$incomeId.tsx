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
  Button,
  Loader,
  Center
} from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { IconArrowLeft } from "@tabler/icons-react"
import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { CDataTable } from "../../../components/common/CDataTable"
import { useIncomes } from "../../../hooks/useIncomes"

export const Route = createFileRoute("/marketing-storage/incomes/$incomeId")({
  component: RouteComponent
})

type IncomeProduct = {
  creator?: string
  code: string
  name: string
  source: "affiliate" | "affiliate-ads" | "ads" | "other"
  quantity: number
  quotation: number
  price: number
  platformDiscount: number
  sellerDiscount: number
  priceAfterDiscount: number
  affiliateAdsPercentage?: number
  affiliateAdsAmount?: number
  standardAffPercentage?: number
  standardAffAmount?: number
  sourceChecked: boolean
  content?: string
  box?: string
}

function RouteComponent() {
  const { incomeId } = Route.useParams()
  const navigate = useNavigate()
  const { getIncomesByDateRange } = useIncomes()

  const { data, isLoading } = useQuery({
    queryKey: ["income", incomeId],
    queryFn: async () => {
      const now = new Date()
      const twoYearsAgo = new Date(now.getFullYear() - 2, 0, 1)
      const result = await getIncomesByDateRange({
        page: 1,
        limit: 1,
        orderId: incomeId,
        startDate: twoYearsAgo.toISOString(),
        endDate: now.toISOString()
      })
      return result.data
    }
  })

  const income = data?.incomes?.[0]

  const sourceColors: Record<string, string> = {
    ads: "green",
    affiliate: "red",
    "affiliate-ads": "violet",
    other: "blue"
  }

  // Calculate totals
  const calculations = useMemo(() => {
    if (!income?.products) return null

    const totalQuantity = income.products.reduce(
      (sum, p) => sum + p.quantity,
      0
    )
    const totalRevenue = income.products.reduce(
      (sum, p) => sum + (p.priceAfterDiscount || 0) * p.quantity,
      0
    )
    const totalDiscount = income.products.reduce(
      (sum, p) =>
        sum +
        ((p.platformDiscount || 0) + (p.sellerDiscount || 0)) * p.quantity,
      0
    )
    const totalBeforeDiscount = income.products.reduce(
      (sum, p) => sum + (p.quotation || p.price || 0) * p.quantity,
      0
    )

    return {
      totalQuantity,
      totalRevenue,
      totalDiscount,
      totalBeforeDiscount
    }
  }, [income?.products])

  const productColumns = useMemo<ColumnDef<IncomeProduct>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Mã SP",
        size: 100,
        cell: ({ row }) => (
          <Text fw={500} size="sm">
            {row.original.code}
          </Text>
        )
      },
      {
        accessorKey: "name",
        header: "Tên sản phẩm",
        size: 200,
        cell: ({ row }) => <Text size="sm">{row.original.name}</Text>
      },
      {
        accessorKey: "source",
        header: "Nguồn",
        size: 100,
        cell: ({ row }) => (
          <Badge
            color={sourceColors[row.original.source] || "gray"}
            variant="light"
            size="sm"
          >
            {row.original.source}
          </Badge>
        )
      },
      {
        accessorKey: "quantity",
        header: "SL",
        size: 70,
        cell: ({ row }) => (
          <Text size="sm" fw={500}>
            {row.original.quantity}
          </Text>
        )
      },
      {
        accessorKey: "quotation",
        header: "Báo giá",
        size: 100,
        cell: ({ row }) => (
          <Text size="sm">
            {row.original.quotation
              ? `${row.original.quotation.toLocaleString("vi-VN")}đ`
              : "-"}
          </Text>
        )
      },
      {
        accessorKey: "price",
        header: "Giá bán",
        size: 100,
        cell: ({ row }) => (
          <Text size="sm">
            {row.original.price
              ? `${row.original.price.toLocaleString("vi-VN")}đ`
              : "-"}
          </Text>
        )
      },
      {
        accessorKey: "platformDiscount",
        header: "CK Platform",
        size: 110,
        cell: ({ row }) => (
          <Text
            size="sm"
            c={row.original.platformDiscount ? "orange" : "dimmed"}
          >
            {row.original.platformDiscount
              ? `${row.original.platformDiscount.toLocaleString("vi-VN")}đ`
              : "-"}
          </Text>
        )
      },
      {
        accessorKey: "sellerDiscount",
        header: "CK Seller",
        size: 100,
        cell: ({ row }) => (
          <Text size="sm" c={row.original.sellerDiscount ? "orange" : "dimmed"}>
            {row.original.sellerDiscount
              ? `${row.original.sellerDiscount.toLocaleString("vi-VN")}đ`
              : "-"}
          </Text>
        )
      },
      {
        accessorKey: "priceAfterDiscount",
        header: "Giá sau CK",
        size: 110,
        cell: ({ row }) => (
          <Text size="sm" fw={500} c="green">
            {row.original.priceAfterDiscount
              ? `${row.original.priceAfterDiscount.toLocaleString("vi-VN")}đ`
              : "-"}
          </Text>
        )
      },
      {
        id: "totalRevenue",
        header: "Tổng tiền",
        size: 120,
        cell: ({ row }) => (
          <Text size="sm" fw={600} c="green.7">
            {(
              (row.original.priceAfterDiscount || 0) * row.original.quantity
            ).toLocaleString("vi-VN")}
            đ
          </Text>
        )
      },
      {
        accessorKey: "standardAffPercentage",
        header: "% Aff",
        size: 80,
        cell: ({ row }) => (
          <Text size="sm">
            {row.original.standardAffPercentage
              ? `${row.original.standardAffPercentage}%`
              : "-"}
          </Text>
        )
      },
      {
        accessorKey: "standardAffAmount",
        header: "Số tiền Aff",
        size: 110,
        cell: ({ row }) => (
          <Text size="sm" c="blue">
            {row.original.standardAffAmount
              ? `${row.original.standardAffAmount.toLocaleString("vi-VN")}đ`
              : "-"}
          </Text>
        )
      },
      {
        accessorKey: "content",
        header: "Nội dung",
        size: 150,
        cell: ({ row }) => (
          <Text size="sm" lineClamp={2}>
            {row.original.content || "-"}
          </Text>
        )
      },
      {
        accessorKey: "box",
        header: "Thùng",
        size: 100,
        cell: ({ row }) => <Text size="sm">{row.original.box || "-"}</Text>
      },
      {
        accessorKey: "creator",
        header: "Người tạo",
        size: 120,
        cell: ({ row }) => <Text size="sm">{row.original.creator || "-"}</Text>
      }
    ],
    []
  )

  if (isLoading) {
    return (
      <AppLayout>
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      </AppLayout>
    )
  }

  if (!income) {
    return (
      <AppLayout>
        <Box
          mt={40}
          mx="auto"
          px={{ base: 8, md: 28 }}
          w="100%"
          style={{
            background: "rgba(255,255,255,0.97)",
            borderRadius: rem(20),
            boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
            border: "1px solid #ececec"
          }}
        >
          <Center h={400}>
            <Stack align="center" gap="md">
              <Text size="lg" c="dimmed">
                Không tìm thấy đơn hàng
              </Text>
              <Button
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate({ to: "/marketing-storage/incomes" })}
              >
                Quay lại danh sách
              </Button>
            </Stack>
          </Center>
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
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
        {/* Header */}
        <Box pt={32} pb={16} px={{ base: 8, md: 28 }}>
          <Group justify="space-between" mb="md">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate({ to: "/marketing-storage/incomes" })}
            >
              Quay lại
            </Button>
          </Group>

          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={2} mb={4}>
                Chi tiết đơn hàng #{income.orderId}
              </Title>
              <Text c="dimmed" size="sm">
                Ngày đặt: {format(new Date(income.date), "dd/MM/yyyy HH:mm")}
              </Text>
            </div>
            <Badge size="lg" color="blue" variant="light">
              {income.products.length} sản phẩm
            </Badge>
          </Group>
        </Box>

        <Divider />

        {/* Order Information */}
        <Box px={{ base: 8, md: 28 }} py={20}>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper withBorder p="md" radius="md" h="100%">
                <Title order={5} mb="md">
                  Thông tin đơn hàng
                </Title>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Mã đơn hàng:
                    </Text>
                    <Text size="sm" fw={500}>
                      {income.orderId}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Ngày đặt:
                    </Text>
                    <Text size="sm">
                      {format(new Date(income.date), "dd/MM/yyyy HH:mm")}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Kênh bán hàng:
                    </Text>
                    <Text size="sm">{income.channel?.name || "-"}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Vận chuyển:
                    </Text>
                    <Text size="sm">{income.shippingProvider || "-"}</Text>
                  </Group>
                </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper withBorder p="md" radius="md" h="100%">
                <Title order={5} mb="md">
                  Thông tin khách hàng
                </Title>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Khách hàng:
                    </Text>
                    <Text size="sm" fw={500}>
                      {income.customer}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Tỉnh/Thành:
                    </Text>
                    <Text size="sm">{income.province}</Text>
                  </Group>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>

          {/* Summary */}
          {calculations && (
            <Paper withBorder p="md" radius="md" mt="md" bg="blue.0">
              <Grid gutter="xl">
                <Grid.Col span={{ base: 6, md: 3 }}>
                  <Stack gap={4}>
                    <Text size="sm" c="dimmed">
                      Tổng số lượng
                    </Text>
                    <Text size="xl" fw={700}>
                      {calculations.totalQuantity} SP
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 3 }}>
                  <Stack gap={4}>
                    <Text size="sm" c="dimmed">
                      Tổng giá trước CK
                    </Text>
                    <Text size="xl" fw={700}>
                      {calculations.totalBeforeDiscount.toLocaleString("vi-VN")}
                      đ
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 3 }}>
                  <Stack gap={4}>
                    <Text size="sm" c="dimmed">
                      Tổng chiết khấu
                    </Text>
                    <Text size="xl" fw={700} c="orange">
                      {calculations.totalDiscount.toLocaleString("vi-VN")}đ
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 3 }}>
                  <Stack gap={4}>
                    <Text size="sm" c="dimmed">
                      Tổng doanh thu
                    </Text>
                    <Text size="xl" fw={700} c="green">
                      {calculations.totalRevenue.toLocaleString("vi-VN")}đ
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Paper>
          )}
        </Box>

        <Divider />

        {/* Products Table */}
        <Box px={{ base: 4, md: 28 }} py={20}>
          <Title order={4} mb="md">
            Danh sách sản phẩm ({income.products.length})
          </Title>
          <CDataTable
            columns={productColumns}
            data={income.products as IncomeProduct[]}
            enableGlobalFilter={true}
            page={1}
            totalPages={1}
            onPageChange={() => {}}
            onPageSizeChange={() => {}}
            initialPageSize={100}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </Box>
      </Box>
    </AppLayout>
  )
}
