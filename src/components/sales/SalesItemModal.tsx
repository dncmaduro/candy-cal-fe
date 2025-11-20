import {
  Button,
  Group,
  Stack,
  TextInput,
  NumberInput,
  Select
} from "@mantine/core"
import { useForm, Controller } from "react-hook-form"
import { useMutation, useQuery } from "@tanstack/react-query"
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
  factory: "candy" | "manufacturing" | "position_MongCai" | "jelly" | "import"
  price: number
  source: "inside" | "outside"
}

interface SalesItemModalProps {
  item?: GetSalesItemDetailResponse
  onSuccess: () => void
}

export const SalesItemModal = ({ item, onSuccess }: SalesItemModalProps) => {
  const {
    createSalesItem,
    updateSalesItem,
    getSalesItemsFactory,
    getSalesItemsSource
  } = useSalesItems()

  const isEdit = !!item

  // Load factories and sources for dropdowns
  const { data: factoriesData } = useQuery({
    queryKey: ["salesItemsFactories"],
    queryFn: getSalesItemsFactory
  })

  const { data: sourcesData } = useQuery({
    queryKey: ["salesItemsSources"],
    queryFn: getSalesItemsSource
  })

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<SalesItemFormData>({
    defaultValues: {
      code: item?.code || "",
      nameVn: item?.name.vn || "",
      nameCn: item?.name.cn || "",
      factory: item?.factory || "candy",
      price: item?.price || 0,
      source: item?.source || "inside"
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
        factory: data.factory,
        price: data.price,
        source: data.source
      })
    } else {
      createMutation.mutate({
        code: data.code,
        name: {
          vn: data.nameVn,
          cn: data.nameCn
        },
        factory: data.factory,
        price: data.price,
        source: data.source
      })
    }
  }

  const onInvalid = () => {
    CToast.error({ title: "Vui lòng điền đầy đủ thông tin bắt buộc" })
  }

  const factoryOptions =
    factoriesData?.data.data.map((factory) => ({
      value: factory.value,
      label: factory.label
    })) || []

  const sourceOptions =
    sourcesData?.data.data.map((source) => ({
      value: source.value,
      label: source.label
    })) || []

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
          name="factory"
          control={control}
          rules={{ required: "Nhà máy là bắt buộc" }}
          render={({ field }) => (
            <Select
              {...field}
              label="Nhà máy"
              placeholder="Chọn nhà máy"
              data={factoryOptions}
              required
              error={errors.factory?.message}
            />
          )}
        />

        <Controller
          name="source"
          control={control}
          rules={{ required: "Nguồn là bắt buộc" }}
          render={({ field }) => (
            <Select
              {...field}
              label="Nguồn"
              placeholder="Chọn nguồn"
              data={sourceOptions}
              required
              error={errors.source?.message}
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
