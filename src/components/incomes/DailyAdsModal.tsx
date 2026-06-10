import { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Badge,
  Button,
  CloseButton,
  Divider,
  Group,
  Loader,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Tooltip
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { Dropzone, type FileWithPath } from "@mantine/dropzone"
import { modals } from "@mantine/modals"
import {
  IconCheck,
  IconEdit,
  IconFileUpload,
  IconX
} from "@tabler/icons-react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { CToast } from "../common/CToast"
import type {
  CreateDailyAdsRequest,
  CreateSimpleDailyAdsRequest,
  DailyAdsMetricsResponse,
  GetPreviousDailyAdsBefore4pmResponse
} from "../../hooks/models"
import { useDailyAds } from "../../hooks/useDailyAds"
import { useLivestreamChannels } from "../../hooks/useLivestreamChannels"

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
} as const

const NEW_ADS_MODEL_START = new Date(2026, 5, 1)

interface Props {
  refetch?: () => void
}

const isOnOrAfterNewAdsModelStart = (value: Date | null) =>
  !!value &&
  new Date(value.getFullYear(), value.getMonth(), value.getDate()) >=
    NEW_ADS_MODEL_START

export const DailyAdsModal = ({ refetch }: Props) => {
  const {
    createDailyAds,
    createDailyAdsWithSavedAdsCost,
    createSimpleDailyAds,
    getDailyAdsMetrics,
    getPreviousDailyAds,
    upsertDailyAdsMetrics
  } = useDailyAds()
  const { searchLivestreamChannels } = useLivestreamChannels()

  const [legacyMode, setLegacyMode] = useState<"file" | "manual">("file")
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

  const [roiProtect, setRoiProtect] = useState<number>(0)
  const [fullRefundGmv, setFullRefundGmv] = useState<number>(0)
  const [tinRefundAmount, setTinRefundAmount] = useState<number>(0)
  const [adsTax, setAdsTax] = useState<number>(0)
  const [gmvAds, setGmvAds] = useState<number>(0)
  const [affiliateCost, setAffiliateCost] = useState<number>(0)
  const [affiliateRefundAmount, setAffiliateRefundAmount] = useState<number>(0)

  const usesNewAdsModel = isOnOrAfterNewAdsModelStart(date)

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

  const { mutateAsync: saveMetrics, isPending: submittingMetrics } =
    useMutation({
      mutationFn: async (req: {
        date: Date
        channelId: string
        roiProtect: number
        fullRefundGmv: number
        tinRefundAmount: number
        adsTax: number
        gmvAds: number
        affiliateCost: number
        affiliateRefundAmount: number
      }) => upsertDailyAdsMetrics(req),
      onSuccess: (response) => {
        const data = response.data.data
        CToast.success({
          title: `Đã lưu chỉ số ads. Ads thực tế: ${data.actualAdsCost.toLocaleString("vi-VN")} VNĐ`
        })
        modals.closeAll()
        refetch?.()
      },
      onError: () => {
        CToast.error({ title: "Có lỗi xảy ra khi lưu chỉ số ads" })
      }
    })

  const { data: existingMetrics } = useQuery({
    queryKey: ["daily-ads-metrics", date?.toISOString(), channel],
    queryFn: async () => {
      if (!date || !channel || !usesNewAdsModel) return null
      const response = await getDailyAdsMetrics({ date, channelId: channel })
      return response.data as DailyAdsMetricsResponse
    },
    enabled: !!date && !!channel && usesNewAdsModel,
    retry: false
  })

  useEffect(() => {
    if (!usesNewAdsModel || !existingMetrics) {
      setRoiProtect(0)
      setFullRefundGmv(0)
      setTinRefundAmount(0)
      setAdsTax(0)
      setGmvAds(0)
      setAffiliateCost(0)
      setAffiliateRefundAmount(0)
      return
    }

    setRoiProtect(existingMetrics.roiProtect || 0)
    setFullRefundGmv(existingMetrics.fullRefundGmv || 0)
    setTinRefundAmount(existingMetrics.tinRefundAmount || 0)
    setAdsTax(existingMetrics.adsTax || 0)
    setGmvAds(existingMetrics.gmvAds || 0)
    setAffiliateCost(existingMetrics.affiliateCost || 0)
    setAffiliateRefundAmount(existingMetrics.affiliateRefundAmount || 0)
  }, [existingMetrics, usesNewAdsModel])

  const { mutate: fetchPreviousAds } = useMutation({
    mutationFn: async (selectedDate: Date) => {
      const response = await getPreviousDailyAds({ date: selectedDate })
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

  const isSubmitting =
    submittingAds || submittingSimpleAds || submittingMetrics

  const modelLabel = usesNewAdsModel
    ? "Biểu mẫu chỉ số ads mới áp dụng từ 01/06/2026."
    : "Ngày trước 01/06/2026 nên đang dùng biểu mẫu ads kiểu cũ."

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

    if (usesNewAdsModel) {
      const values = [
        roiProtect,
        fullRefundGmv,
        tinRefundAmount,
        adsTax,
        gmvAds,
        affiliateCost,
        affiliateRefundAmount
      ]
      if (values.some((value) => value < 0)) {
        CToast.error({ title: "Chỉ số ads không được âm" })
        return
      }

      await saveMetrics({
        date,
        channelId: channel,
        roiProtect,
        fullRefundGmv,
        tinRefundAmount,
        adsTax,
        gmvAds,
        affiliateCost,
        affiliateRefundAmount
      })
      return
    }

    if (legacyMode === "manual") {
      if (liveAdsCost < 0 || shopAdsCost < 0) {
        CToast.error({ title: "Chi phí quảng cáo không được âm" })
        return
      }

      await createSimpleAds({
        date,
        channel,
        liveAdsCost,
        shopAdsCost,
        currency
      })
      return
    }

    if (previousAdsStatus === "accepted") {
      const requiredFiles = [
        "yesterdayLiveAdsCostFile",
        "yesterdayShopAdsCostFile",
        "todayLiveAdsCostFileBefore4pm",
        "todayShopAdsCostFileBefore4pm"
      ] as const

      const allRequiredFilesUploaded = requiredFiles.every(
        (key) => adsFiles[key].file !== null
      )

      if (!allRequiredFilesUploaded) {
        CToast.error({
          title: "Vui lòng tải lên đủ 4 file chi phí quảng cáo còn lại"
        })
        return
      }

      await createAdsWithSaved({
        files: requiredFiles.map((key) => adsFiles[key].file!).filter(Boolean),
        req: { date, channel, currency }
      })
      return
    }

    const allAdsFilesUploaded = Object.values(adsFiles).every(
      (fileState) => fileState.file !== null
    )

    if (!allAdsFilesUploaded) {
      CToast.error({ title: "Vui lòng tải lên đủ 6 file chi phí quảng cáo" })
      return
    }

    await createAds({
      files: Object.keys(ADS_FILE_LABELS)
        .map((key) => adsFiles[key].file!)
        .filter(Boolean),
      req: { date, channel, currency }
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
                      onClick={(event) => {
                        event.stopPropagation()
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
    const firstTwoEntries = Object.entries(ADS_FILE_LABELS).filter(([key]) =>
      key === "yesterdayLiveAdsCostFileBefore4pm" ||
      key === "yesterdayShopAdsCostFileBefore4pm"
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

    if (previousAdsStatus === "rejected" || previousAdsStatus === "loading") {
      return (
        <>
          {firstTwoEntries.map(([key, label]) => renderAdsDropzone(key, label))}
        </>
      )
    }

    return null
  }

  const legacyFilesReady =
    previousAdsStatus === "accepted"
      ? [
          "yesterdayLiveAdsCostFile",
          "yesterdayShopAdsCostFile",
          "todayLiveAdsCostFileBefore4pm",
          "todayShopAdsCostFileBefore4pm"
        ].every((key) => adsFiles[key].file !== null)
      : Object.values(adsFiles).every((fileState) => fileState.file !== null)

  const canSubmitLegacy =
    legacyMode === "manual" ? true : legacyFilesReady

  const modeExplanation = useMemo(() => {
    if (!date) {
      return "Chọn ngày để hệ thống xác định dùng biểu mẫu ads cũ hay mới."
    }

    return modelLabel
  }, [date, modelLabel])

  return (
    <Stack gap="md" p="sm">
      <Text size="xl" fw={700}>
        Thêm chi phí quảng cáo
      </Text>

      <Alert color={usesNewAdsModel ? "teal" : "blue"} variant="light">
        <Text size="sm">{modeExplanation}</Text>
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
          disabled={isSubmitting}
        />

        <Select
          label="Chọn kênh livestream"
          size="md"
          placeholder="Chọn kênh"
          value={channel}
          onChange={setChannel}
          data={
            channelsData?.data.map((item) => ({
              value: item._id,
              label: item.name
            })) || []
          }
          searchable
          withAsterisk
          className="flex-1"
          disabled={isSubmitting}
        />

        {!usesNewAdsModel && (
          <Select
            label="Tiền tệ"
            size="md"
            value={currency}
            onChange={(value) => setCurrency(value as "vnd" | "usd")}
            data={[
              { value: "vnd", label: "VNĐ" },
              { value: "usd", label: "USD" }
            ]}
            className="flex-1"
            w={120}
            withAsterisk
            disabled={isSubmitting}
          />
        )}
      </Group>

      {usesNewAdsModel ? (
        <>
          <Divider label="Chỉ số ads đầu vào" labelPosition="center" />
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <NumberInput
              label="ROI Protect"
              value={roiProtect}
              onChange={(value) => setRoiProtect(Number(value) || 0)}
              min={0}
              size="md"
              thousandSeparator=","
              disabled={submittingMetrics}
            />
            <NumberInput
              label="GMV hoàn 100%"
              value={fullRefundGmv}
              onChange={(value) => setFullRefundGmv(Number(value) || 0)}
              min={0}
              size="md"
              thousandSeparator=","
              disabled={submittingMetrics}
            />
            <NumberInput
              label="Tiền tín hoàn về"
              value={tinRefundAmount}
              onChange={(value) => setTinRefundAmount(Number(value) || 0)}
              min={0}
              size="md"
              thousandSeparator=","
              disabled={submittingMetrics}
            />
            <NumberInput
              label="TQLQC / khấu trừ ads"
              value={adsTax}
              onChange={(value) => setAdsTax(Number(value) || 0)}
              min={0}
              size="md"
              thousandSeparator=","
              disabled={submittingMetrics}
            />
            <NumberInput
              label="GMV Ads"
              value={gmvAds}
              onChange={(value) => setGmvAds(Number(value) || 0)}
              min={0}
              size="md"
              thousandSeparator=","
              disabled={submittingMetrics}
            />
            <NumberInput
              label="Chi phí affiliate"
              value={affiliateCost}
              onChange={(value) => setAffiliateCost(Number(value) || 0)}
              min={0}
              size="md"
              thousandSeparator=","
              disabled={submittingMetrics}
            />
            <NumberInput
              label="AFF - Hoàn huỷ"
              value={affiliateRefundAmount}
              onChange={(value) => setAffiliateRefundAmount(Number(value) || 0)}
              min={0}
              size="md"
              thousandSeparator=","
              disabled={submittingMetrics}
            />
          </SimpleGrid>

          {existingMetrics && (
            <Alert color="green" variant="light" title="Snapshot hiện có">
              <Text size="sm">
                Ads thực tế:{" "}
                {existingMetrics.actualAdsCost.toLocaleString("vi-VN")} VNĐ.
                Tổng chi phí:{" "}
                {existingMetrics.totalCost.toLocaleString("vi-VN")} VNĐ. Sau
                hoàn/hủy:{" "}
                {existingMetrics.costAfterRefund.toLocaleString("vi-VN")} VNĐ.
              </Text>
            </Alert>
          )}
        </>
      ) : (
        <>
          <SegmentedControl
            value={legacyMode}
            onChange={(value) => setLegacyMode(value as "file" | "manual")}
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
              {legacyMode === "file"
                ? "Tải lên 6 file chi phí quảng cáo cho ngày đã chọn. Sau khi tải lên, hệ thống sẽ xử lý và cập nhật dữ liệu."
                : "Nhập trực tiếp chi phí quảng cáo Live và Shop cho ngày đã chọn."}
            </Text>
          </Alert>

          {legacyMode === "manual" ? (
            <>
              <Divider label="Chi phí quảng cáo" labelPosition="center" />
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <NumberInput
                  label="Live Ads Cost"
                  placeholder="Nhập chi phí Live Ads"
                  value={liveAdsCost}
                  onChange={(value) => setLiveAdsCost(Number(value) || 0)}
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
                  onChange={(value) => setShopAdsCost(Number(value) || 0)}
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

                    if (isFirstTwoFiles && previousAdsStatus !== "idle") {
                      return false
                    }

                    if (isFirstTwoFiles && previousAdsData) {
                      return false
                    }

                    return true
                  })
                  .map(([key, label]) => renderAdsDropzone(key, label))}
              </SimpleGrid>
            </>
          )}
        </>
      )}

      <Group justify="end" mt="md">
        <Button
          variant="outline"
          onClick={() => modals.closeAll()}
          size="md"
          radius="xl"
          disabled={isSubmitting}
        >
          Huỷ
        </Button>
        <Button
          onClick={handleSubmitAdsCost}
          loading={isSubmitting}
          disabled={
            !date ||
            !channel ||
            (!usesNewAdsModel && !canSubmitLegacy) ||
            isSubmitting
          }
          size="md"
          radius="xl"
        >
          {usesNewAdsModel ? "Lưu chỉ số ads" : "Thêm chi phí quảng cáo"}
        </Button>
      </Group>
    </Stack>
  )
}
