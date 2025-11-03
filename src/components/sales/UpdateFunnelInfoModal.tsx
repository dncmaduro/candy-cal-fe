import { Button, Group, Stack, TextInput, Select } from "@mantine/core"
import { modals } from "@mantine/modals"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { CToast } from "../common/CToast"
import { useSalesFunnel } from "../../hooks/useSalesFunnel"
import { UpdateFunnelInfoRequest } from "../../hooks/models"
import { useProvinces } from "../../hooks/useProvinces"
import { useSalesChannels } from "../../hooks/useSalesChannels"

interface UpdateFunnelInfoModalProps {
  funnelId: string
  currentData: {
    name: string
    facebook: string
    province?: string
    phoneNumber?: string
    channel: string
    hasBuyed: boolean
  }
  onSuccess?: () => void
}

export const UpdateFunnelInfoModal = ({
  funnelId,
  currentData,
  onSuccess
}: UpdateFunnelInfoModalProps) => {
  const queryClient = useQueryClient()
  const { updateFunnelInfo } = useSalesFunnel()
  const { getProvinces } = useProvinces()
  const { searchSalesChannels } = useSalesChannels()

  const { data: provincesData } = useQuery({
    queryKey: ["provinces"],
    queryFn: getProvinces
  })

  const { data: channelsData } = useQuery({
    queryKey: ["salesChannels", "all"],
    queryFn: () => searchSalesChannels({ page: 1, limit: 999 })
  })

  const { register, handleSubmit, control } = useForm<UpdateFunnelInfoRequest>({
    defaultValues: {
      name: currentData.name,
      facebook: currentData.facebook,
      province: currentData.province,
      phoneNumber: currentData.phoneNumber,
      channel: currentData.channel,
      hasBuyed: currentData.hasBuyed
    }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateFunnelInfoRequest) =>
      updateFunnelInfo(funnelId, data),
    onSuccess: () => {
      CToast.success({ title: "Cập nhật thông tin thành công" })
      queryClient.invalidateQueries({ queryKey: ["salesFunnel"] })
      modals.closeAll()
      onSuccess?.()
    },
    onError: (error: any) => {
      CToast.error({ title: error?.message || "Có lỗi xảy ra" })
    }
  })

  const onSubmit = (data: UpdateFunnelInfoRequest) => {
    mutate(data)
  }

  const provinceOptions =
    provincesData?.data.provinces.map((province) => ({
      value: province._id,
      label: province.name
    })) || []

  const channelOptions =
    channelsData?.data.data.map((channel) => ({
      value: channel._id,
      label: channel.channelName
    })) || []

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Tên khách hàng"
          placeholder="Nhập tên khách hàng"
          {...register("name")}
        />

        <TextInput
          label="Facebook"
          placeholder="Nhập link Facebook hoặc tên Facebook"
          {...register("facebook")}
        />

        <Controller
          name="province"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Tỉnh/Thành phố"
              placeholder="Chọn tỉnh/thành phố"
              data={provinceOptions}
              searchable
              clearable
            />
          )}
        />

        <TextInput
          label="Số điện thoại"
          placeholder="Nhập số điện thoại"
          {...register("phoneNumber")}
        />

        <Controller
          name="channel"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Kênh"
              placeholder="Chọn kênh"
              data={channelOptions}
              searchable
            />
          )}
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
            Cập nhật
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
