import React, { useMemo, useState } from "react"
import { Box, Flex, Stack, Text, Tooltip } from "@mantine/core"

type Datum = {
  label: string
  value: number // giá trị tuyệt đối (ví dụ doanh thu)
  percentage?: number // % do server trả (tùy chọn) để ước tính tổng thật sự
  raw?: any // đính kèm dữ liệu gốc nếu cần
}

type Props = {
  data: Datum[]
  title?: React.ReactNode

  // Layout & style
  width?: number // tổng bề rộng SVG (chiều ngang phần chart)
  radius?: number // bán kính pie
  donut?: boolean // true => donut, false => pie
  innerRatio?: number // tỉ lệ bán kính lỗ donut (0..0.9), chỉ dùng khi donut=true
  palette?: string[] // bảng màu tùy chỉnh
  othersColor?: string // màu cho "Khác"
  pieFontSize?: number

  // Legend
  showLegend?: boolean
  legendItemWidth?: number

  // “Khác” (Others)
  enableOthers?: boolean // tự thêm “Khác” nếu có percentage để ước tính tổng
  othersLabel?: string

  // Tooltip
  showTooltip?: boolean

  // Formatters
  valueFormatter?: (v: number) => string
  percentFormatter?: (p: number) => string

  // Hướng dọc / ngang của toàn bộ chart + legend
  orientation?: "vertical" | "horizontal"

  // Anh hưởng thứ tự: giữ nguyên mảng truyền vào
}

