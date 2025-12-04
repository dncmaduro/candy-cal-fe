import { createFileRoute } from "@tanstack/react-router"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { useSalesChannels } from "../../../hooks/useSalesChannels"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Box, Button, rem, Text, ActionIcon, Image } from "@mantine/core"
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { Can } from "../../../components/common/Can"
import { CToast } from "../../../components/common/CToast"
import { useState } from "react"
import type { SearchSalesChannelResponse } from "../../../hooks/models"
import { SalesChannelModal } from "../../../components/sales/SalesChannelModal"
import { CDataTable } from "../../../components/common/CDataTable"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

type SalesChannel = SearchSalesChannelResponse["data"][0]

export const Route = createFileRoute("/sales/channels/")({
  component: RouteComponent
})

function RouteComponent() {
  const { searchSalesChannels, deleteSalesChannel } = useSalesChannels()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchText, setSearchText] = useState("")

  const {
    data: channelsData,
    refetch,
    isLoading
  } = useQuery({
    queryKey: ["searchSalesChannels", page, limit, searchText],
    queryFn: () =>
      searchSalesChannels({
        page,
        limit,
        searchText: searchText || undefined
      }),
    select: (data) => data.data
  })

  const { mutate: deleteChannel } = useMutation({
    mutationFn: deleteSalesChannel,
    onSuccess: () => {
      CToast.success({ title: "Xóa kênh bán hàng thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi xóa kênh" })
    }
  })

  const openChannelModal = (channel?: SalesChannel) => {
    modals.open({
      title: (
        <b>{channel ? "Chỉnh sửa kênh bán hàng" : "Tạo kênh bán hàng mới"}</b>
      ),
      children: <SalesChannelModal channel={channel} refetch={refetch} />,
      size: "lg"
    })
  }

  const confirmDelete = (channel: SalesChannel) => {
    modals.openConfirmModal({
      title: "Xác nhận xóa",
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa kênh <strong>{channel.channelName}</strong>?
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteChannel(channel._id)
    })
  }

  const channels = channelsData?.data || []
  const total = channelsData?.total || 0

  const columns: ColumnDef<SalesChannel>[] = [
    {
      accessorKey: "channelName",
      header: "Tên kênh",
      cell: ({ row }) => (
        <Text fw={600} size="sm">
          {row.original.channelName}
        </Text>
      )
    },
    {
      accessorKey: "assignedTo",
      header: "Nhân viên phụ trách",
      cell: ({ row }) => (
        <Text size="sm">{row.original.assignedTo?.name || "Chưa có"}</Text>
      )
    },
    {
      accessorKey: "phoneNumber",
      header: "Số điện thoại",
      cell: ({ row }) => <Text size="sm">{row.original.phoneNumber}</Text>
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
      cell: ({ row }) => <Text size="sm">{row.original.address}</Text>
    },
    {
      accessorKey: "avatarUrl",
      header: "Ảnh đại diện",
      cell: ({ row }) => (
        <Image
          src={row.original.avatarUrl}
          alt={row.original.channelName}
          h={40}
          fit="contain"
        />
      )
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => (
        <Text size="sm" c="dimmed">
          {format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm")}
        </Text>
      )
    },
    {
      accessorKey: "updatedAt",
      header: "Cập nhật",
      cell: ({ row }) => (
        <Text size="sm" c="dimmed">
          {format(new Date(row.original.updatedAt), "dd/MM/yyyy HH:mm")}
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
    <SalesLayout>
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
            Quản lý kênh bán hàng
          </Text>
          <Text c="dimmed" fz="sm">
            Quản lý thông tin các kênh bán hàng
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
            isLoading={isLoading}
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
    </SalesLayout>
  )
}
