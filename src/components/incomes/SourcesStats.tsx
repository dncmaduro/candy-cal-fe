import { useState } from "react"
import {
  Paper,
  Text,
  Group,
  Table,
  Badge,
  Box,
  SegmentedControl,
  Flex
} from "@mantine/core"
import { fmtPercent } from "../../utils/fmt"
import { CPiechart } from "../common/CPiechart"

export const SourcesStats = ({
  sources,
  changes
}: {
  sources: Record<string, number>
  changes?: any
}) => {
  const [mode, setMode] = useState<"table" | "chart">("table")

  const entries = Object.entries(sources || {})
  const sum = entries.reduce((s, [, v]) => s + v, 0) || 1
  const labels: Record<string, string> = {
    ads: "Ads",
    affiliate: "Affiliate",
    affiliateAds: "Affiliate Ads",
    other: "Khác"
  }

  // prepare slices for pie
  const slices = entries.map(([k, v]) => ({
    key: k,
    label: labels[k] || k,
    value: v,
    pct: Math.round(((v / sum) * 100 + Number.EPSILON) * 100) / 100,
    change:
      k === "ads"
        ? changes?.adsPct
        : k === "affiliate"
          ? changes?.affiliatePct
          : k === "affiliateAds"
            ? changes?.affiliateAdsPct
            : changes?.otherPct
  }))

  return (
    <Paper withBorder p="lg" radius="lg">
      <Group justify="apart" align="center" mb={8}>
        <Text fw={600}>Chi tiết theo nguồn</Text>
        <SegmentedControl
          value={mode}
          onChange={(v) => setMode(v as "table" | "chart")}
          data={[
            { label: "Bảng", value: "table" },
            { label: "Biểu đồ", value: "chart" }
          ]}
          size="sm"
        />
      </Group>

      {mode === "table" ? (
        <Table
          withColumnBorders
          withTableBorder
          striped
          verticalSpacing="xs"
          horizontalSpacing="md"
          miw={300}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 160 }}>Nguồn</Table.Th>
              <Table.Th style={{ width: 120 }}>Doanh thu</Table.Th>
              <Table.Th style={{ width: 100 }}>Tỉ lệ</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {slices.map((s) => (
              <Table.Tr key={s.key}>
                <Table.Td>{s.label}</Table.Td>
                <Table.Td>{s.value.toLocaleString()}</Table.Td>
                <Table.Td>
                  <Group align="center" gap={8}>
                    <span>{s.pct}%</span>
                    {typeof s.change === "number" && (
                      <Badge
                        color={s.change >= 0 ? "green" : "red"}
                        variant="light"
                      >
                        {s.change >= 0 ? "+" : "-"}
                        {fmtPercent(Math.abs(s.change))}
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Flex gap={24} align="flex-start">
          <Box style={{ minWidth: 280 }}>
            <CPiechart
              data={slices.map((s) => ({ label: s.label, value: s.value }))}
              width={280}
              radius={110}
              donut={false}
              // palette={slices.map((s, i) => getColor(s.key, i))}
              showLegend
              legendItemWidth={90}
              enableOthers={false}
              title={
                <Text fw={600} fz="sm" c="dimmed">
                  Tổng: {sum.toLocaleString()} VNĐ
                </Text>
              }
              valueFormatter={(v) => v.toLocaleString() + "₫"}
              percentFormatter={(p) => fmtPercent(p)}
            />
          </Box>
        </Flex>
      )}
    </Paper>
  )
}
