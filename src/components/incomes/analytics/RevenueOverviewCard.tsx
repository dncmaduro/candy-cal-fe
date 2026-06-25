import type { ReactNode } from "react"
import { Badge, Divider, Group, Paper, Stack, Text } from "@mantine/core"
import { TrendBadge } from "./TrendBadge"
import {
  formatCurrency,
  formatPercent,
  formatSignedPercent
} from "./formatters"
import { toneClasses } from "../dashboard-v2/helpers"

interface RevenueOverviewCardProps {
  title: string
  rangeLabel: string
  totalRevenue: number
  changePct?: number
  modeLabel: string
  detailSections?: ReactNode
  statusTone?: "good" | "warning" | "bad"
  statusLabel?: string
  achievedPct?: number
  expectedPct?: number
  deltaPct?: number
  goalValue?: number
}

export const RevenueOverviewCard = ({
  title,
  rangeLabel,
  totalRevenue,
  changePct,
  modeLabel,
  detailSections,
  statusTone = "warning",
  statusLabel,
  achievedPct,
  expectedPct,
  deltaPct,
  goalValue
}: RevenueOverviewCardProps) => {
  const tone = toneClasses[statusTone]

  return (
    <Paper
      withBorder
      radius={28}
      p="xl"
      style={{
        borderColor: "#e2e8f0",
        background: "#ffffff",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)"
      }}
    >
      <Stack gap={18}>
        <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
          <Stack gap={10} style={{ flex: "1 1 520px" }}>
            <Group gap={10} wrap="wrap">
              <Badge radius="xl" variant="light" color="indigo">
                {modeLabel}
              </Badge>
              <Badge radius="xl" variant="light" color="gray">
                {rangeLabel}
              </Badge>
              {statusLabel ? (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tone.badge}`}
                >
                  {statusLabel}
                </span>
              ) : null}
            </Group>

            <Stack gap={4}>
              <Text
                fz="xs"
                fw={700}
                tt="uppercase"
                style={{ letterSpacing: "0.12em" }}
              >
                {title}
              </Text>
              <Text
                fw={800}
                fz="3.35rem"
                lh={1}
                style={{ letterSpacing: "-0.06em" }}
              >
                {formatCurrency(totalRevenue)}
              </Text>
            </Stack>

            <Group gap="sm">
              <TrendBadge value={changePct} />
              <Text fz="sm" c="dimmed">
                So với kì trước
              </Text>
            </Group>

            {typeof achievedPct === "number" ? (
              <Stack gap={8}>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${tone.progress}`}
                    style={{
                      width: `${Math.max(0, Math.min(100, achievedPct))}%`
                    }}
                  />
                </div>
                <Group gap="lg" wrap="wrap">
                  <Text fz="sm" c="dimmed">
                    Tiến độ đạt: <strong>{formatPercent(achievedPct)}</strong>
                  </Text>
                  {typeof expectedPct === "number" ? (
                    <Text fz="sm" c="dimmed">
                      Tiến độ kỳ vọng:{" "}
                      <strong>{formatPercent(expectedPct)}</strong>
                    </Text>
                  ) : null}
                  {typeof deltaPct === "number" ? (
                    <Text fz="sm" c="dimmed">
                      Lệch mục tiêu:{" "}
                      <strong>{formatSignedPercent(deltaPct)}</strong>
                    </Text>
                  ) : null}
                </Group>
              </Stack>
            ) : null}
          </Stack>

          <div className="grid min-w-[540px] flex-1 gap-4 md:grid-cols-3">
            <MetricPanel
              label="Doanh thu"
              value={formatCurrency(totalRevenue)}
            />
            <MetricPanel
              label="KPI"
              value={
                typeof goalValue === "number"
                  ? formatCurrency(goalValue)
                  : "Chưa có"
              }
            />
            <MetricPanel
              label="Lệch so với kỳ vọng"
              value={
                typeof deltaPct === "number"
                  ? formatSignedPercent(deltaPct)
                  : "Chưa có"
              }
              tone={statusTone}
            />
          </div>
        </Group>
      </Stack>

      {detailSections ? (
        <>
          <Divider my="lg" />
          {detailSections}
        </>
      ) : null}
    </Paper>
  )
}

function MetricPanel({
  label,
  value,
  tone
}: {
  label: string
  value: string
  tone?: "good" | "warning" | "bad"
}) {
  const visualTone = tone ? toneClasses[tone] : toneClasses.slate

  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p
        className={`mt-3 text-2xl font-semibold tracking-tight ${visualTone.text}`}
      >
        {value}
      </p>
    </div>
  )
}
