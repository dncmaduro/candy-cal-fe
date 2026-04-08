// components/dashboard/DashboardSectionCard.tsx
import { Paper, Group, Text, Box } from "@mantine/core"
import type { ReactNode } from "react"

interface DashboardSectionCardProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  rightSection?: ReactNode
  children: ReactNode
  accentColor?: string // mantine color name, default "blue"
}

export const DashboardSectionCard = ({
  title,
  subtitle,
  icon,
  rightSection,
  children,
  accentColor = "blue"
}: DashboardSectionCardProps) => {
  return (
    <Paper
      withBorder
      radius="xl"
      p="lg"
      className="bg-white transition-all"
      style={{
        height: "100%",
        borderColor: "#dbe4f0",
        boxShadow: "0 12px 34px rgba(15, 23, 42, 0.05)",
        background:
          "linear-gradient(180deg, rgba(248,250,252,0.86) 0%, rgba(255,255,255,1) 100%)"
      }}
    >
      <Group justify="space-between" align="flex-start" mb="md" gap="sm">
        <Group gap="xs" align="flex-start">
          {icon && (
            <Box
              mt={2}
              style={{
                color: `var(--mantine-color-${accentColor}-6)`,
                background: `var(--mantine-color-${accentColor}-0)`,
                borderRadius: 14,
                padding: 8,
                lineHeight: 0
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Text
              fz="xs"
              fw={700}
              tt="uppercase"
              c="dimmed"
              style={{ letterSpacing: "0.14em" }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text fz="sm" fw={600} mt={4}>
                {subtitle}
              </Text>
            )}
          </Box>
        </Group>
        {rightSection}
      </Group>

      {children}
    </Paper>
  )
}
