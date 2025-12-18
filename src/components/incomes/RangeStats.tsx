import { useState, useMemo } from "react"
import { useIncomes } from "../../hooks/useIncomes"
import { useLivestream } from "../../hooks/useLivestream"
import { DatePickerInput } from "@mantine/dates"
import {
  Flex,
  Loader,
  Stack,
  Text,
  Paper,
  Divider,
  Group,
  Select,
  Badge,
  SegmentedControl
} from "@mantine/core"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { fmtPercent } from "../../utils/fmt"
import type { GetRangeStatsResponse } from "../../hooks/models"
import { LiveAndVideoStats } from "./LiveAndVideoStats"
import { SourcesStats } from "./SourcesStats"
import { ProductsQuantityStats } from "./ProductsQuantityStats"
import { ShippingProvidersStats } from "./ShippingProvidersStats"
import { BoxesStats } from "./BoxesStats"
import { CDashboardLayout } from "../common/CDashboardLayout"
import { IconCalendarStats, IconFilter } from "@tabler/icons-react"
import { useLivestreamChannel } from "../../context/LivestreamChannelContext"

type RangeType = "day" | "range"
type DiscountMode = "beforeDiscount" | "afterDiscount"

type RangeSelectorProps = {
  startDate: Date | null
  endDate: Date | null
  onChangeStartDate: (d: Date | null) => void
  onChangeEndDate: (d: Date | null) => void
  channelId: string | null
  setChannelId: (id: string | null) => void
  channelsData: any[]
}

const RangeSelector = ({
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate
}: RangeSelectorProps) => {
  const [rangeType, setRangeType] = useState<RangeType>("day")

  // value cho DatePickerInput type="range"
  const rangeValue: [Date | null, Date | null] | undefined =
    startDate || endDate ? [startDate, endDate] : undefined

  const handleRangeTypeChange = (newType: RangeType) => {
    setRangeType(newType)
    // Khi chuyển sang mode "range", reset end date để user chọn lại
    if (newType === "range" && startDate && endDate) {
      const sameDay = startDate.toDateString() === endDate.toDateString()
      if (sameDay) {
        onChangeEndDate(null)
      }
    }
  }

  return (
    <Group align="flex-end" gap={12} wrap="nowrap">
      <Select
        value={rangeType}
        onChange={(v) => handleRangeTypeChange((v as RangeType) || "day")}
        data={[
          { label: "Ngày", value: "day" },
          { label: "Khoảng ngày", value: "range" }
        ]}
        size="sm"
        w={140}
        label="Loại"
      />

      {rangeType === "day" && (
        <DatePickerInput
          label="Ngày"
          type="default"
          value={startDate}
          onChange={(date) => {
            onChangeStartDate(
              date ? new Date(new Date(date).setHours(1, 0, 0, 0)) : null
            )
            onChangeEndDate(
              date ? new Date(new Date(date).setHours(23, 59, 59, 999)) : null
            )
          }}
          valueFormat="DD/MM/YYYY"
          size="sm"
          radius="md"
          maxDate={new Date()}
          w={160}
          placeholder="Chọn ngày"
          clearable
        />
      )}

      {rangeType === "range" && (
        <DatePickerInput
          label="Khoảng ngày"
          type="range"
          value={rangeValue}
          onChange={(value) => {
            const [start, end] = value || [null, null]
            onChangeStartDate(
              start ? new Date(new Date(start).setHours(0, 0, 0, 0)) : null
            )
            // Chỉ set end khi user thực sự chọn ngày thứ 2, không force = start
            onChangeEndDate(
              end ? new Date(new Date(end).setHours(23, 59, 59, 999)) : null
            )
          }}
          valueFormat="DD/MM/YYYY"
          size="sm"
          radius="md"
          maxDate={new Date()}
          w={260}
          placeholder="Chọn khoảng ngày"
          clearable
        />
      )}
    </Group>
  )
}

