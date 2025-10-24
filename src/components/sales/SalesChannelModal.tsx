import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { Button, Stack, TextInput } from "@mantine/core"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import { useSalesChannels } from "../../hooks/useSalesChannels"
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
  const isEdit = !!channel

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      channelName: channel?.channelName || ""
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
