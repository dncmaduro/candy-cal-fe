import { Controller, useForm } from "react-hook-form"
import { CreateItemRequest, ItemResponse } from "../../hooks/models"
import { Button, NumberInput, Stack, TextInput } from "@mantine/core"
import { useItems } from "../../hooks/useItems"
import { useMutation } from "@tanstack/react-query"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"

interface Props {
  item?: ItemResponse
  refetch: () => void
}

export const ItemModal = ({ item, refetch }: Props) => {
  const { handleSubmit, control } = useForm<CreateItemRequest>({
    defaultValues: item ?? {
      name: "",
      quantityPerBox: 0
    }
  })

  const { createItem, updateItem } = useItems()

  const { mutate: create } = useMutation({
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

  const { mutate: update } = useMutation({
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
    <form onSubmit={handleSubmit(submit)}>
      <Stack gap={16}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => <TextInput label="Tên mặt hàng" {...field} />}
        />
        <Controller
          name="quantityPerBox"
          control={control}
          render={({ field }) => (
            <NumberInput label="Số lượng/thùng" {...field} />
          )}
        />
        <Button type="submit">Xác nhận</Button>
      </Stack>
    </form>
  )
}
