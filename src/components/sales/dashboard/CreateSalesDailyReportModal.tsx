import {
  Accordion,
  Alert,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Group,
  MantineColor,
  NumberInput,
  Paper,
  Progress,
  Select,
  Skeleton,
  ScrollArea,
  Stack,
  Text
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { modals } from "@mantine/modals"
import { useMutation, useQuery } from "@tanstack/react-query"
import { IconAlertCircle, IconDeviceFloppy } from "@tabler/icons-react"
import { getDaysInMonth } from "date-fns"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useSalesChannels } from "../../../hooks/useSalesChannels"
import { useSalesDailyReports } from "../../../hooks/useSalesDailyReports"
import { useUsers } from "../../../hooks/useUsers"
import { CToast } from "../../common/CToast"
import { DailyReportByText } from "./DailyReportByText"

type SummaryStatProps = {
  label: string
  value: string | number
  hint?: string
  isLoading?: boolean
}

const SummaryStat = ({ label, value, hint, isLoading }: SummaryStatProps) => (
  <Stack gap={2}>
    <Text size="xs" c="dimmed">
      {label}
    </Text>
    {isLoading ? (
      <Skeleton height={16} width={120} radius="xl" />
    ) : (
      <Text fw={600}>{value}</Text>
    )}
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
  mainValue: string | number
  mainColor?: string
  detail: string
  progress: number
}

const MetricCard = ({
  title,
  mainValue,
  mainColor = "blue",
  detail,
  progress
}: MetricCardProps) => (
  <Paper withBorder radius="md" p="sm" bg="gray.0">
    <Stack gap="sm">
      <Text size="sm" fw={600}>
        {title}
      </Text>
      <Text fw={700} fz={26} c={mainColor}>
        {mainValue}%
      </Text>
      <Text size="xs" c="dimmed">
        {detail}
      </Text>
      <Progress
        value={Math.min(Math.max(progress, 0), 100)}
        color={mainColor}
        size={5}
        radius="xl"
      />
    </Stack>
  </Paper>
)

type SalesDailyReportFormValues = {
  date: Date
  channel: string
  dateKpi: number
  revenue: number
  newFunnelRevenue: { ads: number; other: number }
  returningFunnelRevenue: number
  newOrder: number
  returningOrder: number
  accumulatedRevenue: number
  accumulatedNewFunnelRevenue: { ads: number; other: number }
}

