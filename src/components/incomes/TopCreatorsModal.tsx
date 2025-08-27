import { useState } from "react"
import { DatePickerInput } from "@mantine/dates"
import {
  Box,
  Flex,
  Group,
  Loader,
  ScrollArea,
  Table,
  Text,
  SegmentedControl,
  Badge
} from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { useIncomes } from "../../hooks/useIncomes"
import { CPiechart } from "../common/CPiechart"
import { TopCreatorItem } from "../../hooks/models"

export const TopCreatorsModal = () => {
  const { getTopCreators } = useIncomes()
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const [view, setView] = useState<"affiliate" | "affiliateAds">("affiliate")
  const [mode, setMode] = useState<"table" | "pie">("table")

  const { data, isLoading } = useQuery({
    queryKey: ["topCreators", startDate, endDate],
    queryFn: () =>
      getTopCreators({
        startDate: (startDate ?? new Date()).toISOString(),
        endDate: (endDate ?? new Date()).toISOString()
      }),
    select: (d) => d.data
  })

  const rows =
    (view === "affiliate" ? data?.affiliate : data?.affiliateAds) || []

  const totalIncome = rows.reduce((acc, r) => acc + (r.totalIncome || 0), 0)

  // Derive "others" (Khác) from percentages if available
  const sumPercent = rows.reduce(
    (acc, r) => acc + (r.percentage !== undefined ? r.percentage : 0),
    0
  )
  const refRow = rows.find((r) => (r.percentage || 0) > 0)
  const grandTotal =
    refRow && refRow.percentage && refRow.percentage > 0
      ? refRow.totalIncome / (refRow.percentage / 100)
      : totalIncome // fallback -> only listed sum known
  const othersPercentRaw = sumPercent > 0 ? Math.max(100 - sumPercent, 0) : 0
  const othersIncome = Math.max(grandTotal - totalIncome, 0)
  const othersPercent =
    othersPercentRaw > 0
      ? othersPercentRaw
      : grandTotal > 0
        ? (othersIncome / grandTotal) * 100
        : 0
  const showOthers = othersIncome > 0.5 || othersPercent > 0.5

  const displayRows = showOthers
    ? [
        ...rows,
        {
          creator: "Khác",
          totalIncome: Math.round(othersIncome),
          percentage: othersPercent
        }
      ]
    : rows

  const rawRows =
    (view === "affiliate" ? data?.affiliate : data?.affiliateAds) || []

  const chartData = rawRows.map((r: TopCreatorItem) => ({
    label: r.creator || "—",
    value: r.totalIncome || 0,
    percentage: typeof r.percentage === "number" ? r.percentage : undefined,
    raw: r
  }))

  const listedTotal = chartData.reduce((a, d) => a + d.value, 0)

  return (
    <Box>
      <Group mb={16} gap={12} align="flex-end" wrap="wrap">
        <DatePickerInput
          label="Từ ngày"
          value={startDate}
          onChange={(d) => setStartDate(d)}
          valueFormat="DD/MM/YYYY"
          size="sm"
        />
        <DatePickerInput
          label="Đến ngày"
          value={endDate}
          onChange={(d) => setEndDate(d)}
          valueFormat="DD/MM/YYYY"
          size="sm"
        />
        <SegmentedControl
          value={view}
          onChange={(val) => setView(val as any)}
          data={[
            { label: "Affiliate", value: "affiliate" },
            { label: "Affiliate Ads", value: "affiliateAds" }
          ]}
          radius="xl"
          size="sm"
        />
        <SegmentedControl
          value={mode}
          onChange={(val) => setMode(val as any)}
          data={[
            { label: "Bảng", value: "table" },
            { label: "Pie chart", value: "pie" }
          ]}
          radius="xl"
          size="sm"
        />
      </Group>
      {mode === "table" && (
        <>
          <ScrollArea h={420} offsetScrollbars>
            <Table
              withTableBorder
              withColumnBorders
              highlightOnHover
              verticalSpacing="xs"
              horizontalSpacing="sm"
              striped
              stickyHeader
              miw={600}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 50 }}>#</Table.Th>
                  <Table.Th>Nhà sáng tạo</Table.Th>
                  <Table.Th style={{ width: 140 }}>Doanh thu</Table.Th>
                  <Table.Th style={{ width: 120 }}>% đóng góp</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {isLoading ? (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Flex justify="center" align="center" h={120}>
                        <Loader />
                      </Flex>
                    </Table.Td>
                  </Table.Tr>
                ) : rows.length > 0 ? (
                  displayRows.map((r, i) => {
                    const percent =
                      r.percentage ??
                      (grandTotal ? (r.totalIncome / grandTotal) * 100 : 0)
                    return (
                      <Table.Tr key={r.creator + i}>
                        <Table.Td>{i + 1}</Table.Td>
                        <Table.Td>
                          <Text fw={500}>{r.creator || "—"}</Text>
                        </Table.Td>
                        <Table.Td>{r.totalIncome?.toLocaleString()}</Table.Td>
                        <Table.Td>
                          <Badge
                            color={
                              percent >= 20
                                ? "green"
                                : percent >= 10
                                  ? "yellow"
                                  : "blue"
                            }
                            variant="light"
                          >
                            {percent.toFixed(2)}%
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    )
                  })
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Flex justify="center" align="center" h={120}>
                        <Text c="dimmed">Không có dữ liệu</Text>
                      </Flex>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
          {rows.length > 0 && (
            <Text mt={12} fz="sm" c="dimmed">
              Tổng doanh thu liệt kê: {totalIncome.toLocaleString()} VNĐ
              {showOthers && refRow?.percentage ? (
                <>
                  {" · Ước tính tổng toàn bộ: "}
                  {Math.round(grandTotal).toLocaleString()} VNĐ
                </>
              ) : null}
            </Text>
          )}
        </>
      )}
      {mode === "pie" && (
        <CPiechart
          data={chartData}
          title={
            <>
              Tổng doanh thu liệt kê: {listedTotal.toLocaleString("vi-VN")} VNĐ
              {/* nếu muốn hiện thêm estimated total, component đã có tooltip ở lát "Khác" */}
            </>
          }
          width={320} // max chiều rộng vùng chart
          radius={120} // bán kính
          donut={false} // bật donut
          enableOthers // tự thêm "Khác" nếu có percentage
          othersLabel="Khác"
          showTooltip
          valueFormatter={(v) => `${v.toLocaleString("vi-VN")}₫`}
          percentFormatter={(p) => `${p.toFixed(2)}%`}
        />
      )}
    </Box>
  )
}
