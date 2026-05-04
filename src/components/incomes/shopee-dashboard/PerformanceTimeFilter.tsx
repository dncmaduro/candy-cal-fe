import type { ReactNode } from "react"
import { Group, Loader, SegmentedControl, Stack, Text } from "@mantine/core"
import type { ShopeeChannelOption } from "../../../hooks/shopeeDashboardApi"
import type {
  ShopeePerformanceTimeMode,
  ShopeeRangePreset
} from "../../../hooks/models"
import { MonthFilterFields } from "./MonthFilterFields"
import { DateRangeFilterFields } from "./DateRangeFilterFields"
import { compactFilterSegmentedStyles } from "../filterStyles"

interface PerformanceTimeFilterProps {
  mode: ShopeePerformanceTimeMode
  channelId: string
  month: number
  year: number
  hideMonthChannelField?: boolean
  hideRangeChannelField?: boolean
  orderFrom?: string
  orderTo?: string
  preset?: ShopeeRangePreset
  channelOptions: ShopeeChannelOption[]
  monthOptions: ShopeeChannelOption[]
  yearOptions: ShopeeChannelOption[]
  isChannelsLoading?: boolean
  isRefreshing?: boolean
  lastUpdatedLabel?: string
  action?: ReactNode
  onModeChange: (mode: ShopeePerformanceTimeMode) => void
  onMonthChannelChange: (value: string) => void
  onMonthChange: (value: number) => void
  onYearChange: (value: number) => void
  onRangeApply: (payload: {
    channel: string
    orderFrom: string
    orderTo: string
    preset?: ShopeeRangePreset
  }) => void
}

export const PerformanceTimeFilter = ({
  mode,
  channelId,
  month,
  year,
  hideMonthChannelField = false,
  hideRangeChannelField = false,
  orderFrom,
  orderTo,
  preset,
  channelOptions,
  monthOptions,
  yearOptions,
  isChannelsLoading = false,
  isRefreshing = false,
  lastUpdatedLabel,
  action,
  onModeChange,
  onMonthChannelChange,
  onMonthChange,
  onYearChange,
  onRangeApply
}: PerformanceTimeFilterProps) => {
  const filterMeta = (
    <Group gap={6} align="center" wrap="wrap">
      {lastUpdatedLabel && (
        <Text size="xs" c="dimmed">
          Cập nhật lúc: {lastUpdatedLabel}
        </Text>
      )}
      {isRefreshing && (
        <Group gap={6} c="dimmed">
          <Loader size="xs" />
          <Text size="xs">Đang cập nhật</Text>
        </Group>
      )}
    </Group>
  )

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center" gap="sm" wrap="wrap">
        <SegmentedControl
          value={mode}
          onChange={(value) => onModeChange(value as ShopeePerformanceTimeMode)}
          data={[
            { label: "Tổng quan", value: "month" },
            { label: "Chi tiết", value: "range" }
          ]}
          styles={compactFilterSegmentedStyles}
        />

        <Group gap={8} align="center" wrap="wrap">
          {action}
        </Group>
      </Group>

      {mode === "month" ? (
        <MonthFilterFields
          channelId={channelId}
          month={month}
          year={year}
          hideChannelField={hideMonthChannelField}
          channelOptions={channelOptions}
          monthOptions={monthOptions}
          yearOptions={yearOptions}
          isChannelsLoading={isChannelsLoading}
          rightSection={filterMeta}
          onChannelChange={onMonthChannelChange}
          onMonthChange={onMonthChange}
          onYearChange={onYearChange}
        />
      ) : (
        <DateRangeFilterFields
          channelId={channelId}
          hideChannelField={hideRangeChannelField}
          orderFrom={orderFrom}
          orderTo={orderTo}
          preset={preset}
          channelOptions={channelOptions}
          isChannelsLoading={isChannelsLoading}
          rightSection={filterMeta}
          onApply={onRangeApply}
        />
      )}
    </Stack>
  )
}
