import { useForm, Controller } from "react-hook-form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button, Stack, TextInput, Select } from "@mantine/core"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import { useSalesChannels } from "../../hooks/useSalesChannels"
import { useUsers } from "../../hooks/useUsers"
import {
  CreateSalesChannelRequest,
  GetSalesChannelDetailResponse
} from "../../hooks/models"

interface Props {
  channel?: GetSalesChannelDetailResponse
  refetch: () => void
}

type FormData = CreateSalesChannelRequest

export const SalesChannelModal = ({ channel, refetch }: Props) => {
  const { createSalesChannel, updateSalesChannel } = useSalesChannels()
  const { publicSearchUser } = useUsers()
  const isEdit = !!channel

  // Load users for assignee selection
  const { data: usersData } = useQuery({
    queryKey: ["users", "public", "sales"],
    queryFn: () => publicSearchUser({ page: 1, limit: 999, role: "sales-emp" })
  })

  const userOptions = [
    { value: "", label: "Không có" },
    ...(usersData?.data.data.map((user) => ({
      value: user._id,
      label: user.name ?? "Anonymous"
    })) || [])
  ]

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      channelName: channel?.channelName || "",
      assignedTo: channel?.assignedTo?.id || "",
      phoneNumber: channel?.phoneNumber || ""
    }
  })

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: createSalesChannel,
    onSuccess: () => {
      modals.closeAll()
      CToast.success({ title: "Tạo kênh bán hàng thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi tạo kênh" })
    }
  })

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: (data: FormData) => updateSalesChannel(channel!._id, data),
    onSuccess: () => {
      modals.closeAll()
      CToast.success({ title: "Cập nhật kênh bán hàng thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi cập nhật kênh" })
    }
  })

  const onSubmit = (values: FormData) => {
    if (isEdit) {
      update(values)
    } else {
      create(values)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md" p="sm">
        <TextInput
          label="Tên kênh bán hàng"
          placeholder="Nhập tên kênh"
          required
          size="md"
          {...register("channelName", {
            required: "Tên kênh là bắt buộc"
          })}
          error={errors.channelName?.message}
        />

        <Controller
          name="assignedTo"
          control={control}
          render={({ field }) => (
            <Select
              label="Nhân viên phụ trách"
              placeholder="Chọn nhân viên phụ trách kênh"
              data={userOptions}
              value={field.value || ""}
              onChange={(value) => field.onChange(value || "")}
              searchable
              clearable
              size="md"
            />
          )}
        />

        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <TextInput
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              {...field}
              size="md"
              type="tel"
            />
          )}
        />

        <Button
          type="submit"
          fullWidth
          size="md"
          radius="xl"
          loading={creating || updating}
        >
          {isEdit ? "Cập nhật" : "Tạo mới"}
        </Button>
      </Stack>
    </form>
  )
}
