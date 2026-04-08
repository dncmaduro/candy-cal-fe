import { Checkbox, Select, SegmentedControl } from "@mantine/core"
import type { DiscountMode, SelectOption } from "./types"
import {
  filterCheckboxContainerStyles,
  filterCheckboxStyles,
  filterDropdownStyles,
  filterInputStyles,
  filterLabelStyles,
  filterSegmentedStyles
} from "../filterStyles"

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
            Nhìn nhanh KPI, xu hướng và chênh lệch giữa Livestream và Sàn.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:flex xl:flex-wrap xl:items-end xl:justify-end">
          <Select
            label="Kênh"
            data={channels}
            value={selectedChannelId}
            onChange={(value) => onChannelChange?.(value)}
            placeholder="Chọn kênh"
            size="sm"
            w={250}
            styles={{
              label: filterLabelStyles,
              input: filterInputStyles,
              dropdown: filterDropdownStyles
            }}
          />

          <Select
            label="Tháng"
            data={monthOptions}
            value={selectedMonth}
            onChange={(value) => value && onMonthChange(value)}
            placeholder="Chọn tháng"
            size="sm"
            w={132}
            styles={{
              label: filterLabelStyles,
              input: filterInputStyles,
              dropdown: filterDropdownStyles
            }}
          />

          <div className="flex flex-col gap-1.5">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: filterLabelStyles.color }}
            >
              Chế độ dữ liệu
            </span>
            <SegmentedControl
              value={mode}
              onChange={(value) => onModeChange(value as DiscountMode)}
              data={[
                { label: "Sau CK", value: "afterDiscount" },
                { label: "Trước CK", value: "beforeDiscount" }
              ]}
              radius={18}
              styles={filterSegmentedStyles}
            />
          </div>

          <div style={filterCheckboxContainerStyles}>
            <Checkbox
              checked={showComparison}
              onChange={(event) =>
                onShowComparisonChange(event.currentTarget.checked)
              }
              label="So sánh với tiến độ"
              styles={filterCheckboxStyles}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
