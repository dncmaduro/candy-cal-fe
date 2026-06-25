import { Group, Paper, Text } from "@mantine/core"
import { IconBroadcast, IconShoppingBag } from "@tabler/icons-react"
import { DashboardSectionCard } from "./DashboardSectionCard"
import { RankedBarList } from "./analytics/RankedBarList"
import {
  formatCurrency,
  formatPercent,
  formatSignedPercent
} from "./analytics/formatters"
import { toneClasses } from "./dashboard-v2/helpers"

type Props = {
  title: string
  income: number
  incomePct?: number
  incomeGoal?: number
  goalLabel?: string
  adsCost: number
  ordersCount?: number
  ordersChangePct?: number
  adsCostChangePct?: number
  adsSharePctDiff?: number
  expectedPct?: number
  deltaPct?: number
  ownVideoIncome?: number
  otherVideoIncome?: number
  otherIncome?: number
  flex?: number
  embedded?: boolean
  hideAdsMetrics?: boolean
}

export const LiveAndVideoStats = ({
  title,
  income,
  incomePct,
  incomeGoal,
  goalLabel = "KPI ngày",
  adsCost,
  ordersCount,
  ordersChangePct,
  adsCostChangePct,
  adsSharePctDiff,
  expectedPct,
  deltaPct,
  ownVideoIncome,
  otherVideoIncome,
  otherIncome,
  flex = 1,
  embedded = false,
  hideAdsMetrics = false
}: Props) => {
  const adsShare = income ? (adsCost / income) * 100 : 0
  const incomeGoalValue = incomeGoal ?? 0
  const normalizedIncomePct =
    typeof incomePct === "number"
      ? incomePct
      : incomeGoalValue > 0
        ? (income / incomeGoalValue) * 100
        : undefined

  // helper for video breakdown
  const videoOwn = ownVideoIncome ?? 0
  const videoOther = otherVideoIncome ?? 0
  const otherIncomeValue = otherIncome ?? 0

  const parts: { key: string; value: number; label: string }[] = [
    { key: "own", value: videoOwn, label: "NST bên bán" },
    { key: "other", value: videoOther, label: "NST liên kết" },
    ...(title === "Doanh thu Sàn" && otherIncomeValue > 0
      ? [
          {
            key: "otherIncome",
            value: otherIncomeValue,
            label: "Doanh thu Khác"
          }
        ]
      : [])
  ]

  const accentColor = title === "Livestream" ? "blue" : "violet"
  const performanceStatus = getPerformanceStatus(normalizedIncomePct, expectedPct)
  const tone = toneClasses[performanceStatus.tone]

  const content = (
    <div className="flex h-full flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tone.badge}`}
            >
              {performanceStatus.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {title === "Livestream"
              ? "Hiệu suất doanh thu từ live"
              : "Hiệu suất cụm doanh thu sàn"}
          </p>
        </div>
        {typeof deltaPct === "number" ? (
          <span className={`text-sm font-semibold ${tone.text}`}>
            {formatSignedPercent(deltaPct)}
          </span>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetricLine
          label="Doanh thu"
          value={formatCurrency(income)}
          secondaryLabel={incomeGoalValue > 0 ? goalLabel : undefined}
          secondaryValue={
            incomeGoalValue > 0 ? formatCurrency(incomeGoalValue) : undefined
          }
        />
        <MetricLine
          label="Đạt KPI"
          value={
            typeof normalizedIncomePct === "number"
              ? formatPercent(normalizedIncomePct)
              : "Chưa có"
          }
          tone={performanceStatus.tone}
          secondaryLabel={
            typeof expectedPct === "number" ? "Kỳ vọng" : undefined
          }
          secondaryValue={
            typeof expectedPct === "number"
              ? formatPercent(expectedPct)
              : undefined
          }
        />
        {!hideAdsMetrics && (
          <MetricLine
            label="Chi ads"
            value={formatCurrency(adsCost)}
            secondaryValue={
              typeof adsCostChangePct === "number"
                ? formatSignedPercent(adsCostChangePct)
                : undefined
            }
            secondaryTone="bad"
          />
        )}
        {!hideAdsMetrics && (
          <MetricLine
            label="Ads / doanh thu"
            value={formatPercent(adsShare)}
            tone={adsShare > 25 ? "warning" : undefined}
            secondaryValue={
              typeof adsSharePctDiff === "number"
                ? formatSignedPercent(adsSharePctDiff)
                : undefined
            }
            secondaryTone="bad"
          />
        )}
        <MetricLine
          label="Đơn hàng"
          value={
            typeof ordersCount === "number"
              ? `${ordersCount.toLocaleString("vi-VN")} đơn`
              : "..."
          }
          secondaryValue={
            typeof ordersChangePct === "number"
              ? formatSignedPercent(ordersChangePct)
              : undefined
          }
          secondaryTone={
            typeof ordersChangePct === "number"
              ? ordersChangePct >= 0
                ? "good"
                : "bad"
              : undefined
          }
        />
      </div>

      {typeof normalizedIncomePct === "number" && typeof expectedPct === "number" && (
        <div
          className={`rounded-2xl border px-4 py-4 ${tone.border} ${tone.soft}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-slate-700">
                  Tiến độ thực tế / tiến độ mục tiêu
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tone.badge}`}
                >
                  {performanceStatus.headline}
                </span>
              </div>
              <p className={`mt-2 text-base font-semibold ${tone.text}`}>
                {performanceStatus.description}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-slate-950">
                {formatPercent(normalizedIncomePct)} / {formatPercent(expectedPct)}
              </p>
            </div>
          </div>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${tone.progress}`}
              style={{
                width: `${Math.max(0, Math.min(100, normalizedIncomePct))}%`
              }}
            />
          </div>

          {typeof deltaPct === "number" && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-slate-500">So với mục tiêu</span>
              <span className={`font-semibold ${tone.text}`}>
                {formatSignedPercent(deltaPct)}
              </span>
            </div>
          )}
        </div>
      )}

      {parts.some((item) => item.value > 0) && (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-600">
              Cấu phần doanh thu
            </p>
            <p className="text-sm text-slate-500">
              Theo cụm {title.toLowerCase()}
            </p>
          </div>

          <RankedBarList
            items={parts
              .filter((item) => item.value > 0)
              .sort((a, b) => b.value - a.value)
              .map((item) => ({
                key: item.key,
                label: item.label,
                value: item.value,
                caption: "Tỷ trọng trong cụm doanh thu này"
              }))}
            totalValue={parts.reduce((sum, item) => sum + item.value, 0)}
            color={accentColor}
            maxItems={4}
            valueFormatter={(value) => formatCurrency(value)}
          />
        </div>
      )}
    </div>
  )

  if (embedded) {
    return (
      <Paper
        withBorder
        radius="xl"
        p="lg"
        style={{
          height: "100%",
          borderColor: "#dbe4f0",
          background: "rgba(255,255,255,0.92)"
        }}
      >
        <Group justify="space-between" align="flex-start" mb="md">
          <Group gap="xs" align="flex-start">
            <div
              style={{
                color: `var(--mantine-color-${accentColor}-6)`,
                background: `var(--mantine-color-${accentColor}-0)`,
                borderRadius: 14,
                padding: 8,
                lineHeight: 0
              }}
            >
              {title === "Livestream" ? (
                <IconBroadcast size={18} />
              ) : (
                <IconShoppingBag size={18} />
              )}
            </div>
            <div>
              <Text
                fz="xs"
                fw={700}
                tt="uppercase"
                c="dimmed"
                style={{ letterSpacing: "0.14em" }}
              >
                {title}
              </Text>
              <Text fz="sm" fw={600} mt={4}>
                {title === "Livestream"
                  ? "Hiệu suất doanh thu từ live"
                  : "Hiệu suất nhóm doanh thu sàn"}
              </Text>
            </div>
          </Group>
        </Group>

        {content}
      </Paper>
    )
  }

  return (
    <div style={{ flex }}>
      <DashboardSectionCard
        title={title}
        subtitle={
          title === "Livestream"
            ? "Hiệu suất doanh thu từ live"
            : "Hiệu suất nhóm doanh thu sàn"
        }
        icon={
          title === "Livestream" ? (
            <IconBroadcast size={18} />
          ) : (
            <IconShoppingBag size={18} />
          )
        }
        accentColor={accentColor}
      >
        {content}
      </DashboardSectionCard>
    </div>
  )
}

function MetricLine({
  label,
  value,
  tone,
  secondaryLabel,
  secondaryValue,
  secondaryTone
}: {
  label: string
  value: string
  tone?: "good" | "warning" | "bad"
  secondaryLabel?: string
  secondaryValue?: string
  secondaryTone?: "good" | "warning" | "bad"
}) {
  const valueClassName = tone ? toneClasses[tone].text : "text-slate-950"
  const secondaryClassName = secondaryTone
    ? toneClasses[secondaryTone].text
    : "text-slate-700"

  return (
    <div className="flex min-h-[108px] flex-col justify-between rounded-[22px] border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className={`text-lg font-semibold ${valueClassName}`}>{value}</p>
        {secondaryValue && (
          <div className="text-right">
            {secondaryLabel && (
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                {secondaryLabel}
              </p>
            )}
            <p className={`mt-1 text-lg font-semibold ${secondaryClassName}`}>
              {secondaryValue}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function getPerformanceStatus(
  achievedPct?: number,
  expectedPct?: number
): {
  tone: "good" | "warning" | "bad"
  label: string
  headline: string
  description: string
} {
  if (typeof achievedPct !== "number") {
    return {
      tone: "warning",
      label: "Chưa có KPI",
      headline: "Chờ thiết lập KPI",
      description: "Cần bổ sung KPI để đánh giá tiến độ chính xác."
    }
  }

  if (typeof expectedPct !== "number") {
    return {
      tone: achievedPct >= 100 ? "good" : "warning",
      label: achievedPct >= 100 ? "Đạt" : "Đang theo dõi",
      headline: achievedPct >= 100 ? "Đạt KPI" : "Theo dõi thêm",
      description:
        achievedPct >= 100
          ? "Doanh thu đã chạm ngưỡng mục tiêu cho khoảng đang chọn."
          : "Đã có tiến độ doanh thu nhưng chưa có mốc kỳ vọng theo thời gian."
    }
  }

  const delta = achievedPct - expectedPct

  if (delta >= 5) {
    return {
      tone: "good",
      label: "Tốt",
      headline: "Nhanh hơn kế hoạch",
      description: "Tiến độ đang đi nhanh hơn nhịp kỳ vọng."
    }
  }

  if (delta >= -5) {
    return {
      tone: "warning",
      label: "Cần chú ý",
      headline: "Bám sát kế hoạch",
      description: "Tiến độ đang bám sát mục tiêu, cần giữ nhịp ổn định."
    }
  }

  return {
    tone: "bad",
    label: "Chưa đạt",
    headline: "Chậm hơn kế hoạch",
    description: "Tiến độ đang thấp hơn mục tiêu kỳ vọng."
  }
}
