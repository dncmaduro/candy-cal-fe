import { Button, Group, Select, Stack, Text } from "@mantine/core"
import { modals } from "@mantine/modals"
import { useMutation, useQuery } from "@tanstack/react-query"
import { IconRepeat } from "@tabler/icons-react"
import { useState } from "react"
import { useSalesLeads, type AvailableCs } from "../../hooks/useSalesLeads"
import { CToast } from "../common/CToast"

interface TransferSalesLeadModalProps {
  leadCaseId: string
  currentSalesCsId?: string
  onSuccess?: () => void
}

export const TransferSalesLeadModal = ({
  leadCaseId,
  currentSalesCsId,
  onSuccess
}: TransferSalesLeadModalProps) => {
  const { availableCs, transfer } = useSalesLeads()
  const [salesCsId, setSalesCsId] = useState<string | null>(null)
  const availableCsQuery = useQuery({
    queryKey: ["salesLeads", "availableCs"],
    queryFn: availableCs,
    select: (response) => response.data as AvailableCs[]
  })
  const options = (availableCsQuery.data || [])
    .filter((row) => row.salesCsId._id !== currentSalesCsId)
    .map((row) => ({
      value: row.salesCsId._id,
      label: row.salesCsId.name || row.salesCsId.username
    }))
  const mutation = useMutation({
    mutationFn: () => {
      if (!salesCsId) throw new Error("Chưa chọn nhân viên CSKH")
      return transfer(leadCaseId, salesCsId)
    },
    onSuccess: () => {
      CToast.success({ title: "Đã chuyển khách hàng" })
      onSuccess?.()
      modals.closeAll()
    },
    onError: (error: any) => {
      CToast.error({ title: error?.message || "Không thể chuyển khách hàng" })
    }
  })

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Khách hàng sẽ được chuyển cho nhân viên CSKH mới. Lịch sử chăm sóc vẫn được lưu lại.
      </Text>
      <Select
        label="Nhân viên CSKH nhận khách"
        placeholder={availableCsQuery.isLoading ? "Đang tải..." : "Chọn nhân viên"}
        data={options}
        value={salesCsId}
        onChange={setSalesCsId}
        searchable
        clearable
        required
      />
      <Group justify="flex-end">
        <Button variant="default" onClick={() => modals.closeAll()} disabled={mutation.isPending}>
          Hủy
        </Button>
        <Button
          leftSection={<IconRepeat size={16} />}
          loading={mutation.isPending}
          disabled={!salesCsId}
          onClick={() => mutation.mutate()}
        >
          Chuyển khách hàng
        </Button>
      </Group>
    </Stack>
  )
}
