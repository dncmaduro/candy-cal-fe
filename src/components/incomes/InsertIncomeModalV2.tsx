import { useState } from "react"
import {
  Button,
  Divider,
  Group,
  Stack,
  Text,
  Paper,
  CloseButton,
  Box,
  Loader,
  Tooltip,
  Alert,
  SimpleGrid
} from "@mantine/core"
import { Dropzone, FileWithPath } from "@mantine/dropzone"
import { DatePickerInput } from "@mantine/dates"
import { IconCheck, IconX } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { useIncomes } from "../../hooks/useIncomes"
import { CToast } from "../common/CToast"
import { CreateDailyAdsRequest } from "../../hooks/models"
import { useDailyAds } from "../../hooks/useDailyAds"
import { modals } from "@mantine/modals"

type FileStatus = "pending" | "uploading" | "success" | "error"
type FileState = {
  file: FileWithPath | null
  status: FileStatus
}

const LABELS = {
  totalIncome: "File tổng doanh thu",
  sourceSplit: "File tách nguồn"
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
  refetch: () => void
}

export const InsertIncomeModalV2 = ({ refetch }: Props) => {
  const { insertIncomeAndUpdateSource } = useIncomes()
  const { createDailyAds } = useDailyAds()
  const [date, setDate] = useState<Date | null>(null)
  const [files, setFiles] = useState<Record<keyof typeof LABELS, FileState>>({
    totalIncome: { file: null, status: "pending" },
    sourceSplit: { file: null, status: "pending" }
  })
  const [insertIncomesCompleted, setInsertIncomesCompleted] = useState(false)
  const [adsFiles, setAdsFiles] = useState<Record<string, FileState>>({
    yesterdayLiveAdsCostFileBefore4pm: { file: null, status: "pending" },
    yesterdayShopAdsCostFileBefore4pm: { file: null, status: "pending" },
    yesterdayLiveAdsCostFile: { file: null, status: "pending" },
    yesterdayShopAdsCostFile: { file: null, status: "pending" },
    todayLiveAdsCostFileBefore4pm: { file: null, status: "pending" },
    todayShopAdsCostFileBefore4pm: { file: null, status: "pending" }
  })

  const { mutateAsync: insertAndUpdate, isPending: insertingIncomes } =
    useMutation({
      mutationFn: async ({
        files: fileList,
        req
      }: {
        files: File[]
        req: { date: Date }
      }) => insertIncomeAndUpdateSource(fileList, req),
      onSuccess: () => {
        setFiles((prev) => ({
          ...prev,
          totalIncome: { ...prev.totalIncome, status: "success" },
          sourceSplit: { ...prev.sourceSplit, status: "success" }
        }))
        setInsertIncomesCompleted(true)
        CToast.success({ title: "Đã gửi files thành công" })
      },
      onError: () => {
        setFiles((prev) => ({
          ...prev,
          totalIncome: { ...prev.totalIncome, status: "error" },
          sourceSplit: { ...prev.sourceSplit, status: "error" }
        }))
        CToast.error({ title: "Gửi files thất bại" })
      },
      onSettled: () => {
        refetch()
      }
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
      CToast.success({ title: "Thêm doanh thu ads thành công!" })
      modals.closeAll()
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi thêm doanh thu ads" })
    }
  })

  const handleInsertIncomes = async () => {
    if (!date || !files.totalIncome.file || !files.sourceSplit.file) {
      CToast.error({ title: "Vui lòng chọn ngày và đủ 2 file" })
      return
    }

    setFiles((prev) => ({
      ...prev,
      totalIncome: { ...prev.totalIncome, status: "uploading" },
      sourceSplit: { ...prev.sourceSplit, status: "uploading" }
    }))

    await insertAndUpdate({
      files: [files.totalIncome.file, files.sourceSplit.file],
      req: { date }
    })
  }

  const handleSubmitAdsCost = async () => {
    const adsFileValues = Object.values(adsFiles)
    const allAdsFilesUploaded = adsFileValues.every(
      (fileState) => fileState.file !== null
    )

    if (!allAdsFilesUploaded) {
      CToast.error({ title: "Vui lòng tải lên đủ 6 file ads" })
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

  const disabledInsertIncomes =
    !date ||
    !files.totalIncome.file ||
    !files.sourceSplit.file ||
    insertingIncomes ||
    insertIncomesCompleted

  const disableDropzone = insertingIncomes || insertIncomesCompleted

  const handleRemove = (key: keyof typeof LABELS) => {
    setFiles((prev) => ({ ...prev, [key]: { file: null, status: "pending" } }))
  }

  const getStatusIcon = (status: FileStatus) => {
    if (status === "uploading") return <Loader size={16} />
    if (status === "success") return <IconCheck color="green" size={18} />
    if (status === "error") return <IconX color="red" size={18} />
    return null
  }

  const renderDropzone = (key: keyof typeof LABELS) => {
    const { file, status } = files[key]
    return (
      <Paper p="md" w={"100%"} radius="lg" shadow="sm" withBorder>
        <Stack gap={6}>
          <Text fw={600}>{LABELS[key]}</Text>
          <Dropzone
            onDrop={(filesArr) =>
              setFiles((prev) => ({
                ...prev,
                [key]: { file: filesArr[0], status: "pending" }
              }))
            }
            maxFiles={1}
            accept={[".xlsx", ".xls", ".csv"]}
            className="flex min-h-[110px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-blue-400"
            disabled={!!file || disableDropzone}
          >
            {file ? (
              <Group justify="space-between" w="100%">
                <Tooltip label={file.name}>
                  <Text size="sm" truncate>
                    {file.name}
                  </Text>
                </Tooltip>
                <Group gap={0}>
                  {getStatusIcon(status)}
                  {status === "pending" && (
                    <CloseButton
                      ml={6}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(key)
                      }}
                    />
                  )}
                </Group>
              </Group>
            ) : (
              <Text size="sm" c="gray.6">
                Kéo & thả file hoặc click để chọn
              </Text>
            )}
          </Dropzone>
          <Text size="xs" c="gray.5" mt={2}>
            Hỗ trợ: .xlsx, .xls, .csv
          </Text>
        </Stack>
      </Paper>
    )
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

  const resetData = () => {
    setDate(null)
    setFiles({
      totalIncome: { file: null, status: "pending" },
      sourceSplit: { file: null, status: "pending" }
    })
    setAdsFiles({
      yesterdayLiveAdsCostFileBefore4pm: { file: null, status: "pending" },
      yesterdayShopAdsCostFileBefore4pm: { file: null, status: "pending" },
      yesterdayLiveAdsCostFile: { file: null, status: "pending" },
      yesterdayShopAdsCostFile: { file: null, status: "pending" },
      todayLiveAdsCostFileBefore4pm: { file: null, status: "pending" },
      todayShopAdsCostFileBefore4pm: { file: null, status: "pending" }
    })
    setInsertIncomesCompleted(false)
  }

  return (
    <Stack gap="md" p="sm">
      <Text size="xl" fw={700}>
        Thêm doanh thu theo ngày
      </Text>
      <Alert title="Lưu ý" color="yellow" variant="light">
        <Text size="sm">
          Sau khi tải file lên, hệ thống sẽ chạy ngầm việc thêm doanh thu, vui
          lòng chờ thông báo của hệ thống và kiểm tra. Trong thời gian đó, bạn
          vẫn có thể đóng cửa sổ này và làm việc khác.
        </Text>
      </Alert>

      {!insertIncomesCompleted ? (
        <>
          <DatePickerInput
            label="Chọn ngày"
            size="md"
            placeholder="Chọn ngày"
            value={date}
            onChange={setDate}
            maxDate={new Date()}
            withAsterisk
            className="max-w-[210px]"
            disabled={insertingIncomes}
          />

          <Stack align="start" justify="center" gap="sm">
            {renderDropzone("totalIncome")}
            <Divider orientation="vertical" />
            {renderDropzone("sourceSplit")}
          </Stack>

          <Group justify="end" mt="md">
            <Button
              onClick={handleInsertIncomes}
              disabled={disabledInsertIncomes}
              loading={insertingIncomes}
              size="md"
              radius="xl"
            >
              {insertingIncomes ? "Đang gửi..." : "Gửi files"}
            </Button>
          </Group>
        </>
      ) : (
        <>
          <Text size="lg" fw={600} mb={2}>
            Tải lên file chi phí quảng cáo
          </Text>

          <Text mb={16} c="dimmed" ta="center">
            Tải lên 6 file chi phí quảng cáo cho ngày{" "}
            <strong>{date?.toLocaleDateString("vi-VN")}</strong>
          </Text>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {Object.entries(ADS_FILE_LABELS).map(([key, label]) =>
              renderAdsDropzone(key, label)
            )}
          </SimpleGrid>

          <Group justify="end" mt="md">
            <Button
              variant="outline"
              onClick={resetData}
              size="md"
              radius="xl"
              disabled={submittingAds}
            >
              Nhập lại từ đầu
            </Button>
            <Button
              onClick={handleSubmitAdsCost}
              loading={submittingAds}
              disabled={
                !Object.values(adsFiles).every((f) => f.file !== null) ||
                submittingAds
              }
              size="md"
              radius="xl"
            >
              Thêm doanh thu ads
            </Button>
          </Group>
        </>
      )}

      {insertIncomesCompleted && (
        <Box pt={4}>
          <Text size="sm" c="teal" fw={500}>
            Thêm doanh thu đã hoàn thành, bây giờ hãy thêm chi phí quảng cáo
          </Text>
        </Box>
      )}
    </Stack>
  )
}
