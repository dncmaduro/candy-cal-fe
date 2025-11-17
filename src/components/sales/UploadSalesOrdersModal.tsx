import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button, Group, Stack, Text, FileButton, Divider } from "@mantine/core"
import {
  IconUpload,
  IconFileSpreadsheet,
  IconDownload
} from "@tabler/icons-react"
import { useSalesOrders } from "../../hooks/useSalesOrders"
import { CToast } from "../common/CToast"

interface Props {
  onSuccess: () => void
}

export const UploadSalesOrdersModal = ({ onSuccess }: Props) => {
  const { uploadSalesOrders, downloadSalesOrdersTemplate } = useSalesOrders()
  const [file, setFile] = useState<File | null>(null)

  const { mutate: uploadFile, isPending } = useMutation({
    mutationFn: (file: File) => uploadSalesOrders(file),
    onSuccess: () => {
      CToast.success({
        title: "Upload thành công - Dữ liệu đơn hàng đã được import"
      })
      onSuccess()
    },
    onError: (error: any) => {
      CToast.error({
        title: error?.response?.data?.message || "Có lỗi xảy ra khi upload file"
      })
    }
  })

  const { mutate: downloadTemplate, isPending: isDownloading } = useMutation({
    mutationFn: () => downloadSalesOrdersTemplate(),
    onSuccess: (response) => {
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `sales-orders-template-${new Date().getTime()}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      CToast.success({
        title: "Đã tải xuống template thành công"
      })
    },
    onError: () => {
      CToast.error({
        title: "Có lỗi xảy ra khi tải template"
      })
    }
  })

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile)
  }

  const handleUpload = () => {
    if (!file) {
      CToast.error({
        title: "Vui lòng chọn file XLSX để upload"
      })
      return
    }

    uploadFile(file)
  }

  const handleDownloadTemplate = () => {
    downloadTemplate()
  }

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Upload file Excel (.xlsx) để import danh sách đơn hàng. File cần có các
        cột: Khách hàng, Sản phẩm, Số lượng, Giá, Thuế, Phí ship, v.v.
      </Text>

      {/* Download Template Section */}
      <Button
        leftSection={<IconDownload size={16} />}
        onClick={handleDownloadTemplate}
        loading={isDownloading}
        variant="outline"
        fullWidth
      >
        Tải template mẫu
      </Button>

      <Divider label="Hoặc" labelPosition="center" />

      {/* Upload Section */}
      <FileButton
        onChange={handleFileSelect}
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      >
        {(props) => (
          <Button
            {...props}
            leftSection={<IconFileSpreadsheet size={16} />}
            variant="light"
            fullWidth
          >
            {file ? file.name : "Chọn file XLSX"}
          </Button>
        )}
      </FileButton>

      {file && (
        <Text size="sm" c="dimmed">
          Đã chọn: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)}{" "}
          KB)
        </Text>
      )}

      <Group justify="flex-end" mt="md">
        <Button
          leftSection={<IconUpload size={16} />}
          onClick={handleUpload}
          loading={isPending}
          disabled={!file}
        >
          Upload
        </Button>
      </Group>
    </Stack>
  )
}
