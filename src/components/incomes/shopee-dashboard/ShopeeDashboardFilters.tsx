import type { ReactNode } from "react"
import {
  Badge,
  Box,
  Group,
  Loader,
  Select,
  Skeleton,
  Stack,
  Text
} from "@mantine/core"
import type { ShopeeChannelOption } from "../../../hooks/shopeeDashboardApi"
import { formatPercent } from "../analytics/formatters"
import {
  filterDropdownStyles,
  filterInputStyles,
  filterPlainLabelStyles
} from "../filterStyles"

interface ShopeeDashboardFiltersProps {
  channelId: string
  month: number
  year: number
  channelOptions: ShopeeChannelOption[]
  monthOptions: ShopeeChannelOption[]
  yearOptions: ShopeeChannelOption[]
  onChannelChange: (value: string) => void
  onMonthChange: (value: number) => void
  onYearChange: (value: number) => void
  isChannelsLoading?: boolean
  isRefreshing?: boolean
  scopeLabel?: string
  scopeDescription?: string
  expectedProgressPercentage?: number
  action?: ReactNode
}

const FilterSkeleton = () => (
  <Stack gap={6}>
    <Skeleton height={12} width={88} radius="xl" />
    <Skeleton height={44} radius="xl" />
  </Stack>
)

export const ShopeeDashboardFilters = ({
  channelId,
  month,
  year,
  channelOptions,
  monthOptions,
  yearOptions,
  onChannelChange,
  onMonthChange,
  onYearChange,
  isChannelsLoading = false,
  isRefreshing = false,
  scopeLabel,
  scopeDescription,
  expectedProgressPercentage,
  action
}: ShopeeDashboardFiltersProps) => {
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start" gap="md">
        <Box>
          <Text fw={700} fz="xl" mb={4}>
            Dashboard hiệu suất Shopee
          </Text>
          <Text c="dimmed" fz="sm">
            Theo dõi KPI, tiến độ và nhịp đạt kế hoạch theo shop hoặc toàn bộ
            kênh Shopee.
          </Text>
        </Box>

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

      <Group gap={10} wrap="wrap">
        {scopeLabel && (
          <Badge variant="light" color="blue" radius="xl" size="lg">
            {scopeLabel}
          </Badge>
        )}
        {typeof expectedProgressPercentage === "number" && (
          <Badge variant="light" color="grape" radius="xl" size="lg">
            Kỳ vọng hiện tại {formatPercent(expectedProgressPercentage)}
          </Badge>
        )}
        {scopeDescription && (
          <Text size="sm" c="dimmed">
            {scopeDescription}
          </Text>
        )}
      </Group>

      <div className="grid gap-3 md:grid-cols-3">
        {isChannelsLoading ? (
          <FilterSkeleton />
        ) : (
          <Select
            label="Kênh Shopee"
            placeholder="Chọn kênh"
            value={channelId}
            onChange={(value) => value && onChannelChange(value)}
            data={channelOptions}
            searchable
            nothingFoundMessage="Không có kênh"
            size="sm"
            styles={{
              label: filterPlainLabelStyles,
              input: filterInputStyles,
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
    </Stack>
  )
}
