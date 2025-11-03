import { useForm, Controller } from "react-hook-form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button, Stack, NumberInput, Select } from "@mantine/core"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import { useSalesPriceItems } from "../../hooks/useSalesPriceItems"
import { useItems } from "../../hooks/useItems"
import {
  CreateSalesPriceItemRequest,
  GetSalesPriceItemDetailResponse
} from "../../hooks/models"
import { useMemo } from "react"

interface Props {
  priceItem?: GetSalesPriceItemDetailResponse & {
    storageItem?: { code: string; name: string }
  }
  refetch: () => void
}

type FormData = CreateSalesPriceItemRequest

export const SalesPriceItemModal = ({ priceItem, refetch }: Props) => {
  const { createSalesPriceItem, updateSalesPriceItem } = useSalesPriceItems()
  const { searchStorageItems } = useItems()
  const isEdit = !!priceItem

  const { data: storageItemsData } = useQuery({
    queryKey: ["searchStorageItems"],
    queryFn: () =>
      searchStorageItems({
        searchText: "",
        deleted: false
      }),
    select: (data) => data.data
  })

  const storageItemOptions = useMemo(() => {
    return (
      storageItemsData?.map((item) => ({
        value: item._id,
        label: `${item.code} - ${item.name}`
      })) || []
    )
  }, [storageItemsData])

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      itemId: priceItem?.itemId || "",
      price: priceItem?.price || 0
    }
  })

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: createSalesPriceItem,
    onSuccess: () => {
      modals.closeAll()
      CToast.success({ title: "Tạo báo giá thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi tạo báo giá" })
    }
  })

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: (data: Partial<FormData>) =>
      updateSalesPriceItem(priceItem!._id, data),
    onSuccess: () => {
      modals.closeAll()
      CToast.success({ title: "Cập nhật báo giá thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi cập nhật báo giá" })
    }
  })

  const onSubmit = (values: FormData) => {
    if (isEdit) {
      update({ price: values.price })
    } else {
      create(values)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md" p="sm">
        <Controller
          name="itemId"
          control={control}
          rules={{ required: "Mặt hàng là bắt buộc" }}
          render={({ field }) => (
            <Select
              label="Mặt hàng"
              placeholder="Chọn mặt hàng"
              required
              size="md"
              searchable
              data={storageItemOptions}
              disabled={isEdit}
              error={errors.itemId?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="price"
          control={control}
          rules={{
            required: "Giá là bắt buộc",
            min: { value: 0, message: "Giá phải lớn hơn hoặc bằng 0" }
          }}
          render={({ field }) => (
            <NumberInput
              label="Giá bán (VNĐ)"
              placeholder="Nhập giá bán"
              required
              size="md"
              min={0}
              thousandSeparator=","
              error={errors.price?.message}
              {...field}
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
