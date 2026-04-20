import { useMemo, useState } from "react"
import {
  Alert,
  Box,
  Button,
  FileButton,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { modals } from "@mantine/modals"
import { IconFileUpload, IconInfoCircle, IconTrash } from "@tabler/icons-react"
import type { LivestreamChannel } from "../../../hooks/models"
import { useShopeeDailyMetrics } from "../../../hooks/useShopeeDailyMetrics"
import { useShopeeIncomes } from "../../../hooks/useShopeeIncomes"
import { SHOPEE_ALL_CHANNEL_ID } from "../../../hooks/shopeeDashboardApi"
import { CToast } from "../../common/CToast"
import {
  filterDropdownStyles,
  filterInputStyles,
  filterPlainLabelStyles
} from "../filterStyles"

interface ShopeeRevenueEntryModalProps {
  currentChannelId: string
  channels: LivestreamChannel[]
  month: number
  year: number
  onSuccess?: () => void
}

const getDefaultDate = (month: number, year: number) => {
  const today = new Date()

  if (today.getMonth() + 1 === month && today.getFullYear() === year) {
    return today
  }

  return new Date(year, month - 1, 1)
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) return error.message
  return "Vui lòng thử lại sau"
}

export const ShopeeRevenueEntryModal = ({
  currentChannelId,
  channels,
  month,
  year,
  onSuccess
}: ShopeeRevenueEntryModalProps) => {
  const queryClient = useQueryClient()
  const { insertIncomeShopee } = useShopeeIncomes()
  const {
    getShopeeDailyAds,
    createShopeeDailyAds,
    updateShopeeDailyAds,
    getShopeeDailyLiveRevenues,
    createShopeeDailyLiveRevenue,
    updateShopeeDailyLiveRevenue
  } = useShopeeDailyMetrics()

  const [date, setDate] = useState<Date | null>(() => getDefaultDate(month, year))
  const [channelId, setChannelId] = useState<string | null>(
    currentChannelId === SHOPEE_ALL_CHANNEL_ID ? null : currentChannelId
  )
  const [orderFile, setOrderFile] = useState<File | null>(null)
  const [adsCost, setAdsCost] = useState<number | string>("")
  const [liveRevenue, setLiveRevenue] = useState<number | string>("")

  const minDate = useMemo(() => new Date(year, month - 1, 1), [month, year])
  const maxDate = useMemo(() => new Date(year, month, 0), [month, year])
  const channelOptions = useMemo(
    () =>
      channels.map((channel) => ({
        value: channel._id,
        label: channel.name
      })),
    [channels]
  )
  const requiresChannelSelection = currentChannelId === SHOPEE_ALL_CHANNEL_ID
  const currentChannel = channels.find((channel) => channel._id === channelId)

  const { mutate: submitRevenueEntry, isPending } = useMutation({
    mutationFn: async () => {
      if (!date) {
        throw new Error("Vui lòng chọn ngày")
      }

      if (!channelId) {
        throw new Error("Vui lòng chọn shop Shopee")
      }

      if (adsCost === "" || adsCost === null) {
        throw new Error("Vui lòng nhập chi phí ads")
      }

      const adsCostValue = Number(adsCost)
      const hasLiveRevenue =
        liveRevenue !== "" && liveRevenue !== null && `${liveRevenue}`.trim() !== ""
      const liveRevenueValue = hasLiveRevenue ? Number(liveRevenue) : undefined

      if (
        Number.isNaN(adsCostValue) ||
        adsCostValue < 0 ||
        (typeof liveRevenueValue === "number" &&
          (Number.isNaN(liveRevenueValue) || liveRevenueValue < 0))
      ) {
        throw new Error("Chi phí ads và doanh thu live không được âm")
      }

      const dateKey = format(date, "yyyy-MM-dd")
      const uploadedOrderFile = Boolean(orderFile)

      if (orderFile) {
        try {
          await insertIncomeShopee([orderFile], { channel: channelId })
        } catch (error) {
          throw new Error(
            `Không tải được file đơn hàng. ${getErrorMessage(error)}`
          )
        }
      }

      try {
        const [adsResponse, liveRevenueResponse] = await Promise.all([
          getShopeeDailyAds({
            page: 1,
            limit: 1,
            channel: channelId,
            date: dateKey
          }),
          hasLiveRevenue
            ? getShopeeDailyLiveRevenues({
                page: 1,
                limit: 1,
                channel: channelId,
                date: dateKey
              })
            : Promise.resolve(null)
        ])

        const existingAds = adsResponse.data.data[0]
        const existingLiveRevenue = liveRevenueResponse?.data.data[0]

        const saveRequests: Promise<unknown>[] = [
          existingAds
            ? updateShopeeDailyAds(existingAds._id, {
                date,
                channel: channelId,
                adsCost: adsCostValue
              })
            : createShopeeDailyAds({
                date,
                channel: channelId,
                adsCost: adsCostValue
              })
        ]

        if (hasLiveRevenue && typeof liveRevenueValue === "number") {
          saveRequests.push(
            existingLiveRevenue
              ? updateShopeeDailyLiveRevenue(existingLiveRevenue._id, {
                  date,
                  channel: channelId,
                  liveRevenue: liveRevenueValue
                })
              : createShopeeDailyLiveRevenue({
                  date,
                  channel: channelId,
                  liveRevenue: liveRevenueValue
                })
          )
        }

        await Promise.all(saveRequests)
      } catch (error) {
        throw new Error(
          uploadedOrderFile
            ? `File đơn hàng đã được tải lên nhưng chưa lưu được chi phí ads hoặc doanh thu live. ${getErrorMessage(
                error
              )}`
            : `Chưa lưu được chi phí ads hoặc doanh thu live. ${getErrorMessage(
                error
              )}`
        )
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["shopeeDashboardOverview"]
        }),
        queryClient.invalidateQueries({
          queryKey: ["searchShopeeIncome"]
        })
      ])

      CToast.success({
        title: orderFile
          ? "Thêm doanh số Shopee thành công"
          : "Lưu chi phí ads thành công"
      })
      onSuccess?.()
      modals.closeAll()
    },
    onError: (error) => {
      CToast.error({
        title: "Không thể thêm doanh số Shopee",
        subtitle: getErrorMessage(error)
      })
    }
  })

  return (
    <Stack gap="lg">
      <Alert
        color="blue"
        variant="light"
        icon={<IconInfoCircle size={16} />}
      >
        Bạn có thể upload file đơn hàng để ghi nhận doanh số Shopee, hoặc bỏ qua
        file và chỉ lưu chi phí ads. Doanh thu live là thông tin tùy chọn.
      </Alert>

      <DatePickerInput
        label="Ngày ghi nhận"
        placeholder="Chọn ngày"
        value={date}
        onChange={setDate}
        valueFormat="DD/MM/YYYY"
        minDate={minDate}
        maxDate={maxDate}
        size="md"
        styles={{
          label: filterPlainLabelStyles,
          input: filterInputStyles
        }}
        required
      />

      {requiresChannelSelection ? (
        <Select
          label="Shop Shopee"
          placeholder="Chọn shop"
          value={channelId}
          onChange={setChannelId}
          data={channelOptions}
          searchable
          nothingFoundMessage="Không có kênh"
          size="md"
          styles={{
            label: filterPlainLabelStyles,
            input: filterInputStyles,
            dropdown: filterDropdownStyles
          }}
          required
        />
      ) : (
        <Paper
          withBorder
          radius="lg"
          p="md"
          style={{ borderColor: "#dbe4f0", background: "#f8fafc" }}
        >
          <Text fz="sm" fw={600} c="#0f172a">
            Shop Shopee
          </Text>
          <Text fw={700} mt={6}>
            {currentChannel?.name || "Shop đang chọn"}
          </Text>
        </Paper>
      )}

      <Stack gap="xs">
        <Text fz="sm" fw={600} c="#0f172a">
          File đơn hàng (không bắt buộc)
        </Text>

        {orderFile ? (
          <Paper
            withBorder
            radius="lg"
            p="md"
            style={{ borderColor: "#dbe4f0", background: "#f8fafc" }}
          >
            <Group justify="space-between" gap="md">
              <Box>
                <Text fw={600}>{orderFile.name}</Text>
                <Text size="sm" c="dimmed">
                  {(orderFile.size / 1024).toFixed(2)} KB
                </Text>
              </Box>
              <Button
                variant="subtle"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => setOrderFile(null)}
                disabled={isPending}
              >
                Xóa file
              </Button>
            </Group>
          </Paper>
        ) : (
          <FileButton
            onChange={setOrderFile}
            accept=".xlsx,.xls"
            disabled={isPending}
          >
            {(props) => (
              <Button
                {...props}
                variant="light"
                color="blue"
                radius="md"
                leftSection={<IconFileUpload size={16} />}
                fullWidth
              >
                Chọn file đơn hàng
              </Button>
            )}
          </FileButton>
        )}
      </Stack>

      <NumberInput
        label="Chi phí ads"
        placeholder="Nhập chi phí ads"
        value={adsCost}
        onChange={setAdsCost}
        min={0}
        size="md"
        thousandSeparator=","
        suffix=" đ"
        hideControls
        styles={{
          label: filterPlainLabelStyles,
          input: filterInputStyles
        }}
        required
      />

      <NumberInput
        label="Doanh thu live (tùy chọn)"
        placeholder="Nhập doanh thu live nếu có"
        value={liveRevenue}
        onChange={setLiveRevenue}
        min={0}
        size="md"
        thousandSeparator=","
        suffix=" đ"
        hideControls
        styles={{
          label: filterPlainLabelStyles,
          input: filterInputStyles
        }}
        required
      />

      <Group justify="flex-end" mt="sm">
        <Button variant="default" onClick={() => modals.closeAll()}>
          Hủy
        </Button>
        <Button onClick={() => submitRevenueEntry()} loading={isPending}>
          Lưu doanh số
        </Button>
      </Group>
    </Stack>
  )
}
