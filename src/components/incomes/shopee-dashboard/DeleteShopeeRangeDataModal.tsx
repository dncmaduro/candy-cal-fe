import { useMemo, useState } from "react"
import { Alert, Button, Checkbox, Group, Stack, Text } from "@mantine/core"
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { CToast } from "../../common/CToast"
import {
  useDeleteShopeeRangeData,
  type DeleteShopeeRangeDataSelection,
  type DeleteShopeeRangeDataSummary
} from "../../../hooks/useDeleteShopeeRangeData"

interface DeleteShopeeRangeDataModalProps {
  channelId: string
  channelName: string
  orderFrom: string
  orderTo: string
}

const renderDeleteSummary = (summary: DeleteShopeeRangeDataSummary) => (
  <Stack gap={2}>
    <Text size="sm">Doanh thu đã xóa: {summary.incomesDeletedCount}</Text>
    <Text size="sm">Ngày ads xóa thành công: {summary.adsDeletedDays}</Text>
    <Text size="sm">
      Ngày live doanh thu xóa thành công: {summary.liveRevenueDeletedDays}
    </Text>
    <Text size="sm">Ngày không có dữ liệu: {summary.noDataDays}</Text>
    <Text size="sm">Request lỗi thật sự: {summary.failedRequests}</Text>
    {summary.errorMessages[0] && (
      <Text size="sm">Lỗi đầu tiên: {summary.errorMessages[0]}</Text>
    )}
  </Stack>
)

const getDeleteErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data &&
    "message" in error.response.data
  ) {
    const message = error.response.data.message

    if (typeof message === "string" && message.trim()) return message
    if (Array.isArray(message)) return message.join(", ")
  }

  if (error instanceof Error && error.message) return error.message
  return "Vui lòng thử lại sau"
}

export const DeleteShopeeRangeDataModal = ({
  channelId,
  channelName,
  orderFrom,
  orderTo
}: DeleteShopeeRangeDataModalProps) => {
  const [selection, setSelection] = useState<DeleteShopeeRangeDataSelection>({
    incomes: false,
    ads: false,
    liveRevenue: false
  })
  const { mutateAsync, isPending } = useDeleteShopeeRangeData()

  const canConfirm = useMemo(
    () => selection.incomes || selection.ads || selection.liveRevenue,
    [selection]
  )

  const handleConfirm = async () => {
    try {
      const summary = await mutateAsync({
        channelId,
        orderFrom,
        orderTo,
        selection
      })

      const hasErrors = summary.failedRequests > 0
      const hasDeletedData =
        summary.incomesDeletedCount > 0 ||
        summary.adsDeletedDays > 0 ||
        summary.liveRevenueDeletedDays > 0
      const hasNoMatchingData = !hasDeletedData && !hasErrors

      if (hasErrors) {
        CToast.info({
          title: "Đã xóa dữ liệu Shopee một phần",
          subtitle: renderDeleteSummary(summary)
        })
      } else if (hasNoMatchingData) {
        CToast.info({
          title: "Không có dữ liệu Shopee để xóa",
          subtitle: renderDeleteSummary(summary)
        })
      } else {
        CToast.success({
          title: "Xóa dữ liệu Shopee thành công",
          subtitle: renderDeleteSummary(summary)
        })
      }

      modals.closeAll()
    } catch (error) {
      CToast.error({
        title: "Không thể xóa dữ liệu Shopee",
        subtitle: getDeleteErrorMessage(error)
      })
    }
  }

  return (
    <Stack gap="md">
      <Alert
        color="red"
        variant="light"
        radius="md"
        icon={<IconAlertTriangle size={18} />}
      >
        <Stack gap={4}>
          <Text fw={700}>Đây là hành động không thể hoàn tác.</Text>
          <Text size="sm">
            Hệ thống sẽ xóa dữ liệu Shopee theo đúng kênh và khoảng ngày hiện tại.
          </Text>
        </Stack>
      </Alert>

      <Stack gap={4}>
        <Text size="sm">
          <b>Kênh:</b> {channelName}
        </Text>
        <Text size="sm">
          <b>Khoảng ngày:</b> {orderFrom} đến {orderTo}
        </Text>
      </Stack>

      <Stack gap="xs">
        <Checkbox
          label="Xóa doanh thu"
          checked={selection.incomes}
          onChange={(event) => {
            const checked = event.currentTarget.checked
            setSelection((current) => ({
              ...current,
              incomes: checked
            }))
          }}
        />
        <Checkbox
          label="Xóa ads"
          checked={selection.ads}
          onChange={(event) => {
            const checked = event.currentTarget.checked
            setSelection((current) => ({
              ...current,
              ads: checked
            }))
          }}
        />
        <Checkbox
          label="Xóa live doanh thu"
          checked={selection.liveRevenue}
          onChange={(event) => {
            const checked = event.currentTarget.checked
            setSelection((current) => ({
              ...current,
              liveRevenue: checked
            }))
          }}
        />
      </Stack>

      <Group justify="flex-end" mt="sm">
        <Button variant="default" onClick={() => modals.closeAll()} disabled={isPending}>
          Hủy
        </Button>
        <Button
          color="red"
          leftSection={<IconTrash size={16} />}
          onClick={handleConfirm}
          loading={isPending}
          disabled={!canConfirm}
        >
          Xóa dữ liệu
        </Button>
      </Group>
    </Stack>
  )
}
