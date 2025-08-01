import { Paper, Text, Stack } from "@mantine/core"

interface Props {
  label: string
  value: string | number
  unit?: string
  color?: string
}

export const KPIBox = ({ label, value, unit, color = "gray" }: Props) => (
  <Paper
    withBorder
    radius="lg"
    p="md"
    shadow="xs"
    className="w-fit min-w-[170px] flex-1 bg-white"
    style={{
      borderColor: `var(--mantine-color-${color}-3, #e9ecef)`,
      background: "linear-gradient(90deg, #f4f6fb 70%, #fff 100%)"
    }}
  >
    <Stack gap={4} align="start">
      <Text c="dimmed" fz="sm" fw={500}>
        {label}
      </Text>
      <Text fz={24} fw={700} c={color}>
        {value}{" "}
        {unit && (
          <Text span fz="md" c="dimmed">
            {unit}
          </Text>
        )}
      </Text>
    </Stack>
  </Paper>
)