export const RangeStats = () => {
  const { getRangeStats } = useIncomes()
  const { searchLivestreamChannels } = useLivestream()
  const { selectedChannelId } = useLivestreamChannel()

  const [mode, setMode] = useState<DiscountMode>("afterDiscount")
  const [channelId, setChannelId] = useState<string | null>(null)

  // mặc định: hôm qua
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [endDate, setEndDate] = useState<Date | null>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    d.setHours(23, 59, 59, 999)
    return d
  })

  // Fetch livestream channels cho filter
  const { data: channelsData = [] } = useQuery({
    queryKey: ["searchLivestreamChannels", "all"],
    queryFn: () =>
      searchLivestreamChannels({
        page: 1,
        limit: 100
      }),
    select: (data) => data.data.data || [],
    staleTime: 5 * 60 * 1000
  })

  const range = useMemo(() => {
    if (!startDate || !endDate) return null

    const s = new Date(startDate.getTime())
    const e = new Date(endDate.getTime())

    // chuẩn hóa: start 00:00, end 23:59
    s.setHours(0, 0, 0, 0)
    e.setHours(1, 59, 59, 999)

    const sameDay = s.toDateString() === e.toDateString()
    const label = sameDay
      ? format(s, "dd/MM/yyyy")
      : `${format(s, "dd/MM/yyyy")} - ${format(e, "dd/MM/yyyy")}`

    return {
      start: s.toISOString(),
      end: e.toISOString(),
      label
    }
  }, [startDate, endDate])

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "getRangeStats",
      range?.start ?? null,
      range?.end ?? null,
      selectedChannelId
    ],
    queryFn: async () => {
      if (!range || !selectedChannelId) return null
      const res = await getRangeStats({
        startDate: range.start,
        endDate: range.end,
        channelId: selectedChannelId
      })
      return res.data as GetRangeStatsResponse
    },
    enabled: !!range,
    staleTime: 60 * 1000
  })

  const current = data?.current
  const changes = data?.changes

  return (
    <CDashboardLayout
      icon={<IconCalendarStats size={28} color="#1971c2" />}
      title="Thống kê theo khoảng"
      subheader="Xem thống kê doanh thu theo khoảng thời gian (ngày/khoảng ngày)"
      rightHeader={
        <>
          <RangeSelector
            startDate={startDate}
            endDate={endDate}
            onChangeStartDate={setStartDate}
            onChangeEndDate={setEndDate}
            channelId={channelId}
            setChannelId={setChannelId}
            channelsData={channelsData}
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
          {/* Filter Summary */}
          {(selectedChannelId || range) && (
            <Paper withBorder p="md" radius="md" mb="lg" bg="blue.0">
              <Group gap="md" align="center">
                <IconFilter size={16} color="var(--mantine-color-blue-6)" />
                <Text size="sm" fw={500} c="blue.7">
                  Bộ lọc đang áp dụng:
                </Text>
                {range && (
                  <Badge variant="light" color="blue" size="sm">
                    {range.label}
                  </Badge>
                )}
                {selectedChannelId && (
                  <Badge variant="light" color="green" size="sm">
                    {channelsData.find((c) => c._id === selectedChannelId)
                      ?.name || "Kênh đã chọn"}
                  </Badge>
                )}
              </Group>
            </Paper>
          )}

          {isLoading ? (
            <Paper withBorder p="xl" radius="lg">
              <Flex
                justify="center"
                align="center"
                h={160}
                direction="column"
                gap="md"
              >
                <Loader size="lg" />
                <Text c="dimmed" size="sm">
                  Đang tải dữ liệu thống kê...
                </Text>
              </Flex>
            </Paper>
          ) : error ? (
            <Paper withBorder p="xl" radius="lg" bg="red.0">
              <Flex
                justify="center"
                align="center"
                h={160}
                direction="column"
                gap="md"
              >
                <Text c="red" fw={500}>
                  Không lấy được dữ liệu
                </Text>
                <Text c="red.7" size="sm">
                  Vui lòng thử lại sau hoặc liên hệ quản trị viên
                </Text>
              </Flex>
            </Paper>
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
                      flex={2}
                    />
                  </Group>
                </Stack>
              </Paper>

              {current[mode].sources && current.productsQuantity && (
                <Group gap={12} align="stretch" grow>
                  <SourcesStats
                    sources={current[mode].sources}
                    changes={changes?.[mode]?.sources}
                  />
                  {current.productsQuantity &&
                    Object.keys(current.productsQuantity).length > 0 && (
                      <ProductsQuantityStats
                        productsQuantity={current.productsQuantity}
                      />
                    )}
                </Group>
              )}

              {(((current as any).boxes && (current as any).boxes.length > 0) ||
                current.shippingProviders) && (
                <Group gap={12} align="stretch" grow>
                  {current.shippingProviders &&
                    current.shippingProviders.length > 0 && (
                      <ShippingProvidersStats
                        shippingProviders={current.shippingProviders}
                      />
                    )}
                  <BoxesStats boxes={(current as any).boxes} />
                </Group>
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

              <Text c="dimmed" fz="xs">
                Cập nhật: {format(new Date(), "dd/MM/yyyy HH:mm:ss")}
              </Text>
            </Stack>
          ) : (
            <Paper withBorder p="xl" radius="lg" bg="gray.0">
              <Flex
                justify="center"
                align="center"
                h={160}
                direction="column"
                gap="md"
              >
                <IconCalendarStats
                  size={48}
                  color="var(--mantine-color-gray-5)"
                />
                <Text c="dimmed" fw={500} size="lg">
                  Chọn khoảng thời gian để xem thống kê
                </Text>
                <Text c="dimmed" size="sm" ta="center">
                  Sử dụng các bộ lọc ở trên để chọn khoảng thời gian và kênh bán
                  hàng
                </Text>
              </Flex>
            </Paper>
          )}
        </>
      }
    />
  )
}
