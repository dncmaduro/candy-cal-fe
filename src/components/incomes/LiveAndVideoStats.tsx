import { useState } from "react"
import {
  Paper,
  Group,
  Text,
  Stack,
  RingProgress,
  Progress,
  Badge,
  SegmentedControl,
  Box,
  Divider
} from "@mantine/core"
import { fmtCurrency, fmtPercent } from "../../utils/fmt"

type Props = {
  title: string
  income: number
  adsCost: number
  adsCostChangePct?: number
  adsSharePctDiff?: number
  ownVideoIncome?: number
  otherVideoIncome?: number
}

export const LiveAndVideoStats = ({
  title,
  income,
  adsCost,
  adsCostChangePct,
  adsSharePctDiff,
  ownVideoIncome,
  otherVideoIncome
}: Props) => {
  const [mode, setMode] = useState<"table" | "chart">("table")
  const adsShare = income ? (adsCost / income) * 100 : 0

  // helper for video breakdown
  const videoOwn = ownVideoIncome ?? 0
  const videoOther = otherVideoIncome ?? 0
  const videoTotal = videoOwn + videoOther

  return (
    <Paper withBorder p="lg" radius="lg" style={{ flex: 1 }}>
      <Group justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Text fw={600}>{title}</Text>
        <Group gap={8}>
          <SegmentedControl
            value={mode}
            onChange={(val) => setMode(val as any)}
            data={[
              { label: "Bảng", value: "table" },
              { label: "Biểu đồ", value: "chart" }
            ]}
            size="sm"
          />
        </Group>
      </Group>

      {mode === "table" ? (
        <Stack gap={8}>
          <Group justify="space-between">
            <Text>Doanh thu</Text>
            <Text fw={700}>{fmtCurrency(income)}</Text>
          </Group>

          {/* If this is Video, show breakdown rows */}
          {title === "Video" && (
            <>
              <Group justify="space-between">
                <Text c={"dimmed"}>Doanh số từ nhà sáng tạo (own)</Text>
                <Text c={"dimmed"} fw={700}>
                  {fmtCurrency(videoOwn)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text c={"dimmed"}>
                  Doanh số từ nhà sáng tạo liên kết (other)
                </Text>
                <Text c={"dimmed"} fw={700}>
                  {fmtCurrency(videoOther)}
                </Text>
              </Group>
            </>
          )}

          <Divider />

          <Group justify="space-between">
            <Text>Chi phí Ads</Text>
            <Group gap={8} align="center">
              <Text fw={700}>{fmtCurrency(adsCost)}</Text>
              {typeof adsCostChangePct === "number" && (
                <Badge
                  color={adsCostChangePct >= 0 ? "green" : "red"}
                  variant="light"
                >
                  {adsCostChangePct >= 0 ? "+" : "-"}
                  {fmtPercent(Math.abs(adsCostChangePct))}
                </Badge>
              )}
            </Group>
          </Group>
          <Group justify="space-between">
            <Text>Tỉ lệ Ads / Doanh thu</Text>
            <Group gap={8} align="center">
              <Text fw={700}>{fmtPercent(adsShare)}</Text>
              {typeof adsSharePctDiff === "number" && (
                <Badge
                  color={adsSharePctDiff >= 0 ? "green" : "red"}
                  variant="light"
                >
                  {adsSharePctDiff >= 0 ? "+" : "-"}
                  {fmtPercent(Math.abs(adsSharePctDiff))}
                </Badge>
              )}
            </Group>
          </Group>
        </Stack>
      ) : (
        <Group justify="space-between" align="center">
          <Group gap={16} align="center">
            <RingProgress
              sections={[
                { value: Math.min(100, Math.round(adsShare)), color: "red" }
              ]}
              size={80}
              thickness={12}
            />
            <div>
              <Text size="sm">Tỉ lệ Ads trên doanh thu</Text>
              <Group align="center" gap={8}>
                <Text fw={700}>{fmtPercent(adsShare)}</Text>
                {typeof adsSharePctDiff === "number" && (
                  <Badge
                    color={adsSharePctDiff >= 0 ? "green" : "red"}
                    variant="light"
                  >
                    {adsSharePctDiff >= 0 ? "+" : "-"}
                    {fmtPercent(Math.abs(adsSharePctDiff))}
                  </Badge>
                )}
              </Group>
            </div>
          </Group>

          <div style={{ width: 160 }}>
            <Text size="sm">Chi phí Ads</Text>
            <Progress
              value={Math.min(100, Math.round((adsCost / (income || 1)) * 100))}
              size="lg"
              color="red"
            />
            <Group align="center" gap={8} style={{ marginTop: 6 }}>
              <Text fw={700}>{fmtCurrency(adsCost)}</Text>
              {typeof adsCostChangePct === "number" && (
                <Badge
                  color={adsCostChangePct >= 0 ? "green" : "red"}
                  variant="light"
                >
                  {adsCostChangePct >= 0 ? "+" : "-"}
                  {fmtPercent(Math.abs(adsCostChangePct))}
                </Badge>
              )}
            </Group>
          </div>

          {/* If Video in chart mode, show small pie breakdown */}
          {title === "Video" && videoTotal > 0 && (
            <Box>
              <svg width={120} height={120} viewBox="0 0 120 120">
                {(() => {
                  const cx = 60
                  const cy = 60
                  const r = 48
                  let start = -Math.PI / 2
                  const parts = [
                    {
                      key: "own",
                      value: videoOwn,
                      color: "#6366f1",
                      label: "Own"
                    },
                    {
                      key: "other",
                      value: videoOther,
                      color: "#7c3aed",
                      label: "Other"
                    }
                  ]
                  const total = parts.reduce((s, p) => s + p.value, 0) || 1
                  return parts.map((p) => {
                    const angle = (p.value / total) * Math.PI * 2
                    const end = start + angle
                    const d = describeArc(cx, cy, r, start, end)
                    const mid = (start + end) / 2
                    const labelX = cx + r * 0.6 * Math.cos(mid)
                    const labelY = cy + r * 0.6 * Math.sin(mid)
                    start = end
                    return (
                      <g key={p.key}>
                        <path
                          d={d}
                          fill={p.color}
                          stroke="#fff"
                          strokeWidth={0.5}
                        />
                        {(p.value / total) * 100 >= 10 && (
                          <text
                            x={labelX}
                            y={labelY}
                            fill="#fff"
                            fontSize={10}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            {((p.value / total) * 100).toFixed(0)}%
                          </text>
                        )}
                      </g>
                    )
                  })
                })()}
              </svg>
            </Box>
          )}
        </Group>
      )}
    </Paper>
  )
}

// Draw arc path for pie chart
function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const x1 = x + radius * Math.cos(-startAngle)
  const y1 = y + radius * Math.sin(-startAngle)
  const x2 = x + radius * Math.cos(-endAngle)
  const y2 = y + radius * Math.sin(-endAngle)

  const d = [
    `M ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${endAngle - startAngle > Math.PI ? 1 : 0} 0 ${x2} ${y2}`,
    `L ${x} ${y}`
  ].join(" ")

  return d
}
