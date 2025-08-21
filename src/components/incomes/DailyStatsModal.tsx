import { useState } from "react"
import { useIncomes } from "../../hooks/useIncomes"
import { DatePickerInput } from "@mantine/dates"
import {
  Flex,
  Loader,
  Stack,
  Table,
  Text,
  Paper,
  Divider,
  Group
} from "@mantine/core"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { fmtCurrency, fmtPercent } from "../../utils/fmt"

export const DailyStatsModal = () => {
  const { getDailyStats } = useIncomes()
  const [date, setDate] = useState<Date | null>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d
  })

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "getDailyStats",
      date ? new Date(date.getTime()).setHours(0, 0, 0, 0) : null
    ],
    queryFn: async () => {
      if (!date) return null
      const iso = new Date(date.getTime()).setHours(0, 0, 0, 0)
      const res = await getDailyStats({ date: new Date(iso).toISOString() })
      return res.data
    },
    enabled: !!date,
    staleTime: 60 * 1000
  })

  // Helpers and metric rows outside JSX

  const metricsRows: { label: string; value: string }[] = (() => {
    if (!data) return []
    const video = typeof data.videoIncome === "number" ? data.videoIncome : 0
    const rest = Math.max(0, data.totalIncome - data.liveIncome - video)

    const rows: { label: string; value: string }[] = [
      { label: "Doanh thu live", value: fmtCurrency(data.liveIncome) }
    ]

    if (typeof data.videoIncome === "number") {
      rows.push({ label: "Doanh thu video", value: fmtCurrency(video) })
    }

    rows.push({ label: "Doanh thu còn lại", value: fmtCurrency(rest) })

    if (data.dailyAds) {
      rows.push(
        {
          label: "Chi phí Ads (Live)",
          value: fmtCurrency(data.dailyAds.liveAdsCost)
        },
        {
          label: "Chi phí Ads (Video)",
          value: fmtCurrency(data.dailyAds.videoAdsCost)
        },
        {
          label: "Tổng chi Ads",
          value: fmtCurrency(
            data.dailyAds.liveAdsCost + data.dailyAds.videoAdsCost
          )
        }
      )
    }

    if (typeof data.percentages?.liveAdsToLiveIncome === "number") {
      rows.push({
        label: "Tỉ lệ Ads live / Doanh thu live",
        value: fmtPercent(data.percentages.liveAdsToLiveIncome)
      })
    }

    if (typeof data.percentages?.videoAdsToVideoIncome === "number") {
      rows.push({
        label: "Tỉ lệ Ads video / Doanh thu video",
        value: fmtPercent(data.percentages.videoAdsToVideoIncome)
      })
    }

    return rows
  })()

  return (
    <Stack gap={16} p={4}>
      <DatePickerInput
        label="Ngày"
        value={date}
        onChange={setDate}
        valueFormat="DD/MM/YYYY"
        size="md"
        radius="md"
        maxDate={new Date()}
      />
      <Divider my={4} />
      {isLoading ? (
        <Flex justify="center" align="center" h={120}>
          <Loader />
        </Flex>
      ) : error ? (
        <Text c="red" fz="sm">
          Không lấy được dữ liệu
        </Text>
      ) : data ? (
        <Stack gap={12}>
          {/* Combined metrics box: total (bigger) + all other metrics unified */}
          <Paper withBorder p="sm" radius="md">
            <Group justify="space-between" align="center">
              <Text fw={700}>Tổng doanh thu</Text>
              <Text fz="xl" fw={900} c="indigo">
                {data.totalIncome.toLocaleString()} VNĐ
              </Text>
            </Group>
            <Divider my={8} />
            <Stack gap={8}>
              {metricsRows.map((r) => (
                <Group key={r.label} justify="space-between" align="center">
                  <Text>{r.label}</Text>
                  <Text fw={700}>{r.value}</Text>
                </Group>
              ))}
            </Stack>
          </Paper>

          {data.sources && (
            <Paper withBorder p="sm" radius="md">
              <Text fw={600} mb={8}>
                Chi tiết theo nguồn
              </Text>
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
                  {(() => {
                    const src = data.sources!
                    const entries: [string, number][] = Object.entries(src)
                    const sum = entries.reduce((s, [, v]) => s + v, 0) || 1
                    const labels: Record<string, string> = {
                      ads: "Ads",
                      affiliate: "Affiliate",
                      affiliateAds: "Affiliate Ads",
                      other: "Khác"
                    }
                    return entries.map(([k, v]) => (
                      <Table.Tr key={k}>
                        <Table.Td>{labels[k] || k}</Table.Td>
                        <Table.Td>{v.toLocaleString()}</Table.Td>
                        <Table.Td>
                          {Math.round(
                            ((v / sum) * 100 + Number.EPSILON) * 100
                          ) / 100}
                          %
                        </Table.Td>
                      </Table.Tr>
                    ))
                  })()}
                </Table.Tbody>
              </Table>
            </Paper>
          )}
          {/* New: Shipping providers breakdown */}
          {data.shippingProviders && data.shippingProviders.length > 0 && (
            <Paper withBorder p="sm" radius="md">
              <Text fw={600} mb={8}>
                Theo đơn vị vận chuyển
              </Text>
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
                    <Table.Th style={{ width: 220 }}>Đơn vị</Table.Th>
                    <Table.Th style={{ width: 120 }}>Số đơn</Table.Th>
                    <Table.Th style={{ width: 100 }}>Tỉ lệ</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {(() => {
                    const items = data.shippingProviders!
                    const total =
                      items.reduce((s, it) => s + (it?.orders ?? 0), 0) || 1
                    return items.map((sp) => (
                      <Table.Tr key={sp.provider}>
                        <Table.Td>{sp.provider || "-"}</Table.Td>
                        <Table.Td>
                          {sp.orders?.toLocaleString?.() ?? sp.orders}
                        </Table.Td>
                        <Table.Td>
                          {Math.round(
                            (((sp.orders || 0) / total) * 100 +
                              Number.EPSILON) *
                              100
                          ) / 100}
                          %
                        </Table.Td>
                      </Table.Tr>
                    ))
                  })()}
                </Table.Tbody>
              </Table>
            </Paper>
          )}
          <Table
            withTableBorder
            withColumnBorders
            striped
            verticalSpacing="xs"
            horizontalSpacing="md"
            miw={300}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 200 }}>Quy cách đóng hộp</Table.Th>
                <Table.Th style={{ width: 100 }}>Số lượng</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.boxes.length ? (
                data.boxes.map((b) => (
                  <Table.Tr key={b.box}>
                    <Table.Td>{b.box || "-"}</Table.Td>
                    <Table.Td>{b.quantity}</Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={2}>
                    <Text c="dimmed" ta="center">
                      Không có dữ liệu
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
          <Text c="dimmed" fz="xs">
            Cập nhật: {format(new Date(), "dd/MM/yyyy HH:mm:ss")}
          </Text>
        </Stack>
      ) : (
        <Text c="dimmed" fz="sm">
          Chọn ngày để xem thống kê
        </Text>
      )}
    </Stack>
  )
}
