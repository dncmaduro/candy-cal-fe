import { useEffect, useState } from "react"
import { useIncomes } from "../../hooks/useIncomes"
import { DatePickerInput } from "@mantine/dates"
import { Flex, Loader, Stack, Table, Text, Paper, Divider } from "@mantine/core"
import { format } from "date-fns"

export const DailyStatsModal = () => {
  const { getDailyStats } = useIncomes()
  const [date, setDate] = useState<Date | null>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d
  })
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<{
    boxes: { box: string; quantity: number }[]
    totalIncome: number
    sources?: {
      ads: number
      affiliate: number
      affiliateAds: number
      other: number
    }
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async (selected: Date | null) => {
    if (!selected) return
    setLoading(true)
    setError(null)
    try {
      const iso = new Date(selected.setHours(0, 0, 0, 0)).toISOString()
      const res = await getDailyStats({ date: iso })
      setData(res.data)
    } catch (e: any) {
      setError("Không lấy được dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats(date)
  }, [])

  useEffect(() => {
    fetchStats(date)
  }, [date])

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
      {loading ? (
        <Flex justify="center" align="center" h={120}>
          <Loader />
        </Flex>
      ) : error ? (
        <Text c="red" fz="sm">
          {error}
        </Text>
      ) : data ? (
        <Stack gap={12}>
          <Paper withBorder p="sm" radius="md">
            <Text fw={600} mb={4}>
              Tổng doanh thu
            </Text>
            <Text fz="lg" fw={700} c="indigo">
              {data.totalIncome.toLocaleString()} VNĐ
            </Text>
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
