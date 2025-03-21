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
  Group
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
      items: [] // Initialize items as an empty array
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items" // Manage the "items" array
  })

  const { createProduct, updateProduct } = useProducts()
  const { getAllItems } = useItems()

  const { data: itemsData } = useQuery({
    queryKey: ["getAllItems"],
    queryFn: getAllItems,
    select: (data) => {
      return data.data.map((item) => ({
        value: item._id,
        label: item.name
      }))
    }
  })

  console.log(itemsData)

  const { mutate: create } = useMutation({
    mutationKey: ["createProduct"],
    mutationFn: createProduct,
    onSuccess: () => {
      modals.closeAll()
      CToast.success({
        title: "Tạo sản phẩm thành công"
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
    mutationKey: ["updateProduct"],
    mutationFn: updateProduct,
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
      <Stack gap={16}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => <TextInput label="Tên sản phẩm" {...field} />}
        />

        {/* Items Section */}
        <Stack gap={8}>
          {fields.map((field, index) => (
            <Group key={field.id} align="flex-end" gap={16}>
              <Controller
                name={`items.${index}._id`}
                control={control}
                render={({ field }) => (
                  <Select
                    label={!index && "Chọn mặt hàng"}
                    placeholder="Chọn mặt hàng"
                    data={itemsData}
                    className="flex-1"
                    searchable
                    {...field}
                    size="xs"
                  />
                )}
              />
              <Controller
                name={`items.${index}.quantity`}
                control={control}
                render={({ field }) => (
                  <NumberInput
                    label={!index && "Số lượng"}
                    placeholder="Nhập số lượng"
                    min={1}
                    className="flex-1"
                    {...field}
                    size="xs"
                  />
                )}
              />
              <ActionIcon
                color="red"
                variant="outline"
                onClick={() => remove(index)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
          <ActionIcon
            color="blue"
            variant="outline"
            onClick={() => append({ _id: "", quantity: 1 })}
          >
            <IconPlus size={16} />
          </ActionIcon>
        </Stack>

        <Button type="submit">Xác nhận</Button>
      </Stack>
    </form>
  )
}
