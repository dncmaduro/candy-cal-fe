import { Paper, Text, Stack } from "@mantine/core"

interface Props {
  label: string
  value: string | number
  unit?: string
  color?: string // chỉ dùng để tô màu số, không bắn gradient
}

export const KPIBox = ({ label, value, unit, color = "gray" }: Props) => {
  // màu của số: nếu không truyền gì thì dùng "dark" cho dễ đọc
  const valueColor = color === "gray" ? "dark" : color

  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      shadow="xs"
      className="min-w-[160px] flex-1 bg-white transition-all hover:-translate-y-[1px] hover:bg-gray-50"
      style={{
        borderColor: "var(--mantine-color-gray-3)",
        borderLeftWidth: 3,
        borderLeftColor:
          color === "gray"
            ? "var(--mantine-color-gray-4)"
            : `var(--mantine-color-${color}-5)`
      }}
    >
      <Stack gap={6} align="start">
        <Text
          c="dimmed"
          fz="xs"
          fw={600}
          style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
        >
          {label}
        </Text>

        <Text fz={22} fw={700} c={valueColor} lh={1.1}>
          {value}
          {unit && (
            <Text span fz="sm" c="dimmed" fw={500} ml={4}>
              {unit}
            </Text>
          )}
        </Text>
      </Stack>
    </Paper>
  )
}
