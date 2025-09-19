import { useState, useMemo } from "react"
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
  Group,
  Box,
  Select,
  Badge
} from "@mantine/core"
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth
} from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { fmtPercent } from "../../utils/fmt"
import type { GetRangeStatsResponse } from "../../hooks/models"
import { LiveAndVideoStats } from "./LiveAndVideoStats"
import { SourcesStats } from "./SourcesStats"

type RangeType = "day" | "week" | "month"

// Range selector UI
const RangeSelector = ({
  rangeType,
  onChangeRangeType,
  day,
  setDay,
  weekDate,
  setWeekDate,
  monthValue,
  setMonthValue
}: {
  rangeType: RangeType
  onChangeRangeType: (r: RangeType) => void
  day: Date | null
  setDay: (d: Date | null) => void
  weekDate: Date | null
  setWeekDate: (d: Date | null) => void
  monthValue: string
  setMonthValue: (v: string) => void
}) => {
  // last 24 months for selection
  const months = useMemo(() => {
    const now = new Date()
    const arr = [] as { label: string; value: string }[]
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      arr.push({ label: format(d, "MM/yyyy"), value: d.toISOString() })
    }
    return arr
  }, [])

  // recent weeks (last 52 weeks)
  const weeks = useMemo(() => {
    const now = new Date()
    const arr = [] as { label: string; value: string }[]
    for (let i = 0; i < 52; i++) {
      const ref = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i * 7
      )
      const s = startOfWeek(ref, { weekStartsOn: 1 })
      const e = endOfWeek(ref, { weekStartsOn: 1 })
      // normalize
      s.setHours(0, 0, 0, 0)
      e.setHours(23, 59, 59, 999)
      arr.push({
        label: `${format(s, "dd/MM")} - ${format(e, "dd/MM/yyyy")}`,
        value: s.toISOString()
      })
    }
    return arr
  }, [])

  return (
    <Group align="flex-end" gap={12}>
      <Select
        value={rangeType}
        onChange={(v) => onChangeRangeType((v as RangeType) || "day")}
        data={[
          { label: "Ngày", value: "day" },
          { label: "Tuần", value: "week" },
          { label: "Tháng", value: "month" }
        ]}
        size="sm"
        w={140}
      />

      {rangeType === "day" && (
        <DatePickerInput
          label="Ngày"
          value={day}
          onChange={setDay}
          valueFormat="DD/MM/YYYY"
          size="sm"
          radius="md"
          maxDate={new Date()}
        />
      )}

      {rangeType === "week" && (
        <Select
          label="Tuần"
          value={weekDate ? weekDate.toISOString() : ""}
          onChange={(v) => setWeekDate(v ? new Date(v) : null)}
          data={weeks}
          size="sm"
          w={220}
        />
      )}

      {rangeType === "month" && (
        <Select
          label="Tháng"
          value={monthValue}
          onChange={(v) => setMonthValue(v || "")}
          data={months}
          size="sm"
          w={160}
        />
      )}
    </Group>
  )
}

