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
  Alert,
  Select
} from "@mantine/core"
import { Dropzone, FileWithPath } from "@mantine/dropzone"
import { DatePickerInput } from "@mantine/dates"
import { IconCheck, IconX } from "@tabler/icons-react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useIncomes } from "../../hooks/useIncomes"
import { useLivestream } from "../../hooks/useLivestream"
import { CToast } from "../common/CToast"
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

interface Props {
  refetch: () => void
}

export const InsertIncomeModalV2 = ({ refetch }: Props) => {
  const { insertIncomeAndUpdateSource } = useIncomes()
  const { searchLivestreamChannels } = useLivestream()
  const [date, setDate] = useState<Date | null>(null)
  const [channel, setChannel] = useState<string | null>(null)
  const [files, setFiles] = useState<Record<keyof typeof LABELS, FileState>>({
    totalIncome: { file: null, status: "pending" },
    sourceSplit: { file: null, status: "pending" }
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

  const { mutateAsync: insertAndUpdate, isPending: insertingIncomes } =
    useMutation({
      mutationFn: async ({
        files: fileList,
        req
      }: {
        files: File[]
        req: { date: Date; channel: string }
      }) => insertIncomeAndUpdateSource(fileList, req),
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
      onSettled: () => {
        refetch()
      }
    })

  const handleInsertIncomes = async () => {
    if (
      !date ||
      !channel ||
      !files.totalIncome.file ||
      !files.sourceSplit.file
    ) {
      CToast.error({ title: "Vui lòng chọn ngày, kênh và đủ 2 file" })
      return
    }

    setFiles((prev) => ({
      ...prev,
      totalIncome: { ...prev.totalIncome, status: "uploading" },
      sourceSplit: { ...prev.sourceSplit, status: "uploading" }
    }))

    await insertAndUpdate({
      files: [files.totalIncome.file, files.sourceSplit.file],
      req: { date, channel }
    })
  }

  const disabledInsertIncomes =
    !date ||
    !channel ||
    !files.totalIncome.file ||
    !files.sourceSplit.file ||
    insertingIncomes

  const disableDropzone = insertingIncomes

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
        Thêm doanh thu theo ngày
      </Text>
      <Alert title="Lưu ý" color="yellow" variant="light">
        <Text size="sm">
          Sau khi tải file lên, hệ thống sẽ chạy ngầm việc thêm doanh thu, vui
          lòng chờ thông báo của hệ thống và kiểm tra. Trong thời gian đó, bạn
          vẫn có thể đóng cửa sổ này và làm việc khác.
        </Text>
      </Alert>

      <Group align="flex-end" gap={12} w={"100%"}>
        <DatePickerInput
          label="Chọn ngày"
          size="md"
          placeholder="Chọn ngày"
          value={date}
          onChange={setDate}
          maxDate={new Date()}
          withAsterisk
          className="flex-1"
          disabled={insertingIncomes}
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
          disabled={insertingIncomes}
        />
      </Group>

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
    </Stack>
  )
}
