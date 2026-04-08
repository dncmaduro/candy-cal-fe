import type { DiscountMode, SelectOption } from "./types"

interface DashboardHeaderProps {
  title: string
  selectedChannelId: string | null
  channels: SelectOption[]
  onChannelChange?: (channelId: string | null) => void
  selectedMonth: string
  monthOptions: SelectOption[]
  onMonthChange: (value: string) => void
  mode: DiscountMode
  onModeChange: (value: DiscountMode) => void
  showComparison: boolean
  onShowComparisonChange: (value: boolean) => void
}

const controlClassName =
  "h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"

const modeButtonClassName =
  "rounded-xl px-3 py-2 text-sm font-semibold transition"

export function DashboardHeader({
  title,
  selectedChannelId,
  channels,
  onChannelChange,
  selectedMonth,
  monthOptions,
  onMonthChange,
  mode,
  onModeChange,
  showComparison,
  onShowComparisonChange
}: DashboardHeaderProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm lg:px-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Dashboard doanh thu
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="text-sm text-slate-500">
            Nhìn nhanh KPI, xu hướng và chênh lệch giữa Livestream và
            Marketplace.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:flex xl:flex-wrap xl:items-end xl:justify-end">
          <label className="flex min-w-[190px] flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Kênh
            </span>
            <select
              className={controlClassName}
              value={selectedChannelId ?? ""}
              onChange={(event) =>
                onChannelChange?.(event.target.value || null)
              }
            >
              {channels.map((channel) => (
                <option key={channel.value} value={channel.value}>
                  {channel.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-[140px] flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Tháng
            </span>
            <select
              className={controlClassName}
              value={selectedMonth}
              onChange={(event) => onMonthChange(event.target.value)}
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Chế độ dữ liệu
            </span>
            <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                className={`${modeButtonClassName} ${
                  mode === "afterDiscount"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500"
                }`}
                onClick={() => onModeChange("afterDiscount")}
              >
                Sau CK
              </button>
              <button
                type="button"
                className={`${modeButtonClassName} ${
                  mode === "beforeDiscount"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500"
                }`}
                onClick={() => onModeChange("beforeDiscount")}
              >
                Trước CK
              </button>
            </div>
          </div>

          <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
              checked={showComparison}
              onChange={(event) =>
                onShowComparisonChange(event.currentTarget.checked)
              }
            />
            <span>So sánh với tiến độ</span>
          </label>
        </div>
      </div>
    </div>
  )
}
