import { useState } from "react"
import {
  Button,
  Divider,
  Group,
  Stack,
  Text,
  Paper,
  CloseButton,
  Loader,
  Tooltip,
  Alert
} from "@mantine/core"
import { Dropzone, FileWithPath } from "@mantine/dropzone"
import { IconCheck, IconX } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { useLivestreamPerformance } from "../../hooks/useLivestreamPerformance"
import { CToast } from "../common/CToast"
import { modals } from "@mantine/modals"
import { format } from "date-fns"

type FileStatus = "pending" | "uploading" | "success" | "error"
type FileState = {
  file: FileWithPath | null
  status: FileStatus
}

const LABELS = {
  totalIncome: "File tổng doanh thu",
  sourceSplit: "File tách nguồn"
}

interface Props {
  date: Date
  refetch: () => void
}

export const CalculateIncomeModal = ({ date, refetch }: Props) => {
  const { calculateLivestreamRealIncome } = useLivestreamPerformance()
  const [files, setFiles] = useState<Record<keyof typeof LABELS, FileState>>({
    totalIncome: { file: null, status: "pending" },
    sourceSplit: { file: null, status: "pending" }
  })

  const { mutateAsync: calculateRealIncome, isPending: calculating } =
    useMutation({
      mutationFn: async ({
        files: fileList,
        req
      }: {
        files: File[]
        req: { date: Date }
      }) => calculateLivestreamRealIncome(fileList, req),
      onSuccess: () => {
        setFiles((prev) => ({
          ...prev,
          totalIncome: { ...prev.totalIncome, status: "success" },
          sourceSplit: { ...prev.sourceSplit, status: "success" }
        }))
        CToast.success({ title: "Đã gửi files thành công" })
        modals.closeAll()
      },
      onError: () => {
        setFiles((prev) => ({
          ...prev,
          totalIncome: { ...prev.totalIncome, status: "error" },
          sourceSplit: { ...prev.sourceSplit, status: "error" }
        }))
        CToast.error({ title: "Gửi files thất bại" })
      },
      onSettled: () => refetch()
    })

  const handleCalculate = async () => {
    if (!files.totalIncome.file || !files.sourceSplit.file) {
      CToast.error({ title: "Vui lòng chọn đủ 2 file" })
      return
    }

    setFiles((prev) => ({
      ...prev,
      totalIncome: { ...prev.totalIncome, status: "uploading" },
      sourceSplit: { ...prev.sourceSplit, status: "uploading" }
    }))

    await calculateRealIncome({
      files: [files.totalIncome.file, files.sourceSplit.file],
      req: { date }
    })
  }

  const disabled =
    !files.totalIncome.file || !files.sourceSplit.file || calculating

  const disableDropzone = calculating

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

  return (
    <Stack gap="md" p="sm">
      <Text size="xl" fw={700}>
        Tính doanh thu thực
      </Text>

      <Alert title="Lưu ý" color="yellow" variant="light">
        <Text size="sm">
          Sau khi tải file lên, hệ thống sẽ chạy ngầm việc tính toán doanh thu
          thực, vui lòng chờ thông báo của hệ thống và kiểm tra.
        </Text>
      </Alert>

      <Paper p="md" radius="md" withBorder>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" fw={600} c="dimmed">
              Ngày:
            </Text>
            <Text size="sm" fw={600}>
              {format(date, "dd/MM/yyyy")}
            </Text>
          </Group>
        </Stack>
      </Paper>

      <Stack align="start" justify="center" gap="sm">
        {renderDropzone("totalIncome")}
        <Divider orientation="vertical" />
        {renderDropzone("sourceSplit")}
      </Stack>

      <Group justify="end" mt="md">
        <Button
          onClick={handleCalculate}
          disabled={disabled}
          loading={calculating}
          size="md"
          radius="xl"
        >
          {calculating ? "Đang gửi..." : "Gửi files"}
        </Button>
      </Group>
    </Stack>
  )
}
