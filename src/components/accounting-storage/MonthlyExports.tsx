import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"

import {
  Box,
  Divider,
  Flex,
  Group,
  rem,
  Select,
  Tabs,
  Text
} from "@mantine/core"
import { MonthPickerInput } from "@mantine/dates"

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
  const { getStorageLogsByMonth } = useLogs()

  const [month, setMonth] = useState<Date | null>(new Date())
  const [tag, setTag] = useState<string>("")

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
        onChange={setMonth}
        valueFormat="MM/YYYY"
        label="Tháng"
        w={160}
        size="sm"
        radius="md"
      />
    </Group>
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
        </Tabs>
      </Box>
    </Box>
  )
}
