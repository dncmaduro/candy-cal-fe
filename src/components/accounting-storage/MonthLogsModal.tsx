import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { Box, Button, Group, Text } from "@mantine/core"
import { MonthPickerInput } from "@mantine/dates"
import { IconRefresh } from "@tabler/icons-react"

import { useLogs } from "../../hooks/useLogs"
import { CDataTable } from "../common/CDataTable"

interface Props {
  initialMonth?: Date | null
}

type MonthLogRow = {
  _id: string
  name: string
  receivedQuantity: number
  deliveredQuantity: number
}

export const MonthLogsModal = ({ initialMonth }: Props) => {
  const { getStorageLogsByMonth } = useLogs()

  const [q, setQ] = useState("")
  const [month, setMonth] = useState<Date | null>(initialMonth ?? new Date())

  const monthParam = useMemo(() => {
    const d = month ?? new Date()
    return { month: d.getMonth() + 1, year: d.getFullYear() }
  }, [month])

  const {
    data: monthlogsData,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ["getStorageLogsByMonth", monthParam.month, monthParam.year],
    queryFn: () => getStorageLogsByMonth(monthParam),
    enabled: !!month,
    select: (res) => res.data
  })

  const rows: MonthLogRow[] = useMemo(() => {
    return (monthlogsData?.items ?? []).map((x: any) => ({
      _id: x._id,
      name: x.name,
      receivedQuantity: Number(x.receivedQuantity ?? 0),
      deliveredQuantity: Number(x.deliveredQuantity ?? 0)
    }))
  }, [monthlogsData])

  const summary = useMemo(() => {
    const totalItems = rows.length
    const totalReceived = rows.reduce(
      (acc, r) => acc + (r.receivedQuantity || 0),
      0
    )
    const totalDelivered = rows.reduce(
      (acc, r) => acc + (r.deliveredQuantity || 0),
      0
    )
    return { totalItems, totalReceived, totalDelivered }
  }, [rows])

  const columns: ColumnDef<MonthLogRow>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Mặt hàng",
        cell: ({ row }) => (
          <Text fw={600} lineClamp={2}>
            {row.original.name}
          </Text>
        )
      },
      {
        accessorKey: "receivedQuantity",
        header: "Nhập",
        cell: ({ row }) => (
          <Text ta="right" fw={700}>
            {row.original.receivedQuantity}
          </Text>
        )
      },
      {
        accessorKey: "deliveredQuantity",
        header: "Xuất",
        cell: ({ row }) => (
          <Text ta="right" fw={700}>
            {row.original.deliveredQuantity}
          </Text>
        )
      }
    ],
    []
  )

  const extraFilters = (
    <Group gap={10} align="end" wrap="wrap">
      <MonthPickerInput
        label="Chọn tháng"
        value={month}
        onChange={setMonth}
        valueFormat="MM/YYYY"
        w={180}
      />

      <Box>
        <Text fz="xs" c="dimmed" mb={4}>
          Tổng mặt hàng
        </Text>
        <Text fw={700}>{summary.totalItems}</Text>
      </Box>

      <Box>
        <Text fz="xs" c="dimmed" mb={4}>
          Tổng nhập
        </Text>
        <Text fw={700}>{summary.totalReceived}</Text>
      </Box>

      <Box>
        <Text fz="xs" c="dimmed" mb={4}>
          Tổng xuất
        </Text>
        <Text fw={700}>{summary.totalDelivered}</Text>
      </Box>
    </Group>
  )

  const extraActions = (
    <Group gap={8}>
      <Button
        variant="light"
        leftSection={<IconRefresh size={16} />}
        onClick={() => refetch()}
        loading={isFetching}
      >
        Tải lại
      </Button>
    </Group>
  )

  return (
    <Box py={8} px={4} w="100%">
      <CDataTable<MonthLogRow, any>
        columns={columns}
        data={rows}
        isLoading={isFetching}
        loadingText="Đang tải số liệu theo tháng..."
        enableRowSelection={false}
        enableGlobalFilter
        globalFilterValue={q}
        onGlobalFilterChange={setQ}
        extraFilters={extraFilters}
        extraActions={extraActions}
        // no pagination
        initialPageSize={100000}
        pageSizeOptions={[100000]}
        className="min-w-[640px] [&>div:last-child]:hidden"
        getRowId={(r) => r._id}
      />
    </Box>
  )
}