export const RangeStats = () => {
  const { getRangeStats } = useIncomes()

  const [rangeType, setRangeType] = useState<RangeType>("day")
  const [day, setDay] = useState<Date | null>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d
  })
  const [weekDate, setWeekDate] = useState<Date | null>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d
  })
  const [monthValue, setMonthValue] = useState<string>(() =>
    new Date().toISOString()
  )

  const range = useMemo(() => {
    if (rangeType === "day") {
      const s = day ? new Date(day.getTime()) : null
      if (!s) return null
      s.setHours(0, 0, 0, 0)
      const e = new Date(s.getTime())
      e.setHours(1, 0, 0, 0)
      return {
        start: s.toISOString(),
        end: e.toISOString(),
        label: format(s, "dd/MM/yyyy")
      }
    }

    if (rangeType === "week") {
      const d = weekDate ? new Date(weekDate.getTime()) : null
      if (!d) return null
      const s = startOfWeek(d, { weekStartsOn: 1 })
      const e = endOfWeek(d, { weekStartsOn: 1 })
      s.setHours(0, 0, 0, 0)
      e.setHours(1, 0, 0, 0)
      return {
        start: s.toISOString(),
        end: e.toISOString(),
        label: `${format(s, "dd/MM")} - ${format(e, "dd/MM/yyyy")}`
      }
    }

    // month
    if (rangeType === "month") {
      const d = monthValue ? new Date(monthValue) : new Date()
      const s = startOfMonth(d)
      const e = endOfMonth(d)
      s.setHours(0, 0, 0, 0)
      e.setHours(1, 0, 0, 0)
      return {
        start: s.toISOString(),
        end: e.toISOString(),
        label: format(s, "MM/yyyy")
      }
    }

    return null
  }, [rangeType, day, weekDate, monthValue])

  const { data, isLoading, error } = useQuery({
    queryKey: ["getRangeStats", range?.start ?? null, range?.end ?? null],
    queryFn: async () => {
      if (!range) return null
      const res = await getRangeStats({
        startDate: range.start,
        endDate: range.end
      })
      return res.data as GetRangeStatsResponse
    },
    enabled: !!range,
    staleTime: 60 * 1000
  })

  const current = data?.current
  const changes = data?.changes

  return (
    <Box
      mt={40}
      mx="auto"
      px={{ base: 8, md: 0 }}
      w="100%"
      style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: 20,
        boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
        border: "1px solid #ececec"
      }}
    >
      {/* Header Section - match Incomes.tsx layout */}
      <Flex
        align="center"
        justify="space-between"
        pt={32}
        pb={16}
        px={{ base: 8, md: 28 }}
        direction={{ base: "column", sm: "row" }}
        gap={12}
      >
        <Box>
          <Text fw={700} fz="xl" mb={2}>
            Thống kê theo khoảng
          </Text>
          <Text c="dimmed" fz="sm">
            Xem thống kê doanh thu theo khoảng thời gian (ngày/tuần/tháng)
          </Text>
        </Box>

        <RangeSelector
          rangeType={rangeType}
          onChangeRangeType={setRangeType}
          day={day}
          setDay={setDay}
          weekDate={weekDate}
          setWeekDate={setWeekDate}
          monthValue={monthValue}
          setMonthValue={setMonthValue}
        />
      </Flex>

      <Divider my={0} />

      {/* Content - use same inner paddings as Incomes */}
      <Box pt={16} pb={8} px={{ base: 8, md: 28 }}>
        {isLoading ? (
          <Flex justify="center" align="center" h={160}>
            <Loader />
          </Flex>
        ) : error ? (
          <Text c="red" fz="sm">
            Không lấy được dữ liệu
          </Text>
        ) : current ? (
          <Stack gap={12}>
            <Paper withBorder p="lg" radius="lg">
              <Group justify="space-between" align="center">
                <Text fw={700}>Tổng doanh thu</Text>
                <Group align="center" gap={8}>
                  <Text fz="xl" fw={900} c="indigo">
                    {current.totalIncome.toLocaleString()} VNĐ
                  </Text>
                  {typeof changes?.totalIncomePct === "number" && (
                    <Badge
                      color={changes.totalIncomePct >= 0 ? "green" : "red"}
                      variant="light"
                    >
                      {changes.totalIncomePct >= 0 ? "+" : "-"}
                      {fmtPercent(Math.abs(changes.totalIncomePct))}
                    </Badge>
                  )}
                </Group>
              </Group>
              <Divider my={12} />

              <Stack gap={10}>
                <Group gap={12} align="stretch">
                  <LiveAndVideoStats
                    title="Livestream"
                    income={current.liveIncome}
                    adsCost={current.ads.liveAdsCost}
                    adsCostChangePct={changes?.ads?.liveAdsCostPct}
                    adsSharePctDiff={changes?.ads?.liveAdsToLiveIncomePctDiff}
                    flex={1}
                  />
                  <LiveAndVideoStats
                    title="Video"
                    income={current.videoIncome || 0}
                    adsCost={current.ads.videoAdsCost}
                    adsCostChangePct={changes?.ads?.videoAdsCostPct}
                    adsSharePctDiff={changes?.ads?.videoAdsToVideoIncomePctDiff}
                    ownVideoIncome={current.ownVideoIncome}
                    otherVideoIncome={current.otherVideoIncome}
                    flex={2}
                  />

                  {/* New: Other income card (thu nhập ngoài livestream & video) */}
                  <Paper
                    withBorder
                    p="md"
                    radius="md"
                    style={{ flex: 1, minWidth: 200 }}
                  >
                    <Text fw={600}>Khác</Text>
                    <Group align="center" gap={8} mt={8} wrap="nowrap">
                      <Text fz="lg" fw={900} c="dark">
                        {(current.otherIncome ?? 0).toLocaleString()} VNĐ
                      </Text>

                      {typeof (changes as any)?.otherIncomePct === "number" && (
                        <Badge
                          color={
                            (changes as any).otherIncomePct >= 0
                              ? "green"
                              : "red"
                          }
                          variant="light"
                        >
                          {(changes as any).otherIncomePct >= 0 ? "+" : "-"}
                          {fmtPercent(
                            Math.abs((changes as any).otherIncomePct)
                          )}
                        </Badge>
                      )}
                    </Group>

                    <Text c="dimmed" fz="xs" mt={6}>
                      Thu nhập ngoài livestream & video
                    </Text>
                  </Paper>
                </Group>
              </Stack>
            </Paper>

            {current.sources && (
              <SourcesStats
                sources={current.sources}
                changes={changes?.sources}
              />
            )}

            {current.shippingProviders &&
              current.shippingProviders.length > 0 && (
                <Paper withBorder p="lg" radius="lg">
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
                        const items = current.shippingProviders
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

            {/* Discount Statistics */}
            {current.discounts && (
              <Paper withBorder p="lg" radius="lg">
                <Text fw={600} mb={16}>
                  Thống kê giảm giá
                </Text>
                {/* All 5 boxes in one row */}
                <Group gap={12} align="stretch" grow>
                  <Paper
                    withBorder
                    p="md"
                    radius="md"
                    h={90}
                    w={200}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <Text fw={500} fz="sm" c="dimmed" mb={4}>
                      Tổng chiết khấu
                    </Text>
                    <Group align="center" gap={8} wrap="nowrap">
                      <Text fz="lg" fw={700} c="dark">
                        {current.discounts.totalDiscount.toLocaleString()} VNĐ
                      </Text>
                      {typeof changes?.discounts?.totalDiscount ===
                        "number" && (
                        <Badge
                          color={
                            changes.discounts.totalDiscount >= 0
                              ? "red"
                              : "green"
                          }
                          variant="light"
                          size="sm"
                        >
                          {changes.discounts.totalDiscount >= 0 ? "+" : "-"}
                          {Math.abs(
                            changes.discounts.totalDiscount
                          ).toLocaleString()}
                        </Badge>
                      )}
                    </Group>
                  </Paper>

                  <Paper
                    withBorder
                    p="md"
                    radius="md"
                    h={90}
                    w={200}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <Text fw={500} fz="sm" c="dimmed" mb={4}>
                      Chiết khấu platform
                    </Text>
                    <Group align="center" gap={8} wrap="nowrap">
                      <Text fz="lg" fw={700} c="orange">
                        {current.discounts.totalPlatformDiscount.toLocaleString()}{" "}
                        VNĐ
                      </Text>
                      {typeof changes?.discounts?.totalPlatformDiscount ===
                        "number" && (
                        <Badge
                          color={
                            changes.discounts.totalPlatformDiscount >= 0
                              ? "red"
                              : "green"
                          }
                          variant="light"
                          size="sm"
                        >
                          {changes.discounts.totalPlatformDiscount >= 0
                            ? "+"
                            : "-"}
                          {Math.abs(
                            changes.discounts.totalPlatformDiscount
                          ).toLocaleString()}
                        </Badge>
                      )}
                    </Group>
                  </Paper>

                  <Paper
                    withBorder
                    p="md"
                    radius="md"
                    h={90}
                    w={200}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <Text fw={500} fz="sm" c="dimmed" mb={4}>
                      Chiết khấu seller
                    </Text>
                    <Group align="center" gap={8} wrap="nowrap">
                      <Text fz="lg" fw={700} c="blue">
                        {current.discounts.totalSellerDiscount.toLocaleString()}{" "}
                        VNĐ
                      </Text>
                      {typeof changes?.discounts?.totalSellerDiscount ===
                        "number" && (
                        <Badge
                          color={
                            changes.discounts.totalSellerDiscount >= 0
                              ? "red"
                              : "green"
                          }
                          variant="light"
                          size="sm"
                        >
                          {changes.discounts.totalSellerDiscount >= 0
                            ? "+"
                            : "-"}
                          {Math.abs(
                            changes.discounts.totalSellerDiscount
                          ).toLocaleString()}
                        </Badge>
                      )}
                    </Group>
                  </Paper>

                  <Paper
                    withBorder
                    p="md"
                    radius="md"
                    h={90}
                    w={200}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <Text fw={500} fz="sm" c="dimmed" mb={4}>
                      Trung bình mỗi đơn
                    </Text>
                    <Group align="center" gap={8} wrap="nowrap">
                      <Text fz="lg" fw={700} c="dark">
                        {current.discounts.avgDiscountPerOrder.toLocaleString()}{" "}
                        VNĐ
                      </Text>
                      {typeof changes?.discounts?.avgDiscountPerOrder ===
                        "number" && (
                        <Badge
                          color={
                            changes.discounts.avgDiscountPerOrder >= 0
                              ? "red"
                              : "green"
                          }
                          variant="light"
                          size="sm"
                        >
                          {changes.discounts.avgDiscountPerOrder >= 0
                            ? "+"
                            : "-"}
                          {Math.abs(
                            changes.discounts.avgDiscountPerOrder
                          ).toLocaleString()}
                        </Badge>
                      )}
                    </Group>
                  </Paper>

                  <Paper
                    withBorder
                    p="md"
                    radius="md"
                    h={90}
                    w={200}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <Text fw={500} fz="sm" c="dimmed" mb={4}>
                      Tỷ lệ chiết khấu
                    </Text>
                    <Group align="center" gap={8} wrap="nowrap">
                      <Text fz="lg" fw={700} c="grape">
                        {current.discounts.discountPercentage.toFixed(2)}%
                      </Text>
                      {typeof changes?.discounts?.discountPercentage ===
                        "number" && (
                        <Badge
                          color={
                            changes.discounts.discountPercentage >= 0
                              ? "red"
                              : "green"
                          }
                          variant="light"
                          size="sm"
                        >
                          {changes.discounts.discountPercentage >= 0 ? "+" : ""}
                          {changes.discounts.discountPercentage.toFixed(2)}%
                        </Badge>
                      )}
                    </Group>
                  </Paper>
                </Group>
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
                {current.boxes.length ? (
                  current.boxes.map((b) => (
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
            Chọn khoảng để xem thống kê
          </Text>
        )}
      </Box>
    </Box>
  )
}
