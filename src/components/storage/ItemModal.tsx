import { Controller, useForm } from "react-hook-form"
import { CreateItemRequest, ItemResponse } from "../../hooks/models"
import { useItems } from "../../hooks/useItems"
import { useMutation, useQuery } from "@tanstack/react-query"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import {
  Stack,
  TextInput,
  Textarea,
  Button,
  MultiSelect,
  Group,
  Divider
} from "@mantine/core"

interface Props {
  item?: ItemResponse
  refetch: () => void
}

export const ItemModal = ({ item, refetch }: Props) => {
  const { searchStorageItems, updateItem, deleteItem, createItem } = useItems()

  const { data: storageItems, isLoading } = useQuery({
    queryKey: ["storageItems"],
    queryFn: () => searchStorageItems({ searchText: "", deleted: false }),
    select: (data) =>
      data.data.map((item) => ({
        value: item._id,
        label: item.name
      }))
  })

  const { mutate: create, isPending: creating } = useMutation({
    mutationKey: ["createItem"],
    mutationFn: createItem,
    onSuccess: () => {
      modals.closeAll()
      CToast.success({ title: "Tạo mặt hàng thành công" })
      refetch()
    },
    onError: () => CToast.error({ title: "Có lỗi xảy ra" })
  })

  const { mutate: update, isPending: updating } = useMutation({
    mutationKey: ["updateItem"],
    mutationFn: updateItem,
    onSuccess: () => {
      modals.closeAll()
      CToast.success({ title: "Chỉnh sửa mặt hàng thành công" })
      refetch()
    },
    onError: () => CToast.error({ title: "Có lỗi xảy ra" })
  })

  const { mutate: remove, isPending: removing } = useMutation({
    mutationKey: ["deleteItem"],
    mutationFn: deleteItem,
    onSuccess: () => {
      modals.closeAll()
      CToast.success({ title: "Xoá sản phẩm thành công" })
      refetch()
    },
    onError: () => CToast.error({ title: "Có lỗi xảy ra" })
  })

  const { handleSubmit, control } = useForm<CreateItemRequest>({
    defaultValues: item
      ? {
          ...item,
          variants: item.variants ?? []
        }
      : {
          name: "",
          note: "",
          variants: []
        }
  })

  const onSubmit = (values: CreateItemRequest) => {
    if (item?._id) {
      update({ _id: item._id, ...values })
    } else {
      create(values)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={18} w={"100%"} p={2}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextInput label="Tên mặt hàng" required {...field} />
          )}
        />
        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <Textarea label="Ghi chú" minRows={2} maxRows={4} {...field} />
          )}
        />

        <Divider label="Các sản phẩm tương ứng" my={6} />
        <Controller
          name="variants"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Chọn các sản phẩm thuộc loại này"
              data={storageItems || []}
              value={field.value}
              onChange={field.onChange}
              placeholder="Chọn sản phẩm"
              searchable
              clearable
              nothingFoundMessage={
                isLoading ? "Đang tải..." : "Không có sản phẩm"
              }
              // Loại bỏ self nếu đang edit
              disabled={isLoading}
              maxDropdownHeight={200}
            />
          )}
        />

        <Group mt={16} justify="flex-end">
          {item && (
            <Button
              type="button"
              color="red"
              variant="subtle"
              onClick={() => remove(item._id!)}
              loading={removing}
            >
              Xoá
            </Button>
          )}
          <Button
            type="submit"
            color="indigo"
            loading={creating || updating}
            fw={600}
          >
            {item ? "Lưu thay đổi" : "Tạo mới"}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
