import { useState, useMemo } from "react"
import { Text, Badge, Box, SegmentedControl, Flex } from "@mantine/core"
import { ColumnDef } from "@tanstack/react-table"
import { CDataTable } from "../common/CDataTable"
import { CPiechart } from "../common/CPiechart"
import { IconPackage } from "@tabler/icons-react"
import { DashboardSectionCard } from "./DashboardSectionCard"

interface ProductQuantityRow {
  code: string
  quantity: number
  percentage: number
}

export const ProductsQuantityStats = ({
  productsQuantity
}: {
  productsQuantity: Record<string, number>
}) => {
  const [mode, setMode] = useState<"table" | "chart">("table")

  const entries = Object.entries(productsQuantity || {})
  if (!entries.length) return null

  const totalQuantity = entries.reduce((s, [, v]) => s + v, 0) || 1

  const data: ProductQuantityRow[] = useMemo(
    () =>
      entries
        .map(([code, quantity]) => ({
          code,
          quantity,
          percentage:
            Math.round(
              ((quantity / totalQuantity) * 100 + Number.EPSILON) * 100
            ) / 100
        }))
        .sort((a, b) => b.quantity - a.quantity),
    [entries, totalQuantity]
  )

  const columns: ColumnDef<ProductQuantityRow>[] = useMemo(
    () => [
      {
        accessorKey: "code",
        header: "Mã sản phẩm",
        size: 200,
        cell: ({ getValue }) => (
          <Text fw={500}>{getValue<string>() || "-"}</Text>
        )
      },
      {
        accessorKey: "quantity",
        header: "Số lượng",
        size: 140,
        cell: ({ getValue }) => (
          <Text>{getValue<number>().toLocaleString()}</Text>
        )
      },
      {
        accessorKey: "percentage",
        header: "Tỉ lệ",
        size: 120,
        cell: ({ getValue }) => (
          <Badge variant="light" color="blue" size="sm">
            {getValue<number>()}%
          </Badge>
        )
      }
    ],
    []
  )

  const slices = data.map((item) => ({
    label: item.code,
    value: item.quantity
  }))

  return (
    <DashboardSectionCard
      title="Sản phẩm theo số lượng"
      subtitle={`Tổng: ${totalQuantity.toLocaleString()} sản phẩm`}
      icon={<IconPackage size={18} />}
      accentColor="blue"
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
          enableGlobalFilter={true}
          enableRowSelection={false}
          initialPageSize={10}
          pageSizeOptions={[10, 20, 50]}
          hideSearch={false}
        />
      ) : (
        <Flex gap={24} align="flex-start" justify="center">
          <Box style={{ minWidth: 320 }}>
            <CPiechart
              data={slices}
              width={320}
              radius={120}
              donut={false}
              showLegend
              legendItemWidth={120}
              enableOthers={slices.length > 10}
              title={
                <Text fw={500} fz="sm" c="dimmed">
                  Tổng: {totalQuantity.toLocaleString()} sản phẩm
                </Text>
              }
              valueFormatter={(v) => v.toLocaleString()}
              percentFormatter={(p) => `${p.toFixed(1)}%`}
            />
          </Box>
        </Flex>
      )}
    </DashboardSectionCard>
  )
}
