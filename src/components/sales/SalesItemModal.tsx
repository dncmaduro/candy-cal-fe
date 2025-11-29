import { Button, Group, Stack, TextInput, NumberInput } from "@mantine/core"
import { useForm, Controller } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import { useSalesItems } from "../../hooks/useSalesItems"
import {
  CreateSalesItemRequest,
  UpdateSalesItemRequest,
  GetSalesItemDetailResponse
} from "../../hooks/models"

type SalesItemFormData = {
  code: string
  nameVn: string
  nameCn: string
  price: number
  size?: string
  area?: number
  mass?: number
  specification?: number
}

interface SalesItemModalProps {
  item?: GetSalesItemDetailResponse
  onSuccess: () => void
}

export const SalesItemModal = ({ item, onSuccess }: SalesItemModalProps) => {
  const { createSalesItem, updateSalesItem } = useSalesItems()

  const isEdit = !!item

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<SalesItemFormData>({
    defaultValues: {
      code: item?.code || "",
      nameVn: item?.name.vn || "",
      nameCn: item?.name.cn || "",
      price: item?.price || 0,
      size: item?.size || "",
      area: item?.area || 0,
      mass: item?.mass || 0,
      specification: item?.specification || 0
    }
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateSalesItemRequest) => createSalesItem(data),
    onSuccess: () => {
      CToast.success({ title: "Tạo sản phẩm thành công" })
      modals.closeAll()
      onSuccess()
    },
    onError: (error: any) => {
      CToast.error({
        title:
          error?.response?.data?.message || "Có lỗi xảy ra khi tạo sản phẩm"
      })
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSalesItemRequest) =>
      updateSalesItem(item!._id, data),
    onSuccess: () => {
      CToast.success({ title: "Cập nhật sản phẩm thành công" })
      modals.closeAll()
      onSuccess()
    },
    onError: (error: any) => {
      CToast.error({
        title:
          error?.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật sản phẩm"
      })
    }
  })

  const onSubmit = (data: SalesItemFormData) => {
    if (isEdit) {
      updateMutation.mutate({
        name: {
          vn: data.nameVn,
          cn: data.nameCn
        },
        price: data.price,
        size: data.size,
        area: data.area,
        mass: data.mass,
        specification: data.specification
      })
    } else {
      createMutation.mutate({
        code: data.code,
        name: {
          vn: data.nameVn,
          cn: data.nameCn
        },
        price: data.price,
        size: data.size,
        area: data.area,
        mass: data.mass,
        specification: data.specification
      })
    }
  }

  const onInvalid = () => {
    CToast.error({ title: "Vui lòng điền đầy đủ thông tin bắt buộc" })
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <Stack gap="md">
        <Controller
          name="code"
          control={control}
          rules={{ required: "Mã sản phẩm là bắt buộc" }}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Mã sản phẩm"
              placeholder="Nhập mã sản phẩm"
              required
              disabled={isEdit} // Code cannot be changed when editing
              error={errors.code?.message}
            />
          )}
        />

        <Controller
          name="nameVn"
          control={control}
          rules={{ required: "Tên tiếng Việt là bắt buộc" }}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Tên (Tiếng Việt)"
              placeholder="Nhập tên sản phẩm bằng tiếng Việt"
              required
              error={errors.nameVn?.message}
            />
          )}
        />

        <Controller
          name="nameCn"
          control={control}
          rules={{ required: "Tên tiếng Trung là bắt buộc" }}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Tên (Tiếng Trung)"
              placeholder="Nhập tên sản phẩm bằng tiếng Trung"
              required
              error={errors.nameCn?.message}
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
              {...field}
              label="Giá"
              placeholder="Nhập giá sản phẩm"
              min={0}
              required
              hideControls
              thousandSeparator=","
              error={errors.price?.message}
            />
          )}
        />

        <Controller
          name="size"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Kích thước"
              placeholder="Nhập kích thước"
            />
          )}
        />

        <Controller
          name="area"
          control={control}
          render={({ field }) => (
            <NumberInput
              {...field}
              label="Số khối (m³)"
              placeholder="Nhập số khối"
              min={0}
              decimalScale={2}
              hideControls
            />
          )}
        />

        <Controller
          name="mass"
          control={control}
          render={({ field }) => (
            <NumberInput
              {...field}
              label="Khối lượng (kg)"
              placeholder="Nhập khối lượng"
              min={0}
              decimalScale={2}
              hideControls
            />
          )}
        />

        <Controller
          name="specification"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Quy cách"
              placeholder="Nhập quy cách"
              min={0}
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
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
