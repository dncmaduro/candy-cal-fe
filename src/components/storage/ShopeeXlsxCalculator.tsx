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
  IconBrandShopee,
  IconDownload,
  IconEye,
  IconUpload
} from "@tabler/icons-react"
import type { AxiosResponse } from "axios"

import { useShopeeProducts } from "../../hooks/useShopeeProducts"
import { useCalResultStore } from "../../store/calResultStore"
import type { CalResult } from "../../store/calResultStore"
import type { CalXlsxShopeeResponse } from "../../hooks/models"
import { ShopeeCalResultModal } from "./ShopeeCalResultModal"
import { CToast } from "../common/CToast"

type Props = {
  compact?: boolean
}

export const ShopeeXlsxCalculator = ({ compact = false }: Props) => {
  const { calShopeeByXlsx } = useShopeeProducts()
  const { lastShopeeResult, setLastShopeeResult } = useCalResultStore()
  const [xlsxFile, setXlsxFile] = useState<File | null>(null)

  const { mutate: calXlsxMutation, isPending: isCalculating } = useMutation({
    mutationFn: calShopeeByXlsx,
    onSuccess: (response: AxiosResponse<CalXlsxShopeeResponse>) => {
      CToast.success({ title: "Tính toán từ file Excel thành công" })

      const items: CalResult["items"] = Array.isArray(response.data?.items)
        ? response.data.items
        : response.data?.items
          ? [response.data.items]
          : []

      const orders: CalResult["orders"] = Array.isArray(response.data?.orders)
        ? response.data.orders
        : response.data?.orders
          ? [response.data.orders]
          : []

      const calResult: CalResult = {
        items,
        orders,
        timestamp: new Date().toISOString()
      }

      setLastShopeeResult(calResult)

      modals.open({
        title: (
          <Text fw={700} fz="lg">
            Kết quả tính toán từ file Excel Shopee
          </Text>
        ),
        children: <ShopeeCalResultModal items={items} orders={orders} />,
        size: "70vw"
      })
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi tính toán file Excel" })
    }
  })

  const handleCalXlsx = () => {
    if (!xlsxFile) return

    calXlsxMutation({ file: xlsxFile })
    setXlsxFile(null)
  }

  const handleViewLastResult = () => {
    if (!lastShopeeResult) return

    modals.open({
      title: (
        <Text fw={700} fz="lg">
          Kết quả tính toán gần nhất
        </Text>
      ),
      children: (
        <ShopeeCalResultModal
          items={lastShopeeResult.items}
          orders={lastShopeeResult.orders}
        />
      ),
      size: "70vw"
    })
  }

  return (
    <Paper withBorder p={compact ? "sm" : "lg"} radius="md">
      <Stack gap={compact ? "sm" : "lg"}>
        {!compact && (
          <Group gap="sm" align="flex-start">
            <ThemeIcon size={40} radius="xl" variant="light" color="orange">
              <IconBrandShopee size={20} />
            </ThemeIcon>
            <div>
              <Text fw={700}>Shopee</Text>
              <Text size="sm" c="dimmed">
                Tính toán từ file XLSX cho SKU Shopee.
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

          {lastShopeeResult && (
            <Tooltip
              label={`Kết quả từ: ${new Date(
                lastShopeeResult.timestamp
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
