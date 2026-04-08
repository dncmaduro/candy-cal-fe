import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import {
  formatCompactCurrency,
  formatCurrency,
  getBestDay,
  getTrendRevenueValue
} from "./helpers"
import type { RevenueTrendMode, RevenueTrendPoint } from "./types"

interface RevenueTrendChartProps {
  data: RevenueTrendPoint[]
  monthLabel: string
}

const TREND_MODE_OPTIONS: Array<{
  value: RevenueTrendMode
  label: string
  description: string
  summaryLabel: string
  dataKey: keyof RevenueTrendPoint
  stroke: string
  fillColor: string
}> = [
  {
    value: "total",
    label: "Tổng",
    description: "Toàn bộ doanh thu theo ngày.",
    summaryLabel: "tổng doanh thu",
    dataKey: "totalRevenue",
    stroke: "#0f172a",
    fillColor: "#0f172a"
  },
  {
    value: "live",
    label: "Live",
    description: "Doanh thu phát sinh từ live.",
    summaryLabel: "doanh thu live",
    dataKey: "liveRevenue",
    stroke: "#2563eb",
    fillColor: "#2563eb"
  },
  {
    value: "shop",
    label: "Sàn",
    description: "Doanh thu phát sinh từ sàn.",
    summaryLabel: "doanh thu sàn",
    dataKey: "shopRevenue",
    stroke: "#7c3aed",
    fillColor: "#7c3aed"
  }
]

export function RevenueTrendChart({ data, monthLabel }: RevenueTrendChartProps) {
  const [trendMode, setTrendMode] = useState<RevenueTrendMode>("total")

  const activeMode = useMemo(
    () => TREND_MODE_OPTIONS.find((option) => option.value === trendMode)!,
    [trendMode]
  )
  const bestDay = useMemo(() => getBestDay(data, trendMode), [data, trendMode])
  const totalRevenue = useMemo(
    () =>
      data.reduce(
        (sum, item) => sum + getTrendRevenueValue(item, trendMode),
        0
      ),
    [data, trendMode]
  )
  const activeDays = useMemo(
    () =>
      data.filter((item) => getTrendRevenueValue(item, trendMode) > 0).length,
    [data, trendMode]
  )
  const averageRevenue = activeDays ? totalRevenue / activeDays : 0
  const hasRevenue = data.some((item) => getTrendRevenueValue(item, trendMode) > 0)
  const bestDayRevenue = getTrendRevenueValue(bestDay, trendMode)
  const gradientId = `dashboardRevenueFill-${trendMode}`

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Xu hướng
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              Doanh thu theo ngày
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Giúp nhìn nhanh nhịp tăng trưởng trong tháng {monthLabel}.
            </p>
            <div className="mt-3 inline-flex flex-wrap gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
              {TREND_MODE_OPTIONS.map((option) => {
                const isActive = option.value === trendMode

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTrendMode(option.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-sm text-slate-500">{activeMode.description}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <TrendMetric
              label="Đỉnh doanh thu"
              value={
                bestDayRevenue > 0
                  ? `${formatCurrency(bestDayRevenue)}`
                  : "Chưa có"
              }
              hint={
                bestDayRevenue > 0 ? `Ngày ${bestDay.day}` : "Chưa có dữ liệu"
              }
            />
            <TrendMetric
              label="Bình quân / ngày"
              value={formatCurrency(averageRevenue)}
              hint={
                activeDays > 0
                  ? `Tính trên ${activeDays} ngày có doanh thu`
                  : "Chưa có ngày nào phát sinh doanh thu"
              }
            />
            <TrendMetric
              label="Lũy kế tháng"
              value={formatCurrency(totalRevenue)}
              hint={`Lũy kế ${activeMode.summaryLabel} trong tháng đang xem`}
            />
          </div>
        </div>

        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={activeMode.fillColor}
                    stopOpacity={0.18}
                  />
                  <stop
                    offset="95%"
                    stopColor={activeMode.fillColor}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                minTickGap={16}
                stroke="#94a3b8"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                width={72}
                stroke="#94a3b8"
                tickFormatter={(value) => formatCompactCurrency(Number(value))}
              />
              <Tooltip
                cursor={{ stroke: "#94a3b8", strokeDasharray: "4 4" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null

                  const point = payload[0].payload as RevenueTrendPoint

                  return (
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Ngày {label}
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-950">
                        {formatCurrency(Number(payload[0].value))}
                      </p>
                      <div className="mt-2 space-y-1 text-sm text-slate-500">
                        <p>Tổng: {formatCompactCurrency(point.totalRevenue)}</p>
                        <p>Livestream: {formatCompactCurrency(point.liveRevenue)}</p>
                        <p>Sàn: {formatCompactCurrency(point.shopRevenue)}</p>
                      </div>
                    </div>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey={activeMode.dataKey}
                stroke={activeMode.stroke}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 5, fill: activeMode.stroke }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {!hasRevenue && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Chưa có {activeMode.summaryLabel} phát sinh trong tháng này để hiển thị xu hướng.
          </div>
        )}
      </div>
    </section>
  )
}

function TrendMetric({
  label,
  value,
  hint
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{hint}</p>
    </div>
  )
}
