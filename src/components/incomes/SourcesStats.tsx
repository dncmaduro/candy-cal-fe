import { useState } from "react"
import {
  Paper,
  Text,
  Group,
  Table,
  Badge,
  Box,
  SegmentedControl,
  Flex,
  Tooltip
} from "@mantine/core"
import { fmtPercent } from "../../utils/fmt"

const COLORS: Record<string, string> = {
  ads: "#16a34a",
  affiliate: "#dc2626",
  affiliateAds: "#7c3aed",
  other: "#2563eb"
}

const PALETTE = [
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
const getColor = (key: string, index: number) =>
  COLORS[key] || PALETTE[index % PALETTE.length]

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

export const SourcesStats = ({
  sources,
  changes
}: {
  sources: Record<string, number>
  changes?: any
}) => {
  const [mode, setMode] = useState<"table" | "chart">("table")
  const [hovered, setHovered] = useState<number | null>(null)

  const entries = Object.entries(sources || {})
  const sum = entries.reduce((s, [, v]) => s + v, 0) || 1
  const labels: Record<string, string> = {
    ads: "Ads",
    affiliate: "Affiliate",
    affiliateAds: "Affiliate Ads",
    other: "Khác"
  }

  // prepare slices for pie
  const slices = entries.map(([k, v]) => ({
    key: k,
    label: labels[k] || k,
    value: v,
    pct: Math.round(((v / sum) * 100 + Number.EPSILON) * 100) / 100,
    change:
      k === "ads"
        ? changes?.adsPct
        : k === "affiliate"
          ? changes?.affiliatePct
          : k === "affiliateAds"
            ? changes?.affiliateAdsPct
            : changes?.otherPct
  }))

  return (
    <Paper withBorder p="lg" radius="lg">
      <Group justify="apart" align="center" mb={8}>
        <Text fw={600}>Chi tiết theo nguồn</Text>
        <SegmentedControl
          value={mode}
          onChange={(v) => setMode(v as "table" | "chart")}
          data={[
            { label: "Bảng", value: "table" },
            { label: "Biểu đồ", value: "chart" }
          ]}
          size="sm"
        />
      </Group>

      {mode === "table" ? (
        <Table
          withColumnBorders
          withTableBorder
          striped
          verticalSpacing="xs"
          horizontalSpacing="md"
          miw={300}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 160 }}>Nguồn</Table.Th>
              <Table.Th style={{ width: 120 }}>Doanh thu</Table.Th>
              <Table.Th style={{ width: 100 }}>Tỉ lệ</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {slices.map((s) => (
              <Table.Tr key={s.key}>
                <Table.Td>{s.label}</Table.Td>
                <Table.Td>{s.value.toLocaleString()}</Table.Td>
                <Table.Td>
                  <Group align="center" gap={8}>
                    <span>{s.pct}%</span>
                    {typeof s.change === "number" && (
                      <Badge
                        color={s.change >= 0 ? "green" : "red"}
                        variant="light"
                      >
                        {s.change >= 0 ? "+" : "-"}
                        {fmtPercent(Math.abs(s.change))}
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Flex gap={24} align="flex-start">
          {/* SVG pie like TopCreatorsModal */}
          <Box>
            <svg width={280} height={280} viewBox="0 0 280 280">
              {(() => {
                const center = 140
                const radius = 110
                let start = -Math.PI / 2
                const total = sum
                return slices.map((s, i) => {
                  const value = s.value
                  const angle = total ? (value / total) * Math.PI * 2 : 0
                  const end = start + angle
                  const d = describeArc(center, center, radius, start, end)
                  const mid = (start + end) / 2
                  const labelX = center + radius * 0.55 * Math.cos(mid)
                  const labelY = center + radius * 0.55 * Math.sin(mid)
                  const percent = total ? (value / total) * 100 : 0
                  const color = getColor(s.key, i)
                  const transformStyle =
                    hovered === i
                      ? {
                          transformOrigin: `${center}px ${center}px`,
                          transform: "scale(1.05)"
                        }
                      : {}
                  const g = (
                    <g
                      key={s.key}
                      style={{
                        cursor: "pointer",
                        transition: "transform 120ms ease",
                        ...transformStyle
                      }}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <Tooltip
                        label={
                          <div style={{ fontSize: 12 }}>
                            <b>{s.label}</b>
                            <div>Doanh thu: {s.value.toLocaleString()} VNĐ</div>
                            <div>Tỉ lệ: {percent.toFixed(2)}%</div>
                            {typeof s.change === "number" && (
                              <div>Change: {fmtPercent(s.change)}</div>
                            )}
                          </div>
                        }
                        withArrow
                        openDelay={100}
                        position="right"
                      >
                        <path
                          d={d}
                          fill={color}
                          stroke="#fff"
                          strokeWidth={1}
                        />
                      </Tooltip>
                      {percent >= 10 && (
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
            </svg>
          </Box>

          {/* Legend */}
          <div
            style={{
              minWidth: 220,
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}
          >
            <Text fw={600} fz="sm" c="dimmed">
              Tổng: {sum.toLocaleString()} VNĐ
            </Text>
            {slices.map((s, i) => (
              <Group key={s.key} align="center" gap={8}>
                <Box
                  style={{
                    width: 14,
                    height: 14,
                    background: getColor(s.key, i),
                    borderRadius: 4
                  }}
                />
                <Text fz={13} fw={500} style={{ flex: 1 }}>
                  {s.label}
                </Text>
                <Text
                  fz={13}
                  c="dimmed"
                  style={{ width: 90, textAlign: "right" }}
                >
                  {s.value.toLocaleString()}₫
                </Text>
                <Text
                  fz={12}
                  c={s.pct >= 20 ? "green" : s.pct >= 10 ? "yellow" : "blue"}
                  style={{ width: 60, textAlign: "right" }}
                >
                  {s.pct}%
                </Text>
              </Group>
            ))}
          </div>
        </Flex>
      )}
    </Paper>
  )
}
