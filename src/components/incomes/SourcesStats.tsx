import { useState, useMemo } from "react"
import { Text, Group, Badge, Box, SegmentedControl, Flex } from "@mantine/core"
import { ColumnDef } from "@tanstack/react-table"
import { CPiechart } from "../common/CPiechart"
import { CDataTable } from "../common/CDataTable"
import { DashboardSectionCard } from "./DashboardSectionCard"
import { fmtPercent } from "../../utils/fmt"
import { IconHierarchy2 } from "@tabler/icons-react"
import {
  getIncomeSourceChangeValue,
  getIncomeSourceChartColor,
  getIncomeSourceLabel,
  sortIncomeSources,
  type IncomeSourceStats,
  type IncomeSourceStatsChanges
} from "../../utils/incomeSources"

interface SourceRow {
  key: string
  label: string
  value: number
  pct: number
  change?: number
}

export const SourcesStats = ({
  sources,
  changes
}: {
  sources: IncomeSourceStats
  changes?: IncomeSourceStatsChanges
}) => {
  const [mode, setMode] = useState<"table" | "chart">("table")

  const orderedKeys = useMemo(
    () =>
      sortIncomeSources(
        Object.keys(sources || {}).filter(
          (key) => typeof sources[key] === "number"
        )
      ),
    [sources]
  )

  const sum =
    orderedKeys.reduce((total, key) => total + (sources[key] || 0), 0) || 1

  const data: SourceRow[] = useMemo(
    () =>
      orderedKeys.map((key) => {
        const value = sources[key] || 0
        return {
          key,
          label: getIncomeSourceLabel(key),
          value,
          pct: Math.round(((value / sum) * 100 + Number.EPSILON) * 100) / 100,
          change: getIncomeSourceChangeValue(changes, key)
        }
      }),
    [orderedKeys, sources, sum, changes]
  )

  const columns: ColumnDef<SourceRow>[] = useMemo(
    () => [
      {
        accessorKey: "label",
        header: "Nguồn",
        size: 160,
        cell: ({ getValue }) => <Text fw={500}>{getValue<string>()}</Text>
      },
      {
        accessorKey: "value",
        header: "Doanh thu",
        size: 140,
        cell: ({ getValue }) => (
          <Text>{getValue<number>().toLocaleString()}</Text>
        )
      },
      {
        accessorKey: "pct",
        header: "Tỉ lệ",
        size: 160,
        cell: ({ row }) => (
          <Group align="center" gap={8}>
            <span>{row.original.pct}%</span>
            {typeof row.original.change === "number" && (
              <Badge
                color={row.original.change >= 0 ? "green" : "red"}
                variant="light"
                size="sm"
              >
                {row.original.change >= 0 ? "+" : "-"}
                {fmtPercent(Math.abs(row.original.change))}
              </Badge>
            )}
          </Group>
        )
      }
    ],
    []
  )

  if (!data.length) return null

  return (
    <DashboardSectionCard
      title="Chi tiết theo nguồn"
      subtitle={`Tổng: ${sum.toLocaleString()} VNĐ`}
      icon={<IconHierarchy2 size={18} />}
      accentColor="indigo"
      rightSection={
        <SegmentedControl
          value={mode}
          onChange={(v) => setMode(v as "table" | "chart")}
          data={[
            { label: "Bảng", value: "table" },
            { label: "Biểu đồ", value: "chart" }
          ]}
          size="xs"
        />
      }
    >
      {mode === "table" ? (
        <CDataTable
          columns={columns}
          data={data}
          enableGlobalFilter={false}
          enableRowSelection={false}
          initialPageSize={10}
          pageSizeOptions={[10, 20]}
          hideSearch={true}
        />
      ) : (
        <Flex gap={24} align="flex-start">
          <Box style={{ minWidth: 280 }}>
            <CPiechart
              data={data.map((s) => ({ label: s.label, value: s.value }))}
              palette={data.map((item) => getIncomeSourceChartColor(item.key))}
              width={280}
              radius={110}
              donut={false}
              showLegend
              legendItemWidth={90}
              enableOthers={false}
              title={
                <Text fw={500} fz="sm" c="dimmed">
                  Tổng: {sum.toLocaleString()} VNĐ
                </Text>
              }
              valueFormatter={(v) => v.toLocaleString() + "₫"}
              percentFormatter={(p) => fmtPercent(p)}
            />
          </Box>
        </Flex>
      )}
    </DashboardSectionCard>
  )
}
