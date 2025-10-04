import { Controller, useFieldArray, useForm } from "react-hook-form"
import {
  Button,
  Stack,
  Select,
  NumberInput,
  ActionIcon,
  Group,
  Box,
  Divider,
  Text,
  Switch,
  Textarea
} from "@mantine/core"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { useProducts } from "../../hooks/useProducts"
import { useMutation, useQuery } from "@tanstack/react-query"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import { ReadyComboResponse, CreateReadyComboRequest } from "../../hooks/models"
import { useReadyCombos } from "../../hooks/useReadyCombos"

interface Props {
  combo?: ReadyComboResponse
  refetch: () => void
}

export const ReadyComboModal = ({ combo, refetch }: Props) => {
  const { handleSubmit, control } = useForm<CreateReadyComboRequest>({
    defaultValues: combo
      ? {
          products: combo.products,
          isReady: combo.isReady,
          note: combo.note || ""
        }
      : {
          products: [],
          isReady: false,
          note: ""
        }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products"
  })

  const { searchProducts } = useProducts()
  const { data: productsData } = useQuery({
    queryKey: ["searchProducts"],
    queryFn: () => searchProducts({ searchText: "", deleted: false }),
    select: (data) =>
      data.data.map((item) => ({
        value: item._id,
        label: item.name
      }))
  })

  const { createCombo, updateCombo } = useReadyCombos()

  const { mutate: create } = useMutation({
    mutationKey: ["createCombo"],
    mutationFn: createCombo,
    onSuccess: () => {
      modals.closeAll()
      CToast.success({ title: "Tạo combo thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra" })
    }
  })

  const { mutate: update } = useMutation({
    mutationKey: ["updateCombo"],
    mutationFn: ({ _id, ...rest }: any) => updateCombo(_id, rest),
    onSuccess: () => {
      modals.closeAll()
      CToast.success({ title: "Cập nhật combo thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra" })
    }
  })

  const submit = (values: CreateReadyComboRequest) => {
    if (combo?._id) {
      update({ _id: combo._id, ...values })
    } else {
      create(values)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack gap={20} p={2}>
        <Text fw={700} fz="lg" mb={2}>
          {combo ? "Chỉnh sửa combo" : "Tạo combo mới"}
        </Text>

        <Controller
          name="isReady"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              label="Combo đã sẵn sàng"
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Ghi chú"
              placeholder="Thêm ghi chú (nếu có)"
              autosize
              minRows={2}
              {...field}
              size="md"
            />
          )}
        />

        <Divider label="Thành phần combo" labelPosition="center" my={8} />
        <Box>
          <Stack gap={10}>
            {fields.map((field, index) => (
              <Group key={field.id} align="flex-end" gap={10}>
                <Controller
                  name={`products.${index}._id`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      className="grow"
                      data={productsData}
                      placeholder="Chọn sản phẩm"
                      required
                      searchable
                      {...field}
                      label={index === 0 ? "Sản phẩm" : undefined}
                      w={180}
                      size="sm"
                    />
                  )}
                />
                <Controller
                  name={`products.${index}.quantity`}
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
              Thêm sản phẩm
            </Button>
          </Stack>
        </Box>
        <Divider my={8} />
        <Button type="submit" color="indigo" radius="xl" fw={600} size="md">
          {combo ? "Lưu thay đổi" : "Tạo combo"}
        </Button>
      </Stack>
    </form>
  )
}
