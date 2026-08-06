import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button, Divider, FileButton, Group, Stack, Text } from "@mantine/core"
import {
  IconDownload,
  IconFileSpreadsheet,
  IconUpload
} from "@tabler/icons-react"
import { useSalesItems } from "../../hooks/useSalesItems"
import { CToast } from "../common/CToast"

type Props = {
  onSuccess: () => void
}

export const UploadSalesInventoryModal = ({ onSuccess }: Props) => {
  const { uploadSalesInventory, downloadSalesInventoryTemplate } =
    useSalesItems()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const mutation = useMutation({
    mutationFn: uploadSalesInventory,
    onSuccess: (response) => {
      const result = response.data
      CToast.success({ title: `Đã nhập kho ${result.imported} dòng hàng` })
      if (result.warnings?.length) {
        CToast.error({ title: result.warnings[0] })
      }
      onSuccess()
    },
    onError: (error: any) => {
      CToast.error({
        title: error?.response?.data?.message || "Có lỗi xảy ra khi nhập kho"
      })
    }
  })
  const templateMutation = useMutation({
    mutationFn: downloadSalesInventoryTemplate,
    onSuccess: (response) => {
      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "nhapkho-template.xlsx"
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    },
    onError: () => CToast.error({ title: "Không thể tải template nhập kho" })
  })

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Dùng đúng template tải về. Header phải viết HOA; hệ thống tìm theo MÃ
        HÀNG = code sản phẩm và lấy số lượng tại cột XUẤT TRONG KỲ của template.
      </Text>
      <Button
        leftSection={<IconDownload size={16} />}
        variant="outline"
        fullWidth
        onClick={() => templateMutation.mutate()}
        loading={templateMutation.isPending}
      >
        Tải template nhập hàng
      </Button>
      <Divider label="Sau đó" labelPosition="center" />
      <FileButton
        onChange={setSelectedFile}
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      >
        {(props) => (
          <Button
            {...props}
            leftSection={<IconFileSpreadsheet size={16} />}
            variant="light"
            fullWidth
          >
            {selectedFile ? selectedFile.name : "Chọn file tồn kho"}
          </Button>
        )}
      </FileButton>
      {selectedFile && (
        <Text size="sm" c="dimmed">
          Đã chọn: <b>{selectedFile.name}</b>
        </Text>
      )}
      <Group justify="flex-end">
        <Button
          leftSection={<IconUpload size={16} />}
          onClick={() => selectedFile && mutation.mutate(selectedFile)}
          loading={mutation.isPending}
          disabled={!selectedFile}
        >
          Nhập kho
        </Button>
      </Group>
    </Stack>
  )
}
