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
  TextInput,
  Divider,
  Button
} from "@mantine/core"
import { useProducts } from "../../hooks/useProducts"
import { useCombos } from "../../hooks/useCombos"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { useMemo } from "react"
import { modals } from "@mantine/modals"
import { CalResultModal } from "../../components/cal/CalResultModal"

export const Route = createFileRoute("/cal/")({
  component: RouteComponent
})

interface CalType {
  combos: {
    _id: string // Existing combos have _id from the database
    quantity: number
  }[]
  optionalCombos: {
    name: string
    quantity: number
    products: {
      _id: string
      quantity: number
    }[]
  }[]
}

function RouteComponent() {
  const { getAllProducts } = useProducts()
  const { getAllCombos, calCombos } = useCombos()

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

  const { data: allCombos } = useQuery({
    queryKey: ["getAllCombos"],
    queryFn: getAllCombos,
    select: (data) => {
      return data.data
    }
  })

  const { mutate: calc } = useMutation({
    mutationKey: ["calCombos"],
    mutationFn: calCombos,
    onSuccess: (response) => {
      modals.open({
        title: "Tổng sản phẩm",
        children: <CalResultModal items={response.data} />
      })
    }
  })

  const combosData = useMemo(() => {
    if (allCombos)
      return allCombos.map((combo) => ({
        value: combo._id,
        label: combo.name
      }))

    return []
  }, [allCombos])

  const dataForCal = (values: CalType) => {
    return [
      ...values.combos.map((combo) => ({
        products:
          (allCombos && allCombos.find((c) => c._id === combo._id))?.products ||
          [],
        quantity: combo.quantity
      })),
      ...values.optionalCombos.map((combo) => ({
        products: combo.products,
        quantity: combo.quantity
      }))
    ]
  }

  const { handleSubmit, control } = useForm<CalType>({
    defaultValues: {
      combos: [],
      optionalCombos: []
    }
  })

  const {
    fields: combosFields,
    append: appendCombo,
    remove: removeCombo
  } = useFieldArray({
    control,
    name: "combos"
  })

  const {
    fields: optionalCombosFields,
    append: appendOptionalCombo,
    remove: removeOptionalCombo
  } = useFieldArray({
    control,
    name: "optionalCombos"
  })

  const submit = (values: CalType) => {
    const data = dataForCal(values)
    calc(data)
  }

  return (
    <AppLayout>
      <Box mt={32} w={1000} mx="auto">
        <Text className="!text-lg !font-bold">
          Tính số mặt hàng dựa trên các combo
        </Text>
        <form onSubmit={handleSubmit(submit)}>
          <Stack gap={16}>
            {/* Part 1: Select existing combos */}
            <Stack p={16} mt={16} className="rounded-lg border border-gray-300">
              <Text className="!text-md !font-semibold">Chọn combo có sẵn</Text>
              {combosFields.map((field, index) => (
                <Group key={field.id} align="flex-end" gap={16}>
                  <Controller
                    name={`combos.${index}._id`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        label={!index && "Chọn combo"}
                        placeholder="Chọn combo"
                        data={combosData}
                        className="flex-1"
                        searchable
                        {...field}
                        size="xs"
                      />
                    )}
                  />
                  <Controller
                    name={`combos.${index}.quantity`}
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
                    onClick={() => removeCombo(index)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
              <ActionIcon
                color="blue"
                variant="outline"
                onClick={() => appendCombo({ _id: "", quantity: 1 })}
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Stack>

            {/* Part 2: Add optional combos */}
            <Divider h={4} color="gray.9" />
            <Text className="!text-md !font-semibold">Thêm combo tuỳ chọn</Text>
            {optionalCombosFields.map((field, index) => (
              <Stack
                key={field.id}
                gap={8}
                p={16}
                className="rounded-lg border border-gray-300"
              >
                <Group align="flex-end" gap={16}>
                  <Controller
                    name={`optionalCombos.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        {...field}
                        label={`Combo tuỳ chọn ${index + 1}`}
                        hidden
                        value={`Combo ${index}`}
                        size="xs"
                      />
                    )}
                  />
                  <Controller
                    name={`optionalCombos.${index}.quantity`}
                    control={control}
                    render={({ field }) => (
                      <NumberInput
                        label={!index && "Số lượng"}
                        placeholder="Nhập số lượng"
                        min={1}
                        w={400}
                        {...field}
                        size="xs"
                      />
                    )}
                  />
                  <ActionIcon
                    color="red"
                    variant="outline"
                    onClick={() => removeOptionalCombo(index)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
                <Stack gap={8} mt={16}>
                  <Text className="!text-sm !font-medium">Sản phẩm</Text>
                  <Controller
                    name={`optionalCombos.${index}.products`}
                    control={control}
                    render={({ field }) => (
                      <Stack gap={16}>
                        {field.value?.map((product, productIndex) => (
                          <Group key={productIndex} align="flex-end" gap={16}>
                            <Select
                              label={!productIndex && "Chọn sản phẩm"}
                              placeholder="Chọn sản phẩm"
                              data={productsData}
                              className="flex-1"
                              searchable
                              value={product._id}
                              onChange={(value) =>
                                field.onChange(
                                  field.value.map((p, i) =>
                                    i === productIndex
                                      ? { ...p, _id: value }
                                      : p
                                  )
                                )
                              }
                              size="xs"
                            />
                            <NumberInput
                              label={!productIndex && "Số lượng"}
                              placeholder="Nhập số lượng"
                              min={1}
                              className="flex-1"
                              value={product.quantity}
                              onChange={(value) =>
                                field.onChange(
                                  field.value.map((p, i) =>
                                    i === productIndex
                                      ? { ...p, quantity: value }
                                      : p
                                  )
                                )
                              }
                              size="xs"
                            />
                            <ActionIcon
                              color="red"
                              variant="outline"
                              onClick={() =>
                                field.onChange(
                                  field.value.filter(
                                    (_, i) => i !== productIndex
                                  )
                                )
                              }
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        ))}
                        <ActionIcon
                          color="blue"
                          variant="outline"
                          onClick={() =>
                            field.onChange([
                              ...(field.value || []),
                              { _id: "", quantity: 1 }
                            ])
                          }
                        >
                          <IconPlus size={16} />
                        </ActionIcon>
                      </Stack>
                    )}
                  />
                </Stack>
              </Stack>
            ))}
            <ActionIcon
              color="blue"
              variant="outline"
              onClick={() =>
                appendOptionalCombo({
                  name: "",
                  quantity: 1,
                  products: [{ _id: "", quantity: 1 }]
                })
              }
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Stack>
          <Button type="submit" mt={32}>
            Xác nhận
          </Button>
        </form>
      </Box>
    </AppLayout>
  )
}
