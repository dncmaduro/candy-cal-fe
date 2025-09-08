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
  Badge,
  ActionIcon
} from "@mantine/core"
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { Can } from "../../../components/common/Can"
import { LivestreamPeriodModal } from "../../../components/livestream/LivestreamPeriodModal"
import { CToast } from "../../../components/common/CToast"
import type { GetAllLivestreamPeriodsResponse } from "../../../hooks/models"

type LivestreamPeriod = GetAllLivestreamPeriodsResponse["periods"][0]

export const Route = createFileRoute("/livestream/periods/")({
  component: RouteComponent
})

function RouteComponent() {
  const { getAllLivestreamPeriods, deleteLivestreamPeriod } = useLivestream()

  const {
    data: periodsData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["getAllLivestreamPeriods"],
    queryFn: () => getAllLivestreamPeriods(),
    select: (data) => data.data.periods,
    refetchOnWindowFocus: true
  })

  const { mutate: deletePeriod } = useMutation({
    mutationFn: (id: string) => deleteLivestreamPeriod({ id }),
    onSuccess: () => {
      CToast.success({ title: "Xóa khoảng thời gian thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi xóa khoảng thời gian" })
    }
  })

  const formatTime = (time: { hour: number; minute: number }) => {
    const hour = time.hour.toString().padStart(2, "0")
    const minute = time.minute.toString().padStart(2, "0")
    return `${hour}:${minute}`
  }

  const formatTimeRange = (
    startTime: { hour: number; minute: number },
    endTime: { hour: number; minute: number }
  ) => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`
  }

  const openPeriodModal = (period?: LivestreamPeriod) => {
    modals.open({
      title: (
        <b>
          {period ? "Chỉnh sửa khoảng thời gian" : "Thêm khoảng thời gian mới"}
        </b>
      ),
      children: <LivestreamPeriodModal period={period} refetch={refetch} />,
      size: "md"
    })
  }

  const handleDelete = (period: LivestreamPeriod) => {
    modals.openConfirmModal({
      title: "Xác nhận xóa",
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa khoảng thời gian{" "}
          <strong>{formatTimeRange(period.startTime, period.endTime)}</strong>{" "}
          trên kênh <strong>{period.channel}</strong>?
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => deletePeriod(period._id)
    })
  }

  const colCount = 4

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
        <Flex
          align="flex-start"
          justify="space-between"
          pt={32}
          pb={8}
          px={{ base: 8, md: 28 }}
          direction="row"
          gap={8}
        >
          <Box>
            <Text fw={700} fz="xl" mb={2}>
              Quản lý khoảng thời gian livestream
            </Text>
            <Text c="dimmed" fz="sm">
              Quản lý các khung giờ phát sóng livestream trên các kênh
            </Text>
          </Box>
          <Can roles={["admin", "livestream-leader"]}>
            <Button
              onClick={() => openPeriodModal()}
              leftSection={<IconPlus size={16} />}
              size="md"
              radius={"xl"}
            >
              Thêm khung giờ
            </Button>
          </Can>
        </Flex>
        <Divider my={0} />

        <Box px={{ base: 4, md: 28 }} py={20}>
          <Table
            highlightOnHover
            striped
            withColumnBorders
            withTableBorder
            verticalSpacing="sm"
            horizontalSpacing="md"
            stickyHeader
            className="rounded-xl"
            miw={600}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Khoảng thời gian</Table.Th>
                <Table.Th>Kênh</Table.Th>
                <Table.Th>Loại</Table.Th>
                <Table.Th style={{ width: 120 }}>Hành động</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={colCount}>
                    <Flex justify="center" align="center" h={60}>
                      <Loader />
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              ) : periodsData && periodsData.length > 0 ? (
                periodsData
                  .sort((a: LivestreamPeriod, b: LivestreamPeriod) => {
                    // Sort by start time (hour then minute)
                    if (a.startTime.hour !== b.startTime.hour) {
                      return a.startTime.hour - b.startTime.hour
                    }
                    return a.startTime.minute - b.startTime.minute
                  })
                  .map((period: LivestreamPeriod) => (
                    <Table.Tr
                      key={period._id}
                      style={{
                        backgroundColor: period.noon
                          ? "var(--mantine-color-green-0)"
                          : undefined
                      }}
                    >
                      <Table.Td>
                        <Text fw={600}>
                          {formatTimeRange(period.startTime, period.endTime)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text>{period.channel}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={period.noon ? "green" : "blue"}
                          variant="light"
                        >
                          {period.noon ? "Khung giờ trưa" : "Khung giờ thường"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={8}>
                          <Can roles={["admin", "livestream-leader"]}>
                            <ActionIcon
                              variant="light"
                              color="indigo"
                              size="sm"
                              onClick={() => openPeriodModal(period)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Can>
                          <Can roles={["admin", "livestream-leader"]}>
                            <ActionIcon
                              variant="light"
                              color="red"
                              size="sm"
                              onClick={() => handleDelete(period)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Can>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={colCount}>
                    <Flex justify="center" align="center" h={60}>
                      <Text c="dimmed">Không có khoảng thời gian nào</Text>
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Box>
    </LivestreamLayout>
  )
}
