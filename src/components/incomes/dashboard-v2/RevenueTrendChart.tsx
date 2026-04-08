import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { getBestDay, formatCompactCurrency, formatCurrency } from "./helpers"
import type { RevenueTrendPoint } from "./types"

interface RevenueTrendChartProps {
  data: RevenueTrendPoint[]
  monthLabel: string
  totalRevenue: number
}

export function RevenueTrendChart({
  data,
  monthLabel,
  totalRevenue
}: RevenueTrendChartProps) {
  const bestDay = getBestDay(data)
  const averageRevenue = data.length ? totalRevenue / data.length : 0
  const hasRevenue = data.some((item) => item.revenue > 0)

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
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <TrendMetric
              label="Đỉnh doanh thu"
              value={
                bestDay.revenue > 0
                  ? `${formatCompactCurrency(bestDay.revenue)}`
                  : "Chưa có"
              }
              hint={
                bestDay.revenue > 0 ? `Ngày ${bestDay.day}` : "Chưa có dữ liệu"
              }
            />
            <TrendMetric
              label="Bình quân / ngày"
              value={formatCompactCurrency(averageRevenue)}
              hint="Tính trên toàn bộ số ngày trong tháng"
            />
            <TrendMetric
              label="Lũy kế tháng"
              value={formatCompactCurrency(totalRevenue)}
              hint="Tổng doanh thu của tháng đang xem"
            />
          </div>
        </div>

        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="dashboardRevenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0.02} />
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

                  return (
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Ngày {label}
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-950">
                        {formatCurrency(Number(payload[0].value))}
                      </p>
                    </div>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0f172a"
                strokeWidth={2.5}
                fill="url(#dashboardRevenueFill)"
                dot={false}
                activeDot={{ r: 5, fill: "#0f172a" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {!hasRevenue && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Chưa có doanh thu phát sinh trong tháng này để hiển thị xu hướng.
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
