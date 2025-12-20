import {
  Stack,
  TextInput,
  Textarea,
  NumberInput,
  Button,
  Group
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { modals } from "@mantine/modals"

type LivestreamSnapshot = {
  _id: string
  period: {
    _id?: string
    startTime: { hour: number; minute: number }
    endTime: { hour: number; minute: number }
  }
  assignee?: {
    _id: string
    name: string
  }
  income?: number
  adsCost?: number
  clickRate?: number
  avgViewingDuration?: number
  comments?: number
  ordersNote?: string
  rating?: string
}

const formatTimeRange = (
  start: { hour: number; minute: number },
  end: { hour: number; minute: number }
) => {
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${pad(start.hour)}:${pad(start.minute)} - ${pad(end.hour)}:${pad(end.minute)}`
}

export const openLivestreamReportModal = ({
  snapshot,
  onSubmit,
  isSubmitting,
  forceEdit = false
}: {
  snapshot: LivestreamSnapshot
  onSubmit: (data: {
    income: number
    adsCost?: number
    clickRate: number
    avgViewingDuration: number
    comments: number
    ordersNote: string
    rating?: string
  }) => void
  isSubmitting?: boolean
  forceEdit?: boolean
}) => {
  // Check if all required data exists (income and 4 required metrics)
  const hasData =
    !forceEdit &&
    !!(
      snapshot.income !== undefined &&
      snapshot.clickRate !== undefined &&
      snapshot.avgViewingDuration !== undefined &&
      snapshot.comments !== undefined &&
      snapshot.ordersNote !== undefined
    )

  const ReportForm = () => {
    const form = useForm({
      initialValues: {
        income: snapshot.income || 0,
        adsCost: snapshot.adsCost || 0,
        clickRate: snapshot.clickRate || 0,
        avgViewingDuration: snapshot.avgViewingDuration || 0,
        comments: snapshot.comments || 0,
        ordersNote: snapshot.ordersNote || "",
        rating: snapshot.rating || ""
      },
      validate: {
        income: (value: number) =>
          value < 0 ? "Doanh thu không được âm" : null,
        adsCost: (value: number) =>
          value < 0 ? "Chi phí quảng cáo không được âm" : null,
        clickRate: (value: number) =>
          value < 0 ? "Tỷ lệ click không được âm" : null,
        avgViewingDuration: (value: number) =>
          value < 0 ? "Thời gian xem không được âm" : null,
        comments: (value: number) =>
          value < 0 ? "Số bình luận không được âm" : null
      }
    })

    const handleSubmit = form.onSubmit((values) => {
      onSubmit(values)
    })

    return (
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Stack gap="xs">
            <TextInput
              label="Ca livestream"
              value={formatTimeRange(
                snapshot.period.startTime,
                snapshot.period.endTime
              )}
              readOnly
              disabled
            />
            {snapshot.assignee && (
              <TextInput
                label="Người phụ trách"
                value={snapshot.assignee.name}
                readOnly
                disabled
              />
            )}
          </Stack>

          <NumberInput
            label="Doanh thu"
            placeholder="Nhập doanh thu"
            min={0}
            thousandSeparator=","
            suffix=" VNĐ"
            readOnly={hasData}
            {...form.getInputProps("income")}
          />

          <NumberInput
            label="Chi phí quảng cáo"
            placeholder="Nhập chi phí quảng cáo"
            min={0}
            thousandSeparator=","
            suffix=" VNĐ"
            readOnly={hasData}
            {...form.getInputProps("adsCost")}
          />

          <NumberInput
            label="Tỷ lệ click (%)"
            placeholder="Nhập tỷ lệ click"
            min={0}
            max={100}
            decimalScale={2}
            suffix="%"
            readOnly={hasData}
            {...form.getInputProps("clickRate")}
          />

          <NumberInput
            label="Thời gian xem trung bình (giây)"
            placeholder="Nhập thời gian xem trung bình"
            min={0}
            decimalScale={2}
            suffix=" giây"
            readOnly={hasData}
            {...form.getInputProps("avgViewingDuration")}
          />

          <NumberInput
            label="Số bình luận"
            placeholder="Nhập số bình luận"
            min={0}
            readOnly={hasData}
            {...form.getInputProps("comments")}
          />

          <Textarea
            label="Ghi chú đơn hàng"
            placeholder="Nhập ghi chú về đơn hàng"
            rows={3}
            readOnly={hasData}
            {...form.getInputProps("ordersNote")}
          />

          <Textarea
            label="Đánh giá"
            placeholder="Nhập đánh giá"
            rows={3}
            readOnly={hasData}
            {...form.getInputProps("rating")}
          />

          {!hasData && (
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => modals.closeAll()}>
                Hủy
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Lưu báo cáo
              </Button>
            </Group>
          )}

          {hasData && (
            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => {
                  modals.closeAll()
                  openLivestreamReportModal({
                    snapshot,
                    onSubmit,
                    isSubmitting,
                    forceEdit: true
                  })
                }}
              >
                Chỉnh sửa
              </Button>
              <Button onClick={() => modals.closeAll()}>Đóng</Button>
            </Group>
          )}
        </Stack>
      </form>
    )
  }

  modals.open({
    title: (
      <b>{hasData ? "Xem báo cáo ca livestream" : "Báo cáo ca livestream"}</b>
    ),
    size: "lg",
    children: <ReportForm />
  })
}
