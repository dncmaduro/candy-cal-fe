import { Box, Group, Progress, Stack, Text } from "@mantine/core"
import type { ReactNode } from "react"
import { formatPercent } from "./formatters"

type RankedBarItem = {
  key: string
  label: string
  value: number
  caption?: string
  delta?: ReactNode
  meta?: ReactNode
  color?: string
}

interface RankedBarListProps {
  items: RankedBarItem[]
  color?: string
  maxItems?: number
  totalValue?: number
  valueFormatter?: (value: number) => string
  shareFormatter?: (share: number) => string
  showShare?: boolean
  emptyText?: string
  footer?: ReactNode
}

export const RankedBarList = ({
  items,
  color = "blue",
  maxItems = 8,
  totalValue,
  valueFormatter = (value) => value.toLocaleString("vi-VN"),
  shareFormatter = (share) => formatPercent(share),
  showShare = true,
  emptyText = "Chưa có dữ liệu",
  footer
}: RankedBarListProps) => {
  if (!items.length) {
    return (
      <Text fz="sm" c="dimmed">
        {emptyText}
      </Text>
    )
  }

  const visibleItems = items.slice(0, maxItems)
  const maxValue = visibleItems[0]?.value || 1
  const total =
    totalValue ?? visibleItems.reduce((sum, item) => sum + (item.value || 0), 0)

  return (
    <Stack gap="md">
      {visibleItems.map((item) => {
        const share = total > 0 ? (item.value / total) * 100 : 0

        return (
          <Box key={item.key}>
            <Group justify="space-between" align="flex-start" gap="md" wrap="nowrap">
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Group gap={8} wrap="nowrap">
                  <Text fw={600} size="sm" truncate>
                    {item.label}
                  </Text>
                  {item.delta}
                </Group>
                {item.caption && (
                  <Text fz="xs" c="dimmed" mt={2}>
                    {item.caption}
                  </Text>
                )}
              </Box>

              <Stack gap={2} align="flex-end">
                <Text fw={700} size="sm">
                  {valueFormatter(item.value)}
                </Text>
                <Group gap={8}>
                  {showShare && (
                    <Text fz="xs" c="dimmed">
                      {shareFormatter(share)}
                    </Text>
                  )}
                  {item.meta}
                </Group>
              </Stack>
            </Group>

            <Progress
              mt={8}
              radius="xl"
              size="md"
              value={maxValue > 0 ? (item.value / maxValue) * 100 : 0}
              color={item.color || color}
            />
          </Box>
        )
      })}

      {footer}
    </Stack>
  )
}
