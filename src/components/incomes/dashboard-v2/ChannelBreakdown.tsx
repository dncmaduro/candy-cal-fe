import {
  clampPercentage,
  formatCompactCurrency,
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
  const topRevenueChannel =
    channels.reduce(
      (best, channel) => (channel.revenue > best.revenue ? channel : best),
      channels[0]
    ) ?? null

  const weakestChannel =
    channels.reduce(
      (worst, channel) =>
        channel.deltaPct < worst.deltaPct ? channel : worst,
      channels[0]
    ) ?? null

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            So sánh theo kênh
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            Livestream vs Marketplace
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {topRevenueChannel && (
            <InfoChip
              label="Đóng góp lớn nhất"
              value={`${topRevenueChannel.name} ${formatPercent(topRevenueChannel.share)}`}
            />
          )}
          {weakestChannel && (
            <InfoChip
              label="Kênh yếu nhất"
              value={`${weakestChannel.name} ${formatSignedPercent(weakestChannel.deltaPct)}`}
            />
          )}
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
          <MetricLine label="Doanh thu" value={formatCompactCurrency(data.revenue)} />
          <MetricLine label="Chi ads" value={formatCompactCurrency(data.adsSpend)} />
          <MetricLine
            label="Sau ads"
            value={formatCompactCurrency(data.netRevenue)}
            tone={data.netRevenue >= 0 ? "good" : "bad"}
          />
          <MetricLine
            label="KPI đạt"
            value={formatPercent(data.achievedPct)}
            tone={data.status.tone}
          />
        </div>

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

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <span>Ads / doanh thu: {formatPercent(data.adsRatio)}</span>
            {showComparison && (
              <span>
                So với tiến độ: {formatSignedPercent(data.deltaPct)}
              </span>
            )}
          </div>
        </div>

        {showComparison && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-600">
                Tiến độ thực tế / tiến độ mục tiêu
              </p>
              <p className="text-sm font-semibold text-slate-950">
                {formatPercent(data.achievedPct)} / {formatPercent(data.expectedPct)}
              </p>
            </div>

            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${tone.progress}`}
                style={{ width: `${clampPercentage(data.achievedPct)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

function MetricLine({
  label,
  value,
  tone
}: {
  label: string
  value: string
  tone?: "good" | "warning" | "bad"
}) {
  const valueClassName = tone ? toneClasses[tone].text : "text-slate-950"

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-lg font-semibold ${valueClassName}`}>{value}</p>
    </div>
  )
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
      <span className="font-medium text-slate-500">{label}: </span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  )
}
