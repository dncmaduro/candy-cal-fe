import { Controller, useForm } from "react-hook-form"
import { CreateItemRequest, ItemResponse } from "../../hooks/models"
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
import { useMutation } from "@tanstack/react-query"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import { IconCheck } from "@tabler/icons-react"

interface Props {
  item?: ItemResponse
  refetch: () => void
}

export const ItemModal = ({ item, refetch }: Props) => {
  const { handleSubmit, control } = useForm<CreateItemRequest>({
    defaultValues: item
      ? {
          ...item,
          receivedQuantity: item.receivedQuantity ?? { quantity: 0, real: 0 },
          deliveredQuantity: item.deliveredQuantity ?? { quantity: 0, real: 0 },
          restQuantity: item.restQuantity ?? { quantity: 0, real: 0 }
        }
      : {
          name: "",
          code: "",
          note: "",
          receivedQuantity: { quantity: 0, real: 0 },
          deliveredQuantity: { quantity: 0, real: 0 },
          restQuantity: { quantity: 0, real: 0 }
        }
  })

  const { createItem, updateItem } = useItems()

  const { mutate: create, isPending: creating } = useMutation({
    mutationKey: ["createItem"],
    mutationFn: createItem,
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
    mutationKey: ["updateItem"],
    mutationFn: updateItem,
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

  const submit = (values: CreateItemRequest) => {
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
                  disabled={!!item?._id}
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
                  disabled={!!item?._id}
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
                  disabled={!!item?._id}
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

        <Button
          type="submit"
          loading={creating || updating}
          leftSection={<IconCheck size={18} />}
          color="indigo"
          radius="xl"
          size="md"
          fw={600}
          mt={6}
        >
          Xác nhận
        </Button>
      </Stack>
    </form>
  )
}
