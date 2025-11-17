import { createFileRoute } from "@tanstack/react-router"
import { LivestreamLayout } from "../../../components/layouts/LivestreamLayout"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Box, Button, rem, Text, ActionIcon } from "@mantine/core"
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { Can } from "../../../components/common/Can"
import { CToast } from "../../../components/common/CToast"
import { useState } from "react"
import { LivestreamChannelModal } from "../../../components/livestream/LivestreamChannelModal"
import { CDataTable } from "../../../components/common/CDataTable"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { useLivestream } from "../../../hooks/useLivestream"

type LivestreamChannel = {
  _id: string
  name: string
  username: string
  link: string
  createdAt?: string
  updatedAt?: string
}

export const Route = createFileRoute("/livestream/channels/")({
  component: RouteComponent
})

function RouteComponent() {
  const { searchLivestreamChannels, deleteLivestreamChannel } = useLivestream()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchText, setSearchText] = useState("")

  const { data: channelsData, refetch } = useQuery({
    queryKey: ["searchLivestreamChannels", page, limit, searchText],
    queryFn: () =>
      searchLivestreamChannels({
        page,
        limit,
        searchText: searchText || undefined
      }),
    select: (data) => data.data
  })

  const { mutate: deleteChannel } = useMutation({
    mutationFn: deleteLivestreamChannel,
    onSuccess: () => {
      CToast.success({ title: "Xóa kênh livestream thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi xóa kênh" })
    }
  })

  const openChannelModal = (channel?: LivestreamChannel) => {
    modals.open({
      title: (
        <b>
          {channel ? "Chỉnh sửa kênh livestream" : "Tạo kênh livestream mới"}
        </b>
      ),
      children: <LivestreamChannelModal channel={channel} refetch={refetch} />,
      size: "lg"
    })
  }

  const confirmDelete = (channel: LivestreamChannel) => {
    modals.openConfirmModal({
      title: "Xác nhận xóa",
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa kênh <strong>{channel.name}</strong>?
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteChannel({ id: channel._id })
    })
  }

  const channels = channelsData?.data || []
  const total = channelsData?.total || 0

  const columns: ColumnDef<LivestreamChannel>[] = [
    {
      accessorKey: "name",
      header: "Tên kênh",
      cell: ({ row }) => (
        <Text fw={600} size="sm">
          {row.original.name}
        </Text>
      )
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => <Text size="sm">{row.original.username}</Text>
    },
    {
      accessorKey: "link",
      header: "Link",
      cell: ({ row }) => (
        <Text size="sm" c="blue" className="max-w-xs truncate">
          <a href={row.original.link} target="_blank" rel="noopener noreferrer">
            {row.original.link}
          </a>
        </Text>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => (
        <Text size="sm" c="dimmed">
          {row.original.createdAt
            ? format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm")
            : "-"}
        </Text>
      )
    },
    {
      accessorKey: "updatedAt",
      header: "Cập nhật",
      cell: ({ row }) => (
        <Text size="sm" c="dimmed">
          {row.original.updatedAt
            ? format(new Date(row.original.updatedAt), "dd/MM/yyyy HH:mm")
            : "-"}
        </Text>
      )
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <Can roles={["admin", "sales-leader"]}>
          <div className="flex gap-2">
            <ActionIcon
              variant="light"
              color="indigo"
              size="sm"
              onClick={() => openChannelModal(row.original)}
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              size="sm"
              onClick={() => confirmDelete(row.original)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </div>
        </Can>
      ),
      enableSorting: false
    }
  ]

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
        <Box pt={32} pb={16} px={{ base: 8, md: 28 }}>
          <Text fw={700} fz="xl" mb={2}>
            Quản lý kênh livestream
          </Text>
          <Text c="dimmed" fz="sm">
            Quản lý thông tin các kênh livestream
          </Text>
        </Box>

        {/* Content */}
        <Box px={{ base: 4, md: 28 }} pb={20}>
          <CDataTable
            columns={columns}
            data={channels}
            enableGlobalFilter={true}
            globalFilterValue={searchText}
            onGlobalFilterChange={setSearchText}
            page={page}
            totalPages={Math.ceil(total / limit)}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            initialPageSize={limit}
            pageSizeOptions={[10, 20, 50, 100]}
            extraActions={
              <Can roles={["admin", "sales-leader"]}>
                <Button
                  onClick={() => openChannelModal()}
                  leftSection={<IconPlus size={16} />}
                  size="sm"
                  radius="md"
                >
                  Thêm kênh
                </Button>
              </Can>
            }
          />
        </Box>
      </Box>
    </LivestreamLayout>
  )
}
