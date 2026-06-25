import { useEffect, useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Alert,
  Button,
  Group,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Text
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { IconDeviceFloppy, IconInfoCircle } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { useDailyAds } from "../../hooks/useDailyAds"
import { CToast } from "../common/CToast"
import { AdsMetricsSummaryCard } from "./AdsMetricsSummaryCard"

type FormState = {
  roiProtect: number
  tinRefundAmount: number
  gmvAds: number
  affiliateCost: number
  totalRevenue: number
  refundCancelRate: number
}

const EMPTY_FORM: FormState = {
  roiProtect: 0,
  tinRefundAmount: 0,
  gmvAds: 0,
  affiliateCost: 0,
  totalRevenue: 0,
  refundCancelRate: 0
}

const fieldLabelStyles = {
  color: "#0f172a",
  fontWeight: 600,
  marginBottom: 6
}

const fieldInputStyles = {
  borderColor: "#cbd5e1",
  color: "#0f172a",
  fontWeight: 500
}

interface DailyAdsMetricsModalProps {
  initialChannelId?: string | null
  initialDate?: Date | null
  initialData?: Partial<FormState> | null
  refetch?: () => void
}

export function DailyAdsMetricsModal({
  initialChannelId = null,
  initialDate,
  initialData,
  refetch
}: DailyAdsMetricsModalProps) {
  const queryClient = useQueryClient()
  const { upsertDailyAdsMetrics } = useDailyAds()
  const isEditing = Boolean(initialDate || initialData)
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (initialDate) return initialDate

    const value = new Date()
    value.setDate(value.getDate() - 1)
    value.setHours(0, 0, 0, 0)
    return value
  })
  const [form, setForm] = useState<FormState>({
    ...EMPTY_FORM,
    ...initialData
  })

  useEffect(() => {
    if (!initialData) return

    setForm((current) => ({
      ...current,
      ...initialData
    }))
  }, [initialData])

  const preview = useMemo(() => {
    const normalizedRate =
      form.refundCancelRate >= 1
        ? form.refundCancelRate / 100
        : form.refundCancelRate
    const actualAdsCost = Math.max(
      0,
      form.gmvAds - form.tinRefundAmount - form.roiProtect
    )
    const affiliateRefundAmount = Math.max(0, actualAdsCost * normalizedRate)
    const totalCost = Math.max(0, actualAdsCost + form.affiliateCost)
    const adjustedRevenue = Math.max(
      0,
      form.totalRevenue * (1 - normalizedRate)
    )
    const percent = (value: number, denominator: number) =>
      denominator > 0 ? Math.round((value / denominator) * 10000) / 100 : 0

    return {
      actualAdsCost,
      totalCost,
      affiliateRefundAmount,
      adjustedRevenue,
      refundCancelRate: Math.round(normalizedRate * 10000) / 100,
      ratios: {
        adsRatioOnBeforeDiscountRevenue: percent(
          actualAdsCost,
          form.totalRevenue
        ),
        totalCostRatioOnBeforeDiscountRevenue: percent(
          totalCost,
          form.totalRevenue
        ),
        costAfterRefundRatioOnBeforeDiscountRevenue: percent(
          totalCost,
          adjustedRevenue
        )
      }
    }
  }, [form])

  const { mutateAsync: saveMetrics, isPending } = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !initialChannelId) {
        throw new Error("missing_required_values")
      }

      return upsertDailyAdsMetrics({
        date: selectedDate,
        channelId: initialChannelId,
        roiProtect: form.roiProtect,
        tinRefundAmount: form.tinRefundAmount,
        gmvAds: form.gmvAds,
        affiliateCost: form.affiliateCost,
        totalRevenue: form.totalRevenue,
        refundCancelRate: form.refundCancelRate
      })
    },
    onSuccess: async () => {
      CToast.success({ title: "Đã lưu chỉ số ads" })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["daily-ads-metrics-list"] }),
        queryClient.invalidateQueries({ queryKey: ["getRangeStats"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-ads-split"] })
      ])
      refetch?.()
      modals.closeAll()
    },
    onError: () => {
      CToast.error({ title: "Không lưu được chỉ số ads" })
    }
  })

  const updateField = (key: keyof FormState, value: number | string) => {
    setForm((current) => ({
      ...current,
      [key]: Number(value || 0)
    }))
  }

  return (
    <Stack gap="xl">
      <Paper withBorder radius="xl" p="xl">
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text fw={800} fz="lg" c="#0f172a">
                {isEditing
                  ? "Cập nhật chỉ số ads theo ngày"
                  : "Thêm chỉ số ads theo ngày"}
              </Text>
              <Text mt={4} size="sm" c="#475569">
                Nhập các số liệu cho ngày đã chọn. Phần tóm tắt bên dưới sẽ tự
                cập nhật theo dữ liệu bạn vừa nhập.
              </Text>
            </div>

            <DatePickerInput
              label="Ngày"
              value={selectedDate}
              onChange={setSelectedDate}
              valueFormat="DD/MM/YYYY"
              clearable={false}
              maxDate={new Date()}
              w={180}
              styles={{
                label: fieldLabelStyles,
                input: fieldInputStyles
              }}
            />
          </Group>

          {!initialChannelId && (
            <Alert
              color="blue"
              variant="light"
              icon={<IconInfoCircle size={16} />}
              radius="xl"
            >
              Chọn kênh trước khi lưu chỉ số ads.
            </Alert>
          )}

          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="md">
            <NumberInput
              label="ROI Protect"
              value={form.roiProtect}
              onChange={(value) => updateField("roiProtect", value)}
              thousandSeparator=","
              min={0}
              styles={{
                label: fieldLabelStyles,
                input: fieldInputStyles
              }}
            />
            <NumberInput
              label="Tiền hoàn tín"
              value={form.tinRefundAmount}
              onChange={(value) => updateField("tinRefundAmount", value)}
              thousandSeparator=","
              min={0}
              styles={{
                label: fieldLabelStyles,
                input: fieldInputStyles
              }}
            />
            <NumberInput
              label="GMV ADS"
              value={form.gmvAds}
              onChange={(value) => updateField("gmvAds", value)}
              thousandSeparator=","
              min={0}
              styles={{
                label: fieldLabelStyles,
                input: fieldInputStyles
              }}
            />
            <NumberInput
              label="Chi phí Aff"
              value={form.affiliateCost}
              onChange={(value) => updateField("affiliateCost", value)}
              thousandSeparator=","
              min={0}
              styles={{
                label: fieldLabelStyles,
                input: fieldInputStyles
              }}
            />
            <NumberInput
              label="Doanh thu tổng"
              value={form.totalRevenue}
              onChange={(value) => updateField("totalRevenue", value)}
              thousandSeparator=","
              min={0}
              styles={{
                label: fieldLabelStyles,
                input: fieldInputStyles
              }}
            />
            <NumberInput
              label="Tỷ lệ hoàn / hủy (%)"
              value={form.refundCancelRate}
              onChange={(value) => updateField("refundCancelRate", value)}
              min={0}
              max={100}
              decimalScale={2}
              styles={{
                label: fieldLabelStyles,
                input: fieldInputStyles,
                description: {
                  color: "#64748b",
                  marginTop: 4
                }
              }}
            />
          </SimpleGrid>

          <Group justify="flex-end">
            <Button
              leftSection={<IconDeviceFloppy size={18} />}
              onClick={() => void saveMetrics()}
              loading={isPending}
              disabled={!selectedDate || !initialChannelId}
            >
              {isEditing ? "Cập nhật chỉ số" : "Lưu chỉ số"}
            </Button>
          </Group>
        </Stack>
      </Paper>

      <AdsMetricsSummaryCard
        title="Tóm tắt số liệu sẽ lưu"
        data={{
          totalAdsCost: preview.actualAdsCost,
          actualAdsCost: preview.actualAdsCost,
          totalCost: preview.totalCost,
          ratios: preview.ratios,
          rawMetrics: {
            roiProtect: form.roiProtect,
            tinRefundAmount: form.tinRefundAmount,
            gmvAds: form.gmvAds,
            affiliateCost: form.affiliateCost,
            affiliateRefundAmount: preview.affiliateRefundAmount,
            totalRevenue: form.totalRevenue,
            adjustedRevenue: preview.adjustedRevenue,
            refundCancelRate: preview.refundCancelRate
          },
          adsSourceMode: "metrics",
          metricsDaysCount: 1
        }}
      />
    </Stack>
  )
}
