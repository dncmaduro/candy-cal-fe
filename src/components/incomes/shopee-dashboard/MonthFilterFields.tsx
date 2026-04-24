import type { ReactNode } from "react"
import { Group, Select } from "@mantine/core"
import type { ShopeeChannelOption } from "../../../hooks/shopeeDashboardApi"
import {
  compactFilterInputStyles,
  compactFilterPlainLabelStyles,
  filterDropdownStyles
} from "../filterStyles"

interface MonthFilterFieldsProps {
  channelId: string
  month: number
  year: number
  hideChannelField?: boolean
  channelOptions: ShopeeChannelOption[]
  monthOptions: ShopeeChannelOption[]
  yearOptions: ShopeeChannelOption[]
  isChannelsLoading?: boolean
  rightSection?: ReactNode
  onChannelChange: (value: string) => void
  onMonthChange: (value: number) => void
  onYearChange: (value: number) => void
}

export const MonthFilterFields = ({
  channelId,
  month,
  year,
  hideChannelField = false,
  channelOptions,
  monthOptions,
  yearOptions,
  isChannelsLoading = false,
  rightSection,
  onChannelChange,
  onMonthChange,
  onYearChange
}: MonthFilterFieldsProps) => {
  return (
    <Group justify="space-between" align="flex-end" gap="sm" wrap="wrap">
      <Group align="flex-end" gap={10} wrap="wrap" style={{ flex: 1 }}>
        {!hideChannelField && (
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
            w={280}
            styles={{
              label: compactFilterPlainLabelStyles,
              input: compactFilterInputStyles,
              dropdown: filterDropdownStyles
            }}
          />
        )}

        <Select
          label="Tháng"
          placeholder="Chọn tháng"
          value={String(month)}
          onChange={(value) => value && onMonthChange(Number(value))}
          data={monthOptions}
          allowDeselect={false}
          size="sm"
          w={180}
          styles={{
            label: compactFilterPlainLabelStyles,
            input: compactFilterInputStyles,
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
          w={160}
          styles={{
            label: compactFilterPlainLabelStyles,
            input: compactFilterInputStyles,
            dropdown: filterDropdownStyles
          }}
        />
      </Group>

      {rightSection}
    </Group>
  )
}
