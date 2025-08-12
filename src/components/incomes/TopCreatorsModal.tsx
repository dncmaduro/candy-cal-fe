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
  Badge,
  Tooltip,
  Stack
} from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { useIncomes } from "../../hooks/useIncomes"

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
  const [hovered, setHovered] = useState<number | null>(null)

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

  // Colors palette (cycled)
  const colors = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#0ea5e9",
    "#84cc16",
    "#f43f5e",
    "#8b5cf6",
    "#14b8a6",
    "#fb7185"
  ]
  const getColor = (label: string, index: number) =>
    label === "Khác" ? "#9ca3af" : colors[index % colors.length]

  const center = 140
  const radius = 120

  const describeArc = (
    cx: number,
    cy: number,
    r: number,
    start: number,
    end: number
  ) => {
    const startX = cx + r * Math.cos(start)
    const startY = cy + r * Math.sin(start)
    const endX = cx + r * Math.cos(end)
    const endY = cy + r * Math.sin(end)
    const largeArc = end - start > Math.PI ? 1 : 0
    return `M ${cx} ${cy} L ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY} Z`
  }

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
        <Flex direction={{ base: "column", md: "row" }} gap={24}>
          <Box>
            <svg
              width={center * 2}
              height={center * 2}
              viewBox={`0 0 ${center * 2} ${center * 2}`}
              style={{ maxWidth: 320 }}
            >
              {rows.length === 0 && !isLoading && (
                <text
                  x="50%"
                  y="50%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="#888"
                  fontSize={14}
                >
                  Không có dữ liệu
                </text>
              )}
              {isLoading && (
                <text
                  x="50%"
                  y="50%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="#555"
                  fontSize={14}
                >
                  Đang tải...
                </text>
              )}
              {!isLoading &&
                rows.reduce((acc, r) => acc + r.totalIncome, 0) === 0 &&
                rows.length > 0 && (
                  <text
                    x="50%"
                    y="50%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fill="#888"
                    fontSize={14}
                  >
                    Tổng = 0
                  </text>
                )}
              {(() => {
                let start = -Math.PI / 2
                const totalForPie = grandTotal || totalIncome
                return displayRows.map((r, i) => {
                  const value = r.totalIncome
                  const angle = totalForPie
                    ? (value / totalForPie) * Math.PI * 2
                    : 0
                  const end = start + angle
                  const d = describeArc(center, center, radius, start, end)
                  const mid = (start + end) / 2
                  const labelX = center + radius * 0.55 * Math.cos(mid)
                  const labelY = center + radius * 0.55 * Math.sin(mid)
                  const percent = totalForPie ? (value / totalForPie) * 100 : 0
                  const g = (
                    <g
                      key={i}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        cursor: "pointer",
                        transformOrigin: `${center}px ${center}px`,
                        transform: hovered === i ? "scale(1.05)" : "scale(1)",
                        transition: "transform 120ms ease"
                      }}
                    >
                      <Tooltip
                        label={
                          <div style={{ fontSize: 12 }}>
                            <b>{r.creator || "—"}</b>
                            <div>Doanh thu: {value.toLocaleString()} VNĐ</div>
                            <div>Tỉ lệ: {percent.toFixed(2)}%</div>
                            {r.percentage !== undefined && (
                              <div>Server %: {r.percentage.toFixed(2)}%</div>
                            )}
                            {r.creator === "Khác" && sumPercent > 0 && (
                              <div>
                                (Ước tính trên tổng ≈{" "}
                                {Math.round(grandTotal).toLocaleString()} VNĐ)
                              </div>
                            )}
                          </div>
                        }
                        withArrow
                        openDelay={100}
                        position="right"
                      >
                        <path
                          d={d}
                          fill={getColor(r.creator, i)}
                          stroke="#fff"
                          strokeWidth={1}
                        />
                      </Tooltip>
                      {percent > 4 && (
                        <text
                          x={labelX}
                          y={labelY}
                          fill="#fff"
                          fontSize={12}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{ pointerEvents: "none", fontWeight: 600 }}
                        >
                          {percent.toFixed(1)}%
                        </text>
                      )}
                    </g>
                  )
                  start = end
                  return g
                })
              })()}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#ddd"
                strokeWidth={1}
                pointerEvents="none"
              />
            </svg>
          </Box>
          <Stack gap={10} flex={1}>
            <Text fw={600} fz="sm" c="dimmed">
              Tổng doanh thu liệt kê: {totalIncome.toLocaleString()} VNĐ
              {showOthers && refRow?.percentage ? (
                <>
                  {" · Ước tính tổng toàn bộ: "}
                  {Math.round(grandTotal).toLocaleString()} VNĐ
                </>
              ) : null}
            </Text>
            <Box>
              {displayRows.map((r, i) => {
                const totalForPie = grandTotal || totalIncome
                const percent = totalForPie
                  ? (r.totalIncome / totalForPie) * 100
                  : 0
                return (
                  <Flex key={i} align="center" gap={8} mb={4}>
                    <Box
                      w={14}
                      h={14}
                      style={{
                        background: getColor(r.creator, i),
                        borderRadius: 4
                      }}
                    />
                    <Text fz={13} fw={500} style={{ flex: 1 }} lineClamp={1}>
                      {i + 1}. {r.creator || "—"}
                    </Text>
                    <Text fz={13} c="dimmed" w={90} ta="right">
                      {r.totalIncome.toLocaleString()}₫
                    </Text>
                    <Text
                      fz={12}
                      c={
                        percent >= 20
                          ? "green"
                          : percent >= 10
                            ? "yellow.7"
                            : "blue.6"
                      }
                      w={60}
                      ta="right"
                    >
                      {percent.toFixed(2)}%
                    </Text>
                  </Flex>
                )
              })}
              {!isLoading && rows.length === 0 && (
                <Text c="dimmed" fz={13}>
                  Không có dữ liệu
                </Text>
              )}
            </Box>
          </Stack>
        </Flex>
      )}
    </Box>
  )
}
