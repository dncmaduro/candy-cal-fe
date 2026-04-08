import type { ReactNode } from "react"
import { Badge, Divider, Group, Paper, Stack, Text } from "@mantine/core"
import { TrendBadge } from "./TrendBadge"
import { formatCompactCurrency, formatCurrency, formatPercent } from "./formatters"

interface RevenueOverviewCardProps {
  title: string
  rangeLabel: string
  totalRevenue: number
  changePct?: number
  rangeGoal?: number
  rangeGoalPct?: number
  rangeDays?: number
  modeLabel: string
  detailSections?: ReactNode
}

export const RevenueOverviewCard = ({
  title,
  rangeLabel,
  totalRevenue,
  changePct,
  rangeGoal,
  rangeGoalPct,
  rangeDays,
  modeLabel,
  detailSections
}: RevenueOverviewCardProps) => {
  return (
    <Paper
      withBorder
      radius="xl"
      p="xl"
      style={{
        borderColor: "#dbe4f0",
        background:
          "linear-gradient(180deg, rgba(248,250,252,0.96) 0%, rgba(255,255,255,1) 100%)",
        boxShadow: "0 16px 36px rgba(15, 23, 42, 0.06)"
      }}
    >
      <Stack gap={10}>
        <Group gap={10}>
          <Badge radius="xl" variant="light" color="indigo">
            {modeLabel}
          </Badge>
          <Badge radius="xl" variant="light" color="gray">
            {rangeLabel}
          </Badge>
        </Group>

        <Stack gap={4}>
          <Text
            fz="xs"
            fw={700}
            tt="uppercase"
            c="dimmed"
            style={{ letterSpacing: "0.16em" }}
          >
            {title}
          </Text>
          <Text fw={800} fz="3rem" lh={1} style={{ letterSpacing: "-0.05em" }}>
            {formatCurrency(totalRevenue)}
          </Text>
        </Stack>

        <Group gap="sm">
          <TrendBadge value={changePct} />
          <Text fz="sm" c="dimmed">
            So với kỳ trước cùng độ dài
          </Text>
        </Group>

        {typeof rangeGoal === "number" && rangeGoal > 0 && (
          <Group gap="sm" align="center" wrap="wrap">
            <Badge radius="xl" variant="light" color="cyan">
              KPI {rangeDays || 1} ngày
            </Badge>
            <Text fz="sm" fw={700}>
              {formatCompactCurrency(rangeGoal)}
            </Text>
            {typeof rangeGoalPct === "number" && (
              <Badge
                radius="xl"
                variant="light"
                color={rangeGoalPct >= 100 ? "teal" : "orange"}
              >
                {formatPercent(rangeGoalPct)}
              </Badge>
            )}
          </Group>
        )}
      </Stack>

      {detailSections ? (
        <>
          <Divider my="lg" />
          {detailSections}
        </>
      ) : null}
    </Paper>
  )
}
