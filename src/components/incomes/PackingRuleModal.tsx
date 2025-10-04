import { useMutation, useQuery } from "@tanstack/react-query"
import { usePackingRules } from "../../hooks/usePackingRules"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import {
  CreatePackingRuleRequest,
  GetPackingRuleResponse,
  UpdatePackingRuleRequest
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
  Box
} from "@mantine/core"
import { PackingRulesBoxTypes } from "../../constants/rules"
import { IconPlus, IconTrash } from "@tabler/icons-react"

interface Props {
  rule?: GetPackingRuleResponse
  refetch: () => void
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

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitted },
    trigger
  } = useForm<CreatePackingRuleRequest>({
    defaultValues: rule ?? {
      productCode: "",
      requirements: [
        {
          packingType: "",
          minQuantity: 0,
          maxQuantity: 0
        }
      ]
    }
  })

  const { append, fields, remove } = useFieldArray({
    control,
    name: "requirements"
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
      req: UpdatePackingRuleRequest
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

  const onSubmit = (values: CreatePackingRuleRequest) => {
    if (isEdit) {
      update({
        productCode: rule!.productCode,
        req: { requirements: values.requirements }
      })
    } else {
      create({
        productCode: values.productCode,
        requirements: values.requirements
      })
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
          name="productCode"
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              label="Chọn sản phẩm"
              placeholder="Chọn sản phẩm"
              required
              data={productsData || []}
              disabled={isEdit}
              size="md"
              {...field}
              value={field.value ?? undefined}
              onChange={field.onChange}
            />
          )}
        />
        <Divider label="Các quy cách đóng" labelPosition="center" my={0} />
        <Stack gap={10} w="100%">
          {fields.map((field, index) => (
            <Group
              key={field.id}
              align="flex-start"
              gap={10}
              className="rounded-lg bg-[#f7f8fa] px-3 py-2"
              wrap="wrap"
            >
              <Controller
                name={`requirements.${index}.packingType`}
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    label={index === 0 ? "Loại đóng" : undefined}
                    data={PackingRulesBoxTypes}
                    required
                    w={160}
                    size="sm"
                    {...field}
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name={`requirements.${index}.minQuantity`}
                control={control}
                rules={{
                  required: "Bắt buộc nhập",
                  min: { value: 1, message: "Tối thiểu phải >= 1" },
                  validate: (minValue) => {
                    if (index === 0) return true
                    const prevMax = getValues(
                      `requirements.${index - 1}.maxQuantity`
                    )
                    if (prevMax == null || prevMax === 0) return true
                    if (minValue == null || minValue < 1)
                      return "Tối thiểu phải >= 1"
                    return Number(minValue) > Number(prevMax)
                      ? true
                      : `Tối thiểu phải lớn hơn tối đa của dòng trước (${prevMax})`
                  }
                }}
                render={({ field }) => (
                  <NumberInput
                    label={index === 0 ? "Tối thiểu" : undefined}
                    min={1}
                    placeholder="Số lượng"
                    w={120}
                    size="sm"
                    {...field}
                    value={field.value ?? undefined}
                    onChange={(value) => {
                      field.onChange(value)
                      trigger(`requirements.${index}.maxQuantity`)
                      if (index < getValues("requirements").length - 1) {
                        trigger(`requirements.${index + 1}.minQuantity`)
                      }
                    }}
                    error={
                      isSubmitted
                        ? errors.requirements?.[index]?.minQuantity?.message
                        : undefined
                    }
                  />
                )}
              />
              <Controller
                name={`requirements.${index}.maxQuantity`}
                control={control}
                rules={{
                  validate: (maxValue) => {
                    const minValue = getValues(
                      `requirements.${index}.minQuantity`
                    )
                    if (
                      minValue != null &&
                      maxValue != null &&
                      Number(maxValue) < Number(minValue)
                    ) {
                      return "Tối đa phải >= tối thiểu"
                    }
                    return true
                  }
                }}
                render={({ field }) => (
                  <NumberInput
                    label={index === 0 ? "Tối đa" : undefined}
                    min={1}
                    placeholder="Số lượng"
                    w={120}
                    size="sm"
                    {...field}
                    value={field.value ?? undefined}
                    onChange={(value) => {
                      field.onChange(value)
                      trigger(`requirements.${index}.minQuantity`)
                      if (index < getValues("requirements").length - 1) {
                        trigger(`requirements.${index + 1}.minQuantity`)
                      }
                    }}
                    error={
                      isSubmitted
                        ? errors.requirements?.[index]?.maxQuantity?.message
                        : undefined
                    }
                  />
                )}
              />
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={() => remove(index)}
                size="md"
                title="Xóa quy cách"
                disabled={fields.length === 1}
                mt={index === 0 ? 21 : 0}
              >
                <IconTrash size={17} />
              </ActionIcon>
            </Group>
          ))}
          <Box>
            <Button
              radius="xl"
              size="sm"
              mt={2}
              leftSection={<IconPlus size={16} />}
              variant="light"
              color="indigo"
              onClick={() =>
                append({ packingType: "", minQuantity: 0, maxQuantity: 0 })
              }
              loading={creating || updating}
              style={{ fontWeight: 600 }}
            >
              Thêm quy cách
            </Button>
          </Box>
        </Stack>
        <Divider my={6} />
        <Button
          type="submit"
          color="indigo"
          radius="xl"
          fw={600}
          size="md"
          loading={creating || updating}
        >
          {isEdit ? "Lưu thay đổi" : "Tạo quy tắc"}
        </Button>
      </Stack>
    </form>
  )
}
