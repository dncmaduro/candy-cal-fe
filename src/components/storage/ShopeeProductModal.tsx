import {
  Box,
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useShopeeProducts } from "../../hooks/useShopeeProducts"
import { useItems } from "../../hooks/useItems"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import { IconTrash } from "@tabler/icons-react"
import { UpdateShopeeProductRequest } from "../../hooks/models"

interface Props {
  product?: {
    _id: string
    name: string
    items: {
      _id: string
      quantity: number
    }[]
  }
  refetch: () => void
}

export const ShopeeProductModal = ({ product, refetch }: Props) => {
  const { createShopeeProduct, updateShopeeProduct } = useShopeeProducts()
  const { searchStorageItems } = useItems()

  const { data: itemsData } = useQuery({
    queryKey: ["searchStorageItems"],
    queryFn: () => searchStorageItems({ searchText: "", deleted: false }),
    select: (data) => data.data
  })

  const form = useForm({
    initialValues: {
      name: product?.name || "",
      items: product?.items || []
    },
    validate: {
      name: (value: string) => (!value ? "Tên sản phẩm là bắt buộc" : null),
      items: (value: { _id: string; quantity: number }[]) =>
        value.length === 0 ? "Phải có ít nhất 1 mặt hàng" : null
    }
  })

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createShopeeProduct,
    onSuccess: () => {
      CToast.success({ title: "Tạo sản phẩm Shopee thành công" })
      refetch()
      modals.closeAll()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi tạo sản phẩm" })
    }
  })

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: (data: { id: string; req: UpdateShopeeProductRequest }) =>
      updateShopeeProduct(data.id, data.req),
    onSuccess: () => {
      CToast.success({ title: "Cập nhật sản phẩm Shopee thành công" })
      refetch()
      modals.closeAll()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi cập nhật sản phẩm" })
    }
  })

  const handleSubmit = (values: typeof form.values) => {
    if (product) {
      updateMutation({
        id: product._id,
        req: {
          name: values.name,
          items: values.items
        }
      })
    } else {
      createMutation({
        name: values.name,
        items: values.items
      })
    }
  }

  const itemOptions =
    itemsData?.map((item) => ({
      value: item._id,
      label: item.name
    })) || []

  const addItem = () => {
    form.insertListItem("items", { _id: "", quantity: 1 })
  }

  const removeItem = (index: number) => {
    form.removeListItem("items", index)
  }

  return (
    <Box>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap={16}>
          <TextInput
            label="Tên sản phẩm Shopee"
            placeholder="Nhập tên sản phẩm"
            withAsterisk
            {...form.getInputProps("name")}
          />

          <Box>
            <Text fw={500} size="sm" mb={8}>
              Mặt hàng trong sản phẩm <span style={{ color: "red" }}>*</span>
            </Text>
            <Stack gap={8}>
              {form.values.items.map((item, index) => (
                <Group key={index} align="end">
                  <Select
                    label={index === 0 ? "Mặt hàng" : ""}
                    placeholder="Chọn mặt hàng"
                    data={itemOptions}
                    searchable
                    value={item._id}
                    onChange={(value) =>
                      form.setFieldValue(`items.${index}._id`, value || "")
                    }
                    style={{ flex: 1 }}
                    error={
                      form.errors[`items.${index}._id`] as string | undefined
                    }
                  />
                  <NumberInput
                    label={index === 0 ? "Số lượng" : ""}
                    placeholder="Số lượng"
                    min={1}
                    value={item.quantity}
                    onChange={(value) =>
                      form.setFieldValue(
                        `items.${index}.quantity`,
                        Number(value) || 1
                      )
                    }
                    w={120}
                  />
                  <Button
                    variant="outline"
                    color="red"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={form.values.items.length === 1}
                  >
                    <IconTrash size={16} />
                  </Button>
                </Group>
              ))}
              <Button
                variant="outline"
                onClick={addItem}
                size="sm"
                w="fit-content"
              >
                Thêm mặt hàng
              </Button>
            </Stack>
            {form.errors.items && (
              <Text size="xs" c="red" mt={4}>
                {form.errors.items}
              </Text>
            )}
          </Box>

          <Group justify="flex-end" mt={16}>
            <Button variant="outline" onClick={() => modals.closeAll()}>
              Hủy
            </Button>
            <Button
              type="submit"
              loading={isCreating || isUpdating}
              color="indigo"
            >
              {product ? "Cập nhật" : "Tạo mới"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  )
}
