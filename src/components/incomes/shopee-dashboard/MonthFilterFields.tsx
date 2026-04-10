import { Select } from "@mantine/core"
import type { ShopeeChannelOption } from "../../../hooks/shopeeDashboardApi"
import {
  filterDropdownStyles,
  filterInputStyles,
  filterPlainLabelStyles
} from "../filterStyles"

interface MonthFilterFieldsProps {
  channelId: string
  month: number
  year: number
  channelOptions: ShopeeChannelOption[]
  monthOptions: ShopeeChannelOption[]
  yearOptions: ShopeeChannelOption[]
  isChannelsLoading?: boolean
  onChannelChange: (value: string) => void
  onMonthChange: (value: number) => void
  onYearChange: (value: number) => void
}

export const MonthFilterFields = ({
  channelId,
  month,
  year,
  channelOptions,
  monthOptions,
  yearOptions,
  isChannelsLoading = false,
  onChannelChange,
  onMonthChange,
  onYearChange
}: MonthFilterFieldsProps) => {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Select
        label="Kênh Shopee"
        placeholder="Chọn kênh"
        value={channelId}
        onChange={(value) => value && onChannelChange(value)}
        data={channelOptions}
        searchable
        disabled={isChannelsLoading}
        nothingFoundMessage="Không có kênh"
        size="sm"
        styles={{
          label: filterPlainLabelStyles,
          input: filterInputStyles,
          dropdown: filterDropdownStyles
        }}
      />

      <Select
        label="Tháng"
        placeholder="Chọn tháng"
        value={String(month)}
        onChange={(value) => value && onMonthChange(Number(value))}
        data={monthOptions}
        allowDeselect={false}
        size="sm"
        styles={{
          label: filterPlainLabelStyles,
          input: filterInputStyles,
          dropdown: filterDropdownStyles
        }}
      />

      <Select
        label="Năm"
        placeholder="Chọn năm"
        value={String(year)}
        onChange={(value) => value && onYearChange(Number(value))}
        data={yearOptions}
        allowDeselect={false}
        size="sm"
        styles={{
          label: filterPlainLabelStyles,
          input: filterInputStyles,
          dropdown: filterDropdownStyles
        }}
      />
    </div>
  )
}