export const CPiechart: React.FC<Props> = ({
  data,
  title,
  width = 280,
  radius = 120,
  donut = true,
  innerRatio = 0.62,
  palette = [
    "#6365f1dd",
    "#10b981dd",
    "#f59e0bdd",
    "#ec4899dd",
    "#0ea5e9dd",
    "#84cc16dd",
    "#f43f5edd",
    "#8b5cf6dd",
    "#14b8a6dd",
    "#fb7185dd"
  ],
  othersColor = "#9ca3af",
  pieFontSize = 13,
  showLegend = true,
  legendItemWidth = 60,
  enableOthers = true,
  othersLabel = "Khác",
  showTooltip = true,
  valueFormatter = (v) => v.toLocaleString("vi-VN"),
  percentFormatter = (p) => `${p.toFixed(2)}%`,
  orientation = "horizontal"
}) => {
  const [hovered, setHovered] = useState<number | null>(null)
  const center = radius + 20 // padding nhỏ
  const svgSize = center * 2

  // Tổng được biết từ client
  const listedTotal = useMemo(
    () => data.reduce((acc, d) => acc + (d.value || 0), 0),
    [data]
  )

  // Nếu có percentage từ server, ước tính tổng thực = value / (percentage/100)
  const { grandTotal, sumPercent } = useMemo(() => {
    const sumP = data.reduce((a, d) => a + (d.percentage ?? 0), 0)
    const ref = data.find((d) => (d.percentage ?? 0) > 0)
    const total =
      ref && ref.percentage && ref.percentage > 0
        ? ref.value / (ref.percentage / 100)
        : listedTotal
    return { grandTotal: total, sumPercent: sumP }
  }, [data, listedTotal])

  const computedRows = useMemo(() => {
    if (!enableOthers) return data
    // chỉ thêm "Khác" khi có dấu hiệu tổng > listedTotal
    const othersValue = Math.max(Math.round(grandTotal - listedTotal), 0)
    const othersPercent = grandTotal > 0 ? (othersValue / grandTotal) * 100 : 0

    const shouldShowOthers =
      (sumPercent > 0 && othersPercent > 0.5) ||
      (othersValue > 0.5 && grandTotal > listedTotal)

    if (!shouldShowOthers) return data
    return [
      ...data,
      { label: othersLabel, value: othersValue, percentage: othersPercent }
    ]
  }, [data, grandTotal, listedTotal, enableOthers, othersLabel, sumPercent])

  const totalForPie = grandTotal || listedTotal

  const getColor = (label: string, i: number) =>
    label === othersLabel ? othersColor : palette[i % palette.length]

  // path của từng lát
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

  const renderSlice = (d: Datum, i: number, start: number) => {
    const angle = totalForPie ? (d.value / totalForPie) * Math.PI * 2 : 0
    const end = start + angle
    const pathD = describeArc(center, center, radius, start, end)
    const mid = (start + end) / 2
    const labelX = center + radius * 0.55 * Math.cos(mid)
    const labelY = center + radius * 0.55 * Math.sin(mid)
    const percent = totalForPie ? (d.value / totalForPie) * 100 : 0

    const slice = (
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
        <path
          d={pathD}
          fill={getColor(d.label, i)}
          stroke="#fff"
          strokeWidth={1}
        />
        {/* hiển thị % trên lát khi đủ lớn */}
        {percent > 10 && (
          <text
            x={labelX}
            y={labelY}
            fill="#fff"
            fontSize={pieFontSize || 12}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ pointerEvents: "none", fontWeight: 600 }}
          >
            {percentFormatter(percent)}
          </text>
        )}
      </g>
    )

    const wrapped =
      showTooltip && d.label ? (
        <Tooltip
          key={i}
          withArrow
          openDelay={100}
          label={
            <div style={{ fontSize: 12 }}>
              <b>{d.label}</b>
              <div>Giá trị: {valueFormatter(d.value)}</div>
              <div>Tỉ lệ: {percentFormatter(percent)}</div>
              {typeof d.percentage === "number" && (
                <div>Server %: {percentFormatter(d.percentage)}</div>
              )}
              {d.label === othersLabel && grandTotal > 0 && (
                <div>
                  (Ước tính tổng ≈ {valueFormatter(Math.round(grandTotal))})
                </div>
              )}
            </div>
          }
          position="right"
        >
          {slice}
        </Tooltip>
      ) : (
        slice
      )

    return { node: wrapped, end }
  }

  return (
    <Flex
      direction={orientation === "vertical" ? "column" : "row"}
      align={"center"}
      gap={24}
    >
      <Box>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{ maxWidth: width }}
          role="img"
          aria-label="Pie chart"
        >
          {/* Trạng thái rỗng */}
          {computedRows.length === 0 && (
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

          {/* Vẽ các lát */}
          {(() => {
            let start = -Math.PI / 2
            return computedRows.map((d, i) => {
              const { node, end } = renderSlice(d, i, start)
              start = end
              return node
            })
          })()}

          {/* viền ngoài mỏng */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#ddd"
            strokeWidth={1}
            pointerEvents="none"
          />

          {/* Donut hole */}
          {donut && (
            <circle
              cx={center}
              cy={center}
              r={Math.max(8, radius * innerRatio)}
              fill="#fff"
              pointerEvents="none"
            />
          )}
        </svg>
      </Box>

      {showLegend && (
        <Stack gap={10} flex={1} mih={60}>
          {title && (
            <Text fw={600} fz="sm" c="dimmed">
              {title}
            </Text>
          )}
          <Box>
            {computedRows.map((d, i) => {
              const percent = totalForPie ? (d.value / totalForPie) * 100 : 0
              return (
                <Flex key={i} align="center" gap={8} mb={4}>
                  <Box
                    w={14}
                    h={14}
                    style={{
                      background: getColor(d.label, i),
                      borderRadius: 4,
                      flex: "0 0 14px"
                    }}
                  />
                  <Text fz={13} fw={500} style={{ flex: 1 }} lineClamp={1}>
                    {i + 1}. {d.label || "—"}
                  </Text>
                  <Text
                    fz={13}
                    c="dimmed"
                    style={{ flex: 1 }}
                    w={legendItemWidth}
                    ta="right"
                  >
                    {valueFormatter(d.value)}
                  </Text>
                  <Text
                    fz={12}
                    w={50}
                    ta="right"
                    c={
                      percent >= 20
                        ? "green"
                        : percent >= 10
                          ? "yellow.7"
                          : "blue.6"
                    }
                  >
                    {percentFormatter(percent)}
                  </Text>
                </Flex>
              )
            })}
            {computedRows.length === 0 && (
              <Text c="dimmed" fz={13}>
                Không có dữ liệu
              </Text>
            )}
          </Box>
        </Stack>
      )}
    </Flex>
  )
}
