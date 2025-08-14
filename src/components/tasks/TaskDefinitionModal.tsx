import { useMutation, useQuery } from "@tanstack/react-query"
import { modals } from "@mantine/modals"
import {
  Button,
  Group,
  MultiSelect,
  NumberInput,
  Stack,
  Switch as MSwitch,
  TextInput,
  Select,
  Loader,
  Badge,
  Text
} from "@mantine/core"
import { useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { useTasks } from "../../hooks/useTasks"
import { useEndpoints } from "../../hooks/useEndpoints"
import { CToast } from "../common/CToast"
import type {
  CreateTaskDefinitionRequest,
  TaskDefinition,
  UpdateTaskDefinitionRequest
} from "../../hooks/models"

interface Props {
  taskDefinition?: TaskDefinition
  refetch: () => void
}

interface FormValues {
  code: string
  title: string
  roles: string[]
  order: number
  active: boolean
  type: "manual" | "http"
  autoComplete: boolean
  httpEndpointKey: string
  httpRunAt: string
}

export const TaskDefinitionModal = ({ taskDefinition, refetch }: Props) => {
  const { createTaskDefinition, updateTaskDefinition } = useTasks()
  const { getAllAPIEndpoints } = useEndpoints()
  const isEdit = !!taskDefinition

  const { control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      code: taskDefinition?.code || "",
      title: taskDefinition?.title || "",
      roles: taskDefinition?.roles || [],
      order: taskDefinition?.order || 0,
      active: taskDefinition?.active ?? true,
      type: taskDefinition?.type || "manual",
      autoComplete: taskDefinition?.autoComplete ?? false,
      httpEndpointKey: taskDefinition?.httpConfig?.endpointKey || "",
      httpRunAt: taskDefinition?.httpConfig?.runAt || ""
    }
  })

  const type = watch("type")
  const httpEndpointKey = watch("httpEndpointKey")
  const httpRunAt = watch("httpRunAt")

  const { data: endpointsData, isLoading: loadingEndpoints } = useQuery({
    queryKey: ["apiEndpoints"],
    queryFn: getAllAPIEndpoints,
    select: (res) => res.data.data,
    enabled: type === "http"
  })

  const endpointMap = useMemo(
    () =>
      Object.fromEntries(
        (endpointsData || [])
          .filter((e) => e.active)
          .map((e) => [
            e.key,
            { method: e.method, url: e.url, label: e.name || e.key }
          ])
      ),
    [endpointsData]
  )

  const endpointData = useMemo(
    () =>
      Object.entries(endpointMap).map(([key, v]) => ({
        label: v.label,
        value: key
      })),
    [endpointMap]
  )

  const { mutate: createMut, isPending: creating } = useMutation({
    mutationFn: (payload: CreateTaskDefinitionRequest) =>
      createTaskDefinition(payload),
    onSuccess: () => {
      CToast.success({ title: "Đã tạo" })
      refetch()
      modals.closeAll()
    },
    onError: () => CToast.error({ title: "Tạo thất bại" })
  })

  const { mutate: updateMut, isPending: updating } = useMutation({
    mutationFn: (payload: UpdateTaskDefinitionRequest & { code: string }) =>
      updateTaskDefinition(payload.code, payload),
    onSuccess: () => {
      CToast.success({ title: "Đã cập nhật" })
      refetch()
      modals.closeAll()
    },
    onError: () => CToast.error({ title: "Cập nhật thất bại" })
  })

  const onSubmit = (vals: FormValues) => {
    if (isEdit) {
      const payload: UpdateTaskDefinitionRequest & { code: string } = {
        code: taskDefinition!.code,
        title: vals.title,
        roles: vals.roles,
        order: vals.order,
        active: vals.active,
        autoComplete: vals.type === "manual" ? vals.autoComplete : undefined,
        type: vals.type,
        httpConfig:
          vals.type === "http"
            ? {
                endpointKey: vals.httpEndpointKey,
                runAt: vals.httpRunAt
              }
            : undefined
      }
      updateMut(payload)
    } else {
      const payload: CreateTaskDefinitionRequest = {
        code: vals.code,
        title: vals.title,
        roles: vals.roles,
        order: vals.order,
        autoComplete: vals.type === "manual" ? vals.autoComplete : undefined,
        type: vals.type,
        httpConfig:
          vals.type === "http"
            ? {
                endpointKey: vals.httpEndpointKey,
                runAt: vals.httpRunAt
              }
            : undefined
      }
      createMut(payload)
    }
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
  const invalidTime = type === "http" && httpRunAt && !timeRegex.test(httpRunAt)
  const disableSubmit = !!(
    creating ||
    updating ||
    (type === "http" && (!httpEndpointKey || !httpRunAt || invalidTime))
  )

  const endpointColor = (method?: string) => {
    switch (method) {
      case "GET":
        return "blue"
      case "POST":
        return "grape"
      case "PATCH":
        return "yellow"
      case "DELETE":
        return "red"
      default:
        return "gray"
    }
  }

  const EndpointRow = ({
    method,
    label,
    url
  }: {
    method?: string
    label: string
    url?: string
  }) => (
    <Group gap={6} wrap="nowrap">
      <Badge size="xs" color={endpointColor(method)}>
        {method}
      </Badge>
      <Stack gap={0} style={{ flex: 1 }}>
        <Text size="xs" fw={600} lineClamp={1}>
          {label}
        </Text>
        {url && (
          <Text size="10px" c="dimmed" lineClamp={1}>
            {url}
          </Text>
        )}
      </Stack>
    </Group>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={14} pt={4}>
        <Text fw={700} fz="lg">
          {isEdit ? `Sửa task ${taskDefinition?.code}` : "Tạo task mới"}
        </Text>
        {!isEdit && (
          <Controller
            name="code"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextInput label="Code" withAsterisk {...field} />
            )}
          />
        )}
        <Controller
          name="title"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <TextInput label="Tiêu đề" withAsterisk {...field} />
          )}
        />
        <Controller
          name="roles"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Roles"
              data={["admin", "accounting-emp", "order-emp", "system-emp"]}
              searchable
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="order"
          control={control}
          render={({ field }) => (
            <NumberInput
              label="Thứ tự"
              value={field.value}
              onChange={(v) => field.onChange(Number(v) || 0)}
            />
          )}
        />
        <Group gap={12}>
          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <MSwitch
                checked={field.value}
                label="Active"
                onChange={(e) => field.onChange(e.currentTarget.checked)}
              />
            )}
          />
          {type === "manual" && (
            <Controller
              name="autoComplete"
              control={control}
              render={({ field }) => (
                <MSwitch
                  checked={field.value}
                  label="Auto complete"
                  onChange={(e) => field.onChange(e.currentTarget.checked)}
                />
              )}
            />
          )}
        </Group>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <MSwitch
              checked={field.value === "http"}
              label="HTTP task"
              onChange={(e) =>
                field.onChange(e.currentTarget.checked ? "http" : "manual")
              }
            />
          )}
        />
        {type === "http" && (
          <Stack gap={8}>
            <Controller
              name="httpEndpointKey"
              control={control}
              render={({ field }) => (
                <Stack gap={4}>
                  <Select
                    label="Endpoint"
                    placeholder="Chọn endpoint"
                    searchable
                    nothingFoundMessage="Không có endpoint"
                    data={endpointData}
                    value={field.value}
                    onChange={(v) => field.onChange(v || "")}
                    rightSection={
                      loadingEndpoints ? <Loader size={16} /> : undefined
                    }
                    renderOption={({ option }) => {
                      const meta = endpointMap[option.value] || {}
                      return (
                        <EndpointRow
                          method={meta.method}
                          label={meta.label || option.label}
                          url={meta.url}
                        />
                      )
                    }}
                  />
                  {field.value && (
                    <Group
                      gap={6}
                      wrap="nowrap"
                      px={6}
                      py={4}
                      style={{
                        border: "1px solid var(--mantine-color-gray-3)",
                        borderRadius: 6
                      }}
                    >
                      {(() => {
                        const meta = endpointMap[field.value] || {}
                        return (
                          <EndpointRow
                            method={meta.method}
                            label={meta.label || field.value}
                            url={meta.url}
                          />
                        )
                      })()}
                    </Group>
                  )}
                </Stack>
              )}
            />
            <Controller
              name="httpRunAt"
              control={control}
              render={({ field }) => (
                <TextInput
                  label="Run At (HH:MM)"
                  placeholder="08:30"
                  value={field.value}
                  onChange={(e) => field.onChange(e.currentTarget.value)}
                  error={invalidTime ? "Định dạng HH:MM" : undefined}
                />
              )}
            />
          </Stack>
        )}
        <Group justify="flex-end" mt={4}>
          <Button
            type="submit"
            loading={creating || updating}
            disabled={disableSubmit}
          >
            {isEdit ? "Lưu" : "Tạo"}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
