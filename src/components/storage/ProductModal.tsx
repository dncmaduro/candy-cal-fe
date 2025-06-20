import { Controller, useFieldArray, useForm } from "react-hook-form"
import { CreateProductRequest, ProductResponse } from "../../hooks/models"
import { useProducts } from "../../hooks/useProducts"
import { useMutation, useQuery } from "@tanstack/react-query"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import {
  Button,
  Stack,
  TextInput,
  Select,
  NumberInput,
  ActionIcon,
  Group,
  Box,
  Divider,
  Text,
  Switch
} from "@mantine/core"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { useItems } from "../../hooks/useItems"

interface Props {
  product?: ProductResponse
  refetch: () => void
}

export const ProductModal = ({ product, refetch }: Props) => {
  const { handleSubmit, control } = useForm<CreateProductRequest>({
    defaultValues: product ?? {
      name: "",
      items: [],
      isReady: false
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  })

  const { createProduct, updateProduct } = useProducts()
  const { searchItems } = useItems()

  const { data: itemsData } = useQuery({
    queryKey: ["searchItems"],
    queryFn: () => searchItems(""),
    select: (data) =>
      data.data.map((item) => ({
        value: item._id,
        label: item.name
      }))
  })

  const { mutate: create } = useMutation({
    mutationKey: ["createProduct"],
    mutationFn: createProduct,
    onSuccess: () => {
      modals.closeAll()
      CToast.success({ title: "Tạo sản phẩm thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra" })
    }
  })

  const { mutate: update } = useMutation({
    mutationKey: ["updateProduct"],
    mutationFn: updateProduct,
    onSuccess: () => {
      modals.closeAll()
      CToast.success({ title: "Cập nhật sản phẩm thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra" })
    }
  })

  const submit = (values: CreateProductRequest) => {
    if (product?._id) {
      update({
        _id: product?._id,
        ...values
      })
    } else {
      create(values)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack gap={20} p={2}>
        <Text fw={700} fz="lg" mb={2}>
          {product ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
        </Text>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextInput
              label="Tên sản phẩm"
              placeholder="Nhập tên sản phẩm"
              required
              {...field}
              size="md"
            />
          )}
        />
        <Controller
          name="isReady"
          control={control}
          render={({ field }) => {
            return (
              <Switch
                checked={field.value}
                label="Sẵn hàng"
                onChange={field.onChange}
              />
            )
          }}
        />
        <Divider label="Thành phần sản phẩm" labelPosition="center" my={8} />
        <Box>
          <Stack gap={10}>
            {fields.map((field, index) => (
              <Group key={field.id} align="flex-end" gap={10}>
                <Controller
                  name={`items.${index}._id`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      className="grow"
                      data={itemsData}
                      placeholder="Chọn mặt hàng"
                      required
                      searchable
                      {...field}
                      label={index === 0 ? "Mặt hàng" : undefined}
                      w={180}
                      size="sm"
                    />
                  )}
                />
                <Controller
                  name={`items.${index}.quantity`}
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      placeholder="Số lượng"
                      min={1}
                      required
                      label={index === 0 ? "Số lượng" : undefined}
                      {...field}
                      w={120}
                      size="sm"
                    />
                  )}
                />
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => remove(index)}
                  title="Xóa dòng"
                  size="md"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ))}
            <Button
              leftSection={<IconPlus size={16} />}
              variant="light"
              color="indigo"
              mt={8}
              w={180}
              onClick={() => append({ _id: "", quantity: 1 })}
              size="sm"
              style={{ fontWeight: 600 }}
            >
              Thêm mặt hàng
            </Button>
          </Stack>
        </Box>
        <Divider my={8} />
        <Button type="submit" color="indigo" radius="xl" fw={600} size="md">
          {product ? "Lưu thay đổi" : "Tạo sản phẩm"}
        </Button>
      </Stack>
    </form>
  )
}
