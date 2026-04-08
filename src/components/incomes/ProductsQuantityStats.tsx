import { useMemo, useState } from "react"
import { Accordion, SegmentedControl, Text } from "@mantine/core"
import { ColumnDef } from "@tanstack/react-table"
import { CDataTable } from "../common/CDataTable"
import { IconPackage } from "@tabler/icons-react"
import { DashboardSectionCard } from "./DashboardSectionCard"
import { RankedBarList } from "./analytics/RankedBarList"
import { formatCompactCurrency } from "./analytics/formatters"

interface ProductRankingRow {
  code: string
  value: number
  percentage: number
}

export const ProductsQuantityStats = ({
  productsQuantity,
  productsRevenue
}: {
  productsQuantity: Record<string, number>
  productsRevenue?: Record<string, number>
}) => {
  const [rankingMode, setRankingMode] = useState<"quantity" | "revenue">(
    "quantity"
  )

  const entries = Object.entries(productsQuantity || {})
  if (!entries.length) return null

  const totalQuantity = entries.reduce((s, [, v]) => s + v, 0) || 1
  const revenueEntries = Object.entries(productsRevenue || {}).filter(
    ([, value]) => value > 0
  )
  const totalRevenue =
    revenueEntries.reduce((sum, [, value]) => sum + value, 0) || 1

  const quantityData: ProductRankingRow[] = useMemo(
    () =>
      entries
        .map(([code, value]) => ({
          code,
          value,
          percentage:
            Math.round(
              ((value / totalQuantity) * 100 + Number.EPSILON) * 100
            ) / 100
        }))
        .sort((a, b) => b.value - a.value),
    [entries, totalQuantity]
  )

  const revenueData: ProductRankingRow[] = useMemo(
    () =>
      revenueEntries
        .map(([code, value]) => ({
          code,
          value,
          percentage:
            Math.round(
              ((value / totalRevenue) * 100 + Number.EPSILON) * 100
            ) / 100
        }))
        .sort((a, b) => b.value - a.value),
    [revenueEntries, totalRevenue]
  )

  const activeData =
    rankingMode === "revenue" && revenueData.length > 0 ? revenueData : quantityData
  const activeTotal =
    rankingMode === "revenue" && revenueData.length > 0 ? totalRevenue : totalQuantity
  const isRevenueMode = rankingMode === "revenue" && revenueData.length > 0
  const topItem = activeData[0]

  const columns: ColumnDef<ProductRankingRow>[] = useMemo(
    () => [
      {
        accessorKey: "code",
        header: "Mã sản phẩm",
        size: 200,
        meta: {
          align: "left"
        },
        cell: ({ getValue }) => (
          <Text fw={500}>{getValue<string>() || "-"}</Text>
        )
      },
      {
        accessorKey: "value",
        header: isRevenueMode ? "Doanh thu" : "Số lượng",
        size: 140,
        meta: {
          align: "right",
          isNumeric: true
        },
        cell: ({ getValue }) => (
          <Text>
            {isRevenueMode
              ? formatCompactCurrency(getValue<number>())
              : getValue<number>().toLocaleString("vi-VN")}
          </Text>
        )
      },
      {
        accessorKey: "percentage",
        header: "Tỉ lệ",
        size: 120,
        meta: {
          align: "right",
          isNumeric: true
        },
        cell: ({ getValue }) => (
          <Text fw={600}>{getValue<number>()}%</Text>
        )
      }
    ],
    [isRevenueMode]
  )

  return (
    <DashboardSectionCard
      title="Sản phẩm"
      subtitle={
        topItem
          ? isRevenueMode
            ? `${topItem.code} dẫn đầu với ${formatCompactCurrency(topItem.value)} doanh thu`
            : `${topItem.code} dẫn đầu với ${topItem.value.toLocaleString("vi-VN")} sản phẩm`
          : `Tổng: ${totalQuantity.toLocaleString()} sản phẩm`
      }
      icon={<IconPackage size={18} />}
      accentColor="blue"
      rightSection={
        <SegmentedControl
          size="xs"
          radius="xl"
          value={rankingMode}
          onChange={(value) => setRankingMode(value as "quantity" | "revenue")}
          data={[
            { label: "Theo số lượng", value: "quantity" },
            { label: "Theo doanh thu", value: "revenue" }
          ]}
        />
      }
    >
      <RankedBarList
        items={activeData.map((item) => ({
          key: item.code,
          label: item.code,
          value: item.value,
          caption: isRevenueMode
            ? `${item.percentage}% tổng doanh thu`
            : `${item.percentage}% tổng số lượng`
        }))}
        totalValue={activeTotal}
        color="blue"
        valueFormatter={(value) =>
          isRevenueMode
            ? formatCompactCurrency(value)
            : `${value.toLocaleString("vi-VN")} sản phẩm`
        }
        footer={
          activeData.length > 8 ? (
            <Accordion variant="contained" radius="lg">
              <Accordion.Item value="full-table">
                <Accordion.Control>Xem chi tiết toàn bộ danh sách</Accordion.Control>
                <Accordion.Panel px={0}>
                  <CDataTable
                    variant="analytics"
                    columns={columns}
                    data={activeData}
                    enableGlobalFilter
                    enableRowSelection={false}
                    initialPageSize={8}
                    pageSizeOptions={[8, 16, 32]}
                  />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          ) : null
        }
      />
    </DashboardSectionCard>
  )
}