export const CreateSalesDailyReportModal = () => {
  const { createSalesDailyReport, getRevenueForDate, getSalesMonthKpi } =
    useSalesDailyReports()
  const { getMyChannel, searchSalesChannels } = useSalesChannels()
  const { getMe } = useUsers()
  const { control, handleSubmit, watch, setValue } =
    useForm<SalesDailyReportFormValues>({
      defaultValues: {
        date: new Date(new Date().setHours(0, 0, 0, 0)),
        channel: "",
        dateKpi: 0,
        revenue: 0,
        newFunnelRevenue: { ads: 0, other: 0 },
        returningFunnelRevenue: 0,
        newOrder: 0,
        returningOrder: 0,
        accumulatedRevenue: 0,
        accumulatedNewFunnelRevenue: { ads: 0, other: 0 }
      }
    })
  const selectedDate = watch("date")
  const channelId = watch("channel")
  const revenue = watch("revenue")
  const newFunnelRevenueAds = watch("newFunnelRevenue.ads")
  const newFunnelRevenueOther = watch("newFunnelRevenue.other")
  const accumulatedRevenue = watch("accumulatedRevenue")
  const accumulatedNewFunnelRevenueAds = watch(
    "accumulatedNewFunnelRevenue.ads"
  )
  const accumulatedNewFunnelRevenueOther = watch(
    "accumulatedNewFunnelRevenue.other"
  )

  const { data: channelData, isLoading: channelLoading } = useQuery({
    queryKey: ["getMyChannel"],
    queryFn: getMyChannel,
    select: (data) => data.data
  })
  const { data: meData } = useQuery({ queryKey: ["me"], queryFn: getMe })
  const { data: allChannelsData } = useQuery({
    queryKey: ["salesChannels", "all"],
    queryFn: () => searchSalesChannels({ page: 1, limit: 999 }),
    enabled: !!meData?.data
  })
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["getRevenueForDate", selectedDate, channelId],
    queryFn: () =>
      getRevenueForDate({
        date: new Date(new Date(selectedDate).setHours(0, 0, 0, 0)),
        channelId
      }),
    select: (data) => data.data,
    enabled: !!selectedDate && !!channelId
  })
  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ["getSalesMonthKpi", selectedDate, channelId],
    queryFn: () => getSalesMonthKpi({ date: selectedDate, channelId }),
    select: (data) => data.data,
    enabled: !!selectedDate && !!channelId
  })

  useEffect(() => {
    if (channelData?.channel?._id && !channelId)
      setValue("channel", channelData.channel._id)
  }, [channelData, channelId, setValue])
  useEffect(() => {
    if (!revenueData) return
    setValue("revenue", revenueData.revenue || 0)
    setValue("newFunnelRevenue.ads", revenueData.newFunnelRevenue?.ads || 0)
    setValue("newFunnelRevenue.other", revenueData.newFunnelRevenue?.other || 0)
    setValue("returningFunnelRevenue", revenueData.returningFunnelRevenue || 0)
    setValue("newOrder", revenueData.newOrder || 0)
    setValue("returningOrder", revenueData.returningOrder || 0)
    setValue("accumulatedRevenue", revenueData.accumulatedRevenue || 0)
    setValue(
      "accumulatedNewFunnelRevenue.ads",
      revenueData.accumulatedNewFunnelRevenue?.ads || 0
    )
    setValue(
      "accumulatedNewFunnelRevenue.other",
      revenueData.accumulatedNewFunnelRevenue?.other || 0
    )
  }, [revenueData, setValue])
  useEffect(() => {
    const monthKpi = kpiData?.kpi ?? 0
    setValue(
      "dateKpi",
      monthKpi > 0 && selectedDate
        ? Math.round(monthKpi / getDaysInMonth(selectedDate))
        : 0
    )
  }, [kpiData?.kpi, selectedDate, setValue])

  const projectedRevenue = useMemo(
    () => accumulatedRevenue + revenue,
    [accumulatedRevenue, revenue]
  )
  const projectedNewFunnelRevenueAds = useMemo(
    () => accumulatedNewFunnelRevenueAds + newFunnelRevenueAds,
    [accumulatedNewFunnelRevenueAds, newFunnelRevenueAds]
  )
  const projectedNewFunnelRevenueOther = useMemo(
    () => accumulatedNewFunnelRevenueOther + newFunnelRevenueOther,
    [accumulatedNewFunnelRevenueOther, newFunnelRevenueOther]
  )
  const kpiPercentage = useMemo(
    () =>
      !kpiData?.kpi ? 0 : ((accumulatedRevenue / kpiData.kpi) * 100).toFixed(2),
    [accumulatedRevenue, kpiData]
  )
  const projectedKpiPercentage = useMemo(
    () =>
      !kpiData?.kpi ? 0 : ((projectedRevenue / kpiData.kpi) * 100).toFixed(2),
    [projectedRevenue, kpiData]
  )
  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: (values: SalesDailyReportFormValues) =>
      createSalesDailyReport({
        date: new Date(values.date),
        channel: values.channel,
        dateKpi: values.dateKpi
      }),
    onSuccess: (response) => {
      CToast.success({ title: "Tạo báo cáo doanh thu thành công" })
      modals.closeAll()
      modals.open({
        id: "create-sales-daily-report",
        title: <b>Tin nhắn báo cáo</b>,
        children: <DailyReportByText report={response.data} />,
        size: "lg"
      })
    },
    onError: () => CToast.error({ title: "Tạo báo cáo doanh thu thất bại" })
  })

  const availableChannels = allChannelsData?.data.data ?? []
  const isLoading = channelLoading || revenueLoading || kpiLoading
  const newRevenueTotal = newFunnelRevenueAds + newFunnelRevenueOther
  const accumulatedNewRevenueTotal =
    accumulatedNewFunnelRevenueAds + accumulatedNewFunnelRevenueOther
  const projectedNewRevenueTotal =
    projectedNewFunnelRevenueAds + projectedNewFunnelRevenueOther
  const dateKpi = watch("dateKpi")
  const [openedAccordion, setOpenedAccordion] = useState<string | null>(null)
  const canSubmit =
    !!selectedDate && !!channelId && Number.isFinite(dateKpi) && dateKpi >= 0
  const readOnlyInputStyles = {
    input: {
      backgroundColor: "var(--mantine-color-gray-0)",
      cursor: "default"
    }
  }

  return (
    <Box
      component="section"
      style={{
        height: "min(84vh, 920px)",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <ScrollArea type="auto" offsetScrollbars style={{ flex: 1 }}>
        <Box p="md" pb="xl">
          {!channelData?.channel && availableChannels.length === 0 && (
            <Alert
              color="yellow"
              title="Lưu ý"
              icon={<IconAlertCircle />}
              mb="md"
            >
              Tài khoản của bạn không phụ trách kênh sỉ lẻ nào, vui lòng kiểm
              tra lại
            </Alert>
          )}
          <form
            id="create-sales-daily-report-form"
            onSubmit={handleSubmit((values) => create(values))}
          >
            <Flex gap="md" align="flex-start" wrap="wrap">
              <Box style={{ flex: "1 1 620px", minWidth: 0 }}>
                <SectionCard
                  title="Thông tin báo cáo"
                  description="Kiểm tra dữ liệu tự động và nhập KPI ngày trước khi lưu."
                >
                  <Grid gutter="sm">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
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
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Controller
                        name="channel"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            label="Kênh"
                            placeholder="Chọn kênh"
                            data={availableChannels.map((channel) => ({
                              value: channel._id,
                              label: channel.channelName
                            }))}
                            searchable
                            clearable
                            required
                            size="sm"
                            withAsterisk
                          />
                        )}
                      />
                    </Grid.Col>
                  </Grid>
                  <Group gap="md" mt="sm" wrap="wrap">
                    <SummaryStat
                      label="Kênh phụ trách"
                      value={
                        channelData?.channel?.channelName || "Chưa được gán"
                      }
                      isLoading={channelLoading}
                    />
                    <Stack gap={4}>
                      <Text size="xs" c="dimmed">
                        Trạng thái dữ liệu
                      </Text>
                      <Badge
                        variant="light"
                        color={channelId ? "teal" : "gray"}
                      >
                        {channelId ? "Đã cập nhật" : "Chưa được gán"}
                      </Badge>
                    </Stack>
                  </Group>
                </SectionCard>
              </Box>

              <Box style={{ flex: "1 1 300px", minWidth: 280 }}>
                <Paper
                  withBorder
                  radius="md"
                  p="sm"
                  style={{
                    position: "sticky",
                    top: 0,
                    borderColor: "var(--mantine-color-gray-3)"
                  }}
                >
                  <Text fw={600} size="sm" mb="sm">
                    Tổng quan KPI
                  </Text>
                  <Stack gap="sm">
                    <MetricCard
                      title="KPI hiện tại"
                      mainValue={kpiPercentage}
                      mainColor="blue"
                      detail={`${accumulatedRevenue.toLocaleString()}đ / ${(kpiData?.kpi ?? 0).toLocaleString()}đ`}
                      progress={Number(kpiPercentage)}
                    />
                    <MetricCard
                      title="KPI dự báo"
                      mainValue={projectedKpiPercentage}
                      mainColor="teal"
                      detail={`${projectedRevenue.toLocaleString()}đ / ${(kpiData?.kpi ?? 0).toLocaleString()}đ`}
                      progress={Number(projectedKpiPercentage)}
                    />
                  </Stack>
                  <Text size="xs" c="dimmed" mt="sm">
                    Chi phí ads là toàn Sales nên không hiển thị CAC theo từng
                    kênh.
                  </Text>
                </Paper>
              </Box>

              <Box style={{ flex: "1 1 620px", minWidth: 0 }}>
                <SectionCard
                  title="Thông tin cần nhập"
                  description="Nhập KPI ngày để lưu báo cáo."
                  badgeLabel="Bắt buộc"
                  badgeColor="orange"
                  bg="orange.0"
                >
                  <Box maw={320}>
                    <Controller
                      name="dateKpi"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          {...field}
                          label="KPI ngày"
                          placeholder="Tự động từ KPI tháng"
                          thousandSeparator=","
                          required
                          min={0}
                          hideControls
                          leftSection={<Text size="sm">đ</Text>}
                          styles={{ input: { fontWeight: 600 } }}
                        />
                      )}
                    />
                  </Box>
                </SectionCard>
              </Box>

              <Box style={{ flex: "1 1 620px", minWidth: 0 }}>
                {isLoading ? (
                  <Stack py="md" gap="xs" aria-live="polite">
                    <Skeleton height={44} radius="sm" />
                    <Skeleton height={44} radius="sm" />
                    <Skeleton height={44} radius="sm" />
                  </Stack>
                ) : (
                  <Accordion
                    variant="contained"
                    radius="md"
                    value={openedAccordion}
                    onChange={setOpenedAccordion}
                  >
                    <Accordion.Item value="daily">
                      <Accordion.Control>
                        <Group justify="space-between" wrap="nowrap" w="100%">
                          <Text fw={600}>Dữ liệu doanh thu ngày</Text>
                          <Text size="sm" c="blue" fw={600}>
                            {revenue.toLocaleString("vi-VN")}đ
                          </Text>
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Grid gutter="sm">
                          <Grid.Col span={12}>
                            <Controller
                              name="revenue"
                              control={control}
                              render={({ field }) => (
                                <NumberInput
                                  {...field}
                                  label="Tổng doanh thu ngày"
                                  thousandSeparator=","
                                  readOnly
                                  hideControls
                                  leftSection={<Text size="sm">đ</Text>}
                                  styles={{
                                    input: {
                                      ...readOnlyInputStyles.input,
                                      fontWeight: 700,
                                      fontSize: 17
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                              value={newRevenueTotal}
                              label="Doanh thu khách mới"
                              thousandSeparator=","
                              readOnly
                              hideControls
                              leftSection={<Text size="sm">đ</Text>}
                              styles={{
                                input: {
                                  ...readOnlyInputStyles.input,
                                  fontWeight: 600
                                }
                              }}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <Controller
                              name="newFunnelRevenue.ads"
                              control={control}
                              render={({ field }) => (
                                <NumberInput
                                  {...field}
                                  label="Từ Ads"
                                  thousandSeparator=","
                                  readOnly
                                  hideControls
                                  leftSection={<Text size="sm">đ</Text>}
                                  styles={readOnlyInputStyles}
                                />
                              )}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <Controller
                              name="newFunnelRevenue.other"
                              control={control}
                              render={({ field }) => (
                                <NumberInput
                                  {...field}
                                  label="Từ nguồn khác"
                                  thousandSeparator=","
                                  readOnly
                                  hideControls
                                  leftSection={<Text size="sm">đ</Text>}
                                  styles={readOnlyInputStyles}
                                />
                              )}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <Controller
                              name="newOrder"
                              control={control}
                              render={({ field }) => (
                                <NumberInput
                                  {...field}
                                  label="Số đơn khách mới"
                                  readOnly
                                  hideControls
                                  leftSection={<Text size="sm">#</Text>}
                                  styles={readOnlyInputStyles}
                                />
                              )}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <Controller
                              name="returningFunnelRevenue"
                              control={control}
                              render={({ field }) => (
                                <NumberInput
                                  {...field}
                                  label="Doanh thu khách cũ"
                                  thousandSeparator=","
                                  readOnly
                                  hideControls
                                  leftSection={<Text size="sm">đ</Text>}
                                  styles={readOnlyInputStyles}
                                />
                              )}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <Controller
                              name="returningOrder"
                              control={control}
                              render={({ field }) => (
                                <NumberInput
                                  {...field}
                                  label="Số đơn khách cũ"
                                  readOnly
                                  hideControls
                                  leftSection={<Text size="sm">#</Text>}
                                  styles={readOnlyInputStyles}
                                />
                              )}
                            />
                          </Grid.Col>
                        </Grid>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="accumulated">
                      <Accordion.Control>
                        <Group justify="space-between" wrap="nowrap" w="100%">
                          <Text fw={600}>Dữ liệu lũy kế tháng</Text>
                          <Text size="sm" c="dimmed">
                            {accumulatedRevenue.toLocaleString("vi-VN")}đ
                          </Text>
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Grid gutter="sm">
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <Controller
                              name="accumulatedRevenue"
                              control={control}
                              render={({ field }) => (
                                <NumberInput
                                  {...field}
                                  label="Tổng doanh thu lũy kế"
                                  thousandSeparator=","
                                  readOnly
                                  hideControls
                                  leftSection={<Text size="sm">đ</Text>}
                                  styles={{
                                    input: {
                                      ...readOnlyInputStyles.input,
                                      fontWeight: 600
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                              value={accumulatedNewRevenueTotal}
                              label="DT khách mới lũy kế"
                              thousandSeparator=","
                              readOnly
                              hideControls
                              leftSection={<Text size="sm">đ</Text>}
                              styles={{
                                input: {
                                  ...readOnlyInputStyles.input,
                                  fontWeight: 600
                                }
                              }}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <Controller
                              name="accumulatedNewFunnelRevenue.ads"
                              control={control}
                              render={({ field }) => (
                                <NumberInput
                                  {...field}
                                  label="Từ Ads"
                                  thousandSeparator=","
                                  readOnly
                                  hideControls
                                  leftSection={<Text size="sm">đ</Text>}
                                  styles={readOnlyInputStyles}
                                />
                              )}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Controller
                              name="accumulatedNewFunnelRevenue.other"
                              control={control}
                              render={({ field }) => (
                                <NumberInput
                                  {...field}
                                  label="Từ nguồn khác"
                                  thousandSeparator=","
                                  readOnly
                                  hideControls
                                  leftSection={<Text size="sm">đ</Text>}
                                  styles={readOnlyInputStyles}
                                />
                              )}
                            />
                          </Grid.Col>
                        </Grid>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="projected">
                      <Accordion.Control>
                        <Group justify="space-between" wrap="nowrap" w="100%">
                          <Text fw={600}>Dữ liệu lũy kế dự báo</Text>
                          <Text size="sm" c="teal" fw={600}>
                            {projectedRevenue.toLocaleString("vi-VN")}đ
                          </Text>
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Grid gutter="sm">
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                              value={projectedRevenue}
                              label="Tổng DT lũy kế"
                              thousandSeparator=","
                              readOnly
                              hideControls
                              leftSection={<Text size="sm">đ</Text>}
                              styles={{
                                input: {
                                  ...readOnlyInputStyles.input,
                                  fontWeight: 600
                                }
                              }}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                              value={projectedNewRevenueTotal}
                              label="DT khách mới"
                              thousandSeparator=","
                              readOnly
                              hideControls
                              leftSection={<Text size="sm">đ</Text>}
                              styles={{
                                input: {
                                  ...readOnlyInputStyles.input,
                                  fontWeight: 600
                                }
                              }}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                              value={projectedNewFunnelRevenueAds}
                              label="Từ Ads"
                              thousandSeparator=","
                              readOnly
                              hideControls
                              leftSection={<Text size="sm">đ</Text>}
                              styles={readOnlyInputStyles}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <NumberInput
                              value={projectedNewFunnelRevenueOther}
                              label="Từ nguồn khác"
                              thousandSeparator=","
                              readOnly
                              hideControls
                              leftSection={<Text size="sm">đ</Text>}
                              styles={readOnlyInputStyles}
                            />
                          </Grid.Col>
                        </Grid>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                )}
              </Box>
            </Flex>
          </form>
        </Box>
      </ScrollArea>
      <Group
        justify="flex-end"
        p="md"
        style={{
          borderTop: "1px solid var(--mantine-color-gray-3)",
          background: "var(--mantine-color-white)"
        }}
      >
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
          form="create-sales-daily-report-form"
          leftSection={<IconDeviceFloppy size={16} />}
          loading={isCreating}
          disabled={!canSubmit}
        >
          Lưu báo cáo doanh thu
        </Button>
      </Group>
    </Box>
  )
}

export const CreateSalesRevenueDailyReportModal = CreateSalesDailyReportModal
