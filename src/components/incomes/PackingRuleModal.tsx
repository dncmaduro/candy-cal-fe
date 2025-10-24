import { useMutation, useQuery } from "@tanstack/react-query"
import { usePackingRules } from "../../hooks/usePackingRules"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import {
  CreatePackingRuleRequest,
  GetPackingRuleResponse
} from "../../hooks/models"
import { useProducts } from "../../hooks/useProducts"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import {
  Button,
  NumberInput,
  Select,
  Stack,
  Group,
  Divider,
  Text,
  ActionIcon,
  Paper
} from "@mantine/core"
import { PackingRulesBoxTypes } from "../../constants/rules"
import { IconPlus, IconTrash } from "@tabler/icons-react"

interface Props {
  rule?: GetPackingRuleResponse
  refetch: () => void
}

type FormData = CreatePackingRuleRequest

// Separate component for each product to avoid hooks in loops
const ProductSection = ({
  productIndex,
  control,
  errors,
  isSubmitted,
  getValues,
  trigger,
  productsData,
  isEdit,
  removeProduct,
  canRemove
}: {
  productIndex: number
  control: any
  errors: any
  isSubmitted: boolean
  getValues: any
  trigger: any
  productsData: any
  isEdit: boolean
  removeProduct: (index: number) => void
  canRemove: boolean
  creating: boolean
  updating: boolean
}) => {
  return (
    <Paper p="md" withBorder style={{ background: "#f9fafb" }}>
      <Group justify="space-between" mb="sm">
        <Text fw={600} size="sm">
          Sản phẩm #{productIndex + 1}
        </Text>
        {canRemove && (
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={() => removeProduct(productIndex)}
            size="sm"
          >
            <IconTrash size={16} />
          </ActionIcon>
        )}
      </Group>

      <Group align="flex-end" wrap="nowrap">
        <Controller
          control={control}
          name={`products.${productIndex}.productCode`}
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              label="Mã sản phẩm"
              placeholder="Chọn sản phẩm"
              required
              data={productsData || []}
              disabled={isEdit}
              size="sm"
              style={{ flex: 1 }}
              {...field}
              value={field.value ?? undefined}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name={`products.${productIndex}.minQuantity` as const}
          control={control}
          rules={{
            required: "Bắt buộc",
            min: { value: 1, message: ">= 1" }
          }}
          render={({ field }) => (
            <NumberInput
              label="Số lượng tối thiểu"
              min={1}
              placeholder="Min"
              w={140}
              size="sm"
              {...field}
              value={field.value ?? undefined}
              onChange={(value) => {
                field.onChange(value)
                trigger(`products.${productIndex}.maxQuantity`)
              }}
              error={
                isSubmitted && errors.products?.[productIndex]?.minQuantity
                  ? errors.products[productIndex].minQuantity?.message
                  : undefined
              }
            />
          )}
        />

        <Controller
          name={`products.${productIndex}.maxQuantity` as const}
          control={control}
          rules={{
            validate: (maxValue) => {
              const minValue = getValues(`products.${productIndex}.minQuantity`)
              if (
                minValue != null &&
                maxValue != null &&
                Number(maxValue) < Number(minValue)
              ) {
                return ">= min"
              }
              return true
            }
          }}
          render={({ field }) => (
            <NumberInput
              label="Số lượng tối đa"
              min={1}
              placeholder="Max"
              w={140}
              size="sm"
              {...field}
              value={field.value ?? undefined}
              onChange={(value) => {
                field.onChange(value)
                trigger(`products.${productIndex}.minQuantity`)
              }}
              error={
                isSubmitted && errors.products?.[productIndex]?.maxQuantity
                  ? errors.products[productIndex].maxQuantity?.message
                  : undefined
              }
            />
          )}
        />
      </Group>
    </Paper>
  )
}

export const PackingRuleModal = ({ rule, refetch }: Props) => {
  const { createRule, updateRule } = usePackingRules()
  const { searchProducts } = useProducts()

  const { data: productsData } = useQuery({
    queryKey: ["searchProducts"],
    queryFn: () => searchProducts({ searchText: "", deleted: false }),
    select: (data) =>
      data.data.map((product) => ({
        value: product.name,
        label: `${product.name}`
      }))
  })

  const isEdit = !!rule

  // Convert rule from API format to form format
  const defaultValues: FormData = rule
    ? rule
    : {
        products: [
          {
            productCode: "",
            minQuantity: null,
            maxQuantity: null
          }
        ],
        packingType: ""
      }

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitted },
    trigger
  } = useForm<FormData>({
    defaultValues
  })

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct
  } = useFieldArray({
    control,
    name: "products"
  })

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: createRule,
    onSuccess: () => {
      modals.closeAll()
      CToast.success({ title: "Tạo quy tắc đóng hàng thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra" })
    }
  })

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: ({
      productCode,
      req
    }: {
      productCode: string
      req: CreatePackingRuleRequest
    }) => updateRule(productCode, req),
    onSuccess: () => {
      modals.closeAll()
      CToast.success({ title: "Cập nhật quy tắc đóng hàng thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra" })
    }
  })

  const onSubmit = (values: FormData) => {
    if (isEdit) {
      // When editing, use the first product code as identifier
      const primaryProductCode = rule!.products[0].productCode
      update({
        productCode: primaryProductCode,
        req: values
      })
    } else {
      create(values)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={18} w={"100%"} p={2}>
        <Text fw={700} fz="lg" mb={-6}>
          {isEdit ? "Chỉnh sửa quy tắc đóng hàng" : "Tạo quy tắc đóng hàng mới"}
        </Text>
        <Divider my={2} />

        <Controller
          control={control}
          name="packingType"
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              label="Loại hộp đóng"
              placeholder="Chọn loại hộp"
              required
              data={PackingRulesBoxTypes}
              size="md"
              mb="md"
              {...field}
              value={field.value ?? undefined}
              onChange={field.onChange}
            />
          )}
        />

        <Divider label="Danh sách sản phẩm" labelPosition="center" my="sm" />

        {productFields.map((productField, productIndex) => (
          <ProductSection
            key={productField.id}
            productIndex={productIndex}
            control={control}
            errors={errors}
            isSubmitted={isSubmitted}
            getValues={getValues}
            trigger={trigger}
            productsData={productsData}
            isEdit={isEdit}
            removeProduct={removeProduct}
            canRemove={productFields.length > 1}
            creating={creating}
            updating={updating}
          />
        ))}

        <Button
          radius="md"
          size="sm"
          leftSection={<IconPlus size={16} />}
          variant="outline"
          color="indigo"
          onClick={() =>
            appendProduct({
              productCode: "",
              minQuantity: null,
              maxQuantity: null
            })
          }
          loading={creating || updating}
          style={{ fontWeight: 600 }}
        >
          Thêm sản phẩm
        </Button>

        <Divider my={6} />
        <Button
          type="submit"
          color="indigo"
          radius="xl"
          fw={600}
          size="md"
          loading={creating || updating}
        >
          Lưu
        </Button>
      </Stack>
    </form>
  )
}
