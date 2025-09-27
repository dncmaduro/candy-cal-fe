import { useState, useMemo } from "react"
import { useIncomes } from "../../hooks/useIncomes"
import { useMonthGoals } from "../../hooks/useMonthGoals"
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
  Select,
  Badge,
  SegmentedControl
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
import { CDashboardLayout } from "../common/CDashboardLayout"
import { IconCalendarStats } from "@tabler/icons-react"

type RangeType = "day" | "week" | "month"
type DiscountMode = "beforeDiscount" | "afterDiscount"

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
  const { getGoal } = useMonthGoals()

  const [rangeType, setRangeType] = useState<RangeType>("day")
  const [mode, setMode] = useState<DiscountMode>("afterDiscount")
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

  // derived objects for the selected discount mode (before/after)
  // (we access current via (current as any)[mode] inline below)

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

  // Fetch month goal for KPI % ads when in month mode
  const { data: monthGoalData } = useQuery({
    queryKey: ["getGoal", range?.start, rangeType],
    queryFn: async () => {
      if (rangeType !== "month" || !range?.start) return null
      const date = new Date(range.start)
      const res = await getGoal({
        month: date.getMonth(),
        year: date.getFullYear()
      })
      return res.data
    },
    enabled: rangeType === "month" && !!range?.start,
    staleTime: 60 * 1000
  })

  const current = data?.current
  const changes = data?.changes

  return (
    <CDashboardLayout
      icon={<IconCalendarStats size={28} color="#1971c2" />}
      title="Thống kê theo khoảng"
      subheader="Xem thống kê doanh thu theo khoảng thời gian (ngày/tuần/tháng)"
      rightHeader={
        <>
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
          <SegmentedControl
            value={mode}
            onChange={(v) => setMode(v as DiscountMode)}
            data={[
              { label: "Sau CK", value: "afterDiscount" },
              { label: "Trước CK", value: "beforeDiscount" }
            ]}
            size="sm"
          />
        </>
      }
      content={
        <>
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
                      {current[mode].totalIncome.toLocaleString()} VNĐ
                    </Text>
                    {typeof changes?.[mode]?.totalIncomePct === "number" && (
                      <Badge
                        color={
                          changes[mode].totalIncomePct >= 0 ? "green" : "red"
                        }
                        variant="light"
                      >
                        {changes[mode].totalIncomePct >= 0 ? "+" : "-"}
                        {fmtPercent(Math.abs(changes[mode].totalIncomePct))}
                      </Badge>
                    )}
                  </Group>
                </Group>
                <Divider my={12} />

                <Stack gap={10}>
                  <Group gap={12} align="stretch">
                    <LiveAndVideoStats
                      title="Livestream"
                      income={current[mode].liveIncome}
                      adsCost={current.ads.liveAdsCost}
                      adsCostChangePct={changes?.ads?.liveAdsCostPct}
                      adsSharePctDiff={changes?.ads?.liveAdsToLiveIncomePctDiff}
                      kpiAdsPercentage={monthGoalData?.liveAdsPercentageGoal}
                      flex={1}
                    />
                    <LiveAndVideoStats
                      title="Doanh thu Sàn"
                      income={
                        (current[mode].videoIncome || 0) +
                        (current[mode].otherIncome || 0)
                      }
                      adsCost={current.ads.shopAdsCost}
                      adsCostChangePct={changes?.ads?.shopAdsCostPct}
                      adsSharePctDiff={changes?.ads?.shopAdsToShopIncomePctDiff}
                      ownVideoIncome={current[mode].ownVideoIncome}
                      otherVideoIncome={current[mode].otherVideoIncome}
                      otherIncome={current[mode].otherIncome}
                      kpiAdsPercentage={monthGoalData?.shopAdsPercentageGoal}
                      flex={2}
                    />
                  </Group>
                </Stack>
              </Paper>

              {current[mode].sources && (
                <SourcesStats
                  sources={current[mode].sources}
                  changes={changes?.[mode]?.sources}
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
                            items.reduce((s, it) => s + (it?.orders ?? 0), 0) ||
                            1
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
                        {typeof (changes as any)?.discounts
                          ?.totalDiscountPct === "number" && (
                          <Badge
                            color={
                              (changes as any).discounts.totalDiscountPct >= 0
                                ? "red"
                                : "green"
                            }
                            variant="light"
                            size="sm"
                          >
                            {(changes as any).discounts.totalDiscountPct >= 0
                              ? "+"
                              : "-"}
                            {fmtPercent(
                              Math.abs(
                                (changes as any).discounts.totalDiscountPct
                              )
                            )}
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
                        {typeof (changes as any)?.discounts
                          ?.totalPlatformDiscountPct === "number" && (
                          <Badge
                            color={
                              (changes as any).discounts
                                .totalPlatformDiscountPct >= 0
                                ? "red"
                                : "green"
                            }
                            variant="light"
                            size="sm"
                          >
                            {(changes as any).discounts
                              .totalPlatformDiscountPct >= 0
                              ? "+"
                              : "-"}
                            {fmtPercent(
                              Math.abs(
                                (changes as any).discounts
                                  .totalPlatformDiscountPct
                              )
                            )}
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
                        {typeof (changes as any)?.discounts
                          ?.totalSellerDiscountPct === "number" && (
                          <Badge
                            color={
                              (changes as any).discounts
                                .totalSellerDiscountPct >= 0
                                ? "red"
                                : "green"
                            }
                            variant="light"
                            size="sm"
                          >
                            {(changes as any).discounts
                              .totalSellerDiscountPct >= 0
                              ? "+"
                              : "-"}
                            {fmtPercent(
                              Math.abs(
                                (changes as any).discounts
                                  .totalSellerDiscountPct
                              )
                            )}
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
                        {typeof (changes as any)?.discounts
                          ?.avgDiscountPerOrderPct === "number" && (
                          <Badge
                            color={
                              (changes as any).discounts
                                .avgDiscountPerOrderPct >= 0
                                ? "red"
                                : "green"
                            }
                            variant="light"
                            size="sm"
                          >
                            {(changes as any).discounts
                              .avgDiscountPerOrderPct >= 0
                              ? "+"
                              : "-"}
                            {fmtPercent(
                              Math.abs(
                                (changes as any).discounts
                                  .avgDiscountPerOrderPct
                              )
                            )}
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
                        {typeof (changes as any)?.discounts
                          ?.discountPercentageDiff === "number" && (
                          <Badge
                            color={
                              (changes as any).discounts
                                .discountPercentageDiff >= 0
                                ? "red"
                                : "green"
                            }
                            variant="light"
                            size="sm"
                          >
                            {(changes as any).discounts
                              .discountPercentageDiff >= 0
                              ? "+"
                              : "-"}
                            {Math.abs(
                              (changes as any).discounts.discountPercentageDiff
                            ).toFixed(2)}
                            %
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
                    <Table.Th style={{ width: 200 }}>
                      Quy cách đóng hộp
                    </Table.Th>
                    <Table.Th style={{ width: 100 }}>Số lượng</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {(current as any).boxes.length ? (
                    (current as any).boxes.map((b: any) => (
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
        </>
      }
    />
  )
}
