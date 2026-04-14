import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import {
  Button,
  FileInput,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Tooltip
} from "@mantine/core"
import { modals } from "@mantine/modals"
import {
  IconBrandTiktok,
  IconDownload,
  IconEye,
  IconUpload
} from "@tabler/icons-react"

import { useProducts } from "../../hooks/useProducts"
import { useCalResultStore } from "../../store/calResultStore"
import type { ProductsCalResult } from "../../store/calResultStore"
import { CalFileResultModal } from "../cal/CalFileResultModal"
import { CToast } from "../common/CToast"

type Props = {
  compact?: boolean
  enableSaveLog?: boolean
}

export const TiktokXlsxCalculator = ({
  compact = false,
  enableSaveLog = true
}: Props) => {
  const { calFile } = useProducts()
  const { lastProductsResult, setLastProductsResult } = useCalResultStore()
  const [xlsxFile, setXlsxFile] = useState<File | null>(null)

  const { mutate: calXlsxMutation, isPending: isCalculating } = useMutation({
    mutationFn: calFile,
    onSuccess: (response) => {
      CToast.success({ title: "Tính toán từ file Excel thành công" })

      const calResult: ProductsCalResult = {
        items: response.data.items || [],
        orders: response.data.orders || [],
        timestamp: new Date().toISOString()
      }

      setLastProductsResult(calResult)

      modals.open({
        title: (
          <Text fw={700} fz="lg">
            Kết quả tính toán từ file Excel
          </Text>
        ),
        children: (
          <CalFileResultModal
            items={calResult.items}
            orders={calResult.orders}
            allowSaveLog={enableSaveLog}
            modalTitle="Kết quả tính toán từ file Excel"
            modalSubtitle="Kiểm tra mặt hàng tổng hợp và tiến hành đóng đơn theo danh sách đã chọn."
          />
        ),
        size: "80vw"
      })
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi tính toán file Excel" })
    }
  })

  const handleCalXlsx = () => {
    if (!xlsxFile) return

    calXlsxMutation(xlsxFile)
    setXlsxFile(null)
  }

  const handleViewLastResult = () => {
    if (!lastProductsResult) return

    modals.open({
      title: (
        <Text fw={700} fz="lg">
          Kết quả tính toán gần nhất
        </Text>
      ),
        children: (
          <CalFileResultModal
            items={lastProductsResult.items}
            orders={lastProductsResult.orders}
            allowSaveLog={enableSaveLog}
            modalTitle="Kết quả tính toán gần nhất"
            modalSubtitle="Kiểm tra mặt hàng tổng hợp và tiến hành đóng đơn theo danh sách đã chọn."
          />
        ),
      size: "80vw"
    })
  }

  return (
    <Paper withBorder p={compact ? "sm" : "lg"} radius="md">
      <Stack gap={compact ? "sm" : "lg"}>
        {!compact && (
          <Group gap="sm" align="flex-start">
            <ThemeIcon size={40} radius="xl" variant="light" color="dark">
              <IconBrandTiktok size={20} />
            </ThemeIcon>
            <div>
              <Text fw={700}>TikTok Shop</Text>
              <Text size="sm" c="dimmed">
                Tính toán từ file XLSX cho SKU TikTok Shop.
              </Text>
            </div>
          </Group>
        )}

        <Group align="end" gap={10} wrap="wrap">
          <FileInput
            label="Excel"
            placeholder="Chọn file .xlsx/.xls"
            accept=".xlsx,.xls"
            value={xlsxFile}
            onChange={setXlsxFile}
            leftSection={<IconUpload size={16} />}
            w={{ base: "100%", sm: 260 }}
          />

          <Button
            color="green"
            leftSection={<IconDownload size={16} />}
            onClick={handleCalXlsx}
            disabled={!xlsxFile}
            loading={isCalculating}
            style={{ alignSelf: "end" }}
            size="sm"
          >
            Tính toán
          </Button>

          {lastProductsResult && (
            <Tooltip
              label={`Kết quả từ: ${new Date(
                lastProductsResult.timestamp
              ).toLocaleString("vi-VN")}`}
              withArrow
            >
              <Button
                variant="light"
                color="blue"
                leftSection={<IconEye size={16} />}
                onClick={handleViewLastResult}
                style={{ alignSelf: "end" }}
                size="sm"
              >
                Xem gần nhất
              </Button>
            </Tooltip>
          )}
        </Group>
      </Stack>
    </Paper>
  )
}
