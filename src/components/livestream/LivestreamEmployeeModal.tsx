import { useState } from "react"
import { useLivestreamEmployees } from "../../hooks/useLivestreamEmployees"
import { useMutation } from "@tanstack/react-query"
import { Stack, TextInput, Button, Group, Switch, Text } from "@mantine/core"
import { modals } from "@mantine/modals"
import { CToast } from "../common/CToast"
import {
  CreateLivestreamEmployeeRequest,
  UpdateLivestreamEmployeeRequest
} from "../../hooks/models"

interface Props {
  employee?: {
    _id: string
    name: string
    active?: boolean
  }
  refetch: () => void
}

export const LivestreamEmployeeModal = ({ employee, refetch }: Props) => {
  const { createLivestreamEmployee, updateLivestreamEmployee } =
    useLivestreamEmployees()

  const [name, setName] = useState(employee?.name || "")
  const [active, setActive] = useState(employee?.active !== false)

  const { mutate: createEmployee, isPending: creating } = useMutation({
    mutationFn: (req: CreateLivestreamEmployeeRequest) =>
      createLivestreamEmployee(req),
    onSuccess: () => {
      CToast.success({ title: "Thêm nhân viên thành công" })
      modals.closeAll()
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi thêm nhân viên" })
    }
  })

  const { mutate: updateEmployee, isPending: updating } = useMutation({
    mutationFn: ({
      id,
      req
    }: {
      id: string
      req: UpdateLivestreamEmployeeRequest
    }) => updateLivestreamEmployee(id, req),
    onSuccess: () => {
      CToast.success({ title: "Cập nhật nhân viên thành công" })
      modals.closeAll()
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi cập nhật nhân viên" })
    }
  })

  const handleSubmit = () => {
    if (!name.trim()) {
      CToast.error({ title: "Vui lòng nhập tên nhân viên" })
      return
    }

    if (employee) {
      // Update existing employee
      updateEmployee({
        id: employee._id,
        req: {
          name: name.trim(),
          active
        }
      })
    } else {
      // Create new employee
      createEmployee({
        name: name.trim(),
        active
      })
    }
  }

  const isPending = creating || updating

  return (
    <Stack gap={16}>
      <TextInput
        label="Tên nhân viên"
        placeholder="Nhập tên nhân viên"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={isPending}
        size="md"
      />

      <Stack gap={8}>
        <Text fw={500} fz="sm">
          Trạng thái
        </Text>
        <Switch
          label={active ? "Hoạt động" : "Tạm dừng"}
          checked={active}
          onChange={(e) => setActive(e.currentTarget.checked)}
          disabled={isPending}
          size="md"
        />
      </Stack>

      <Group justify="flex-end" mt={16}>
        <Button
          variant="outline"
          onClick={() => modals.closeAll()}
          disabled={isPending}
        >
          Hủy
        </Button>
        <Button onClick={handleSubmit} loading={isPending}>
          {employee ? "Cập nhật" : "Thêm"}
        </Button>
      </Group>
    </Stack>
  )
}
