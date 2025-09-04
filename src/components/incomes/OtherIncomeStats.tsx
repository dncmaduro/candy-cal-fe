import {
  Paper,
  Group,
  Text,
  Stack,
  Badge,
  Box
} from "@mantine/core"
import { fmtCurrency, fmtPercent } from "../../utils/fmt"

type Props = {
  otherIncome: number
  totalIncome: number
  otherIncomeChangePct?: number
  flex?: number
}

export const OtherIncomeStats = ({
  otherIncome,
  totalIncome,
  otherIncomeChangePct,
  flex = 1
}: Props) => {
  const otherIncomePercent = totalIncome > 0 ? (otherIncome / totalIncome) * 100 : 0

  return (
    <Paper withBorder p="lg" radius="lg" style={{ flex }}>
      <Group justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Text fw={600}>Nguồn khác</Text>
      </Group>

      <Stack gap={8}>
        <Group justify="space-between">
          <Text>Doanh thu</Text>
          <Group align="center" gap={8}>
            <Text fw={700}>{fmtCurrency(otherIncome)}</Text>
            {typeof otherIncomeChangePct === "number" && (
              <Badge
                color={otherIncomeChangePct >= 0 ? "green" : "red"}
                variant="light"
              >
                {otherIncomeChangePct >= 0 ? "+" : ""}
                {fmtPercent(otherIncomeChangePct)}
              </Badge>
            )}
          </Group>
        </Group>

        <Group justify="space-between">
          <Text>Tỉ lệ trên tổng</Text>
          <Text fw={700} c="dimmed">
            {fmtPercent(otherIncomePercent)}
          </Text>
        </Group>

        {otherIncome > 0 && totalIncome > 0 && (
          <Box
            h={8}
            w="100%"
            style={{
              backgroundColor: "#f1f3f4",
              borderRadius: 4,
              overflow: "hidden"
            }}
          >
            <Box
              h="100%"
              w={`${Math.min(100, otherIncomePercent)}%`}
              style={{
                backgroundColor: "#9c88ff",
                transition: "width 0.3s ease"
              }}
            />
          </Box>
        )}
      </Stack>
    </Paper>
  )
}