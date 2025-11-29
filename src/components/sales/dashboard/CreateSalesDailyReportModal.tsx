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
  Alert
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

export const CreateSalesDailyReportModal = () => {
  const { createSalesDailyReport, getRevenueForDate, getSalesMonthKpi } =
    useSalesDailyReports()
  const { getMyChannel } = useSalesChannels()

  const { control, handleSubmit, watch, setValue } =
    useForm<CreateSalesDailyReportRequest>({
      defaultValues: {
        date: new Date(),
        channel: "",
        adsCost: 0,
        dateKpi: 0,
        revenue: 0,
        newFunnelRevenue: 0,
        returningFunnelRevenue: 0,
        accumulatedRevenue: 0,
        accumulatedAdsCost: 0,
        accumulatedNewFunnelRevenue: 0
      }
    })

  const selectedDate = watch("date")
  const channelId = watch("channel")
  const accumulatedRevenue = watch("accumulatedRevenue")
  const accumulatedAdsCost = watch("accumulatedAdsCost")
  const accumulatedNewFunnelRevenue = watch("accumulatedNewFunnelRevenue")

  // Get my channel
  const { data: channelData, isLoading: channelLoading } = useQuery({
    queryKey: ["getMyChannel"],
    queryFn: getMyChannel,
    select: (data) => {
      return data.data
    }
  })

  const hasChannel = !!channelData?.channel

  // Get revenue for selected date
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["getRevenueForDate", selectedDate, channelId],
    queryFn: () =>
      getRevenueForDate({
        date: selectedDate instanceof Date ? selectedDate : new Date(),
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
    onSuccess: () => {
      CToast.success({ title: "Tạo báo cáo hàng ngày thành công" })
      modals.closeAll()
    },
    onError: () => {
      CToast.error({ title: "Tạo báo cáo hàng ngày thất bại" })
    }
  })

  // Auto fill channel when data is loaded
  useEffect(() => {
    if (channelData?.channel?._id) {
      setValue("channel", channelData.channel._id)
    }
  }, [channelData, setValue])

  // Auto fill revenue data when loaded
  useEffect(() => {
    if (revenueData) {
      setValue("revenue", revenueData.revenue || 0)
      setValue("newFunnelRevenue", revenueData.newFunnelRevenue || 0)
      setValue(
        "returningFunnelRevenue",
        revenueData.returningFunnelRevenue || 0
      )
      setValue("accumulatedRevenue", revenueData.accumulatedRevenue || 0)
      setValue("accumulatedAdsCost", revenueData.accumulatedAdsCost || 0)
      setValue(
        "accumulatedNewFunnelRevenue",
        revenueData.accumulatedNewFunnelRevenue || 0
      )
    }
  }, [revenueData, setValue])

  useEffect(() => {
    console.log(selectedDate, channelId)
  }, [selectedDate])

  const isLoading = channelLoading || revenueLoading || kpiLoading

  // Calculate KPI percentage
  const kpiPercentage = useMemo(() => {
    if (!kpiData?.kpi || kpiData.kpi === 0) return 0
    return ((accumulatedRevenue / kpiData.kpi) * 100).toFixed(2)
  }, [accumulatedRevenue, kpiData])

  // Calculate CAC (Customer Acquisition Cost)
  const cac = useMemo(() => {
    if (!accumulatedNewFunnelRevenue || accumulatedNewFunnelRevenue === 0)
      return 0
    return (accumulatedAdsCost / accumulatedNewFunnelRevenue).toFixed(2)
  }, [accumulatedAdsCost, accumulatedNewFunnelRevenue])

  const onSubmit = (values: CreateSalesDailyReportRequest) => {
    create(values)
  }

  return (
    <Box>
      {!hasChannel && (
        <Alert color="yellow" title="Lưu ý" icon={<IconAlertCircle />}>
          Tài khoản của bạn không phụ trách kênh sỉ lẻ nào, vui lòng kiểm tra
          lại
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          {/* Date Selection */}
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
                readOnly
              />
            )}
          />

          {isLoading && (
            <Group justify="center" py="xl">
              <Loader size="md" />
              <Text c="dimmed">Đang tải dữ liệu...</Text>
            </Group>
          )}

          {/* Revenue Data (Auto-filled) */}
          {!isLoading && (
            <>
              <Paper withBorder p="md" radius="md">
                <Text fw={600} mb="md">
                  Dữ liệu doanh thu ngày
                </Text>
                <Grid gutter="md">
                  <Grid.Col span={6}>
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
                        />
                      )}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Controller
                      name="newFunnelRevenue"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          {...field}
                          label="DT khách mới"
                          placeholder="0"
                          thousandSeparator=","
                          readOnly
                          leftSection={<Text size="sm">đ</Text>}
                        />
                      )}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Controller
                      name="returningFunnelRevenue"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          {...field}
                          label="DT khách quay lại"
                          placeholder="0"
                          thousandSeparator=","
                          readOnly
                          leftSection={<Text size="sm">đ</Text>}
                        />
                      )}
                    />
                  </Grid.Col>
                </Grid>
              </Paper>

              {/* Manual Input Fields */}
              <Paper withBorder p="md" radius="md" bg={"indigo.0"}>
                <Text fw={600} mb="md">
                  Thông tin cần nhập
                </Text>
                <Grid gutter="md">
                  <Grid.Col span={6}>
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
                        />
                      )}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
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
                        />
                      )}
                    />
                  </Grid.Col>
                </Grid>
              </Paper>

              {/* Accumulated Data (Auto-filled) */}
              <Paper withBorder p="md" radius="md">
                <Text fw={600} mb="md">
                  Dữ liệu tích luỹ tháng
                </Text>
                <Grid gutter="md">
                  <Grid.Col span={4}>
                    <Controller
                      name="accumulatedRevenue"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          {...field}
                          label="Tổng DT tích luỹ"
                          placeholder="0"
                          thousandSeparator=","
                          readOnly
                          leftSection={<Text size="sm">đ</Text>}
                        />
                      )}
                    />
                  </Grid.Col>
                  <Grid.Col span={4}>
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
                  <Grid.Col span={4}>
                    <Controller
                      name="accumulatedNewFunnelRevenue"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          {...field}
                          label="DT khách mới tích luỹ"
                          placeholder="0"
                          thousandSeparator=","
                          readOnly
                          leftSection={<Text size="sm">đ</Text>}
                        />
                      )}
                    />
                  </Grid.Col>
                </Grid>
              </Paper>

              <Divider />

              {/* KPI Statistics */}
              <Paper withBorder p="lg" radius="md" bg="blue.0">
                <Text fw={600} mb="md" size="lg">
                  Thống kê KPI tháng
                </Text>
                <Grid gutter="xl">
                  <Grid.Col span={6}>
                    <Stack gap="xs" align="center">
                      <Text size="sm" c="dimmed">
                        % KPI đạt được
                      </Text>
                      <Badge size="xl" variant="filled" color="blue">
                        {kpiPercentage}%
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {accumulatedRevenue.toLocaleString()} /{" "}
                        {kpiData?.kpi?.toLocaleString() || 0} đ
                      </Text>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Stack gap="xs" align="center">
                      <Text size="sm" c="dimmed">
                        CAC (Chi phí / DT khách mới)
                      </Text>
                      <Badge size="xl" variant="filled" color="orange">
                        {cac}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {accumulatedAdsCost.toLocaleString()} /{" "}
                        {accumulatedNewFunnelRevenue.toLocaleString()} đ
                      </Text>
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Paper>

              {/* Submit Button */}
              <Group justify="flex-end" mt="md">
                <Button
                  variant="default"
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
