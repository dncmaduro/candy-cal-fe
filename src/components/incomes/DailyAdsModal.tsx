import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { CreateDailyAdsRequest } from "../../hooks/models"
import { useDailyAds } from "../../hooks/useDailyAds"
import {
  Box,
  Button,
  Group,
  NumberInput,
  Text,
  Stack,
  Divider,
  Paper
} from "@mantine/core"
import { CToast } from "../common/CToast"

interface Props {
  resetStep: () => void
  refetch: () => void
  selectedDate: Date
}

export const DailyAdsModal = ({ resetStep, refetch, selectedDate }: Props) => {
  const [liveAdsCost, setLiveAdsCost] = useState<number>(0)
  const [videoAdsCost, setVideoAdsCost] = useState<number>(0)
  const { createDailyAds } = useDailyAds()

  const { mutateAsync: createAds, isPending: submitting } = useMutation({
    mutationFn: async (req: CreateDailyAdsRequest) => createDailyAds(req),
    onSuccess: () => {
      CToast.success({ title: "Thêm doanh thu ads thành công!" })
      resetStep()
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi thêm doanh thu ads" })
    }
  })

  const handleSubmit = async () => {
    if (liveAdsCost < 0 || videoAdsCost < 0) {
      CToast.error({ title: "Chi phí ads không thể âm" })
      return
    }

    await createAds({
      date: selectedDate,
      liveAdsCost,
      videoAdsCost
    })
  }

  const totalCost = liveAdsCost + videoAdsCost

  return (
    <Stack gap="md" p="sm" align="center">
      <Text size="xl" fw={700} mb={2}>
        Thêm doanh thu quảng cáo
      </Text>

      <Text mb={16} c="dimmed" ta="center">
        Nhập chi phí quảng cáo cho ngày{" "}
        <strong>{selectedDate.toLocaleDateString("vi-VN")}</strong>
      </Text>

      <Paper p="md" radius="lg" shadow="sm" withBorder w={"100%"}>
        <Stack gap={16}>
          <NumberInput
            label="Chi phí Ads Livestream (VNĐ)"
            placeholder="Nhập chi phí ads livestream"
            value={liveAdsCost}
            onChange={(val) => setLiveAdsCost(Number(val) || 0)}
            min={0}
            thousandSeparator=","
            size="md"
            required
          />

          <NumberInput
            label="Chi phí Ads Video (VNĐ)"
            placeholder="Nhập chi phí ads video"
            value={videoAdsCost}
            onChange={(val) => setVideoAdsCost(Number(val) || 0)}
            min={0}
            thousandSeparator=","
            size="md"
            required
          />

          <Divider />

          <Box>
            <Text fw={600} fz="lg">
              Tổng chi phí ads: {totalCost.toLocaleString()} VNĐ
            </Text>
            <Text c="dimmed" fz="sm">
              Livestream: {liveAdsCost.toLocaleString()} VNĐ | Video:{" "}
              {videoAdsCost.toLocaleString()} VNĐ
            </Text>
          </Box>
        </Stack>
      </Paper>

      <Group justify="end" mt="md" w="100%">
        <Button
          variant="outline"
          onClick={resetStep}
          disabled={submitting}
          size="md"
          radius="xl"
        >
          Huỷ
        </Button>
        <Button
          onClick={handleSubmit}
          loading={submitting}
          disabled={totalCost === 0}
          size="md"
          radius="xl"
        >
          Thêm doanh thu ads
        </Button>
      </Group>
    </Stack>
  )
}
