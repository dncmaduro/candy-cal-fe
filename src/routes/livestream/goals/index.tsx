import { createFileRoute } from "@tanstack/react-router"
import { LivestreamLayout } from "../../../components/layouts/LivestreamLayout"
import { useLivestream } from "../../../hooks/useLivestream"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Loader,
  rem,
  Table,
  Text,
  ActionIcon,
  Select
} from "@mantine/core"
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { Can } from "../../../components/common/Can"
import { CToast } from "../../../components/common/CToast"
import { useState } from "react"
import type { GetLivestreamMonthGoalsResponse } from "../../../hooks/models"
import { LivestreamGoalModal } from "../../../components/livestream/LivestreamGoalModal"

type LivestreamGoal = GetLivestreamMonthGoalsResponse["data"][0]

const CHANNELS = [
  { label: "Tất cả kênh", value: "" },
  { label: "Kênh 1", value: "channel1" },
  { label: "Kênh 2", value: "channel2" },
  { label: "TikTok", value: "tiktok" },
  { label: "Facebook", value: "facebook" }
]

export const Route = createFileRoute("/livestream/goals/")({
  component: RouteComponent
})

function RouteComponent() {
  const { getLivestreamMonthGoals, deleteLivestreamMonthGoal } = useLivestream()

  const [selectedChannel, setSelectedChannel] = useState<string>("")

  const {
    data: goalsData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["getLivestreamMonthGoals", selectedChannel],
    queryFn: () =>
      getLivestreamMonthGoals({
        page: 1,
        limit: 50,
        channel: selectedChannel || undefined
      }),
    select: (data) => data.data
  })

  const { mutate: deleteGoal } = useMutation({
    mutationFn: deleteLivestreamMonthGoal,
    onSuccess: () => {
      CToast.success({ title: "Xóa mục tiêu thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi xóa mục tiêu" })
    }
  })

  const openGoalModal = (goal?: LivestreamGoal) => {
    modals.open({
      title: <b>{goal ? "Chỉnh sửa mục tiêu" : "Tạo mục tiêu mới"}</b>,
      children: <LivestreamGoalModal goal={goal} refetch={refetch} />,
      size: "lg"
    })
  }

  const confirmDelete = (goal: LivestreamGoal) => {
    modals.openConfirmModal({
      title: "Xác nhận xóa",
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa mục tiêu tháng {goal.month + 1}/{goal.year}{" "}
          của kênh {goal.channel.name}?
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteGoal({ id: goal._id })
    })
  }

  const goals = goalsData?.data || []

  return (
    <LivestreamLayout>
      <Box
        mt={40}
        mx="auto"
        px={{ base: 8, md: 0 }}
        w="100%"
        style={{
          background: "rgba(255,255,255,0.97)",
          borderRadius: rem(20),
          boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
          border: "1px solid #ececec"
        }}
      >
        {/* Header Section */}
        <Flex
          align="flex-start"
          justify="space-between"
          pt={32}
          pb={16}
          px={{ base: 8, md: 28 }}
          direction="row"
          gap={8}
        >
          <Box>
            <Text fw={700} fz="xl" mb={2}>
              Mục tiêu Livestream theo tháng
            </Text>
            <Text c="dimmed" fz="sm">
              Quản lý mục tiêu doanh thu livestream theo tháng và kênh
            </Text>
          </Box>

          <Group>
            <Select
              placeholder="Chọn kênh"
              value={selectedChannel}
              onChange={(value) => setSelectedChannel(value || "")}
              data={CHANNELS}
              size="sm"
              w={180}
            />
            <Can roles={["admin", "livestream-leader"]}>
              <Button
                onClick={() => openGoalModal()}
                leftSection={<IconPlus size={16} />}
                size="md"
                radius="xl"
              >
                Tạo mục tiêu
              </Button>
            </Can>
          </Group>
        </Flex>

        <Divider my={0} />

        {/* Content */}
        <Box px={{ base: 4, md: 28 }} py={20}>
          {isLoading ? (
            <Flex justify="center" align="center" h={400}>
              <Loader />
            </Flex>
          ) : goals.length === 0 ? (
            <Flex justify="center" align="center" h={400}>
              <Text c="dimmed">Không có mục tiêu nào</Text>
            </Flex>
          ) : (
            <Table
              withColumnBorders
              withTableBorder
              striped
              verticalSpacing="sm"
              horizontalSpacing="md"
              stickyHeader
              className="rounded-xl"
              miw={600}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 120 }}>Tháng/Năm</Table.Th>
                  <Table.Th style={{ width: 150 }}>Kênh</Table.Th>
                  <Table.Th style={{ width: 180 }}>Mục tiêu (VNĐ)</Table.Th>
                  <Table.Th style={{ width: 140 }}>Thao tác</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {goals.map((goal) => (
                  <Table.Tr key={goal._id}>
                    <Table.Td>
                      <Text fw={600}>
                        {goal.month + 1}/{goal.year}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text>{goal.channel.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600} c="indigo">
                        {goal.goal.toLocaleString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Can roles={["admin", "livestream-leader"]}>
                          <ActionIcon
                            variant="light"
                            color="indigo"
                            size="sm"
                            onClick={() => openGoalModal(goal)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="sm"
                            onClick={() => confirmDelete(goal)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Can>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}

          {/* Summary */}
          {goals.length > 0 && (
            <Flex justify="space-between" align="center" mt={16}>
              <Text c="dimmed" fz="sm">
                Hiển thị {goals.length} mục tiêu
              </Text>
              <Text fw={600}>
                Tổng mục tiêu:{" "}
                {goals
                  .reduce((sum, goal) => sum + goal.goal, 0)
                  .toLocaleString()}{" "}
                VNĐ
              </Text>
            </Flex>
          )}
        </Box>
      </Box>
    </LivestreamLayout>
  )
}
