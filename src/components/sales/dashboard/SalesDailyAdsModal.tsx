import { Box, Button, Group, NumberInput, Stack } from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { modals } from "@mantine/modals"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { IconDeviceFloppy } from "@tabler/icons-react"
import { Controller, useForm } from "react-hook-form"
import { SalesDailyAdsItem } from "../../../hooks/models"
import { useSalesDailyAds } from "../../../hooks/useSalesDailyAds"
import { CToast } from "../../common/CToast"

type SalesDailyAdsFormValues = { date: Date; adsCost: number; newLeads: number }

export const SalesDailyAdsModal = ({
  initialAds,
  onSaved
}: {
  initialAds?: SalesDailyAdsItem
  onSaved?: () => void
}) => {
  const { upsertSalesDailyAds } = useSalesDailyAds()
  const queryClient = useQueryClient()
  const { control, handleSubmit } = useForm<SalesDailyAdsFormValues>({
    defaultValues: {
      date: initialAds ? new Date(initialAds.date) : new Date(new Date().setHours(0, 0, 0, 0)),
      adsCost: initialAds?.adsCost ?? 0,
      newLeads: initialAds?.newLeads ?? 0
    }
  })
  const { mutate: save, isPending } = useMutation({
    mutationFn: (values: SalesDailyAdsFormValues) =>
      upsertSalesDailyAds({ date: new Date(values.date), adsCost: values.adsCost, newLeads: values.newLeads }),
    onSuccess: () => {
      CToast.success({ title: "Lưu chi phí ads thành công" })
      void queryClient.invalidateQueries({ queryKey: ["salesDailyAds"] })
      void queryClient.invalidateQueries({ queryKey: ["salesRevenue"] })
      onSaved?.()
      modals.closeAll()
    },
    onError: () => CToast.error({ title: "Lưu chi phí ads thất bại" })
  })

  return (
    <Box component="section">
      <form onSubmit={handleSubmit((values) => save(values))}>
        <Stack gap="md">
          <Controller name="date" control={control} render={({ field }) => (
            <DatePickerInput {...field} label="Ngày" valueFormat="DD/MM/YYYY" required withAsterisk />
          )} />
          <Controller name="adsCost" control={control} rules={{ min: 0 }} render={({ field }) => (
            <NumberInput {...field} label="Chi phí ads" thousandSeparator="." min={0} required withAsterisk leftSection="đ" />
          )} />
          <Controller name="newLeads" control={control} rules={{ min: 0 }} render={({ field }) => (
            <NumberInput {...field} label="Số Lead mới" thousandSeparator="." min={0} required withAsterisk/>
          )} />
          <Group justify="flex-end">
            <Button type="button" variant="subtle" onClick={() => modals.closeAll()} disabled={isPending}>Huỷ</Button>
            <Button type="submit" leftSection={<IconDeviceFloppy size={16} />} loading={isPending}>Lưu chi phí ads</Button>
          </Group>
        </Stack>
      </form>
    </Box>
  )
}
