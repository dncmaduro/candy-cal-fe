import {
  Box,
  Group,
  Stack,
  NumberInput,
  Button,
  Loader,
  Text,
  Paper,
  Divider,
  Badge,
  Grid,
  Alert,
  Accordion,
  MantineColor,
  Select
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useSalesDailyReports } from "../../../hooks/useSalesDailyReports"
import { useMutation, useQuery } from "@tanstack/react-query"
import { CToast } from "../../common/CToast"
import { modals } from "@mantine/modals"
import { useForm, Controller } from "react-hook-form"
import { CreateSalesDailyReportRequest } from "../../../hooks/models"
import { useSalesChannels } from "../../../hooks/useSalesChannels"
import { useEffect, useMemo } from "react"
import { IconAlertCircle, IconDeviceFloppy } from "@tabler/icons-react"
import { DailyReportByText } from "./DailyReportByText"
import { useUsers } from "../../../hooks/useUsers"

// ────────────────────────────────────────────────────────────
// Reusable UI helpers (visual only, không đổi logic)
// ────────────────────────────────────────────────────────────

type SummaryStatProps = {
  label: string
  value: string | number
  hint?: string
}

const SummaryStat = ({ label, value, hint }: SummaryStatProps) => (
  <Stack gap={2}>
    <Text size="xs" c="dimmed">
      {label}
    </Text>
    <Text fw={600}>{value}</Text>
    {hint && (
      <Text size="xs" c="dimmed">
        {hint}
      </Text>
    )}
  </Stack>
)

type SectionCardProps = {
  title: string
  description?: string
  badgeLabel?: string
  badgeColor?: string
  id?: string
  bg?: MantineColor
  children: React.ReactNode
}

const SectionCard = ({
  title,
  description,
  badgeLabel,
  badgeColor = "gray",
  id,
  bg = "white",
  children
}: SectionCardProps) => (
  <Paper withBorder radius="md" p="md" aria-labelledby={id} bg={bg} shadow="xs">
    <Group justify="space-between" align="flex-start" mb="sm">
      <Box>
        <Text id={id} fw={600} size="md">
          {title}
        </Text>
        {description && (
          <Text size="sm" c="dimmed" mt={4}>
            {description}
          </Text>
        )}
      </Box>
      {badgeLabel && (
        <Badge size="sm" variant="light" color={badgeColor}>
          {badgeLabel}
        </Badge>
      )}
    </Group>
    {children}
  </Paper>
)

type MetricCardProps = {
  title: string
  badgeLabel: string
  mainLabel: string
  mainValue: string | number
  mainSuffix?: string
  mainColor?: string
  detailLabel: string
  detailValueLeft: string
  detailValueRight: string
}

const MetricCard = ({
  title,
  badgeLabel,
  mainLabel,
  mainValue,
  mainSuffix = "%",
  mainColor = "blue",
  detailLabel,
  detailValueLeft,
  detailValueRight
}: MetricCardProps) => (
  <Paper
    withBorder
    radius="md"
    p="md"
    bg="gray.0"
    shadow="xs"
    style={{ height: "100%" }}
  >
    <Group justify="space-between" mb="sm">
      <Text fw={600}>{title}</Text>
      <Badge size="sm" variant="light" color="gray">
        {badgeLabel}
      </Badge>
    </Group>
    <Stack gap="sm">
      <Box>
        <Text size="xs" fw={500} c="dimmed" tt="uppercase" mb={4}>
          {mainLabel}
        </Text>
        <Group gap={4} align="baseline">
          <Text fw={700} size="xl" c={mainColor}>
            {mainValue}
          </Text>
          <Text size="sm" c="dimmed">
            {mainSuffix}
          </Text>
        </Group>
      </Box>
      <Box>
        <Text size="xs" fw={500} c="dimmed" mb={2}>
          {detailLabel}
        </Text>
        <Text size="xs" c="dimmed">
          <Text component="span" fw={600} mr={4}>
            {detailValueLeft}
          </Text>
          {" / "}
          <Text component="span" fw={600} ml={4}>
            {detailValueRight}
          </Text>
        </Text>
      </Box>
    </Stack>
  </Paper>
)

