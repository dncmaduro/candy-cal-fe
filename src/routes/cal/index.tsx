import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../components/layouts/AppLayout"
import {
  Box,
  Group,
  Select,
  Stack,
  Text,
  ActionIcon,
  NumberInput,
  Button
} from "@mantine/core"
import { useProducts } from "../../hooks/useProducts"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { CalResultModal } from "../../components/cal/CalResultModal"
import { CalItemsRequest } from "../../hooks/models"

export const Route = createFileRoute("/cal/")({
  component: RouteComponent
})

function RouteComponent() {
  const { getAllProducts, calProducts } = useProducts()

  const { data: productsData } = useQuery({
    queryKey: ["getAllproducts"],
    queryFn: getAllProducts,
    select: (data) => {
      return data.data.map((product) => ({
        value: product._id,
        label: product.name
      }))
    }
  })

  const { mutate: calc } = useMutation({
    mutationKey: ["calProducts"],
    mutationFn: calProducts,
    onSuccess: (response) => {
      modals.open({
        title: "Tổng sản phẩm",
        children: <CalResultModal items={response.data} />
      })
    }
  })

  const { handleSubmit, control } = useForm<CalItemsRequest>({
    defaultValues: {
      products: []
    }
  })

  const {
    fields: productsFields,
    append: appendProduct,
    remove: removeProduct
  } = useFieldArray({
    control,
    name: "products"
  })

  const submit = (values: CalItemsRequest) => {
    calc(values)
  }

  return (
    <AppLayout>
      <Box mt={32} w={1000} mx="auto">
        <Text className="!text-lg !font-bold">
          Tính số mặt hàng dựa trên các sản phẩm
        </Text>
        <form onSubmit={handleSubmit(submit)}>
          <Stack gap={16}>
            <Stack p={16} mt={16} className="rounded-lg border border-gray-300">
              <Text className="!text-md !font-semibold">
                Chọn sản phẩm có sẵn
              </Text>
              {productsFields.map((field, index) => (
                <Group key={field.id} align="flex-end" gap={16}>
                  <Controller
                    name={`products.${index}._id`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        label={!index && "Chọn sản phẩm"}
                        placeholder="Chọn sản phẩm"
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
                    onClick={() => removeProduct(index)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
              <ActionIcon
                color="blue"
                variant="outline"
                onClick={() => appendProduct({ _id: "", quantity: 1 })}
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Stack>
            <Button type="submit" mt={32}>
              Xác nhận
            </Button>
          </Stack>
        </form>
      </Box>
    </AppLayout>
  )
}
