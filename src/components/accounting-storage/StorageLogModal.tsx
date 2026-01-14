import {
  Button,
  Stack,
  NumberInput,
  Textarea,
  Select,
  Group,
  Divider,
  Flex,
  Text,
  ActionIcon
} from "@mantine/core"
import { Controller, useForm, useFieldArray } from "react-hook-form"
import { DatePickerInput } from "@mantine/dates"
import { IconCheck, IconPlus, IconTrash } from "@tabler/icons-react"
import { useLogs } from "../../hooks/useLogs"
import {
  DELIVERED_TAG_OPTIONS,
  RECEIVED_TAG_OPTION,
  RETURNED_TAG_OPTIONS
} from "../../constants/tags"
import { STATUS_OPTIONS } from "../../constants/status"
import { useMutation } from "@tanstack/react-query"
import { CToast } from "../common/CToast"

interface Props {
  itemsList: any[]
  log?: any
  onSuccess: () => void
}

export const StorageLogModal = ({ itemsList, log, onSuccess }: Props) => {
  const isEdit = Boolean(log)
  const { createStorageLog, updateStorageLog } = useLogs()

  // Edit: lấy log.items, Create: tạo mảng với 1 item rỗng
  const defaultItems =
    isEdit && log.items
      ? log.items.map((item: any) => ({
          _id: item._id,
          quantity: item.quantity
        }))
      : [{ _id: "", quantity: 1 }]

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      items: defaultItems,
      note: log?.note || "",
      status: log?.status || "delivered",
      date: log?.date
        ? new Date(log.date)
        : new Date(
            Date.UTC(
              new Date().getUTCFullYear(),
              new Date().getUTCMonth(),
              new Date().getUTCDate()
            )
          ),
      tag: log?.tag || ""
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  })

  const itemOptions = itemsList.map((it) => ({
    value: it._id,
    label: it.name
  }))

  const { mutate: createLog, isPending: isCreating } = useMutation({
    mutationFn: createStorageLog,
    onSuccess: () => {
      onSuccess()
      CToast.success({
        title: "Tạo log kho thành công"
      })
    },
    onError: (error) => {
      CToast.error({
        title: "Lỗi khi tạo log kho",
        subtitle: error.message || "Vui lòng thử lại sau"
      })
    }
  })

  const { mutate: updateLog, isPending: isUpdating } = useMutation({
    mutationFn: (data: any) => updateStorageLog(log._id, data),
    onSuccess: () => {
      onSuccess()
      CToast.success({
        title: "Cập nhật log kho thành công"
      })
    },
    onError: (error) => {
      CToast.error({
        title: "Lỗi khi cập nhật log kho",
        subtitle: error.message || "Vui lòng thử lại sau"
      })
    }
  })
  const isLoading = isCreating || isUpdating

  const onSubmit = (values: any) => {
    const submitData = {
      items: values.items.map((item: any) => ({
        _id: item._id,
        quantity: item.quantity
      })),
      note: values.note,
      status: values.status,
      date: values.date,
      tag: values.tag
    }

    if (isEdit) {
      updateLog(submitData)
    } else {
      createLog(submitData)
    }
  }

  const onInvalid = (errors: any) => {
    // Kiểm tra lỗi các trường cơ bản
    if (errors.status) {
      CToast.error({
        title: "Vui lòng chọn trạng thái",
        subtitle: "Trạng thái là trường bắt buộc"
      })
      return
    }

    if (errors.date) {
      CToast.error({
        title: "Vui lòng chọn ngày",
        subtitle: "Ngày là trường bắt buộc"
      })
      return
    }

    if (errors.tag) {
      CToast.error({
        title: "Vui lòng chọn phân loại",
        subtitle: "Phân loại là trường bắt buộc"
      })
      return
    }

    // Kiểm tra lỗi items
    if (errors.items) {
      const itemErrors = errors.items
      let errorMessage = ""

      for (let i = 0; i < itemErrors.length; i++) {
        if (itemErrors[i]?._id) {
          errorMessage = `Vui lòng chọn mặt hàng cho dòng ${i + 1}`
          break
        }
        if (itemErrors[i]?.quantity) {
          errorMessage = `Vui lòng nhập số lượng hợp lệ cho dòng ${i + 1}`
          break
        }
      }

      if (errorMessage) {
        CToast.error({
          title: "Thông tin mặt hàng chưa đầy đủ",
          subtitle: errorMessage
        })
        return
      }
    }

    // Lỗi chung
    CToast.error({
      title: "Vui lòng điền đầy đủ thông tin",
      subtitle: "Có một số trường bắt buộc chưa được điền"
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <Stack
        gap={18}
        pt={2}
        w="100%"
        style={{ maxWidth: 600, margin: "0 auto" }}
      >
        <Flex gap={20} wrap="wrap" align="center">
          <Controller
            name="status"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                label="Trạng thái"
                required
                data={STATUS_OPTIONS}
                {...field}
                value={field.value}
                radius="md"
                w={180}
              />
            )}
          />
          <Controller
            name="date"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <DatePickerInput
                label="Ngày"
                value={field.value}
                onChange={field.onChange}
                required
                radius="md"
                valueFormat="DD/MM/YYYY"
                w={180}
              />
            )}
          />
          <Controller
            name="tag"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                label="Phân loại"
                disabled={!watch("status")}
                required
                data={
                  watch("status") === "delivered"
                    ? DELIVERED_TAG_OPTIONS
                    : watch("status") === "received"
                      ? RECEIVED_TAG_OPTION
                      : RETURNED_TAG_OPTIONS
                }
                allowDeselect={false}
                value={field.value}
                onChange={field.onChange}
                radius="md"
                w={180}
              />
            )}
          />
        </Flex>
        <Divider my={0} />
        <Flex justify="space-between" align="center">
          <Text fw={600} fz="sm">
            Mặt hàng
          </Text>
          <Button
            size="xs"
            variant="light"
            leftSection={<IconPlus size={14} />}
            onClick={() => append({ _id: "", quantity: 1 })}
            radius="md"
          >
            Thêm mặt hàng
          </Button>
        </Flex>

        <Stack gap={12}>
          {fields.map((field, index) => (
            <Group key={field.id} align="flex-end" gap={8} w="100%">
              <Controller
                name={`items.${index}._id`}
                control={control}
                rules={{ required: true }}
                render={({ field: fieldProps }) => (
                  <Select
                    label={index === 0 ? "Mặt hàng" : ""}
                    data={itemOptions}
                    value={fieldProps.value}
                    onChange={fieldProps.onChange}
                    required
                    radius="md"
                    searchable
                    w={260}
                    placeholder="Chọn mặt hàng"
                  />
                )}
              />
              <Controller
                name={`items.${index}.quantity`}
                control={control}
                rules={{ required: true, min: 1 }}
                render={({ field: fieldProps }) => (
                  <NumberInput
                    label={index === 0 ? "Số lượng" : ""}
                    min={1}
                    radius="md"
                    w={120}
                    value={fieldProps.value}
                    onChange={fieldProps.onChange}
                    required
                  />
                )}
              />
              {fields.length > 1 && (
                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={() => remove(index)}
                  radius="md"
                  size="lg"
                >
                  <IconTrash size={18} />
                </ActionIcon>
              )}
            </Group>
          ))}
        </Stack>
        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Ghi chú"
              autosize
              minRows={2}
              maxRows={4}
              radius="md"
              {...field}
            />
          )}
        />
        <Button
          type="submit"
          leftSection={<IconCheck size={18} />}
          color="indigo"
          radius="xl"
          size="md"
          fw={600}
          loading={isLoading}
        >
          {isEdit ? "Cập nhật" : "Tạo mới"}
        </Button>
      </Stack>
    </form>
  )
}
