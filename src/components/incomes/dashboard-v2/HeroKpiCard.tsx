import type { ReactNode } from "react"
import { IconCash, IconChartBar, IconTargetArrow } from "@tabler/icons-react"
import {
  clampPercentage,
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
  formatSignedPercent,
  toneClasses
} from "./helpers"
import type { DashboardStatus, SummaryMetric } from "./types"

interface HeroKpiCardProps {
  achievedPercentage: number
  expectedPercentage: number
  deltaPercentage: number
  status: DashboardStatus
  actualRevenue: number
  targetRevenue: number
  netRevenue: number
  monthLabel: string
  summaryMetrics: SummaryMetric[]
}

export function HeroKpiCard({
  achievedPercentage,
  expectedPercentage,
  deltaPercentage,
  status,
  actualRevenue,
  targetRevenue,
  netRevenue,
  monthLabel,
  summaryMetrics
}: HeroKpiCardProps) {
  const tone = toneClasses[status.tone]
  const summaryGridClassName =
    summaryMetrics.length >= 4
      ? "grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      : summaryMetrics.length === 3
        ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        : "grid gap-4 md:grid-cols-2"

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

          <div className="grid gap-4 sm:grid-cols-2 xl:w-[560px] xl:grid-cols-3">
            <MetricPanel
              label="Tiến độ mục tiêu"
              value={formatPercent(expectedPercentage)}
              icon={<IconTargetArrow size={20} />}
            />
            <MetricPanel
              label="Lệch so với mục tiêu"
              value={formatSignedPercent(deltaPercentage)}
              tone={status.tone}
              icon={<IconChartBar size={20} />}
            />
            <MetricPanel
              label="Doanh thu / KPI"
              value={`${formatCompactCurrency(actualRevenue)} / ${formatCompactCurrency(targetRevenue)}`}
              icon={<IconCash size={20} />}
            />
          </div>
        </div>

        {summaryMetrics.length > 0 && (
          <div className="border-t border-slate-200 pt-6">
            <div className={summaryGridClassName}>
              {summaryMetrics.map((metric) => {
                const metricTone = toneClasses[metric.tone ?? "slate"]

                return (
                  <article
                    key={metric.label}
                    className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {metric.label}
                        </p>
                        <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                          {metric.value}
                        </p>
                      </div>
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${metricTone.soft} ${metricTone.text}`}
                      >
                        {metric.icon}
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">{metric.hint}</p>
                  </article>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function MetricPanel({
  label,
  value,
  tone,
  icon
}: {
  label: string
  value: string
  tone?: "good" | "warning" | "bad"
  icon: ReactNode
}) {
  const visualTone = toneClasses[tone ?? "slate"]
  const valueClass = tone ? visualTone.text : "text-slate-950"

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${visualTone.soft} ${visualTone.text}`}
        >
          {icon}
        </div>
      </div>
      <p className={`mt-3 text-2xl font-semibold tracking-tight ${valueClass}`}>
        {value}
      </p>
    </div>
  )
}
