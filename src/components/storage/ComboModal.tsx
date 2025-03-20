import { Controller, useFieldArray, useForm } from "react-hook-form"
import { ComboResponse, CreateComboRequest } from "../../hooks/models"
import { useCombos } from "../../hooks/useCombos"
import { useProducts } from "../../hooks/useProducts"
import { useMutation, useQuery } from "@tanstack/react-query"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  TextInput
} from "@mantine/core"
import { IconPlus, IconTrash } from "@tabler/icons-react"

interface Props {
  combo?: ComboResponse
}

export const ComboModal = ({ combo }: Props) => {
  const { handleSubmit, control } = useForm<CreateComboRequest>({
    defaultValues: combo ?? {
      name: "",
      products: [] // Initialize items as an empty array
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products" // Manage the "items" array
  })

  const { createCombo, updateCombo } = useCombos()
  const { getAllProducts } = useProducts()

  const { data: productsData } = useQuery({
    queryKey: ["getAllProducts"],
    queryFn: getAllProducts,
    select: (data) => {
      return data.data.map((product) => ({
        value: product._id,
        label: product.name
      }))
    }
  })

  const { mutate: create } = useMutation({
    mutationKey: ["createCombo"],
    mutationFn: createCombo,
    onSuccess: () => {
      modals.closeAll()
      CToast.success({
        title: "Tạo combo thành công"
      })
    },
    onError: () => {
      CToast.error({
        title: "Có lỗi xảy ra"
      })
    }
  })

  const { mutate: update } = useMutation({
    mutationKey: ["updateCombo"],
    mutationFn: updateCombo,
    onSuccess: () => {
      modals.closeAll()
      CToast.success({
        title: "Cập nhật combo thành công"
      })
    },
    onError: () => {
      CToast.error({
        title: "Có lỗi xảy ra"
      })
    }
  })

  const submit = (values: CreateComboRequest) => {
    if (combo?._id) {
      update({
        _id: combo?._id,
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
          render={({ field }) => <TextInput label="Tên combo" {...field} />}
        />

        {/* Items Section */}
        <Stack gap={8}>
          {fields.map((field, index) => (
            <Group key={field.id} align="flex-end" gap={16}>
              <Controller
                name={`products.${index}._id`}
                control={control}
                render={({ field }) => (
                  <Select
                    label={!index && "Chọn mặt hàng"}
                    placeholder="Chọn mặt hàng"
                    data={productsData}
                    className="flex-1"
                    searchable
                    {...field}
                    size="xs"
                  />
                )}
              />
              <Controller
                name={`products.${index}.quantity`}
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
