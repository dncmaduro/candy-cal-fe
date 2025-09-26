import { Controller, useForm } from "react-hook-form"
import {
  CreateStorageItemRequest,
  SearchStorageItemResponse
} from "../../hooks/models"
import {
  Button,
  Group,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Textarea
} from "@mantine/core"
import { useItems } from "../../hooks/useItems"
import { useMutation, useQuery } from "@tanstack/react-query"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import { IconCheck, IconTrash, IconRestore } from "@tabler/icons-react"
import { useUsers } from "../../hooks/useUsers"

interface Props {
  item?: SearchStorageItemResponse
  refetch: () => void
}

export const StorageItemModal = ({ item, refetch }: Props) => {
  const { handleSubmit, control } = useForm<CreateStorageItemRequest>({
    defaultValues: item
      ? {
          ...item,
          receivedQuantity: item.receivedQuantity ?? { quantity: 0, real: 0 },
          deliveredQuantity: item.deliveredQuantity ?? { quantity: 0, real: 0 },
          restQuantity: item.restQuantity ?? { quantity: 0, real: 0 },
          quantityPerBox: item.quantityPerBox ?? 1
        }
      : {
          name: "",
          code: "",
          note: "",
          quantityPerBox: 1,
          receivedQuantity: { quantity: 0, real: 0 },
          deliveredQuantity: { quantity: 0, real: 0 },
          restQuantity: { quantity: 0, real: 0 }
        }
  })

  const {
    createStorageItem,
    updateStorageItem,
    deleteStorageItem,
    restoreStorageItem
  } = useItems()
  const { getMe } = useUsers()
  const { data: meData } = useQuery({
    queryKey: ["getMe"],
    queryFn: () => getMe(),
    select: (data) => data.data
  })

  const { mutate: create, isPending: creating } = useMutation({
    mutationKey: ["createStorageItem"],
    mutationFn: createStorageItem,
    onSuccess: () => {
      modals.closeAll()
      CToast.success({
        title: "Tạo mặt hàng thành công"
      })
      refetch()
    },
    onError: () => {
      CToast.error({
        title: "Có lỗi xảy ra"
      })
    }
  })

  const { mutate: update, isPending: updating } = useMutation({
    mutationKey: ["updateStorageItem"],
    mutationFn: updateStorageItem,
    onSuccess: () => {
      modals.closeAll()
      CToast.success({
        title: "Cập nhật sản phẩm thành công"
      })
      refetch()
    },
    onError: () => {
      CToast.error({
        title: "Có lỗi xảy ra"
      })
    }
  })

  const { mutate: remove, isPending: removing } = useMutation({
    mutationKey: ["deleteStorageItem"],
    mutationFn: deleteStorageItem,
    onSuccess: () => {
      modals.closeAll()
      CToast.success({
        title: "Xoá sản phẩm thành công"
      })
      refetch()
    },
    onError: () => {
      CToast.error({
        title: "Có lỗi xảy ra"
      })
    }
  })

  const { mutate: restore, isPending: restoring } = useMutation({
    mutationKey: ["restoreStorageItem"],
    mutationFn: restoreStorageItem,
    onSuccess: () => {
      modals.closeAll()
      CToast.success({
        title: "Khôi phục sản phẩm thành công"
      })
      refetch()
    },
    onError: () => {
      CToast.error({
        title: "Có lỗi xảy ra"
      })
    }
  })

  const submit = (values: CreateStorageItemRequest) => {
    if (item?._id) {
      update({
        _id: item?._id,
        ...values
      })
    } else {
      create(values)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} style={{ width: "100%" }}>
      <Stack gap={22} py={2}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextInput
              label="Tên mặt hàng"
              required
              radius="md"
              size="md"
              autoFocus
              {...field}
            />
          )}
        />
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <TextInput label="Mã mặt hàng" radius="md" size="md" {...field} />
          )}
        />
        <Controller
          name="quantityPerBox"
          control={control}
          render={({ field }) => (
            <NumberInput
              label="Số lượng trên 1 hộp"
              min={1}
              radius="md"
              size="md"
              hideControls
              {...field}
            />
          )}
        />

        {/* --- Group số lượng nhập/xuất/tồn --- */}
        <Stack gap={10}>
          <Text fw={600} fz="sm" c="dimmed" mb={-6}>
            Số lượng nhập kho
          </Text>
          <Group gap={10} grow>
            <Controller
              name="receivedQuantity.quantity"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Số lượng"
                  min={0}
                  disabled={!!item?._id && !meData?.roles?.includes("admin")}
                  size="sm"
                  radius="md"
                  hideControls
                  {...field}
                />
              )}
            />
            <Controller
              name="receivedQuantity.real"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Thực tế"
                  min={0}
                  size="sm"
                  radius="md"
                  hideControls
                  {...field}
                />
              )}
            />
          </Group>
        </Stack>

        <Stack gap={10}>
          <Text fw={600} fz="sm" c="dimmed" mb={-6}>
            Số lượng xuất kho
          </Text>
          <Group gap={10} grow>
            <Controller
              name="deliveredQuantity.quantity"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Số lượng"
                  disabled={!!item?._id && !meData?.roles?.includes("admin")}
                  min={0}
                  size="sm"
                  radius="md"
                  hideControls
                  {...field}
                />
              )}
            />
            <Controller
              name="deliveredQuantity.real"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Thực tế"
                  min={0}
                  size="sm"
                  radius="md"
                  hideControls
                  {...field}
                />
              )}
            />
          </Group>
        </Stack>

        <Stack gap={10}>
          <Text fw={600} fz="sm" c="dimmed" mb={-6}>
            Số lượng tồn kho
          </Text>
          <Group gap={10} grow>
            <Controller
              name="restQuantity.quantity"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Số lượng"
                  min={0}
                  disabled={!!item?._id && !meData?.roles?.includes("admin")}
                  size="sm"
                  radius="md"
                  hideControls
                  {...field}
                />
              )}
            />
            <Controller
              name="restQuantity.real"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Thực tế"
                  min={0}
                  size="sm"
                  radius="md"
                  hideControls
                  {...field}
                />
              )}
            />
          </Group>
        </Stack>

        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Ghi chú"
              autosize
              minRows={2}
              maxRows={4}
              radius="md"
              size="md"
              {...field}
            />
          )}
        />

        <Group mt={6} justify="flex-end">
          {item?.deletedAt ? (
            <Button
              variant="outline"
              color="green"
              radius="xl"
              size="md"
              onClick={() => item?._id && restore({ id: item._id })}
              loading={restoring}
              leftSection={<IconRestore size={18} />}
              fw={600}
            >
              Khôi phục
            </Button>
          ) : (
            <Button
              variant="outline"
              color="red"
              radius="xl"
              size="md"
              onClick={() => item?._id && remove(item?._id)}
              loading={removing}
              leftSection={<IconTrash size={18} />}
              fw={600}
            >
              Xoá
            </Button>
          )}
          <Button
            type="submit"
            loading={creating || updating}
            leftSection={<IconCheck size={18} />}
            color="indigo"
            radius="xl"
            size="md"
            fw={600}
          >
            Xác nhận
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
