import { useState } from "react"
import {
  Paper,
  Group,
  Text,
  Stack,
  RingProgress,
  Badge,
  SegmentedControl,
  Box,
  Divider
} from "@mantine/core"
import { fmtCurrency, fmtPercent } from "../../utils/fmt"
import { CPiechart } from "../common/CPiechart"

type Props = {
  title: string
  income: number
  adsCost: number
  adsCostChangePct?: number
  adsSharePctDiff?: number
  ownVideoIncome?: number
  otherVideoIncome?: number
  flex?: number
}

export const LiveAndVideoStats = ({
  title,
  income,
  adsCost,
  adsCostChangePct,
  adsSharePctDiff,
  ownVideoIncome,
  otherVideoIncome,
  flex = 1
}: Props) => {
  const [mode, setMode] = useState<"table" | "chart">("table")
  const adsShare = income ? (adsCost / income) * 100 : 0

  // helper for video breakdown
  const videoOwn = ownVideoIncome ?? 0
  const videoOther = otherVideoIncome ?? 0
  const videoTotal = videoOwn + videoOther

  // small pie parts for video breakdown (used both for drawing and legend)
  const parts: { key: string; value: number; label: string }[] = [
    { key: "own", value: videoOwn, label: "NST bên bán" },
    { key: "other", value: videoOther, label: "NST liên kết" }
  ]
  return (
    <Paper withBorder p="lg" radius="lg" style={{ flex }}>
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
              size={140}
              thickness={20}
            />
            <Stack>
              <Box>
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
              </Box>
              <Box>
                <Text size="sm">Chi phí ads</Text>
                <Group align="center" gap={8}>
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
              </Box>
            </Stack>
          </Group>

          {/* If Video in chart mode, show small pie breakdown using CPiechart */}
          {title === "Video" && videoTotal > 0 && (
            <Box w={500}>
              <CPiechart
                data={parts.map((p) => ({ label: p.label, value: p.value }))}
                width={160}
                radius={80}
                donut={false}
                enableOthers={false}
                showTooltip
                valueFormatter={(v) => fmtCurrency(v)}
                percentFormatter={(p) => fmtPercent(p)}
                pieFontSize={16}
                title={
                  <Text size="sm" c="black" fw={600}>
                    Phân bổ doanh số qua Video
                  </Text>
                }
              />
            </Box>
          )}
        </Group>
      )}
    </Paper>
  )
}
