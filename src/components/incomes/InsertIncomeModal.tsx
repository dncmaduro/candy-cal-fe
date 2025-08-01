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
  Tooltip
} from "@mantine/core"
import { Dropzone, FileWithPath } from "@mantine/dropzone"
import { DatePickerInput } from "@mantine/dates"
import { IconCheck, IconChevronRight, IconX } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { useIncomes } from "../../hooks/useIncomes"
import { CToast } from "../common/CToast"
import type { InsertIncomeRequest } from "../../hooks/models"

type FileStatus = "pending" | "uploading" | "success" | "error"
type FileKey = "affFile" | "adsFile" | "otherFile"
type FileState = {
  file: FileWithPath | null
  status: FileStatus
}

const LABELS: Record<FileKey, string> = {
  affFile: "Affiliate File",
  adsFile: "Ads File",
  otherFile: "Other File"
}

const TYPE_MAP: Record<FileKey, InsertIncomeRequest["type"]> = {
  affFile: "affiliate",
  adsFile: "ads",
  otherFile: "other"
}

interface Props {
  nextStep: () => void
  refetch: () => void
}

export const InsertIncomeModal = ({ nextStep, refetch }: Props) => {
  const { insertIncome } = useIncomes()
  const [date, setDate] = useState<Date | null>(null)
  const [files, setFiles] = useState<Record<FileKey, FileState>>({
    affFile: { file: null, status: "pending" },
    adsFile: { file: null, status: "pending" },
    otherFile: { file: null, status: "pending" }
  })
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const { mutateAsync: insert } = useMutation({
    mutationFn: async ({
      file,
      req
    }: {
      file: File
      req: InsertIncomeRequest
    }) => insertIncome(file, req),
    onSettled: () => {
      refetch()
    }
  })

  const handleSubmit = async () => {
    setSubmitting(true)

    for (const key of Object.keys(files) as FileKey[]) {
      const item = files[key]
      if (item.file) {
        setFiles((prev) => ({
          ...prev,
          [key]: { ...item, status: "uploading" }
        }))

        try {
          await insert({
            file: item.file,
            req: { type: TYPE_MAP[key], date: date! }
          })
          setFiles((prev) => ({
            ...prev,
            [key]: { ...item, status: "success" }
          }))
          CToast.success({
            title: `Đã gửi ${LABELS[key]}`
          })
        } catch {
          setFiles((prev) => ({
            ...prev,
            [key]: { ...item, status: "error" }
          }))
          CToast.error({
            title: `Gửi ${LABELS[key]} thất bại`
          })
        }
      }
    }
    setSubmitting(false)
    setSent(true)
  }

  const disableSubmit =
    !date || Object.values(files).every((f) => !f.file) || submitting || sent

  const disableDropzone = submitting || sent

  const handleRemove = (key: FileKey) => {
    setFiles((prev) => ({ ...prev, [key]: { file: null, status: "pending" } }))
  }

  const getStatusIcon = (status: FileStatus) => {
    if (status === "uploading") return <Loader size={16} />
    if (status === "success") return <IconCheck color="green" size={18} />
    if (status === "error") return <IconX color="red" size={18} />
    return null
  }

  const renderDropzone = (key: FileKey) => {
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
      <Text size="xl" fw={700} mb={2}>
        Thêm doanh thu theo ngày
      </Text>
      <DatePickerInput
        label="Chọn ngày"
        size="md"
        placeholder="Chọn ngày"
        value={date}
        onChange={setDate}
        maxDate={new Date()}
        withAsterisk
        className="max-w-[210px]"
        disabled={submitting || sent}
      />

      <Stack align="start" justify="center" gap="sm">
        {renderDropzone("affFile")}
        <Divider orientation="vertical" />
        {renderDropzone("adsFile")}
        <Divider orientation="vertical" />
        {renderDropzone("otherFile")}
      </Stack>

      <Group justify="end" mt="md">
        <Button
          onClick={handleSubmit}
          disabled={disableSubmit}
          loading={submitting}
          size="md"
          radius="xl"
        >
          {submitting ? "Đang gửi..." : "Gửi file"}
        </Button>
        {sent && (
          <Button
            rightSection={<IconChevronRight size={16} />}
            size="md"
            radius="xl"
            onClick={nextStep}
          >
            Cập nhật trạng thái affiliate
          </Button>
        )}
      </Group>
      {sent && (
        <Box pt={4}>
          <Text size="sm" c="teal" fw={500}>
            Đã gửi xong. Không thể nhập lại file mới.
          </Text>
        </Box>
      )}
    </Stack>
  )
}
