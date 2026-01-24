import {
  Stack,
  TextInput,
  Textarea,
  NumberInput,
  Button,
  Group,
  Text
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { modals } from "@mantine/modals"
import { useQuery } from "@tanstack/react-query"
import { useUsers } from "../../hooks/useUsers"

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
  altAssignee?:
    | string
    | {
        _id: string
        name: string
      }
  altOtherAssignee?: string
  altNote?: string
  income?: number
  adsCost?: number
  clickRate?: number
  avgViewingDuration?: number
  comments?: number
  ordersNote?: string
  rating?: string
  realIncome?: number
  orders?: number
}

export type LivestreamReportFormValues = {
  income: number
  adsCost?: number
  clickRate: number
  avgViewingDuration: number
  comments: number
  ordersNote: string
  rating?: string
  realIncome?: number
  orders: number
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
  onSubmit: (data: LivestreamReportFormValues) => void
  isSubmitting?: boolean
  forceEdit?: boolean
}) => {
  const hasData =
    !forceEdit &&
    snapshot.income !== undefined &&
    snapshot.clickRate !== undefined &&
    snapshot.avgViewingDuration !== undefined &&
    snapshot.comments !== undefined &&
    snapshot.ordersNote !== undefined

  const altAssigneeId =
    typeof snapshot.altAssignee === "string" && snapshot.altAssignee !== "other"
      ? snapshot.altAssignee
      : undefined

  const ReportForm = () => {
    const { publicSearchUser } = useUsers()
    const { data: altUserName } = useQuery({
      queryKey: ["publicSearchUser", altAssigneeId],
      queryFn: () =>
        publicSearchUser({
          page: 1,
          limit: 100
        }),
      select: (res) => {
        const items = res.data.data || []
        console.log(items)
        const exact = items.find((u) => u._id === altAssigneeId)
        return exact?.name || items[0]?.name
      },
      enabled: !!altAssigneeId
    })

    const altAssigneeLabel = (() => {
      const alt = snapshot.altAssignee
      if (!alt) return undefined
      if (typeof alt === "string") {
        if (alt === "other") return "Khác"
        return altUserName || alt
      }
      return alt.name
    })()

    const form = useForm<LivestreamReportFormValues>({
      initialValues: {
        income: snapshot.income ?? 0,
        adsCost: snapshot.adsCost ?? 0,
        clickRate: snapshot.clickRate ?? 0,
        avgViewingDuration: snapshot.avgViewingDuration ?? 0,
        comments: snapshot.comments ?? 0,
        ordersNote: snapshot.ordersNote ?? "",
        rating: snapshot.rating ?? "",
        realIncome: snapshot.realIncome ?? 0,
        orders: snapshot.orders ?? 0
      },
      validate: {
        income: (value) => (value < 0 ? "Doanh thu không được âm" : null),
        adsCost: (value) =>
          value !== undefined && value < 0
            ? "Chi phí quảng cáo không được âm"
            : null,
        clickRate: (value) => (value < 0 ? "Tỷ lệ click không được âm" : null),
        avgViewingDuration: (value) =>
          value < 0 ? "Thời gian xem không được âm" : null,
        comments: (value) => (value < 0 ? "Số bình luận không được âm" : null),
        ordersNote: (value) =>
          !value?.trim() ? "Vui lòng nhập ghi chú đơn hàng" : null
      }
    })

    return (
      <form
        onSubmit={form.onSubmit((values) => {
          onSubmit(values)
        })}
      >
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
                label="Host"
                value={snapshot.assignee.name}
                readOnly
                disabled
              />
            )}

            {(snapshot.altAssignee ||
              snapshot.altNote ||
              snapshot.altOtherAssignee) && (
              <Stack gap="xs" mt={4}>
                <Text size="xs" fw={600} c="dimmed">
                  Thông tin thay thế
                </Text>
                {snapshot.altAssignee && (
                  <TextInput
                    label="Host thay thế"
                    value={altAssigneeLabel || ""}
                    readOnly
                    disabled
                  />
                )}
                {!!snapshot.altOtherAssignee &&
                  snapshot.altAssignee === "other" && (
                    <TextInput
                      label="Host khác"
                      value={snapshot.altOtherAssignee}
                      readOnly
                      disabled
                    />
                  )}
                {!!snapshot.altNote && (
                  <Textarea
                    label="Ghi chú"
                    value={snapshot.altNote}
                    readOnly
                    disabled
                    rows={2}
                  />
                )}
              </Stack>
            )}
          </Stack>

          <Group>
            <NumberInput
              label="Doanh thu"
              placeholder="Nhập doanh thu"
              min={0}
              thousandSeparator=","
              suffix=" VNĐ"
              readOnly={hasData}
              className="grow"
              {...form.getInputProps("income")}
            />
            <NumberInput
              label="Doanh thu thực"
              readOnly
              thousandSeparator=","
              suffix=" VNĐ"
              className="grow"
              {...form.getInputProps("realIncome")}
            />
          </Group>

          <Group>
            <NumberInput
              label="Chi phí quảng cáo"
              placeholder="Nhập chi phí quảng cáo"
              min={0}
              thousandSeparator=","
              suffix=" VNĐ"
              readOnly={hasData}
              className="grow"
              {...form.getInputProps("adsCost")}
            />
            <NumberInput
              label="Số đơn hàng"
              placeholder="Nhập số đơn hàng"
              min={0}
              readOnly={hasData}
              className="grow"
              {...form.getInputProps("orders")}
            />
          </Group>

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

          {!hasData ? (
            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={() => modals.closeAll()}
                disabled={!!isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Lưu báo cáo
              </Button>
            </Group>
          ) : (
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
    size: "xl",
    children: <ReportForm />
  })
}
