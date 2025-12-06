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
      shadow="md"
      radius="md"
      p="md"
      className="bg-white transition-all"
      style={{
        borderColor: "var(--mantine-color-gray-3)",
        borderLeftWidth: 3,
        borderLeftColor: `var(--mantine-color-${accentColor}-5)`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 18px rgba(15, 23, 42, 0.04)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none"
      }}
    >
      <Group justify="space-between" align="flex-start" mb="sm" gap="sm">
        <Group gap="xs" align="flex-start">
          {icon && <Box mt={2}>{icon}</Box>}
          <Box>
            <Text fw={600}>{title}</Text>
            {subtitle && (
              <Text fz="xs" c="dimmed">
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
