import { Button, Group, Stack, TextInput, Select } from "@mantine/core"
import { modals } from "@mantine/modals"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { CToast } from "../common/CToast"
import { useSalesFunnel } from "../../hooks/useSalesFunnel"
import { CreateLeadRequest } from "../../hooks/models"
import { useSalesChannels } from "../../hooks/useSalesChannels"
import { useUsers } from "../../hooks/useUsers"

interface CreateLeadModalProps {
  onSuccess?: () => void
}

export const CreateLeadModal = ({ onSuccess }: CreateLeadModalProps) => {
  const queryClient = useQueryClient()
  const { createLead } = useSalesFunnel()
  const { searchSalesChannels } = useSalesChannels()
  const { publicSearchUser } = useUsers()

  const { data: channelsData } = useQuery({
    queryKey: ["salesChannels", "all"],
    queryFn: () => searchSalesChannels({ page: 1, limit: 999 })
  })

  const { data: usersData } = useQuery({
    queryKey: ["users", "public", "all"],
    queryFn: () => publicSearchUser({ page: 1, limit: 999 })
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<CreateLeadRequest>()

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

  const userOptions =
    usersData?.data.data.map((user) => ({
      value: user._id,
      label: user.name
    })) || []

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

        <TextInput
          label="Facebook"
          placeholder="Nhập link Facebook hoặc tên Facebook"
          required
          error={errors.facebook?.message}
          {...register("facebook", { required: "Facebook là bắt buộc" })}
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
          name="user"
          control={control}
          rules={{ required: "Nhân viên phụ trách là bắt buộc" }}
          render={({ field }) => (
            <Select
              {...field}
              label="Nhân viên phụ trách"
              placeholder="Chọn nhân viên"
              data={userOptions}
              searchable
              required
              error={errors.user?.message}
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
