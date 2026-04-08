import { Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core"
import { IconBroadcast, IconShoppingBag } from "@tabler/icons-react"
import { DashboardSectionCard } from "./DashboardSectionCard"
import { RankedBarList } from "./analytics/RankedBarList"
import { TrendBadge } from "./analytics/TrendBadge"
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent
} from "./analytics/formatters"

type Props = {
  title: string
  income: number
  incomePct?: number
  incomeGoal?: number
  goalLabel?: string
  adsCost: number
  adsCostChangePct?: number
  adsSharePctDiff?: number
  ownVideoIncome?: number
  otherVideoIncome?: number
  otherIncome?: number
  flex?: number
  embedded?: boolean
}

export const LiveAndVideoStats = ({
  title,
  income,
  incomePct,
  incomeGoal,
  goalLabel = "KPI ngày",
  adsCost,
  adsCostChangePct,
  adsSharePctDiff,
  ownVideoIncome,
  otherVideoIncome,
  otherIncome,
  flex = 1,
  embedded = false
}: Props) => {
  const adsShare = income ? (adsCost / income) * 100 : 0
  const incomeGoalValue = incomeGoal ?? 0
  const normalizedIncomePct =
    typeof incomePct === "number"
      ? incomePct
      : incomeGoalValue > 0
        ? (income / incomeGoalValue) * 100
        : undefined

  // helper for video breakdown
  const videoOwn = ownVideoIncome ?? 0
  const videoOther = otherVideoIncome ?? 0
  const otherIncomeValue = otherIncome ?? 0

  const parts: { key: string; value: number; label: string }[] = [
    { key: "own", value: videoOwn, label: "NST bên bán" },
    { key: "other", value: videoOther, label: "NST liên kết" },
    ...(title === "Doanh thu Sàn" && otherIncomeValue > 0
      ? [
          {
            key: "otherIncome",
            value: otherIncomeValue,
            label: "Doanh thu Khác"
          }
        ]
      : [])
  ]

  const accentColor = title === "Livestream" ? "blue" : "violet"

  const content = (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={4}>
          <Text fw={800} fz="2rem" lh={1} style={{ letterSpacing: "-0.05em" }}>
            {formatCurrency(income)}
          </Text>
          {incomeGoalValue > 0 && (
            <Text fz="sm" c="dimmed">
              {goalLabel} {formatCurrency(incomeGoalValue)}
            </Text>
          )}
        </Stack>

        {typeof normalizedIncomePct === "number" && (
          <Stack gap={4} align="flex-end">
            <Text fz="xs" fw={700} c="dimmed" tt="uppercase">
              Đạt KPI
            </Text>
            <Text fw={800} fz="xl">
              {formatPercent(normalizedIncomePct)}
            </Text>
          </Stack>
        )}
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
        <Paper
          radius="lg"
          p="md"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
        >
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Text fz="xs" fw={700} c="dimmed" tt="uppercase">
                Chi phí ads
              </Text>
              <Text fw={700}>{formatCompactCurrency(adsCost)}</Text>
            </Stack>
            <TrendBadge value={adsCostChangePct} positiveMeaning="bad" />
          </Group>
        </Paper>

        <Paper
          radius="lg"
          p="md"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
        >
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Text fz="xs" fw={700} c="dimmed" tt="uppercase">
                Ads / doanh thu
              </Text>
              <Text fw={700}>{formatPercent(adsShare)}</Text>
            </Stack>
            <TrendBadge value={adsSharePctDiff} positiveMeaning="bad" />
          </Group>
        </Paper>
      </SimpleGrid>

      {parts.some((item) => item.value > 0) && (
        <RankedBarList
          items={parts
            .filter((item) => item.value > 0)
            .sort((a, b) => b.value - a.value)
            .map((item) => ({
              key: item.key,
              label: item.label,
              value: item.value,
              caption: "Tỷ trọng trong cụm doanh thu này"
            }))}
          totalValue={parts.reduce((sum, item) => sum + item.value, 0)}
          color={accentColor}
          maxItems={4}
          valueFormatter={(value) => formatCurrency(value)}
        />
      )}
    </Stack>
  )

  if (embedded) {
    return (
      <Paper
        withBorder
        radius="xl"
        p="lg"
        style={{
          height: "100%",
          borderColor: "#dbe4f0",
          background: "rgba(255,255,255,0.92)"
        }}
      >
        <Group justify="space-between" align="flex-start" mb="md">
          <Group gap="xs" align="flex-start">
            <div
              style={{
                color: `var(--mantine-color-${accentColor}-6)`,
                background: `var(--mantine-color-${accentColor}-0)`,
                borderRadius: 14,
                padding: 8,
                lineHeight: 0
              }}
            >
              {title === "Livestream" ? (
                <IconBroadcast size={18} />
              ) : (
                <IconShoppingBag size={18} />
              )}
            </div>
            <div>
              <Text
                fz="xs"
                fw={700}
                tt="uppercase"
                c="dimmed"
                style={{ letterSpacing: "0.14em" }}
              >
                {title}
              </Text>
              <Text fz="sm" fw={600} mt={4}>
                {title === "Livestream"
                  ? "Hiệu suất doanh thu từ live"
                  : "Hiệu suất nhóm doanh thu sàn"}
              </Text>
            </div>
          </Group>
        </Group>

        {content}
      </Paper>
    )
  }

  return (
    <div style={{ flex }}>
      <DashboardSectionCard
        title={title}
        subtitle={title === "Livestream" ? "Hiệu suất doanh thu từ live" : "Hiệu suất nhóm doanh thu sàn"}
        icon={
          title === "Livestream" ? (
            <IconBroadcast size={18} />
          ) : (
            <IconShoppingBag size={18} />
          )
        }
        accentColor={accentColor}
      >
        {content}
      </DashboardSectionCard>
    </div>
  )
}
