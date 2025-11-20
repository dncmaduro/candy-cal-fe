import {
  Badge,
  Button,
  Group,
  Box,
  Text,
  Select,
  ActionIcon,
  Drawer,
  Stack,
  ScrollArea,
  Textarea
} from "@mantine/core"
import { DateTimePicker } from "@mantine/dates"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { modals } from "@mantine/modals"
import { format } from "date-fns"
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconPhone,
  IconMessage,
  IconDots
} from "@tabler/icons-react"
import { useSalesActivities } from "../../hooks/useSalesActivities"
import { CToast } from "../common/CToast"

interface SalesActivitiesDrawerProps {
  opened: boolean
  onClose: () => void
  funnelId: string | null
  funnelName: string
}

export const SalesActivitiesDrawer = ({
  opened,
  onClose,
  funnelId,
  funnelName
}: SalesActivitiesDrawerProps) => {
  const {
    getSalesActivities,
    createSalesActivity,
    updateSalesActivity,
    deleteSalesActivity
  } = useSalesActivities()

  const [activityFormOpen, setActivityFormOpen] = useState(false)
  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null
  )
  const [activityType, setActivityType] = useState<
    "call" | "message" | "other"
  >("call")
  const [activityTime, setActivityTime] = useState<Date>(new Date())
  const [activityNote, setActivityNote] = useState("")

  // Load activities for selected funnel
  const { data: activitiesData, refetch: refetchActivities } = useQuery({
    queryKey: ["salesActivities", funnelId],
    queryFn: () =>
      getSalesActivities({
        salesFunnelId: funnelId!,
        page: 1,
        limit: 100
      }),
    enabled: !!funnelId && opened
  })

  // Mutations for activities
  const { mutate: createActivityMutation } = useMutation({
    mutationFn: createSalesActivity,
    onSuccess: () => {
      CToast.success({ title: "Tạo hoạt động thành công" })
      refetchActivities()
      resetActivityForm()
    },
    onError: () => {
      CToast.error({ title: "Tạo hoạt động thất bại" })
    }
  })

  const { mutate: updateActivityMutation } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateSalesActivity(id, data),
    onSuccess: () => {
      CToast.success({ title: "Cập nhật hoạt động thành công" })
      refetchActivities()
      resetActivityForm()
    },
    onError: () => {
      CToast.error({ title: "Cập nhật hoạt động thất bại" })
    }
  })

  const { mutate: deleteActivityMutation } = useMutation({
    mutationFn: deleteSalesActivity,
    onSuccess: () => {
      CToast.success({ title: "Xóa hoạt động thành công" })
      refetchActivities()
    },
    onError: () => {
      CToast.error({ title: "Xóa hoạt động thất bại" })
    }
  })

  const resetActivityForm = () => {
    setActivityFormOpen(false)
    setEditingActivityId(null)
    setActivityType("call")
    setActivityTime(new Date())
    setActivityNote("")
  }

  const handleCreateActivity = () => {
    setActivityFormOpen(true)
    setEditingActivityId(null)
    setActivityType("call")
    setActivityTime(new Date())
    setActivityNote("")
  }

  const handleEditActivity = (activity: any) => {
    setActivityFormOpen(true)
    setEditingActivityId(activity._id)
    setActivityType(activity.type)
    setActivityTime(new Date(activity.time))
    setActivityNote(activity.note || "")
  }

  const handleSaveActivity = () => {
    if (!funnelId) return

    if (editingActivityId) {
      updateActivityMutation({
        id: editingActivityId,
        data: {
          time: activityTime,
          type: activityType,
          note: activityNote
        }
      })
    } else {
      createActivityMutation({
        time: activityTime,
        type: activityType,
        note: activityNote,
        salesFunnelId: funnelId
      })
    }
  }

  const handleDeleteActivity = (activityId: string) => {
    modals.openConfirmModal({
      title: <b>Xác nhận xóa</b>,
      children: (
        <Text size="sm">Bạn có chắc chắn muốn xóa hoạt động này không?</Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteActivityMutation(activityId)
    })
  }

  const handleClose = () => {
    resetActivityForm()
    onClose()
  }

  console.log(activitiesData?.data)

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={600} size="lg">
          Hoạt động chăm sóc - {funnelName}
        </Text>
      }
      position="right"
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="md">
        {/* Add Activity Button */}
        {!activityFormOpen && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleCreateActivity}
            variant="light"
            fullWidth
          >
            Thêm hoạt động mới
          </Button>
        )}

        {/* Activity Form */}
        {activityFormOpen && (
          <Box
            p="md"
            style={{
              border: "2px solid #228be6",
              borderRadius: "8px",
              backgroundColor: "#f0f7ff"
            }}
          >
            <Text fw={600} mb="md">
              {editingActivityId ? "Chỉnh sửa hoạt động" : "Thêm hoạt động mới"}
            </Text>

            <Stack gap="sm">
              <Select
                label="Loại hoạt động"
                data={[
                  { value: "call", label: "Gọi điện" },
                  { value: "message", label: "Tin nhắn" },
                  { value: "other", label: "Khác" }
                ]}
                value={activityType}
                onChange={(value) => setActivityType(value as any)}
                required
              />

              <DateTimePicker
                label="Thời gian"
                value={activityTime}
                onChange={(value) => setActivityTime(value || new Date())}
                valueFormat="DD/MM/YYYY HH:mm"
                required
              />

              <Textarea
                label="Ghi chú"
                placeholder="Nhập ghi chú về hoạt động..."
                value={activityNote}
                onChange={(e) => setActivityNote(e.currentTarget.value)}
                minRows={3}
              />

              <Group justify="flex-end" gap="xs">
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={resetActivityForm}
                >
                  Hủy
                </Button>
                <Button onClick={handleSaveActivity}>
                  {editingActivityId ? "Cập nhật" : "Tạo"}
                </Button>
              </Group>
            </Stack>
          </Box>
        )}

        {/* Activities List */}
        {activitiesData?.data && activitiesData.data.data.length > 0 ? (
          activitiesData.data.data.map((activity) => {
            console.log(activity)
            return (
              <Box
                key={activity._id}
                p="md"
                style={{
                  border: "1px solid #e9ecef",
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa"
                }}
              >
                <Group justify="space-between" mb="xs">
                  <Badge
                    color="blue"
                    variant="light"
                    leftSection={
                      activity.type === "call" ? (
                        <IconPhone size={14} />
                      ) : activity.type === "message" ? (
                        <IconMessage size={14} />
                      ) : (
                        <IconDots size={14} />
                      )
                    }
                  >
                    {activity.type === "call"
                      ? "Gọi điện"
                      : activity.type === "message"
                        ? "Tin nhắn"
                        : "Khác"}
                  </Badge>
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">
                      {format(new Date(activity.time), "dd/MM/yyyy HH:mm")}
                    </Text>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="blue"
                      onClick={() => handleEditActivity(activity)}
                    >
                      <IconEdit size={14} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      onClick={() => handleDeleteActivity(activity._id)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
                {activity.note && <Text size="sm">{activity.note}</Text>}
              </Box>
            )
          })
        ) : !activityFormOpen ? (
          <Box ta="center" py="xl">
            <Text size="sm" c="dimmed">
              Chưa có hoạt động chăm sóc nào
            </Text>
          </Box>
        ) : null}
      </Stack>
    </Drawer>
  )
}