// ────────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────────

export const CreateSalesDailyReportModal = () => {
  const { createSalesDailyReport, getRevenueForDate, getSalesMonthKpi } =
    useSalesDailyReports()
  const { getMyChannel, searchSalesChannels } = useSalesChannels()
  const { getMe } = useUsers()

  const { control, handleSubmit, watch, setValue } =
    useForm<CreateSalesDailyReportRequest>({
      defaultValues: {
        date: new Date(),
        channel: "",
        adsCost: 0,
        dateKpi: 0,
        revenue: 0,
        newFunnelRevenue: {
          ads: 0,
          other: 0
        },
        returningFunnelRevenue: 0,
        newOrder: 0,
        returningOrder: 0,
        accumulatedRevenue: 0,
        accumulatedAdsCost: 0,
        accumulatedNewFunnelRevenue: {
          ads: 0,
          other: 0
        }
      }
    })

  const selectedDate = watch("date")
  const channelId = watch("channel")
  const revenue = watch("revenue")
  const newFunnelRevenueAds = watch("newFunnelRevenue.ads")
  const newFunnelRevenueOther = watch("newFunnelRevenue.other")
  const adsCost = watch("adsCost")
  const accumulatedRevenue = watch("accumulatedRevenue")
  const accumulatedAdsCost = watch("accumulatedAdsCost")
  const accumulatedNewFunnelRevenueAds = watch(
    "accumulatedNewFunnelRevenue.ads"
  )
  const accumulatedNewFunnelRevenueOther = watch(
    "accumulatedNewFunnelRevenue.other"
  )

  // Get my channel
  const { data: channelData, isLoading: channelLoading } = useQuery({
    queryKey: ["getMyChannel"],
    queryFn: getMyChannel,
    select: (data) => data.data
  })

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: getMe
  })

  const { data: allChannelsData } = useQuery({
    queryKey: ["salesChannels", "all"],
    queryFn: () => searchSalesChannels({ page: 1, limit: 999 }),
    enabled: meData?.data.roles.includes("admin")
  })

  const isAdmin = meData?.data.roles.includes("admin")
  const hasChannel = !!channelData?.channel

  // Get revenue for selected date
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["getRevenueForDate", selectedDate, channelId],
    queryFn: () =>
      getRevenueForDate({
        date:
          selectedDate instanceof Date
            ? new Date(selectedDate.setHours(0, 0, 0, 0))
            : new Date(new Date().setHours(0, 0, 0, 0)),
        channelId: channelId
      }),
    select: (data) => data.data,
    enabled: !!selectedDate && !!channelId
  })

  // Get month KPI
  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ["getSalesMonthKpi", selectedDate, channelId],
    queryFn: () =>
      getSalesMonthKpi({
        date: selectedDate instanceof Date ? selectedDate : new Date(),
        channelId: channelId
      }),
    select: (data) => data.data,
    enabled: !!selectedDate && !!channelId
  })

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createSalesDailyReport,
    onSuccess: (response) => {
      CToast.success({ title: "Tạo báo cáo hàng ngày thành công" })
      modals.closeAll()
      modals.open({
        id: "create-sales-daily-report",
        title: <b>Tin nhắn báo cáo</b>,
        children: <DailyReportByText report={response.data} />,
        size: "lg"
      })
    },
    onError: () => {
      CToast.error({ title: "Tạo báo cáo hàng ngày thất bại" })
    }
  })

  // Auto fill channel when data is loaded (only if not admin or channel is empty)
  useEffect(() => {
    if (channelData?.channel?._id && !channelId) {
      setValue("channel", channelData.channel._id)
    }
  }, [channelData, setValue, channelId])

  // Auto fill revenue data when loaded
  useEffect(() => {
    if (revenueData) {
      setValue("revenue", revenueData.revenue || 0)
      setValue("newFunnelRevenue.ads", revenueData.newFunnelRevenue?.ads || 0)
      setValue(
        "newFunnelRevenue.other",
        revenueData.newFunnelRevenue?.other || 0
      )
      setValue(
        "returningFunnelRevenue",
        revenueData.returningFunnelRevenue || 0
      )
      setValue("newOrder", revenueData.newOrder || 0)
      setValue("returningOrder", revenueData.returningOrder || 0)
      setValue("accumulatedRevenue", revenueData.accumulatedRevenue || 0)
      setValue("accumulatedAdsCost", revenueData.accumulatedAdsCost || 0)
      setValue(
        "accumulatedNewFunnelRevenue.ads",
        revenueData.accumulatedNewFunnelRevenue?.ads || 0
      )
      setValue(
        "accumulatedNewFunnelRevenue.other",
        revenueData.accumulatedNewFunnelRevenue?.other || 0
      )
    }
  }, [revenueData, setValue])

  const isLoading = channelLoading || revenueLoading || kpiLoading

  // Calculate KPI percentage
  const kpiPercentage = useMemo(() => {
    if (!kpiData?.kpi || kpiData.kpi === 0) return 0
    return ((accumulatedRevenue / kpiData.kpi) * 100).toFixed(2)
  }, [accumulatedRevenue, kpiData])

  // Calculate CAC (Customer Acquisition Cost) in percentage
  const cac = useMemo(() => {
    if (!accumulatedNewFunnelRevenueAds || accumulatedNewFunnelRevenueAds === 0)
      return 0
    return (
      (accumulatedAdsCost / accumulatedNewFunnelRevenueAds) *
      100
    ).toFixed(2)
  }, [accumulatedAdsCost, accumulatedNewFunnelRevenueAds])

  // Calculate projected totals (accumulated + today)
  const projectedRevenue = useMemo(() => {
    return accumulatedRevenue + revenue
  }, [accumulatedRevenue, revenue])

  const projectedAdsCost = useMemo(() => {
    return accumulatedAdsCost + adsCost
  }, [accumulatedAdsCost, adsCost])

  const projectedNewFunnelRevenueAds = useMemo(() => {
    return accumulatedNewFunnelRevenueAds + newFunnelRevenueAds
  }, [accumulatedNewFunnelRevenueAds, newFunnelRevenueAds])

  const projectedNewFunnelRevenueOther = useMemo(() => {
    return accumulatedNewFunnelRevenueOther + newFunnelRevenueOther
  }, [accumulatedNewFunnelRevenueOther, newFunnelRevenueOther])

  const projectedKpiPercentage = useMemo(() => {
    if (!kpiData?.kpi || kpiData.kpi === 0) return 0
    return ((projectedRevenue / kpiData.kpi) * 100).toFixed(2)
  }, [projectedRevenue, kpiData])

  const projectedCAC = useMemo(() => {
    if (!projectedNewFunnelRevenueAds || projectedNewFunnelRevenueAds === 0)
      return 0
    return ((projectedAdsCost / projectedNewFunnelRevenueAds) * 100).toFixed(2)
  }, [projectedAdsCost, projectedNewFunnelRevenueAds])

  const onSubmit = (values: CreateSalesDailyReportRequest) => {
    create(values)
  }

  return (
    <Box component="section">
      {!hasChannel && (
        <Alert color="yellow" title="Lưu ý" icon={<IconAlertCircle />} mb="md">
          Tài khoản của bạn không phụ trách kênh sỉ lẻ nào, vui lòng kiểm tra
          lại
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="lg">
          {/* Header: Date + Summary */}
          <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
            <Group justify="space-between" align="flex-start">
              <Box>
                <Text fw={600} size="lg">
                  Báo cáo doanh thu ngày
                </Text>
                <Text size="sm" c="dimmed" mt={4}>
                  Chọn ngày và nhập KPI, chi phí. Các số liệu doanh thu sẽ được
                  tự động lấy từ hệ thống.
                </Text>
                <Group gap="xl" mt="md" wrap="wrap">
                  <SummaryStat
                    label="Kênh phụ trách"
                    value={channelData?.channel?.channelName || "Chưa được gán"}
                  />
                  {kpiData?.kpi && (
                    <SummaryStat
                      label="KPI tháng"
                      value={`${kpiData.kpi.toLocaleString()}đ`}
                      hint="Dùng để tính % KPI đạt được"
                    />
                  )}
                  <SummaryStat
                    label="Trạng thái dữ liệu"
                    value={isLoading ? "Đang tải..." : "Đã cập nhật"}
                  />
                </Group>
              </Box>

              <Stack gap="sm" miw={220}>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <DatePickerInput
                      {...field}
                      label="Ngày báo cáo"
                      placeholder="Chọn ngày"
                      valueFormat="DD/MM/YYYY"
                      required
                      size="sm"
                      withAsterisk
                    />
                  )}
                />
                {isAdmin && (
                  <Controller
                    name="channel"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Kênh"
                        placeholder="Chọn kênh"
                        data={
                          allChannelsData?.data.data.map((ch) => ({
                            value: ch._id,
                            label: ch.channelName
                          })) || []
                        }
                        searchable
                        clearable
                        size="sm"
                        withAsterisk
                      />
                    )}
                  />
                )}
              </Stack>
            </Group>
          </Paper>

          {isLoading && (
            <Group justify="center" py="lg" aria-live="polite">
              <Loader size="sm" />
              <Text c="dimmed" size="sm">
                Đang tải dữ liệu doanh thu và KPI...
              </Text>
            </Group>
          )}

          {/* Manual inputs - always visible */}
          <SectionCard
            id="manual-input-section"
            title="Thông tin cần nhập"
            description="Nhập chi phí quảng cáo và KPI ngày. Các trường khác được tính tự động từ hệ thống."
            badgeLabel="Bắt buộc"
            badgeColor="orange"
            bg="orange.0"
          >
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Controller
                  name="adsCost"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      label="Chi phí quảng cáo"
                      placeholder="Nhập chi phí ads"
                      thousandSeparator=","
                      required
                      leftSection={<Text size="sm">đ</Text>}
                      styles={{
                        input: { fontWeight: 500 }
                      }}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Controller
                  name="dateKpi"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      label="KPI ngày"
                      placeholder="Nhập KPI ngày"
                      thousandSeparator=","
                      required
                      leftSection={<Text size="sm">đ</Text>}
                      styles={{
                        input: { fontWeight: 500 }
                      }}
                    />
                  )}
                />
              </Grid.Col>
            </Grid>
          </SectionCard>

          {/* Auto-filled / calculated data as Accordion */}
          {!isLoading && (
            <>
              <Accordion
                variant="separated"
                radius="md"
                multiple
                defaultValue={[]}
              >
                {/* Daily revenue */}
                <Accordion.Item value="daily">
                  <Accordion.Control>
                    Dữ liệu doanh thu ngày (tự động)
                  </Accordion.Control>
                  <Accordion.Panel>
                    <SectionCard
                      title="Dữ liệu doanh thu ngày"
                      badgeLabel="Tự động"
                      badgeColor="gray"
                    >
                      <Grid gutter="md">
                        <Grid.Col span={12}>
                          <Controller
                            name="revenue"
                            control={control}
                            render={({ field }) => (
                              <NumberInput
                                {...field}
                                label="Tổng doanh thu"
                                placeholder="0"
                                thousandSeparator=","
                                readOnly
                                leftSection={<Text size="sm">đ</Text>}
                                styles={{
                                  input: {
                                    fontWeight: 600,
                                    fontSize: 16
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid.Col>

                        {/* New funnel revenue */}
                        <Grid.Col span={12}>
                          <Paper
                            withBorder
                            radius="sm"
                            p="sm"
                            bg="gray.0"
                            shadow="xs"
                          >
                            <Text size="sm" fw={500} c="dimmed" mb="xs">
                              Doanh thu khách mới
                            </Text>
                            <Group gap="lg" align="flex-end" wrap="wrap">
                              <Box style={{ flex: 1, minWidth: 160 }}>
                                <Text size="xs" c="dimmed" mb={4}>
                                  Tổng
                                </Text>
                                <Text size="lg" fw={600}>
                                  {(
                                    newFunnelRevenueAds + newFunnelRevenueOther
                                  ).toLocaleString()}
                                  đ
                                </Text>
                              </Box>
                              <Box style={{ flex: 1, minWidth: 160 }}>
                                <Controller
                                  name="newFunnelRevenue.ads"
                                  control={control}
                                  render={({ field }) => (
                                    <NumberInput
                                      {...field}
                                      label="Từ Ads"
                                      placeholder="0"
                                      thousandSeparator=","
                                      readOnly
                                      size="sm"
                                      leftSection={<Text size="xs">đ</Text>}
                                      styles={{
                                        label: {
                                          fontSize: 12,
                                          color: "var(--mantine-color-dimmed)"
                                        }
                                      }}
                                    />
                                  )}
                                />
                              </Box>
                              <Box style={{ flex: 1, minWidth: 160 }}>
                                <Controller
                                  name="newFunnelRevenue.other"
                                  control={control}
                                  render={({ field }) => (
                                    <NumberInput
                                      {...field}
                                      label="Từ nguồn khác"
                                      placeholder="0"
                                      thousandSeparator=","
                                      readOnly
                                      size="sm"
                                      leftSection={<Text size="xs">đ</Text>}
                                      styles={{
                                        label: {
                                          fontSize: 12,
                                          color: "var(--mantine-color-dimmed)"
                                        }
                                      }}
                                    />
                                  )}
                                />
                              </Box>
                            </Group>
                          </Paper>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <Controller
                            name="newOrder"
                            control={control}
                            render={({ field }) => (
                              <NumberInput
                                {...field}
                                label="Số đơn khách mới"
                                placeholder="0"
                                readOnly
                                leftSection={<Text size="sm">#</Text>}
                              />
                            )}
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <Controller
                            name="returningFunnelRevenue"
                            control={control}
                            render={({ field }) => (
                              <NumberInput
                                {...field}
                                label="Doanh thu khách cũ"
                                placeholder="0"
                                thousandSeparator=","
                                readOnly
                                leftSection={<Text size="sm">đ</Text>}
                              />
                            )}
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <Controller
                            name="returningOrder"
                            control={control}
                            render={({ field }) => (
                              <NumberInput
                                {...field}
                                label="Số đơn khách cũ"
                                placeholder="0"
                                readOnly
                                leftSection={<Text size="sm">#</Text>}
                              />
                            )}
                          />
                        </Grid.Col>
                      </Grid>
                    </SectionCard>
                  </Accordion.Panel>
                </Accordion.Item>

                {/* Accumulated month */}
                <Accordion.Item value="accumulated">
                  <Accordion.Control>
                    Dữ liệu lũy kế tháng (trước ngày hôm nay)
                  </Accordion.Control>
                  <Accordion.Panel>
                    <SectionCard
                      title="Dữ liệu lũy kế tháng"
                      badgeLabel="Tự động"
                      badgeColor="gray"
                    >
                      <Grid gutter="md">
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                          <Controller
                            name="accumulatedRevenue"
                            control={control}
                            render={({ field }) => (
                              <NumberInput
                                {...field}
                                label="Tổng doanh thu lũy kế"
                                placeholder="0"
                                thousandSeparator=","
                                readOnly
                                leftSection={<Text size="sm">đ</Text>}
                                styles={{
                                  input: { fontWeight: 600 }
                                }}
                              />
                            )}
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                          <Controller
                            name="accumulatedAdsCost"
                            control={control}
                            render={({ field }) => (
                              <NumberInput
                                {...field}
                                label="Tổng chi phí ads"
                                placeholder="0"
                                thousandSeparator=","
                                readOnly
                                leftSection={<Text size="sm">đ</Text>}
                              />
                            )}
                          />
                        </Grid.Col>

                        <Grid.Col span={12}>
                          <Paper
                            withBorder
                            radius="sm"
                            p="sm"
                            bg="gray.0"
                            shadow="xs"
                          >
                            <Text size="sm" fw={500} c="dimmed" mb="xs">
                              Doanh thu khách mới lũy kế
                            </Text>
                            <Group gap="lg" align="flex-end" wrap="wrap">
                              <Box style={{ flex: 1, minWidth: 160 }}>
                                <Text size="xs" c="dimmed" mb={4}>
                                  Tổng
                                </Text>
                                <Text size="lg" fw={600}>
                                  {(
                                    accumulatedNewFunnelRevenueAds +
                                    accumulatedNewFunnelRevenueOther
                                  ).toLocaleString()}
                                  đ
                                </Text>
                              </Box>
                              <Box style={{ flex: 1, minWidth: 160 }}>
                                <Controller
                                  name="accumulatedNewFunnelRevenue.ads"
                                  control={control}
                                  render={({ field }) => (
                                    <NumberInput
                                      {...field}
                                      label="Từ Ads"
                                      placeholder="0"
                                      thousandSeparator=","
                                      readOnly
                                      size="sm"
                                      leftSection={<Text size="xs">đ</Text>}
                                      styles={{
                                        label: {
                                          fontSize: 12,
                                          color: "var(--mantine-color-dimmed)"
                                        }
                                      }}
                                    />
                                  )}
                                />
                              </Box>
                              <Box style={{ flex: 1, minWidth: 160 }}>
                                <Controller
                                  name="accumulatedNewFunnelRevenue.other"
                                  control={control}
                                  render={({ field }) => (
                                    <NumberInput
                                      {...field}
                                      label="Từ nguồn khác"
                                      placeholder="0"
                                      thousandSeparator=","
                                      readOnly
                                      size="sm"
                                      leftSection={<Text size="xs">đ</Text>}
                                      styles={{
                                        label: {
                                          fontSize: 12,
                                          color: "var(--mantine-color-dimmed)"
                                        }
                                      }}
                                    />
                                  )}
                                />
                              </Box>
                            </Group>
                          </Paper>
                        </Grid.Col>
                      </Grid>
                    </SectionCard>
                  </Accordion.Panel>
                </Accordion.Item>

                {/* Projected (accumulated + today) */}
                <Accordion.Item value="projected">
                  <Accordion.Control>
                    Dữ liệu lũy kế dự báo (bao gồm ngày hôm nay)
                  </Accordion.Control>
                  <Accordion.Panel>
                    <SectionCard
                      title="Dữ liệu lũy kế dự báo"
                      badgeLabel="Tự động"
                      badgeColor="gray"
                    >
                      <Grid gutter="md">
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                          <NumberInput
                            value={projectedRevenue}
                            label="Tổng DT lũy kế (dự báo)"
                            placeholder="0"
                            thousandSeparator=","
                            readOnly
                            leftSection={<Text size="sm">đ</Text>}
                            styles={{
                              input: { fontWeight: 600 }
                            }}
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                          <NumberInput
                            value={projectedAdsCost}
                            label="Tổng chi phí ads (dự báo)"
                            placeholder="0"
                            thousandSeparator=","
                            readOnly
                            leftSection={<Text size="sm">đ</Text>}
                          />
                        </Grid.Col>

                        <Grid.Col span={12}>
                          <Paper
                            withBorder
                            radius="sm"
                            p="sm"
                            bg="gray.0"
                            shadow="xs"
                          >
                            <Text size="sm" fw={500} c="dimmed" mb="xs">
                              Doanh thu khách mới lũy kế (dự báo)
                            </Text>
                            <Group gap="lg" align="flex-end" wrap="wrap">
                              <Box style={{ flex: 1, minWidth: 160 }}>
                                <Text size="xs" c="dimmed" mb={4}>
                                  Tổng
                                </Text>
                                <Text size="lg" fw={600}>
                                  {(
                                    projectedNewFunnelRevenueAds +
                                    projectedNewFunnelRevenueOther
                                  ).toLocaleString()}
                                  đ
                                </Text>
                              </Box>
                              <Box style={{ flex: 1, minWidth: 160 }}>
                                <NumberInput
                                  value={projectedNewFunnelRevenueAds}
                                  label="Từ Ads"
                                  placeholder="0"
                                  thousandSeparator=","
                                  readOnly
                                  size="sm"
                                  leftSection={<Text size="xs">đ</Text>}
                                  styles={{
                                    label: {
                                      fontSize: 12,
                                      color: "var(--mantine-color-dimmed)"
                                    }
                                  }}
                                />
                              </Box>
                              <Box style={{ flex: 1, minWidth: 160 }}>
                                <NumberInput
                                  value={projectedNewFunnelRevenueOther}
                                  label="Từ nguồn khác"
                                  placeholder="0"
                                  thousandSeparator=","
                                  readOnly
                                  size="sm"
                                  leftSection={<Text size="xs">đ</Text>}
                                  styles={{
                                    label: {
                                      fontSize: 12,
                                      color: "var(--mantine-color-dimmed)"
                                    }
                                  }}
                                />
                              </Box>
                            </Group>
                          </Paper>
                        </Grid.Col>
                      </Grid>
                    </SectionCard>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>

              <Divider />

              {/* KPI overview */}
              <SectionCard
                title="Tổng quan KPI"
                description="So sánh KPI hiện tại và KPI dự báo sau khi tính cả ngày hôm nay."
              >
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <MetricCard
                      title="KPI hiện tại"
                      badgeLabel="Hiện tại"
                      mainLabel="% KPI đạt được"
                      mainValue={kpiPercentage}
                      mainColor="blue"
                      detailLabel="Doanh thu lũy kế / KPI tháng"
                      detailValueLeft={`${accumulatedRevenue.toLocaleString()}đ`}
                      detailValueRight={`${kpiData?.kpi?.toLocaleString() || 0}đ`}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <MetricCard
                      title="KPI dự báo"
                      badgeLabel="Dự báo"
                      mainLabel="% KPI đạt được (dự báo)"
                      mainValue={projectedKpiPercentage}
                      mainColor="teal"
                      detailLabel="DT lũy kế dự báo / KPI tháng"
                      detailValueLeft={`${projectedRevenue.toLocaleString()}đ`}
                      detailValueRight={`${kpiData?.kpi?.toLocaleString() || 0}đ`}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <MetricCard
                      title="CAC hiện tại"
                      badgeLabel="Hiện tại"
                      mainLabel="CAC (Chi phí / DT từ Ads)"
                      mainValue={cac}
                      mainColor="orange"
                      detailLabel="Chi phí ads / DT khách mới từ Ads"
                      detailValueLeft={`${accumulatedAdsCost.toLocaleString()}đ`}
                      detailValueRight={`${accumulatedNewFunnelRevenueAds.toLocaleString()}đ`}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <MetricCard
                      title="CAC dự báo"
                      badgeLabel="Dự báo"
                      mainLabel="CAC (dự báo)"
                      mainValue={projectedCAC}
                      mainColor="orange"
                      detailLabel="Chi phí ads dự báo / DT khách mới từ Ads (dự báo)"
                      detailValueLeft={`${projectedAdsCost.toLocaleString()}đ`}
                      detailValueRight={`${projectedNewFunnelRevenueAds.toLocaleString()}đ`}
                    />
                  </Grid.Col>
                </Grid>
              </SectionCard>

              {/* Actions */}
              <Group justify="flex-end" mt="sm">
                <Button
                  type="button"
                  variant="subtle"
                  onClick={() => modals.closeAll()}
                  disabled={isCreating}
                >
                  Huỷ
                </Button>
                <Button
                  type="submit"
                  leftSection={<IconDeviceFloppy size={16} />}
                  loading={isCreating}
                >
                  Lưu báo cáo
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </form>
    </Box>
  )
}
