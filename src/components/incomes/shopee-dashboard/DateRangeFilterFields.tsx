import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Alert, Group, Select, Stack, Text } from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { IconAlertCircle } from "@tabler/icons-react"
import type { ShopeeChannelOption } from "../../../hooks/shopeeDashboardApi"
import {
  MAX_RANGE_DAYS,
  getDaysInRange,
  isRangeValid,
  parseDateInputValue,
  toDateInputValue
} from "./performanceTimeUtils"
import {
  compactFilterInputStyles,
  compactFilterPlainLabelStyles
} from "../filterStyles"

interface DateRangeFilterFieldsProps {
  channelId: string
  hideChannelField?: boolean
  orderFrom?: string
  orderTo?: string
  channelOptions: ShopeeChannelOption[]
  isChannelsLoading?: boolean
  rightSection?: ReactNode
  onApply: (payload: {
    channel: string
    orderFrom: string
    orderTo: string
  }) => void
}

export const DateRangeFilterFields = ({
  channelId,
  hideChannelField = false,
  orderFrom,
  orderTo,
  channelOptions,
  isChannelsLoading = false,
  rightSection,
  onApply
}: DateRangeFilterFieldsProps) => {
  const [draftChannel, setDraftChannel] = useState(channelId)
  const [draftFrom, setDraftFrom] = useState<Date | null>(
    parseDateInputValue(orderFrom)
  )
  const [draftTo, setDraftTo] = useState<Date | null>(
    parseDateInputValue(orderTo)
  )

  useEffect(() => {
    setDraftChannel(channelId)
  }, [channelId])

  useEffect(() => {
    setDraftFrom(parseDateInputValue(orderFrom))
  }, [orderFrom])

  useEffect(() => {
    setDraftTo(parseDateInputValue(orderTo))
  }, [orderTo])

  const normalizedFrom = draftFrom ? toDateInputValue(draftFrom) : undefined
  const normalizedTo = draftTo ? toDateInputValue(draftTo) : undefined
  const rangeDays = getDaysInRange(normalizedFrom, normalizedTo)
  const validRange = isRangeValid(normalizedFrom, normalizedTo)
  const canApply =
    Boolean(draftChannel) &&
    Boolean(normalizedFrom) &&
    Boolean(normalizedTo) &&
    validRange

  useEffect(() => {
    if (!canApply || !normalizedFrom || !normalizedTo) return

    const isChanged =
      draftChannel !== channelId ||
      normalizedFrom !== orderFrom ||
      normalizedTo !== orderTo

    if (!isChanged) return

    onApply({
      channel: draftChannel,
      orderFrom: normalizedFrom,
      orderTo: normalizedTo
    })
  }, [
    canApply,
    channelId,
    draftChannel,
    orderFrom,
    normalizedFrom,
    normalizedTo,
    onApply,
    orderTo
  ])

  const rangeError = useMemo(() => {
    if (!normalizedFrom || !normalizedTo) {
      return "Vui lòng chọn đầy đủ từ ngày và đến ngày."
    }

    if (rangeDays === 0) {
      return "Từ ngày không được lớn hơn đến ngày."
    }

    if (rangeDays > MAX_RANGE_DAYS) {
      return `Khoảng thời gian tối đa là ${MAX_RANGE_DAYS} ngày.`
    }

    return undefined
  }, [normalizedFrom, normalizedTo, rangeDays])

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="flex-end" gap="sm" wrap="wrap">
        <Group align="flex-end" gap={10} wrap="wrap" style={{ flex: 1 }}>
          {!hideChannelField && (
            <Select
              label="Kênh Shopee"
              placeholder="Chọn kênh"
              value={draftChannel}
              onChange={(value) => value && setDraftChannel(value)}
              data={channelOptions}
              searchable
              disabled={isChannelsLoading}
              nothingFoundMessage="Không có kênh"
              size="sm"
              w={280}
              styles={{
                label: compactFilterPlainLabelStyles,
                input: compactFilterInputStyles
              }}
            />
          )}

          <DatePickerInput
            label="Từ ngày"
            placeholder="Chọn từ ngày"
            value={draftFrom}
            onChange={setDraftFrom}
            valueFormat="DD/MM/YYYY"
            clearable={false}
            w={180}
            styles={{
              label: compactFilterPlainLabelStyles,
              input: compactFilterInputStyles
            }}
          />

          <DatePickerInput
            label="Đến ngày"
            placeholder="Chọn đến ngày"
            value={draftTo}
            onChange={setDraftTo}
            valueFormat="DD/MM/YYYY"
            clearable={false}
            w={180}
            styles={{
              label: compactFilterPlainLabelStyles,
              input: compactFilterInputStyles
            }}
          />
        </Group>

        {rightSection}
      </Group>

      {rangeError && (
        <Alert
          color="orange"
          variant="light"
          radius="lg"
          icon={<IconAlertCircle size={16} />}
        >
          <Text size="sm">{rangeError}</Text>
        </Alert>
      )}
    </Stack>
  )
}
