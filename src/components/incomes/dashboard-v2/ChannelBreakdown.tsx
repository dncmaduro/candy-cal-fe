import {
  clampPercentage,
  formatCurrency,
  formatPercent,
  formatSignedPercent,
  toneClasses
} from "./helpers"
import type { ChannelPerformanceCardData } from "./types"

interface ChannelBreakdownProps {
  channels: ChannelPerformanceCardData[]
  showComparison: boolean
}

export function ChannelBreakdown({
  channels,
  showComparison
}: ChannelBreakdownProps) {
  return (
    <section className="space-y-4">
      <div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            So sánh theo kênh
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            Livestream vs Sàn
          </h2>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {channels.map((channel) => (
          <ChannelCard
            key={channel.key}
            data={channel}
            showComparison={showComparison}
          />
        ))}
      </div>
    </section>
  )
}

function ChannelCard({
  data,
  showComparison
}: {
  data: ChannelPerformanceCardData
  showComparison: boolean
}) {
  const tone = toneClasses[data.status.tone]
  const progressPace = showComparison ? getProgressPace(data.deltaPct) : null

  return (
    <article
      className={`rounded-[28px] border bg-white p-5 shadow-sm ${tone.border}`}
    >
      <div className="flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-slate-950">
                {data.name}
              </h3>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tone.badge}`}
              >
                {data.status.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{data.subtitle}</p>
          </div>

          {data.highlight && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {data.highlight}
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MetricLine
            label="Doanh thu"
            value={formatCurrency(data.revenue)}
          />
          <MetricLine
            label="Chi ads"
            value={formatCurrency(data.adsSpend)}
          />
          <MetricLine
            label="Ads/doanh thu"
            value={formatPercent(data.adsRatio)}
          />
          <MetricLine
            label="KPI đạt"
            value={
              data.goalRevenue > 0
                ? formatCurrency(data.goalRevenue)
                : "Chưa có"
            }
            secondaryLabel="% đạt"
            secondaryValue={
              data.goalRevenue > 0
                ? formatPercent(data.achievedPct)
                : undefined
            }
            secondaryTone={data.goalRevenue > 0 ? data.status.tone : undefined}
            tone={data.goalRevenue > 0 ? undefined : "warning"}
          />
        </div>

        {showComparison && (
          <div
            className={`rounded-2xl border px-4 py-4 ${tone.border} ${tone.soft}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-slate-700">
                    Tiến độ thực tế / tiến độ mục tiêu
                  </p>
                  {progressPace && (
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${toneClasses[progressPace.tone].badge}`}
                    >
                      {progressPace.label}
                    </span>
                  )}
                </div>
                {progressPace && (
                  <>
                    <p
                      className={`mt-2 text-base font-semibold ${toneClasses[progressPace.tone].text}`}
                    >
                      {progressPace.headline}
                    </p>
                  </>
                )}
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-slate-950">
                  {formatPercent(data.achievedPct)} / {formatPercent(data.expectedPct)}
                </p>
              </div>
            </div>

            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${tone.progress}`}
                style={{ width: `${clampPercentage(data.achievedPct)}%` }}
              />
            </div>

            {progressPace && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">So với mục tiêu</span>
                <span className={`font-semibold ${toneClasses[progressPace.tone].text}`}>
                  {formatSignedPercent(data.deltaPct)}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-600">
              Tỷ trọng doanh thu
            </p>
            <p className="text-lg font-semibold text-slate-950">
              {formatPercent(data.share)}
            </p>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-white">
            <div
              className={`h-full rounded-full ${tone.progress}`}
              style={{ width: `${clampPercentage(data.share)}%` }}
            />
          </div>

          <p className="text-sm text-slate-500">Đóng góp trong tổng doanh thu tháng</p>
        </div>
      </div>
    </article>
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
    <div className="flex min-h-[108px] flex-col justify-between rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
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

function getProgressPace(deltaPct: number): {
  label: string
  headline: string
  description: string
  tone: "good" | "warning" | "bad"
} {
  if (deltaPct >= 5) {
    return {
      label: "Nhanh hơn",
      headline: "Tiến độ đang nhanh hơn mục tiêu",
      description: "Tiến độ đang vượt khá rõ so với nhịp mục tiêu.",
      tone: "good"
    }
  }

  if (deltaPct >= -5) {
    return {
      label: "Bám sát",
      headline: "Tiến độ đang bám sát mục tiêu",
      description: "Tiến độ đang bám sát mục tiêu, cần giữ đều nhịp.",
      tone: "warning"
    }
  }

  return {
    label: "Chậm hơn",
    headline: "Tiến độ đang chậm hơn mục tiêu",
    description: "Tiến độ đang chậm hơn mục tiêu và cần đẩy thêm.",
    tone: "bad"
  }
}
