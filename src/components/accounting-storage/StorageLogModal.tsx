import {
  Button,
  Stack,
  NumberInput,
  Textarea,
  Select,
  Group,
  Divider,
  Flex,
  Text
} from "@mantine/core"
import { Controller, useForm } from "react-hook-form"
import { DatePickerInput } from "@mantine/dates"
import { IconCheck } from "@tabler/icons-react"
import { useLogs } from "../../hooks/useLogs"
import {
  DELIVERED_TAG_OPTIONS,
  RECEIVED_TAG_OPTION
} from "../../constants/tags"
import { STATUS_OPTIONS } from "../../constants/status"

interface Props {
  itemsList: any[]
  log?: any
  onSuccess: () => void
}

export const StorageLogModal = ({ itemsList, log, onSuccess }: Props) => {
  const isEdit = Boolean(log)
  const { createStorageLog, updateStorageLog } = useLogs()

  // Edit: lấy log.item, Create: null
  const defaultItem = isEdit && log.item ? log.item : undefined

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      item: defaultItem?._id ?? "",
      quantity: defaultItem?.quantity ?? 1,
      note: log?.note || "",
      status: log?.status || "delivered",
      date: log?.date ? new Date(log.date) : new Date(),
      tag: log?.tag || ""
    }
  })

  const itemOptions = itemsList.map((it) => ({
    value: it._id,
    label: it.name
  }))

  const onSubmit = (values: any) => {
    const submitData = {
      item: {
        _id: values.item,
        quantity: values.quantity
      },
      note: values.note,
      status: values.status,
      date: values.date,
      tag: values.tag
    }

    if (isEdit) {
      updateStorageLog(log._id, submitData).then(onSuccess)
    } else {
      createStorageLog(submitData).then(onSuccess)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
            render={({ field }) => (
              <Select
                label="Phân loại"
                disabled={!watch("status")}
                required
                data={
                  watch("status") === "delivered"
                    ? DELIVERED_TAG_OPTIONS
                    : RECEIVED_TAG_OPTION
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
        <Text fw={600} fz="sm" mb={-4}>
          Mặt hàng
        </Text>
        <Group align="flex-end" gap={8} w="100%">
          <Controller
            name="item"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                label="Mặt hàng"
                data={itemOptions}
                value={field.value}
                onChange={field.onChange}
                required
                radius="md"
                searchable
                w={260}
                placeholder="Chọn mặt hàng"
              />
            )}
          />
          <Controller
            name="quantity"
            control={control}
            rules={{ required: true, min: 1 }}
            render={({ field }) => (
              <NumberInput
                label="Số lượng"
                min={1}
                radius="md"
                w={120}
                value={field.value}
                onChange={field.onChange}
                required
              />
            )}
          />
        </Group>
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
        >
          {isEdit ? "Cập nhật" : "Tạo mới"}
        </Button>
      </Stack>
    </form>
  )
}
