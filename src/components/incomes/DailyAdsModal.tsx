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
  SimpleGrid,
  Badge,
  SegmentedControl,
  Select,
  NumberInput,
  Divider
} from "@mantine/core"
import { Dropzone, FileWithPath } from "@mantine/dropzone"
import { DatePickerInput } from "@mantine/dates"
import { IconCheck, IconX, IconFileUpload, IconEdit } from "@tabler/icons-react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { CToast } from "../common/CToast"
import {
  CreateDailyAdsRequest,
  GetPreviousDailyAdsBefore4pmResponse,
  CreateSimpleDailyAdsRequest
} from "../../hooks/models"
import { useDailyAds } from "../../hooks/useDailyAds"
import { useLivestreamChannels } from "../../hooks/useLivestreamChannels"
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
  const {
    createDailyAds,
    createDailyAdsWithSavedAdsCost,
    getPreviousDailyAds,
    createSimpleDailyAds
  } = useDailyAds()
  const { searchLivestreamChannels } = useLivestreamChannels()
  const [mode, setMode] = useState<"file" | "manual">("file")
  const [currency, setCurrency] = useState<"vnd" | "usd">("vnd")
  const [date, setDate] = useState<Date | null>(null)
  const [channel, setChannel] = useState<string | null>(null)
  const [liveAdsCost, setLiveAdsCost] = useState<number>(0)
  const [shopAdsCost, setShopAdsCost] = useState<number>(0)
  const [previousAdsData, setPreviousAdsData] =
    useState<GetPreviousDailyAdsBefore4pmResponse | null>(null)
  const [previousAdsStatus, setPreviousAdsStatus] = useState<
    "idle" | "loading" | "accepted" | "rejected"
  >("idle")
  const [adsFiles, setAdsFiles] = useState<Record<string, FileState>>({
    yesterdayLiveAdsCostFileBefore4pm: { file: null, status: "pending" },
    yesterdayShopAdsCostFileBefore4pm: { file: null, status: "pending" },
    yesterdayLiveAdsCostFile: { file: null, status: "pending" },
    yesterdayShopAdsCostFile: { file: null, status: "pending" },
    todayLiveAdsCostFileBefore4pm: { file: null, status: "pending" },
    todayShopAdsCostFileBefore4pm: { file: null, status: "pending" }
  })

  const { data: channelsData } = useQuery({
    queryKey: ["searchLivestreamChannels"],
    queryFn: () =>
      searchLivestreamChannels({
        page: 1,
        limit: 100
      }),
    select: (data) => data.data
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

  const { mutateAsync: createAdsWithSaved } = useMutation({
    mutationFn: async ({
      files: fileList,
      req
    }: {
      files: File[]
      req: CreateDailyAdsRequest
    }) => createDailyAdsWithSavedAdsCost(fileList, req),
    onSuccess: () => {
      CToast.success({ title: "Thêm chi phí quảng cáo thành công!" })
      modals.closeAll()
      refetch?.()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi thêm chi phí quảng cáo" })
    }
  })

  const { mutateAsync: createSimpleAds, isPending: submittingSimpleAds } =
    useMutation({
      mutationFn: async (req: CreateSimpleDailyAdsRequest) =>
        createSimpleDailyAds(req),
      onSuccess: () => {
        CToast.success({ title: "Thêm chi phí quảng cáo thành công!" })
        modals.closeAll()
        refetch?.()
      },
      onError: () => {
        CToast.error({ title: "Có lỗi xảy ra khi thêm chi phí quảng cáo" })
      }
    })

  const { mutate: fetchPreviousAds } = useMutation({
    mutationFn: async (date: Date) => {
      const response = await getPreviousDailyAds({ date })
      return response.data
    },
    onSuccess: (data) => {
      setPreviousAdsData(data)
      setPreviousAdsStatus("idle")
    },
    onError: () => {
      CToast.error({
        title: "Không thể lấy dữ liệu ads trước 4 giờ chiều hôm qua"
      })
      setPreviousAdsStatus("rejected")
    }
  })

  const handleFetchPreviousAds = () => {
    if (!date) {
      CToast.error({ title: "Vui lòng chọn ngày trước" })
      return
    }
    setPreviousAdsStatus("loading")
    fetchPreviousAds(date)
  }

  const handleAcceptPreviousAds = () => {
    setPreviousAdsStatus("accepted")
  }

  const handleRejectPreviousAds = () => {
    setPreviousAdsStatus("rejected")
    setPreviousAdsData(null)
  }

  const handleSubmitAdsCost = async () => {
    if (!date) {
      CToast.error({ title: "Vui lòng chọn ngày" })
      return
    }

    if (!channel) {
      CToast.error({ title: "Vui lòng chọn kênh livestream" })
      return
    }

    // Manual mode: submit simple ads with numbers
    if (mode === "manual") {
      if (liveAdsCost < 0 || shopAdsCost < 0) {
        CToast.error({ title: "Chi phí quảng cáo không được âm" })
        return
      }

      await createSimpleAds({
        date: date!,
        channel: channel!,
        liveAdsCost,
        shopAdsCost,
        currency
      })
      return
    }

    // File mode below
    // If user accepted previous ads data, only need 4 files (not the first 2)
    if (previousAdsStatus === "accepted") {
      const requiredFiles = [
        "yesterdayLiveAdsCostFile",
        "yesterdayShopAdsCostFile",
        "todayLiveAdsCostFileBefore4pm",
        "todayShopAdsCostFileBefore4pm"
      ]
      const allRequiredFilesUploaded = requiredFiles.every(
        (key) => adsFiles[key].file !== null
      )

      if (!allRequiredFilesUploaded) {
        CToast.error({
          title: "Vui lòng tải lên đủ 4 file chi phí quảng cáo còn lại"
        })
        return
      }

      const fileList = requiredFiles
        .map((key) => adsFiles[key].file!)
        .filter(Boolean)

      await createAdsWithSaved({
        files: fileList,
        req: { date: date!, channel: channel!, currency }
      })
    } else {
      // Normal flow: need all 6 files
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
        req: { date: date!, channel: channel!, currency }
      })
    }
  }

  const getStatusIcon = (status: FileStatus) => {
    if (status === "uploading") return <Loader size={16} />
    if (status === "success") return <IconCheck color="green" size={18} />
    if (status === "error") return <IconX color="red" size={18} />
    return null
  }

  const renderAdsDropzone = (key: string, label: string) => {
    const { file, status } = adsFiles[key]

    // If accepted previous data, hide the first 2 dropzones
    const isFirstTwoFiles =
      key === "yesterdayLiveAdsCostFileBefore4pm" ||
      key === "yesterdayShopAdsCostFileBefore4pm"
    if (previousAdsStatus === "accepted" && isFirstTwoFiles) {
      return null
    }

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

  const renderPreviousAdsSection = () => {
    const isFirstTwoFiles = (key: string) =>
      key === "yesterdayLiveAdsCostFileBefore4pm" ||
      key === "yesterdayShopAdsCostFileBefore4pm"

    const firstTwoEntries = Object.entries(ADS_FILE_LABELS).filter(([key]) =>
      isFirstTwoFiles(key)
    )

    if (previousAdsStatus === "idle" && previousAdsData) {
      return (
        <Paper
          p="md"
          radius="lg"
          shadow="sm"
          withBorder
          bg="blue.0"
          style={{ gridColumn: "1 / -1" }}
        >
          <Stack gap="sm">
            <Text fw={600} size="sm">
              Dữ liệu ads trước 4 giờ chiều hôm qua
            </Text>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">Live Ads Cost:</Text>
                <Text size="sm" fw={600}>
                  {previousAdsData.before4pmLiveAdsCost.toLocaleString()} VNĐ
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Shop Ads Cost:</Text>
                <Text size="sm" fw={600}>
                  {previousAdsData.before4pmShopAdsCost.toLocaleString()} VNĐ
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="blue.7">
                  Tổng:
                </Text>
                <Text size="sm" fw={700} c="blue.7">
                  {previousAdsData.totalBefore4pmCost.toLocaleString()} VNĐ
                </Text>
              </Group>
            </Stack>
            <Group justify="end" gap="xs" mt="xs">
              <Button
                variant="outline"
                color="red"
                size="sm"
                onClick={handleRejectPreviousAds}
              >
                Từ chối
              </Button>
              <Button color="green" size="sm" onClick={handleAcceptPreviousAds}>
                Chấp nhận
              </Button>
            </Group>
          </Stack>
        </Paper>
      )
    }

    if (previousAdsStatus === "accepted") {
      return (
        <Paper
          p="md"
          radius="lg"
          shadow="sm"
          withBorder
          bg="green.0"
          style={{ gridColumn: "1 / -1" }}
        >
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <IconCheck color="green" size={20} />
              <Text size="sm" c="green.9" fw={600}>
                Đồng ý sử dụng dữ liệu ads trước 4h chiều hôm qua
              </Text>
            </Group>
            <Badge color="green" variant="filled">
              Đã chấp nhận
            </Badge>
          </Group>
        </Paper>
      )
    }

    // Show dropzones for first 2 files when rejected or loading
    if (previousAdsStatus === "rejected" || previousAdsStatus === "loading") {
      return (
        <>
          {firstTwoEntries.map(([key, label]) => renderAdsDropzone(key, label))}
        </>
      )
    }

    // Initial state - don't render anything, let the main filter handle it
    return null
  }

  return (
    <Stack gap="md" p="sm">
      <Text size="xl" fw={700}>
        Thêm chi phí quảng cáo
      </Text>

      <SegmentedControl
        value={mode}
        onChange={(v) => setMode(v as "file" | "manual")}
        data={[
          {
            label: (
              <Group gap="xs" justify="center">
                <IconEdit size={16} />
                <span>Nhập số</span>
              </Group>
            ),
            value: "manual"
          },
          {
            label: (
              <Group gap="xs" justify="center">
                <IconFileUpload size={16} />
                <span>Upload file</span>
              </Group>
            ),
            value: "file"
          }
        ]}
        size="md"
        fullWidth
      />

      <Alert title="Lưu ý" color="blue" variant="light">
        <Text size="sm">
          {mode === "file"
            ? "Tải lên 6 file chi phí quảng cáo cho ngày đã chọn. Sau khi tải lên, hệ thống sẽ xử lý và cập nhật dữ liệu."
            : "Nhập trực tiếp chi phí quảng cáo Live và Shop cho ngày đã chọn."}
        </Text>
      </Alert>

      <Group align="flex-end" gap="md">
        <DatePickerInput
          label="Chọn ngày"
          size="md"
          placeholder="Chọn ngày"
          value={date}
          onChange={setDate}
          maxDate={new Date()}
          withAsterisk
          className="flex-1"
          disabled={submittingAds || submittingSimpleAds}
        />

        <Select
          label="Chọn kênh livestream"
          size="md"
          placeholder="Chọn kênh"
          value={channel}
          onChange={setChannel}
          data={
            channelsData?.data.map((ch) => ({
              value: ch._id,
              label: ch.name
            })) || []
          }
          searchable
          withAsterisk
          className="flex-1"
          disabled={submittingAds || submittingSimpleAds}
        />

        <Select
          label="Tiền tệ"
          size="md"
          value={currency}
          onChange={(v) => setCurrency(v as "vnd" | "usd")}
          data={[
            { value: "vnd", label: "VNĐ" },
            { value: "usd", label: "USD" }
          ]}
          className="flex-1"
          w={120}
          withAsterisk
          disabled={submittingAds || submittingSimpleAds}
        />
      </Group>

      {mode === "manual" ? (
        <>
          <Divider label="Chi phí quảng cáo" labelPosition="center" />
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <NumberInput
              label="Live Ads Cost"
              placeholder="Nhập chi phí Live Ads"
              value={liveAdsCost}
              onChange={(v) => setLiveAdsCost(Number(v) || 0)}
              min={0}
              size="md"
              thousandSeparator=","
              suffix={currency === "vnd" ? " VNĐ" : " USD"}
              withAsterisk
              disabled={submittingSimpleAds}
            />
            <NumberInput
              label="Shop Ads Cost"
              placeholder="Nhập chi phí Shop Ads"
              value={shopAdsCost}
              onChange={(v) => setShopAdsCost(Number(v) || 0)}
              min={0}
              size="md"
              thousandSeparator=","
              suffix={currency === "vnd" ? " VNĐ" : " USD"}
              withAsterisk
              disabled={submittingSimpleAds}
            />
          </SimpleGrid>
        </>
      ) : (
        <>
          <Button
            variant="outline"
            color="blue"
            onClick={handleFetchPreviousAds}
            loading={previousAdsStatus === "loading"}
            disabled={
              !date || previousAdsStatus === "accepted" || submittingAds
            }
            leftSection={<IconCheck size={16} />}
          >
            Lấy dữ liệu ads trước 4 giờ chiều hôm trước
          </Button>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {renderPreviousAdsSection()}
            {Object.entries(ADS_FILE_LABELS)
              .filter(([key]) => {
                const isFirstTwoFiles =
                  key === "yesterdayLiveAdsCostFileBefore4pm" ||
                  key === "yesterdayShopAdsCostFileBefore4pm"

                // Skip first 2 files only when renderPreviousAdsSection handles them
                // (i.e., when status is NOT idle without data)
                if (isFirstTwoFiles && previousAdsStatus !== "idle") {
                  return false
                }

                // Also skip if we have data to show
                if (isFirstTwoFiles && previousAdsData) {
                  return false
                }

                return true
              })
              .map(([key, label]) => renderAdsDropzone(key, label))}
          </SimpleGrid>
        </>
      )}

      <Group justify="end" mt="md">
        <Button
          variant="outline"
          onClick={() => modals.closeAll()}
          size="md"
          radius="xl"
          disabled={submittingAds || submittingSimpleAds}
        >
          Huỷ
        </Button>
        <Button
          onClick={handleSubmitAdsCost}
          loading={submittingAds || submittingSimpleAds}
          disabled={
            !date ||
            !channel ||
            (mode === "manual"
              ? false
              : previousAdsStatus === "accepted"
                ? ![
                    "yesterdayLiveAdsCostFile",
                    "yesterdayShopAdsCostFile",
                    "todayLiveAdsCostFileBefore4pm",
                    "todayShopAdsCostFileBefore4pm"
                  ].every((key) => adsFiles[key].file !== null)
                : !Object.values(adsFiles).every((f) => f.file !== null)) ||
            submittingAds ||
            submittingSimpleAds
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
