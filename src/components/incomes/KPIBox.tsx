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
    className="w-fit min-w-[160px] flex-1 bg-white"
    style={{
      borderColor: `var(--mantine-color-${color}-3, #e9ecef)`,
      background: `linear-gradient(135deg, rgba(var(--mantine-color-${color}-1-rgb), 0.1) 0%, #fff 70%)`,
      transition: "all 0.2s ease",
      cursor: "default"
    }}
    __vars={{
      "--paper-hover": `linear-gradient(135deg, rgba(var(--mantine-color-${color}-2-rgb), 0.15) 0%, #fff 70%)`
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = `linear-gradient(135deg, rgba(var(--mantine-color-${color}-2-rgb), 0.15) 0%, #fff 70%)`
      e.currentTarget.style.transform = "translateY(-1px)"
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = `linear-gradient(135deg, rgba(var(--mantine-color-${color}-1-rgb), 0.1) 0%, #fff 70%)`
      e.currentTarget.style.transform = "translateY(0px)"
    }}
  >
    <Stack gap={4} align="start">
      <Text
        c="dimmed"
        fz="xs"
        fw={600}
        style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}
      >
        {label}
      </Text>
      <Text fz={22} fw={700} c={color} lh={1.1}>
        {value}{" "}
        {unit && (
          <Text span fz="sm" c="dimmed" fw={500}>
            {unit}
          </Text>
        )}
      </Text>
    </Stack>
  </Paper>
)
