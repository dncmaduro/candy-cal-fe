import { useLivestream } from "../../hooks/useLivestream"
import { useMutation } from "@tanstack/react-query"
import { Stack, Button, Group, TextInput } from "@mantine/core"
import { useForm, Controller } from "react-hook-form"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import {
  CreateLivestreamChannelRequest,
  UpdateLivestreamChannelRequest
} from "../../hooks/models"

interface Props {
  channel?: {
    _id: string
    name: string
    username: string
    link: string
  }
  refetch: () => void
}

interface FormData {
  name: string
  username: string
  link: string
}

export const LivestreamChannelModal = ({ channel, refetch }: Props) => {
  const { createLivestreamChannel, updateLivestreamChannel } = useLivestream()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      name: channel?.name ?? "",
      username: channel?.username ?? "",
      link: channel?.link ?? ""
    }
  })

  const { mutate: createChannel, isPending: creating } = useMutation({
    mutationFn: (req: CreateLivestreamChannelRequest) =>
      createLivestreamChannel(req),
    onSuccess: () => {
      modals.closeAll()
      CToast.success({ title: "Tạo kênh thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi tạo kênh" })
    }
  })

  const { mutate: updateChannel, isPending: updating } = useMutation({
    mutationFn: ({
      id,
      req
    }: {
      id: string
      req: UpdateLivestreamChannelRequest
    }) => updateLivestreamChannel(id, req),
    onSuccess: () => {
      modals.closeAll()
      CToast.success({ title: "Cập nhật kênh thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi cập nhật kênh" })
    }
  })

  const onSubmit = (values: FormData) => {
    if (channel) {
      // Update existing channel
      updateChannel({
        id: channel._id,
        req: values
      })
    } else {
      // Create new channel
      createChannel(values)
    }
  }

  const isPending = creating || updating

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={18} w="100%" p={2}>
        <Controller
          name="name"
          control={control}
          rules={{ required: "Vui lòng nhập tên kênh" }}
          render={({ field }) => (
            <TextInput
              label="Tên kênh"
              placeholder="Nhập tên kênh livestream"
              value={field.value}
              onChange={field.onChange}
              required
              disabled={isPending}
              size="md"
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          name="username"
          control={control}
          rules={{ required: "Vui lòng nhập username" }}
          render={({ field }) => (
            <TextInput
              label="Username"
              placeholder="Nhập username của kênh"
              value={field.value}
              onChange={field.onChange}
              required
              disabled={isPending}
              size="md"
              error={errors.username?.message}
              leftSection="@"
            />
          )}
        />

        <Controller
          name="link"
          control={control}
          rules={{
            required: "Vui lòng nhập link kênh",
            pattern: {
              value: /^https?:\/\/.+/,
              message: "Link phải bắt đầu bằng http:// hoặc https://"
            }
          }}
          render={({ field }) => (
            <TextInput
              label="Link kênh"
              placeholder="https://..."
              value={field.value}
              onChange={field.onChange}
              required
              disabled={isPending}
              size="md"
              error={errors.link?.message}
            />
          )}
        />

        <Group justify="flex-end" mt="md">
          <Button
            variant="light"
            onClick={() => modals.closeAll()}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button type="submit" loading={isPending} disabled={isPending}>
            {channel ? "Cập nhật" : "Tạo kênh"}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
