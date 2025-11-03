import { useState } from "react"
import { Button, FileButton, Group, Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { modals } from "@mantine/modals"
import { IconFileSpreadsheet, IconCheck, IconX } from "@tabler/icons-react"
import { useSalesItems } from "../../hooks/useSalesItems"

interface UploadSalesItemsModalProps {
  onSuccess: () => void
}

export const UploadSalesItemsModal = ({
  onSuccess
}: UploadSalesItemsModalProps) => {
  const { uploadSalesItems } = useSalesItems()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    if (!selectedFile) {
      notifications.show({
        title: "Lỗi",
        message: "Vui lòng chọn file",
        color: "red",
        icon: <IconX />
      })
      return
    }

    setUploading(true)
    try {
      await uploadSalesItems(selectedFile)
      notifications.show({
        title: "Thành công",
        message: "Đồng bộ file thành công",
        color: "green",
        icon: <IconCheck />
      })
      onSuccess()
    } catch (error) {
      notifications.show({
        title: "Lỗi",
        message: "Không thể đồng bộ file",
        color: "red",
        icon: <IconX />
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Text size="sm" c="dimmed">
        Chọn file Excel hoặc CSV chứa danh sách sản phẩm để đồng bộ
      </Text>

      <FileButton
        onChange={setSelectedFile}
        accept=".xlsx,.xls,.csv"
        disabled={uploading}
      >
        {(props) => (
          <Button
            {...props}
            variant="light"
            fullWidth
            leftSection={<IconFileSpreadsheet size={16} />}
          >
            {selectedFile ? "Chọn file khác" : "Chọn file"}
          </Button>
        )}
      </FileButton>

      {selectedFile && (
        <div className="rounded-lg bg-gray-50 p-3">
          <Text size="sm" fw={500}>
            File đã chọn:
          </Text>
          <Text size="sm" c="dimmed">
            {selectedFile.name}
          </Text>
          <Text size="xs" c="dimmed">
            {(selectedFile.size / 1024).toFixed(2)} KB
          </Text>
        </div>
      )}

      <Group justify="flex-end" mt="md">
        <Button
          variant="subtle"
          onClick={() => modals.closeAll()}
          disabled={uploading}
        >
          Hủy
        </Button>
        <Button onClick={handleUpload} loading={uploading}>
          Đồng bộ
        </Button>
      </Group>
    </div>
  )
}
