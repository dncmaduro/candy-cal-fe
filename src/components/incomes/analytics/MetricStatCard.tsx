import type { ReactNode } from "react"
import { Box, Group, Paper, Text } from "@mantine/core"

interface MetricStatCardProps {
  label: string
  value: string
  hint?: string
  icon?: ReactNode
  tone?: string
  trailing?: ReactNode
}

export const MetricStatCard = ({
  label,
  value,
  hint,
  icon,
  tone = "blue",
  trailing
}: MetricStatCardProps) => {
  const toneStyles: Record<
    string,
    {
      background: string
      color: string
    }
  > = {
    blue: {
      background: "#eff6ff",
      color: "#3b82f6"
    },
    cyan: {
      background: "#ecfeff",
      color: "#06b6d4"
    },
    teal: {
      background: "#ecfdf5",
      color: "#10b981"
    },
    grape: {
      background: "#faf5ff",
      color: "#d946ef"
    },
    indigo: {
      background: "#eef2ff",
      color: "#6366f1"
    },
    red: {
      background: "#fff1f2",
      color: "#ef4444"
    },
    orange: {
      background: "#fff7ed",
      color: "#f97316"
    },
    amber: {
      background: "#fffbeb",
      color: "#d97706"
    },
    rose: {
      background: "#fff1f2",
      color: "#f43f5e"
    }
  }

  const currentTone = toneStyles[tone] ?? toneStyles.blue

  return (
    <Paper
      withBorder
      radius={24}
      p="lg"
      style={{
        height: "100%",
        borderColor: "#dbe4f0",
        boxShadow: "0 12px 34px rgba(15, 23, 42, 0.05)",
        background: "#ffffff"
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb={18}>
        <Text
          fz="sm"
          fw={500}
          c="#64748b"
        >
          {label}
        </Text>
        {icon && (
          <Box
            style={{
              flexShrink: 0,
              width: 46,
              height: 46,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: currentTone.background,
              color: currentTone.color
            }}
          >
            {icon}
          </Box>
        )}
      </Group>

      <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
        <Text
          fw={700}
          fz="2.15rem"
          lh={1.05}
          c="#0f172a"
          style={{
            flex: "1 1 220px",
            minWidth: 0,
            letterSpacing: "-0.04em"
          }}
        >
          {value}
        </Text>
        {trailing ? (
          <Box
            style={{
              marginInlineStart: "auto",
              maxWidth: "100%"
            }}
          >
            {trailing}
          </Box>
        ) : null}
      </Group>

      {hint && (
        <Text mt={16} fz="sm" c="#64748b">
          {hint}
        </Text>
      )}
    </Paper>
  )
}
