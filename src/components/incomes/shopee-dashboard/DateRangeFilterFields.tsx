import { useEffect, useMemo, useState } from "react"
import { Alert, Badge, Group, Select, Stack, Text } from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { IconAlertCircle } from "@tabler/icons-react"
import type { ShopeeChannelOption } from "../../../hooks/shopeeDashboardApi"
import type { ShopeeRangePreset } from "../../../hooks/models"
import {
  MAX_RANGE_DAYS,
  getDaysInRange,
  isRangeValid,
  parseDateInputValue,
  resolvePresetRange,
  toDateInputValue
} from "./performanceTimeUtils"
import {
  filterInputStyles,
  filterPlainLabelStyles
} from "../filterStyles"

const PRESET_OPTIONS: Array<{
  key: ShopeeRangePreset
  label: string
}> = [
  { key: "last-7-days", label: "7 ngày gần nhất" },
  { key: "last-14-days", label: "14 ngày gần nhất" },
  { key: "last-30-days", label: "30 ngày gần nhất" },
  { key: "this-month", label: "Tháng này" },
  { key: "last-month", label: "Tháng trước" }
]

interface DateRangeFilterFieldsProps {
  channelId: string
  orderFrom?: string
  orderTo?: string
  preset?: ShopeeRangePreset
  channelOptions: ShopeeChannelOption[]
  isChannelsLoading?: boolean
  onApply: (payload: {
    channel: string
    orderFrom: string
    orderTo: string
    preset?: ShopeeRangePreset
  }) => void
}

export const DateRangeFilterFields = ({
  channelId,
  orderFrom,
  orderTo,
  preset,
  channelOptions,
  isChannelsLoading = false,
  onApply
}: DateRangeFilterFieldsProps) => {
  const [draftChannel, setDraftChannel] = useState(channelId)
  const [draftFrom, setDraftFrom] = useState<Date | null>(
    parseDateInputValue(orderFrom)
  )
  const [draftTo, setDraftTo] = useState<Date | null>(parseDateInputValue(orderTo))
  const [draftPreset, setDraftPreset] = useState<ShopeeRangePreset | undefined>(
    preset
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

  useEffect(() => {
    setDraftPreset(preset)
  }, [preset])

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
      normalizedTo !== orderTo ||
      draftPreset !== preset

    if (!isChanged) return

    onApply({
      channel: draftChannel,
      orderFrom: normalizedFrom,
      orderTo: normalizedTo,
      preset: draftPreset
    })
  }, [
    canApply,
    channelId,
    draftChannel,
    draftPreset,
    orderFrom,
    normalizedFrom,
    normalizedTo,
    onApply,
    preset,
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
      <div className="grid gap-3 md:grid-cols-3">
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
          styles={{
            label: filterPlainLabelStyles,
            input: filterInputStyles
          }}
        />

        <DatePickerInput
          label="Từ ngày"
          placeholder="Chọn từ ngày"
          value={draftFrom}
          onChange={(value) => {
            setDraftFrom(value)
            setDraftPreset(undefined)
          }}
          valueFormat="DD/MM/YYYY"
          clearable={false}
          styles={{
            label: filterPlainLabelStyles,
            input: filterInputStyles
          }}
        />

        <DatePickerInput
          label="Đến ngày"
          placeholder="Chọn đến ngày"
          value={draftTo}
          onChange={(value) => {
            setDraftTo(value)
            setDraftPreset(undefined)
          }}
          valueFormat="DD/MM/YYYY"
          clearable={false}
          styles={{
            label: filterPlainLabelStyles,
            input: filterInputStyles
          }}
        />
      </div>

      <Group gap={8} wrap="wrap">
        {PRESET_OPTIONS.map((option) => {
          const active = draftPreset === option.key

          return (
            <Badge
              key={option.key}
              component="button"
              type="button"
              variant={active ? "filled" : "light"}
              color={active ? "blue" : "gray"}
              radius="xl"
              size="lg"
              onClick={() => {
                const next = resolvePresetRange(option.key)
                setDraftPreset(option.key)
                setDraftFrom(parseDateInputValue(next.orderFrom))
                setDraftTo(parseDateInputValue(next.orderTo))
              }}
              style={{
                cursor: "pointer",
                border: "none"
              }}
            >
              {option.label}
            </Badge>
          )
        })}
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
