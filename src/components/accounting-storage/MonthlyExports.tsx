import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"

import {
  Box,
  Card,
  Divider,
  Flex,
  Group,
  rem,
  Select,
  SimpleGrid,
  Tabs,
  Text
} from "@mantine/core"
import { DatePickerInput, MonthPickerInput } from "@mantine/dates"
import { endOfMonth, startOfMonth } from "date-fns"

import { useLogs } from "../../hooks/useLogs"
import { DailyMatrixTable } from "./DailyMatrixTable"
import {
  DELIVERED_TAG_OPTIONS,
  RECEIVED_TAG_OPTION
} from "../../constants/tags"
import { CDataTable } from "../common/CDataTable"

interface Props {
  activeTab: string
}

type MonthItemRow = {
  _id: string
  name: string
  receivedQuantity: number
  deliveredQuantity: number
}

export const MonthlyExports = ({ activeTab }: Props) => {
  const { getStorageLogsByMonth, getDeliveredSummary } = useLogs()

  const [month, setMonth] = useState<Date | null>(new Date())
  const [tag, setTag] = useState<string>("")

  type RangeType = "day" | "range"
  const [avgRangeType, setAvgRangeType] = useState<RangeType>("range")
  const [avgStartDate, setAvgStartDate] = useState<Date | null>(() => {
    const now = new Date()
    return startOfMonth(now)
  })
  const [avgEndDate, setAvgEndDate] = useState<Date | null>(() => {
    const now = new Date()
    return endOfMonth(now)
  })

  const tagOptions = useMemo(
    () => [
      { value: "", label: "Tất cả" },
      ...DELIVERED_TAG_OPTIONS,
      ...RECEIVED_TAG_OPTION
    ],
    []
  )

  const queryPayload = useMemo(() => {
    const base = month
      ? { month: month.getMonth() + 1, year: month.getFullYear() }
      : { month: new Date().getMonth() + 1, year: new Date().getFullYear() }

    return { ...base, tag: tag || undefined }
  }, [month, tag])

  const { data, isFetching } = useQuery({
    queryKey: ["getStorageLogsByMonth", queryPayload, activeTab],
    queryFn: () => getStorageLogsByMonth(queryPayload),
    enabled: !!month,
    select: (res) => res.data
  })

  const avgQueryPayload = useMemo(() => {
    if (!avgStartDate || !avgEndDate) return null
    return { startDate: avgStartDate, endDate: avgEndDate }
  }, [avgStartDate, avgEndDate])

  const { data: avgData, isFetching: isFetchingAvg } = useQuery({
    queryKey: ["getDeliveredSummary", avgQueryPayload],
    queryFn: () => getDeliveredSummary(avgQueryPayload!),
    enabled: !!avgQueryPayload,
    select: (res) => res.data
  })

  const rows: MonthItemRow[] = data?.items ?? []

  /* =======================
     DataTable columns
  ======================= */
  const columns: ColumnDef<MonthItemRow>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Mặt hàng",
        cell: ({ row }) => (
          <Text fw={600} fz="sm" lineClamp={2}>
            {row.original.name}
          </Text>
        )
      },
      {
        accessorKey: "receivedQuantity",
        header: "Nhập kho",
        cell: ({ row }) => (
          <Text ta="left" fw={700}>
            {row.original.receivedQuantity}
          </Text>
        )
      },
      {
        accessorKey: "deliveredQuantity",
        header: "Xuất kho",
        cell: ({ row }) => (
          <Text ta="left" fw={700}>
            {row.original.deliveredQuantity}
          </Text>
        )
      }
    ],
    []
  )

  /* =======================
     Extra filters (toolbar)
  ======================= */
  const extraFilters = (
    <Group gap={12} align="flex-end">
      <Select
        data={tagOptions}
        value={tag}
        onChange={(v) => setTag(v ?? "")}
        label="Phân loại"
        placeholder="Tất cả"
        w={220}
        size="sm"
        radius="md"
      />
      <MonthPickerInput
        value={month}
        onChange={(d) => {
          setMonth(d)
          if (d) {
            setAvgRangeType("range")
            setAvgStartDate(startOfMonth(d))
            setAvgEndDate(endOfMonth(d))
          }
        }}
        valueFormat="MM/YYYY"
        label="Tháng"
        w={160}
        size="sm"
        radius="md"
      />
    </Group>
  )

  const avgFilters = (
    <Group gap={12} align="flex-end">
      <Select
        value={avgRangeType}
        onChange={(v) => setAvgRangeType((v as RangeType) || "range")}
        data={[
          { value: "range", label: "Khoảng ngày" },
          { value: "day", label: "Ngày" }
        ]}
        label="Loại"
        w={160}
        size="sm"
        radius="md"
      />

      {avgRangeType === "day" ? (
        <DatePickerInput
          label="Ngày"
          type="default"
          value={avgStartDate}
          onChange={(date) => {
            setAvgStartDate(
              date ? new Date(new Date(date).setHours(0, 0, 0, 0)) : null
            )
            setAvgEndDate(
              date ? new Date(new Date(date).setHours(23, 59, 59, 999)) : null
            )
          }}
          valueFormat="DD/MM/YYYY"
          size="sm"
          radius="md"
          w={170}
          placeholder="Chọn ngày"
          clearable
        />
      ) : (
        <DatePickerInput
          label="Khoảng ngày"
          type="range"
          value={
            avgStartDate || avgEndDate ? [avgStartDate, avgEndDate] : undefined
          }
          onChange={(value) => {
            const [start, end] = value || [null, null]
            setAvgStartDate(
              start ? new Date(new Date(start).setHours(0, 0, 0, 0)) : null
            )
            setAvgEndDate(
              end ? new Date(new Date(end).setHours(23, 59, 59, 999)) : null
            )
          }}
          valueFormat="DD/MM/YYYY"
          size="sm"
          radius="md"
          w={280}
          placeholder="Chọn khoảng ngày"
          clearable
        />
      )}
    </Group>
  )

  type AvgItemRow = {
    itemId: string
    code: string
    name: string
    totalDeliveredQuantity: number
    averagePerDay: number
  }

  const avgRows: AvgItemRow[] = useMemo(() => {
    const items = avgData?.items ?? []
    return items.map((it) => ({
      itemId: it.itemId,
      code: it.item?.code || "-",
      name: it.item?.name || "-",
      totalDeliveredQuantity: it.totalDeliveredQuantity || 0,
      averagePerDay: it.averagePerDay || 0
    }))
  }, [avgData])

  const avgColumns: ColumnDef<AvgItemRow>[] = useMemo(
    () => [
      {
        accessorKey: "code",
        header: "Mã",
        size: 120,
        cell: ({ row }) => (
          <Text fw={600} fz="sm">
            {row.original.code}
          </Text>
        )
      },
      {
        accessorKey: "name",
        header: "Mặt hàng",
        cell: ({ row }) => (
          <Text fw={600} fz="sm" lineClamp={2}>
            {row.original.name}
          </Text>
        )
      },
      {
        accessorKey: "totalDeliveredQuantity",
        header: "Tổng xuất",
        size: 120,
        cell: ({ row }) => (
          <Text ta="left" fw={700}>
            {row.original.totalDeliveredQuantity.toLocaleString("vi-VN")}
          </Text>
        )
      },
      {
        accessorKey: "averagePerDay",
        header: "TB/ngày",
        size: 120,
        cell: ({ row }) => (
          <Text ta="left" fw={700}>
            {row.original.averagePerDay.toLocaleString("vi-VN")}
          </Text>
        )
      }
    ],
    []
  )

  return (
    <Box
      mt={40}
      mx="auto"
      px={{ base: 8, md: 0 }}
      maw="100%"
      style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: rem(20),
        boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
        border: "1px solid #ececec"
      }}
    >
      {/* Header */}
      <Flex
        justify="space-between"
        align="flex-end"
        pt={28}
        pb={14}
        px={{ base: 10, md: 28 }}
        gap={12}
      >
        <Box>
          <Text fw={800} fz="xl" mb={4}>
            Xuất kho theo tháng
          </Text>
          <Text c="dimmed" fz="sm">
            Tổng hợp số liệu nhập – xuất theo tháng
          </Text>
        </Box>
      </Flex>

      <Divider my={0} />

      {/* Content */}
      <Box px={{ base: 10, md: 28 }} py={16}>
        <Tabs defaultValue="month" variant="pills" radius="xl" color="indigo">
          <Tabs.List mb={12}>
            <Tabs.Tab value="month">Tổng hợp tháng</Tabs.Tab>
            <Tabs.Tab value="daily">Theo ngày</Tabs.Tab>
            <Tabs.Tab value="avg">Tính trung bình</Tabs.Tab>
          </Tabs.List>

          {/* ===== Month summary ===== */}
          <Tabs.Panel value="month">
            <CDataTable<MonthItemRow, any>
              columns={columns}
              data={rows}
              isLoading={isFetching}
              loadingText="Đang tải số liệu tháng..."
              enableGlobalFilter={false}
              enableRowSelection={false}
              getRowId={(r) => r._id}
              extraFilters={extraFilters}
              /* không pagination */
              initialPageSize={100000}
              pageSizeOptions={[100000]}
              className="min-w-[720px] [&>div:last-child]:hidden"
            />
          </Tabs.Panel>

          {/* ===== Daily ===== */}
          <Tabs.Panel value="daily">
            <DailyMatrixTable
              month={month}
              data={data}
              isFetching={isFetching}
            />
          </Tabs.Panel>

          {/* ===== Average ===== */}
          <Tabs.Panel value="avg">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="md">
              <Card withBorder radius="md" p="md">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Tổng xuất
                </Text>
                <Text fw={800} fz="lg">
                  {(avgData?.totalDeliveredQuantity ?? 0).toLocaleString("vi-VN")}
                </Text>
              </Card>
              <Card withBorder radius="md" p="md">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Số ngày
                </Text>
                <Text fw={800} fz="lg">
                  {(avgData?.days ?? 0).toLocaleString("vi-VN")}
                </Text>
              </Card>
              <Card withBorder radius="md" p="md">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Trung bình/ngày
                </Text>
                <Text fw={800} fz="lg">
                  {(avgData?.averagePerDay ?? 0).toLocaleString("vi-VN")}
                </Text>
              </Card>
            </SimpleGrid>

            <CDataTable<AvgItemRow, any>
              columns={avgColumns}
              data={avgRows}
              isLoading={isFetchingAvg}
              loadingText="Đang tải dữ liệu trung bình..."
              enableGlobalFilter={false}
              enableRowSelection={false}
              getRowId={(r) => r.itemId}
              extraFilters={avgFilters}
              initialPageSize={100000}
              pageSizeOptions={[100000]}
              className="min-w-[720px] [&>div:last-child]:hidden"
            />
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Box>
  )
}
