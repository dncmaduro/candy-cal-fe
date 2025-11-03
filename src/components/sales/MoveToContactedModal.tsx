import { Button, Group, Stack, TextInput, Select } from "@mantine/core"
import { modals } from "@mantine/modals"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { CToast } from "../common/CToast"
import { useSalesFunnel } from "../../hooks/useSalesFunnel"
import { MoveToContactedRequest } from "../../hooks/models"
import { useProvinces } from "../../hooks/useProvinces"

interface MoveToContactedModalProps {
  funnelId: string
  onSuccess?: () => void
}

export const MoveToContactedModal = ({
  funnelId,
  onSuccess
}: MoveToContactedModalProps) => {
  const queryClient = useQueryClient()
  const { moveToContacted } = useSalesFunnel()
  const { getProvinces } = useProvinces()

  const { data: provincesData } = useQuery({
    queryKey: ["provinces"],
    queryFn: getProvinces
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<MoveToContactedRequest>()

  const { mutate, isPending } = useMutation({
    mutationFn: (data: MoveToContactedRequest) =>
      moveToContacted(funnelId, data),
    onSuccess: () => {
      CToast.success({ title: "Chuyển sang đã liên hệ thành công" })
      queryClient.invalidateQueries({ queryKey: ["salesFunnel"] })
      modals.closeAll()
      onSuccess?.()
    },
    onError: (error: any) => {
      CToast.error({ title: error?.message || "Có lỗi xảy ra" })
    }
  })

  const onSubmit = (data: MoveToContactedRequest) => {
    mutate(data)
  }

  const onInvalid = () => {
    CToast.error({ title: "Vui lòng điền đầy đủ thông tin bắt buộc" })
  }

  const provinceOptions =
    provincesData?.data.provinces.map((province) => ({
      value: province._id,
      label: province.name
    })) || []

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <Stack gap="md">
        <Controller
          name="province"
          control={control}
          rules={{ required: "Tỉnh/Thành phố là bắt buộc" }}
          render={({ field }) => (
            <Select
              {...field}
              label="Tỉnh/Thành phố"
              placeholder="Chọn tỉnh/thành phố"
              data={provinceOptions}
              searchable
              required
              error={errors.province?.message}
            />
          )}
        />

        <TextInput
          label="Số điện thoại"
          placeholder="Nhập số điện thoại"
          required
          error={errors.phoneNumber?.message}
          {...register("phoneNumber", {
            required: "Số điện thoại là bắt buộc"
          })}
        />

        <Group justify="flex-end" mt="md">
          <Button
            variant="default"
            onClick={() => modals.closeAll()}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button type="submit" loading={isPending}>
            Chuyển sang Đã liên hệ
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
