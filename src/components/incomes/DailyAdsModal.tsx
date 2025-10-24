import { useState } from "react"
import {
  Button,
  Group,
  Stack,
  Text,
  Paper,
  CloseButton,
  Loader,
  Tooltip,
  Alert,
  SimpleGrid
} from "@mantine/core"
import { Dropzone, FileWithPath } from "@mantine/dropzone"
import { DatePickerInput } from "@mantine/dates"
import { IconCheck, IconX } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { CToast } from "../common/CToast"
import { CreateDailyAdsRequest } from "../../hooks/models"
import { useDailyAds } from "../../hooks/useDailyAds"
import { modals } from "@mantine/modals"

type FileStatus = "pending" | "uploading" | "success" | "error"
type FileState = {
  file: FileWithPath | null
  status: FileStatus
}

const ADS_FILE_LABELS = {
  yesterdayLiveAdsCostFileBefore4pm: "Hôm qua Live Ads (trước 4pm)",
  yesterdayShopAdsCostFileBefore4pm: "Hôm qua Shop Ads (trước 4pm)",
  yesterdayLiveAdsCostFile: "Hôm qua Live Ads (cả ngày)",
  yesterdayShopAdsCostFile: "Hôm qua Shop Ads (cả ngày)",
  todayLiveAdsCostFileBefore4pm: "Hôm nay Live Ads (trước 4pm)",
  todayShopAdsCostFileBefore4pm: "Hôm nay Shop Ads (trước 4pm)"
}

interface Props {
  refetch?: () => void
}

export const DailyAdsModal = ({ refetch }: Props) => {
  const { createDailyAds } = useDailyAds()
  const [date, setDate] = useState<Date | null>(null)
  const [adsFiles, setAdsFiles] = useState<Record<string, FileState>>({
    yesterdayLiveAdsCostFileBefore4pm: { file: null, status: "pending" },
    yesterdayShopAdsCostFileBefore4pm: { file: null, status: "pending" },
    yesterdayLiveAdsCostFile: { file: null, status: "pending" },
    yesterdayShopAdsCostFile: { file: null, status: "pending" },
    todayLiveAdsCostFileBefore4pm: { file: null, status: "pending" },
    todayShopAdsCostFileBefore4pm: { file: null, status: "pending" }
  })

  const { mutateAsync: createAds, isPending: submittingAds } = useMutation({
    mutationFn: async ({
      files: fileList,
      req
    }: {
      files: File[]
      req: CreateDailyAdsRequest
    }) => createDailyAds(fileList, req),
    onSuccess: () => {
      CToast.success({ title: "Thêm chi phí quảng cáo thành công!" })
      modals.closeAll()
      refetch?.()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi thêm chi phí quảng cáo" })
    }
  })

  const handleSubmitAdsCost = async () => {
    if (!date) {
      CToast.error({ title: "Vui lòng chọn ngày" })
      return
    }

    const adsFileValues = Object.values(adsFiles)
    const allAdsFilesUploaded = adsFileValues.every(
      (fileState) => fileState.file !== null
    )

    if (!allAdsFilesUploaded) {
      CToast.error({ title: "Vui lòng tải lên đủ 6 file chi phí quảng cáo" })
      return
    }

    const fileList = Object.keys(ADS_FILE_LABELS)
      .map((key) => adsFiles[key].file!)
      .filter(Boolean)

    await createAds({
      files: fileList,
      req: { date: date! }
    })
  }

  const getStatusIcon = (status: FileStatus) => {
    if (status === "uploading") return <Loader size={16} />
    if (status === "success") return <IconCheck color="green" size={18} />
    if (status === "error") return <IconX color="red" size={18} />
    return null
  }

  const renderAdsDropzone = (key: string, label: string) => {
    const { file, status } = adsFiles[key]
    return (
      <Paper key={key} p="md" radius="lg" shadow="sm" withBorder>
        <Stack gap={6}>
          <Text fw={600} size="sm">
            {label}
          </Text>
          <Dropzone
            onDrop={(filesArr) =>
              setAdsFiles((prev) => ({
                ...prev,
                [key]: { file: filesArr[0], status: "pending" }
              }))
            }
            maxFiles={1}
            accept={[".xlsx", ".xls", ".csv"]}
            className="flex min-h-[80px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-blue-400"
            disabled={!!file || submittingAds}
          >
            {file ? (
              <Group justify="space-between" w="100%">
                <Tooltip label={file.name}>
                  <Text size="xs" truncate>
                    {file.name}
                  </Text>
                </Tooltip>
                <Group gap={0}>
                  {getStatusIcon(status)}
                  {status === "pending" && (
                    <CloseButton
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setAdsFiles((prev) => ({
                          ...prev,
                          [key]: { file: null, status: "pending" }
                        }))
                      }}
                    />
                  )}
                </Group>
              </Group>
            ) : (
              <Text size="xs" c="gray.6">
                Click để chọn file
              </Text>
            )}
          </Dropzone>
          <Text size="xs" c="gray.5">
            .xlsx, .xls, .csv
          </Text>
        </Stack>
      </Paper>
    )
  }

  return (
    <Stack gap="md" p="sm">
      <Text size="xl" fw={700}>
        Thêm chi phí quảng cáo
      </Text>
      <Alert title="Lưu ý" color="blue" variant="light">
        <Text size="sm">
          Tải lên 6 file chi phí quảng cáo cho ngày đã chọn. Sau khi tải lên, hệ
          thống sẽ xử lý và cập nhật dữ liệu.
        </Text>
      </Alert>

      <DatePickerInput
        label="Chọn ngày"
        size="md"
        placeholder="Chọn ngày"
        value={date}
        onChange={setDate}
        maxDate={new Date()}
        withAsterisk
        className="max-w-[210px]"
        disabled={submittingAds}
      />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {Object.entries(ADS_FILE_LABELS).map(([key, label]) =>
          renderAdsDropzone(key, label)
        )}
      </SimpleGrid>

      <Group justify="end" mt="md">
        <Button
          variant="outline"
          onClick={() => modals.closeAll()}
          size="md"
          radius="xl"
          disabled={submittingAds}
        >
          Huỷ
        </Button>
        <Button
          onClick={handleSubmitAdsCost}
          loading={submittingAds}
          disabled={
            !date ||
            !Object.values(adsFiles).every((f) => f.file !== null) ||
            submittingAds
          }
          size="md"
          radius="xl"
        >
          Thêm chi phí quảng cáo
        </Button>
      </Group>
    </Stack>
  )
}
