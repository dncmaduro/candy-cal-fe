import type { ReactNode } from "react"
import { toneClasses } from "./helpers"
import type { DetailMetric } from "./types"

interface DetailMetricsSectionProps {
  metrics: DetailMetric[]
  action?: ReactNode
}

export function DetailMetricsSection({
  metrics,
  action
}: DetailMetricsSectionProps) {
  const gridClassName =
    metrics.length >= 5
      ? "grid gap-3 md:grid-cols-2 xl:grid-cols-5"
      : "grid gap-3 md:grid-cols-2 xl:grid-cols-4"

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Chi tiết thêm
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              Chỉ số phụ cho vận hành
            </h2>
          </div>
          {action}
        </div>

        <div className={gridClassName}>
          {metrics.map((metric) => {
            const tone = toneClasses[metric.tone ?? "slate"]

            return (
              <div
                key={metric.label}
                className={`rounded-2xl border px-4 py-4 ${tone.soft} ${tone.border}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {metric.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {metric.value}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
