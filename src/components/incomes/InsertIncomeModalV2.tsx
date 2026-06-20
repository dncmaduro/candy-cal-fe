import { useState } from "react"
import {
  Button,
  Divider,
  Group,
  SegmentedControl,
  Stack,
  Text,
  Paper,
  CloseButton,
  Tooltip,
  Alert,
  Select
} from "@mantine/core"
import { Dropzone, FileWithPath } from "@mantine/dropzone"
import { DatePickerInput } from "@mantine/dates"
import { useQuery } from "@tanstack/react-query"
import { useLivestreamChannels } from "../../hooks/useLivestreamChannels"
import { CToast } from "../common/CToast"
import { modals } from "@mantine/modals"
import { startIncomeImportTask } from "../../services/incomeImportTask"
import { useIncomeImportTaskStore } from "../../store/incomeImportTaskStore"

type FileState = {
  file: FileWithPath | null
}

const LABELS = {
  totalIncome: "File tổng doanh thu",
  sourceSplit: "File tách nguồn"
}

interface Props {
  refetch: () => void
}

export const InsertIncomeModalV2 = ({ refetch }: Props) => {
  const { searchLivestreamChannels } = useLivestreamChannels()
  const activeTask = useIncomeImportTaskStore((state) => state.task)
  const [updateMode, setUpdateMode] = useState<"full" | "status-only">("full")
  const [date, setDate] = useState<Date | null>(null)
  const [channel, setChannel] = useState<string | null>(null)
  const [files, setFiles] = useState<Record<keyof typeof LABELS, FileState>>({
    totalIncome: { file: null },
    sourceSplit: { file: null }
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

  const taskRunning =
    activeTask?.status === "preparing" || activeTask?.status === "uploading"

  const handleInsertIncomes = () => {
    const missingSourceSplit = updateMode === "full" && !files.sourceSplit.file

    if (!date || !channel || !files.totalIncome.file || missingSourceSplit) {
      CToast.error({
        title:
          updateMode === "status-only"
            ? "Vui lòng chọn ngày, kênh và file tổng đơn"
            : "Vui lòng chọn ngày, kênh và đủ 2 file"
      })
      return
    }

    const started = startIncomeImportTask({
      totalIncomeFile: files.totalIncome.file,
      affiliateFile: files.sourceSplit.file || undefined,
      date,
      channel,
      updateMode,
      onComplete: refetch
    })

    if (!started) {
      CToast.error({ title: "Một tác vụ import khác đang chạy" })
      return
    }

    modals.closeAll()
    CToast.success({ title: "Đã bắt đầu xử lý các file" })
  }

  const disabledInsertIncomes =
    !date ||
    !channel ||
    !files.totalIncome.file ||
    (updateMode === "full" && !files.sourceSplit.file) ||
    taskRunning

  const disableDropzone = taskRunning

  const handleRemove = (key: keyof typeof LABELS) => {
    setFiles((prev) => ({ ...prev, [key]: { file: null } }))
  }

  const renderDropzone = (key: keyof typeof LABELS) => {
    const { file } = files[key]
    return (
      <Paper p="md" w={"100%"} radius="lg" shadow="sm" withBorder>
        <Stack gap={6}>
          <Text fw={600}>{LABELS[key]}</Text>
          <Dropzone
            onDrop={(filesArr) =>
              setFiles((prev) => ({
                ...prev,
                [key]: { file: filesArr[0] }
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
                  <CloseButton
                    ml={6}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(key)
                    }}
                  />
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
          {updateMode === "status-only"
            ? "Chế độ này chỉ cập nhật trạng thái hoàn/hủy từ file tổng đơn, không xóa và import lại doanh thu."
            : "Sau khi tải file lên, hệ thống sẽ chạy ngầm việc thêm doanh thu, vui lòng chờ thông báo của hệ thống và kiểm tra. Trong thời gian đó, bạn vẫn có thể đóng cửa sổ này và làm việc khác."}
        </Text>
      </Alert>

      <SegmentedControl
        value={updateMode}
        onChange={(value) => setUpdateMode(value as "full" | "status-only")}
        data={[
          { label: "Cập nhật doanh thu", value: "full" },
          { label: "Chỉ cập nhật trạng thái đơn hàng", value: "status-only" }
        ]}
      />

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
          valueFormat="DD/MM/YYYY"
          disabled={taskRunning}
        />

        <Select
          label="Chọn kênh Tiktokshop"
          size="md"
          placeholder="Chọn kênh"
          value={channel}
          onChange={setChannel}
          data={
            channelsData?.data
              .filter((ch) => ch.platform === "tiktokshop")
              .map((ch) => ({
                value: ch._id,
                label: ch.name
              })) || []
          }
          searchable
          withAsterisk
          className="flex-1"
          disabled={taskRunning}
        />
      </Group>

      <Stack align="start" justify="center" gap="sm">
        {renderDropzone("totalIncome")}
        {updateMode === "full" && (
          <>
            <Divider orientation="vertical" />
            {renderDropzone("sourceSplit")}
          </>
        )}
      </Stack>

      <Group justify="end" mt="md">
        <Button
          onClick={handleInsertIncomes}
          disabled={disabledInsertIncomes}
          size="md"
          radius="xl"
        >
          Bắt đầu xử lý các file
        </Button>
      </Group>
    </Stack>
  )
}
