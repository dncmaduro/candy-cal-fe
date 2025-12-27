import { createFileRoute } from "@tanstack/react-router"
import { LivestreamLayout } from "../../../components/layouts/LivestreamLayout"
import { useLivestreamPeriods } from "../../../hooks/useLivestreamPeriods"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useMemo } from "react"
import {
  Box,
  Button,
  Divider,
  Group,
  rem,
  Text,
  ActionIcon
} from "@mantine/core"
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { Can } from "../../../components/common/Can"
import { LivestreamPeriodModal } from "../../../components/livestream/LivestreamPeriodModal"
import { CToast } from "../../../components/common/CToast"
import { CDataTable } from "../../../components/common/CDataTable"
import { ColumnDef } from "@tanstack/react-table"
import type { GetAllLivestreamPeriodsResponse } from "../../../hooks/models"

type LivestreamPeriod = GetAllLivestreamPeriodsResponse["periods"][0]

export const Route = createFileRoute("/livestream/periods/")({
  component: RouteComponent
})

function RouteComponent() {
  const { getAllLivestreamPeriods, deleteLivestreamPeriod } =
    useLivestreamPeriods()

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
          trên kênh <strong>{period.channel.name}</strong>?
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => deletePeriod(period._id)
    })
  }

  // Sort periods by start time
  const sortedPeriods = useMemo(() => {
    if (!periodsData) return []
    return [...periodsData].sort((a, b) => {
      if (a.startTime.hour !== b.startTime.hour) {
        return a.startTime.hour - b.startTime.hour
      }
      return a.startTime.minute - b.startTime.minute
    })
  }, [periodsData])

  const columns = useMemo<ColumnDef<LivestreamPeriod>[]>(
    () => [
      {
        accessorKey: "startTime",
        header: "Khoảng thời gian",
        size: 200,
        cell: ({ row }) => (
          <Text size="sm" fw={600}>
            {formatTimeRange(row.original.startTime, row.original.endTime)}
          </Text>
        )
      },
      {
        accessorKey: "channel",
        header: "Kênh",
        size: 200,
        cell: ({ row }) => <Text size="sm">{row.original.channel.name}</Text>
      },
      {
        accessorKey: "for",
        header: "Dành cho",
        size: 120,
        cell: ({ row }) => (
          <Text size="sm" tt="capitalize">
            {row.original.for === "host" ? "Host" : "Trợ live"}
          </Text>
        )
      },
      {
        id: "actions",
        header: "Hành động",
        size: 120,
        cell: ({ row }) => (
          <Group gap={8}>
            <Can roles={["admin", "livestream-leader"]}>
              <ActionIcon
                variant="light"
                color="indigo"
                size="sm"
                onClick={() => openPeriodModal(row.original)}
              >
                <IconEdit size={16} />
              </ActionIcon>
            </Can>
            <Can roles={["admin", "livestream-leader"]}>
              <ActionIcon
                variant="light"
                color="red"
                size="sm"
                onClick={() => handleDelete(row.original)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Can>
          </Group>
        )
      }
    ],
    [refetch]
  )

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
        <Box pt={32} pb={16} px={{ base: 8, md: 28 }}>
          <Box>
            <Text fw={700} fz="xl" mb={2}>
              Quản lý khoảng thời gian livestream
            </Text>
            <Text c="dimmed" fz="sm">
              Quản lý các khung giờ phát sóng livestream trên các kênh
            </Text>
          </Box>
        </Box>
        <Divider my={0} />

        <Box px={{ base: 4, md: 28 }} py={20}>
          <CDataTable
            columns={columns}
            data={sortedPeriods}
            isLoading={isLoading}
            page={1}
            totalPages={1}
            onPageChange={() => {}}
            onPageSizeChange={() => {}}
            initialPageSize={100}
            pageSizeOptions={[50, 100]}
            extraActions={
              <Can roles={["admin", "livestream-leader"]}>
                <Button
                  onClick={() => openPeriodModal()}
                  leftSection={<IconPlus size={16} />}
                  size="sm"
                >
                  Thêm khung giờ
                </Button>
              </Can>
            }
          />
        </Box>
      </Box>
    </LivestreamLayout>
  )
}
