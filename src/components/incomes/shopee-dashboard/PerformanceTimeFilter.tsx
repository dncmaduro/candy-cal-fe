import type { ReactNode } from "react"
import { Group, Loader, SegmentedControl, Stack, Text } from "@mantine/core"
import type { ShopeeChannelOption } from "../../../hooks/shopeeDashboardApi"
import type { ShopeePerformanceTimeMode, ShopeeRangePreset } from "../../../hooks/models"
import { MonthFilterFields } from "./MonthFilterFields"
import { DateRangeFilterFields } from "./DateRangeFilterFields"
import { filterSegmentedStyles } from "../filterStyles"

interface PerformanceTimeFilterProps {
  mode: ShopeePerformanceTimeMode
  channelId: string
  month: number
  year: number
  fromDate?: string
  toDate?: string
  preset?: ShopeeRangePreset
  channelOptions: ShopeeChannelOption[]
  monthOptions: ShopeeChannelOption[]
  yearOptions: ShopeeChannelOption[]
  isChannelsLoading?: boolean
  isRefreshing?: boolean
  action?: ReactNode
  onModeChange: (mode: ShopeePerformanceTimeMode) => void
  onMonthChannelChange: (value: string) => void
  onMonthChange: (value: number) => void
  onYearChange: (value: number) => void
  onRangeApply: (payload: {
    channel: string
    fromDate: string
    toDate: string
    preset?: ShopeeRangePreset
  }) => void
}

export const PerformanceTimeFilter = ({
  mode,
  channelId,
  month,
  year,
  fromDate,
  toDate,
  preset,
  channelOptions,
  monthOptions,
  yearOptions,
  isChannelsLoading = false,
  isRefreshing = false,
  action,
  onModeChange,
  onMonthChannelChange,
  onMonthChange,
  onYearChange,
  onRangeApply
}: PerformanceTimeFilterProps) => {
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center" gap="md" wrap="wrap">
        <SegmentedControl
          value={mode}
          onChange={(value) => onModeChange(value as ShopeePerformanceTimeMode)}
          data={[
            { label: "Theo tháng", value: "month" },
            { label: "Khoảng ngày", value: "range" }
          ]}
          styles={filterSegmentedStyles}
        />

        <Group gap="sm" align="center">
          {isRefreshing && (
            <Group gap={8} c="dimmed">
              <Loader size="xs" />
              <Text size="sm">Đang cập nhật</Text>
            </Group>
          )}
          {action}
        </Group>
      </Group>

      {mode === "month" ? (
        <MonthFilterFields
          channelId={channelId}
          month={month}
          year={year}
          channelOptions={channelOptions}
          monthOptions={monthOptions}
          yearOptions={yearOptions}
          isChannelsLoading={isChannelsLoading}
          onChannelChange={onMonthChannelChange}
          onMonthChange={onMonthChange}
          onYearChange={onYearChange}
        />
      ) : (
        <DateRangeFilterFields
          channelId={channelId}
          fromDate={fromDate}
          toDate={toDate}
          preset={preset}
          channelOptions={channelOptions}
          isChannelsLoading={isChannelsLoading}
          onApply={onRangeApply}
        />
      )}
    </Stack>
  )
}
