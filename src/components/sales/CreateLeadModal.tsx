import { Button, Group, Stack, TextInput, Select } from "@mantine/core"
import { modals } from "@mantine/modals"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { CToast } from "../common/CToast"
import { useSalesFunnel } from "../../hooks/useSalesFunnel"
import { CreateLeadRequest } from "../../hooks/models"
import { useSalesChannels } from "../../hooks/useSalesChannels"

interface CreateLeadModalProps {
  onSuccess?: () => void
}

export const CreateLeadModal = ({ onSuccess }: CreateLeadModalProps) => {
  const queryClient = useQueryClient()
  const { createLead } = useSalesFunnel()
  const { searchSalesChannels } = useSalesChannels()

  const { data: channelsData } = useQuery({
    queryKey: ["salesChannels", "all"],
    queryFn: () => searchSalesChannels({ page: 1, limit: 999 })
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<CreateLeadRequest>({
    defaultValues: {
      name: "",
      channel: "",
      funnelSource: "ads"
    }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      CToast.success({ title: "Tạo lead mới thành công" })
      queryClient.invalidateQueries({ queryKey: ["salesFunnel"] })
      modals.closeAll()
      onSuccess?.()
    },
    onError: (error: any) => {
      CToast.error({ title: error?.message || "Có lỗi xảy ra" })
    }
  })

  const onSubmit = (data: CreateLeadRequest) => {
    mutate(data)
  }

  const onInvalid = () => {
    CToast.error({ title: "Vui lòng điền đầy đủ thông tin bắt buộc" })
  }

  const channelOptions =
    channelsData?.data.data.map((channel) => ({
      value: channel._id,
      label: channel.channelName
    })) || []

  const sourceOptions = [
    { value: "ads", label: "Ads" },
    { value: "seeding", label: "Seeding" },
    { value: "referral", label: "Giới thiệu" }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <Stack gap="md">
        <TextInput
          label="Tên khách hàng"
          placeholder="Nhập tên khách hàng"
          required
          error={errors.name?.message}
          {...register("name", { required: "Tên khách hàng là bắt buộc" })}
        />

        <Controller
          name="channel"
          control={control}
          rules={{ required: "Kênh là bắt buộc" }}
          render={({ field }) => (
            <Select
              {...field}
              label="Kênh"
              placeholder="Chọn kênh"
              data={channelOptions}
              searchable
              required
              error={errors.channel?.message}
            />
          )}
        />

        <Controller
          name="funnelSource"
          control={control}
          rules={{ required: "Nguồn là bắt buộc" }}
          render={({ field }) => (
            <Select
              {...field}
              label="Nguồn"
              placeholder="Chọn nguồn"
              data={sourceOptions}
              searchable
              required
              error={errors.funnelSource?.message}
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
            Tạo Lead
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
