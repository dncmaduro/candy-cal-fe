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
  TextInput,
  Pagination,
  NumberInput
} from "@mantine/core"
import {
  IconEdit,
  IconPlus,
  IconTrash,
  IconExternalLink
} from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { Can } from "../../../components/common/Can"
import { CToast } from "../../../components/common/CToast"
import { useState } from "react"
import type { SearchLivestreamChannelsResponse } from "../../../hooks/models"
import { LivestreamChannelModal } from "../../../components/livestream/LivestreamChannelModal"

type LivestreamChannel = SearchLivestreamChannelsResponse["data"][0]

export const Route = createFileRoute("/livestream/channels/")({
  component: RouteComponent
})

function RouteComponent() {
  const { searchLivestreamChannels, deleteLivestreamChannel } = useLivestream()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchText, setSearchText] = useState("")

  const {
    data: channelsData,
    isLoading,
    refetch
  } = useQuery({
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
      CToast.success({ title: "Xóa kênh thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi xóa kênh" })
    }
  })

  const openChannelModal = (channel?: LivestreamChannel) => {
    modals.open({
      title: <b>{channel ? "Chỉnh sửa kênh" : "Tạo kênh mới"}</b>,
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
              Quản lý kênh livestream
            </Text>
            <Text c="dimmed" fz="sm">
              Quản lý thông tin các kênh phát sóng livestream
            </Text>
          </Box>

          <Can roles={["admin", "livestream-leader"]}>
            <Button
              onClick={() => openChannelModal()}
              leftSection={<IconPlus size={16} />}
              size="md"
              radius="xl"
            >
              Thêm kênh
            </Button>
          </Can>
        </Flex>

        <Divider my={0} />

        {/* Filters */}
        <Box px={{ base: 8, md: 28 }} py={16}>
          <Group gap={16} align="end">
            <TextInput
              label="Tìm kiếm"
              placeholder="Nhập tên kênh hoặc username"
              value={searchText}
              onChange={(e) => setSearchText(e.currentTarget.value)}
              size="sm"
              style={{ minWidth: 250 }}
            />
          </Group>
        </Box>

        {/* Content */}
        <Box px={{ base: 4, md: 28 }} py={20}>
          {isLoading ? (
            <Flex justify="center" align="center" h={400}>
              <Loader />
            </Flex>
          ) : channels.length === 0 ? (
            <Flex justify="center" align="center" h={400}>
              <Text c="dimmed">
                {searchText ? "Không tìm thấy kênh nào" : "Chưa có kênh nào"}
              </Text>
            </Flex>
          ) : (
            <>
              <Table
                withColumnBorders
                withTableBorder
                striped
                verticalSpacing="sm"
                horizontalSpacing="md"
                stickyHeader
                className="rounded-xl"
                miw={800}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 200 }}>Tên kênh</Table.Th>
                    <Table.Th style={{ width: 150 }}>Username</Table.Th>
                    <Table.Th>Link</Table.Th>
                    <Table.Th style={{ width: 140 }}>Thao tác</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {channels.map((channel) => (
                    <Table.Tr key={channel._id}>
                      <Table.Td>
                        <Text fw={600}>{channel.name}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text c="dimmed">@{channel.username}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Text
                            component="a"
                            href={channel.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              textDecoration: "none",
                              color: "var(--mantine-color-indigo-6)",
                              cursor: "pointer"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.textDecoration = "underline"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.textDecoration = "none"
                            }}
                          >
                            {channel.link.length > 50
                              ? `${channel.link.substring(0, 50)}...`
                              : channel.link}
                          </Text>
                          <ActionIcon
                            component="a"
                            href={channel.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="light"
                            color="indigo"
                            size="xs"
                          >
                            <IconExternalLink size={12} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Can roles={["admin", "livestream-leader"]}>
                            <ActionIcon
                              variant="light"
                              color="indigo"
                              size="sm"
                              onClick={() => openChannelModal(channel)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="red"
                              size="sm"
                              onClick={() => confirmDelete(channel)}
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

              {/* Pagination */}
              <Flex justify="space-between" align="center" mt={16}>
                <Text c="dimmed" mr={8}>
                  Tổng số kênh: {total}
                </Text>
                <Pagination
                  total={Math.ceil(total / limit)}
                  value={page}
                  onChange={setPage}
                />
                <Group>
                  <Text>Số dòng/trang</Text>
                  <NumberInput
                    value={limit}
                    onChange={(val) => setLimit(Number(val) || 10)}
                    w={100}
                    min={5}
                    max={100}
                  />
                </Group>
              </Flex>
            </>
          )}
        </Box>
      </Box>
    </LivestreamLayout>
  )
}
