import { useState } from "react"
import {
  Paper,
  Group,
  Text,
  Stack,
  RingProgress,
  Progress,
  Badge,
  SegmentedControl
} from "@mantine/core"
import { fmtCurrency, fmtPercent } from "../../utils/fmt"

type Props = {
  title: string
  income: number
  adsCost: number
  adsCostChangePct?: number
  adsSharePctDiff?: number
}

export const LiveAndVideoStats = ({
  title,
  income,
  adsCost,
  adsCostChangePct,
  adsSharePctDiff
}: Props) => {
  const [mode, setMode] = useState<"table" | "chart">("table")
  const adsShare = income ? (adsCost / income) * 100 : 0

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
        </Group>
      )}
    </Paper>
  )
}
