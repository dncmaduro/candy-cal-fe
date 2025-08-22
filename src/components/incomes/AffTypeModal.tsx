import { useState } from "react"
import {
  Button,
  Stack,
  Text,
  Paper,
  Group,
  CloseButton,
  Loader,
  Tooltip,
  Box
} from "@mantine/core"
import { Dropzone, FileWithPath } from "@mantine/dropzone"
import { useMutation } from "@tanstack/react-query"
import { IconCheck, IconX } from "@tabler/icons-react"
import { useIncomes } from "../../hooks/useIncomes"

type FileStatus = "pending" | "uploading" | "success" | "error"

interface Props {
  resetStep: () => void
  nextStep: () => void
  refetch: () => void
}

export const AffTypeModal = ({ resetStep, nextStep, refetch }: Props) => {
  const { updateAffiliateType } = useIncomes()
  const [file, setFile] = useState<FileWithPath | null>(null)
  const [status, setStatus] = useState<FileStatus>("pending")
  const [sent, setSent] = useState(false)

  const { mutateAsync: updateAffType, isPending: submitting } = useMutation({
    mutationFn: async (file: File) => updateAffiliateType(file),
    onSuccess: () => {
      setStatus("success")
      setSent(true)
    },
    onError: () => {
      setStatus("error")
      setSent(true)
    },
    onSettled: () => {
      resetStep()
      refetch()
    }
  })

  const handleSubmit = () => {
    if (file) {
      updateAffType(file)
    }
  }

  const disableDropzone = !!file || submitting || sent
  const disableSubmit = !file || submitting || sent

  const handleRemove = () => {
    setFile(null)
    setStatus("pending")
  }

  const getStatusIcon = (status: FileStatus) => {
    if (status === "uploading") return <Loader size={16} />
    if (status === "success") return <IconCheck color="green" size={18} />
    if (status === "error") return <IconX color="red" size={18} />
    return null
  }

  return (
    <Stack gap="md" p="sm" align="center">
      <Text size="xl" fw={700} mb={2}>
        Cập nhật bảng loại Affiliate
      </Text>

      <Paper p="md" radius="lg" shadow="sm" withBorder w={"100%"}>
        <Stack gap={6}>
          <Text fw={600}>Affiliate Type File</Text>
          <Dropzone
            onDrop={(filesArr) => {
              setFile(filesArr[0])
              setStatus("pending")
            }}
            maxFiles={1}
            w={"100%"}
            accept={[".xlsx", ".xls", ".csv"]}
            className="flex min-h-[110px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-blue-400"
            disabled={disableDropzone}
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
                        handleRemove()
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

      <Group justify="end" mt="md" w="100%">
        <Button
          onClick={handleSubmit}
          disabled={disableSubmit}
          loading={submitting}
          size="md"
          radius="xl"
        >
          {submitting ? "Đang gửi..." : "Gửi file"}
        </Button>
      </Group>

      {sent && (
        <Box pt={4}>
          <Text size="sm" c={status === "success" ? "teal" : "red"} fw={500}>
            {status === "success"
              ? "Đã cập nhật thành công. Không thể nhập lại file mới."
              : "Cập nhật thất bại. Vui lòng thử lại hoặc liên hệ admin."}
          </Text>
        </Box>
      )}
      {status === "success" && (
        <Group justify="end" w={"100%"} mt="sm">
          <Button
            onClick={nextStep}
            size="md"
            radius="xl"
            rightSection={<IconCheck size={16} />}
          >
            Thêm doanh thu ads
          </Button>
        </Group>
      )}
    </Stack>
  )
}
