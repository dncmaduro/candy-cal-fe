import { toneClasses } from "./helpers"
import type { SummaryMetric } from "./types"

interface SummaryCardsProps {
  metrics: SummaryMetric[]
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Tóm tắt nhanh
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-950">
          4 chỉ số cần nhìn ngay
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const tone = toneClasses[metric.tone ?? "slate"]

          return (
            <article
              key={metric.label}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
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
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone.soft} ${tone.text}`}
                >
                  {metric.icon}
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">{metric.hint}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
