import {
  clampPercentage,
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
  formatSignedPercent,
  toneClasses
} from "./helpers"
import type { DashboardStatus } from "./types"

interface HeroKpiCardProps {
  achievedPercentage: number
  expectedPercentage: number
  deltaPercentage: number
  status: DashboardStatus
  actualRevenue: number
  targetRevenue: number
  netRevenue: number
  monthLabel: string
}

export function HeroKpiCard({
  achievedPercentage,
  expectedPercentage,
  deltaPercentage,
  status,
  actualRevenue,
  targetRevenue,
  netRevenue,
  monthLabel
}: HeroKpiCardProps) {
  const tone = toneClasses[status.tone]

  return (
    <section
      className={`rounded-[32px] border bg-white p-6 shadow-sm lg:p-7 ${tone.border}`}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Insight chính
              </p>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ${tone.badge}`}
              >
                {status.label}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                KPI đạt vs tiến độ kỳ vọng
              </p>
              <div className="mt-2 flex items-end gap-3">
                <span className="text-5xl font-semibold tracking-tight text-slate-950 lg:text-6xl">
                  {formatPercent(achievedPercentage)}
                </span>
                <span className="pb-2 text-sm font-medium text-slate-500">
                  tháng {monthLabel}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                {status.description}
              </p>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${tone.progress}`}
                  style={{ width: `${clampPercentage(achievedPercentage)}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span>Doanh thu: {formatCurrency(actualRevenue)}</span>
                <span>Mục tiêu: {formatCurrency(targetRevenue)}</span>
                <span>Sau ads: {formatCurrency(netRevenue)}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:w-[520px]">
            <MetricPanel
              label="Tiến độ mục tiêu"
              value={formatPercent(expectedPercentage)}
              caption="Mức cần đạt tới hôm nay"
            />
            <MetricPanel
              label="Lệch so với mục tiêu"
              value={formatSignedPercent(deltaPercentage)}
              caption="Chênh lệch thực tế"
              tone={status.tone}
            />
            <MetricPanel
              label="Doanh thu / KPI"
              value={`${formatCompactCurrency(actualRevenue)} / ${formatCompactCurrency(targetRevenue)}`}
              caption="Dễ đọc khi scan nhanh"
            />
          </div>
        </div>

      </div>
    </section>
  )
}

function MetricPanel({
  label,
  value,
  caption,
  tone
}: {
  label: string
  value: string
  caption: string
  tone?: "good" | "warning" | "bad"
}) {
  const toneClass = tone ? toneClasses[tone].text : "text-slate-900"

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${toneClass}`}>
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{caption}</p>
    </div>
  )
}
