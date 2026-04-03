import { useMemo, useState, useCallback } from "react"
import { useDeliveredRequests } from "../../hooks/useDeliveredRequests"
import { useLivestreamChannels } from "../../hooks/useLivestreamChannels"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Text,
  rem,
  Badge,
  Select
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { format } from "date-fns"
import { IconArrowBackUp, IconCheck, IconEye, IconX } from "@tabler/icons-react"
import { CToast } from "../common/CToast"
import { modals } from "@mantine/modals"
import { DeliveredRequestModal } from "./DeliveredRequestModal"
import { Helmet } from "react-helmet-async"
import { Can } from "../common/Can"
import { CDataTable } from "../common/CDataTable"
import type { ColumnDef } from "@tanstack/react-table"
import { AppLayout } from "../layouts/AppLayout"
import { useAuthGuard } from "../../hooks/useAuthGuard"
import type { AppNavItem } from "../../constants/navs"
import type {
  AcceptDeliveredRequestRequest,
  SearchDeliveredRequestsResponse,
  UndoAcceptDeliveredRequestRequest
} from "../../hooks/models"

type DeliveredRequestRow = SearchDeliveredRequestsResponse["requests"][number]

type Props = {
  roles: string[]
  navs: AppNavItem[]
}

const startOfDayISO = (value: Date) => {
  const nextValue = new Date(value)
  nextValue.setHours(0, 0, 0, 0)
  return nextValue.toISOString()
}

const endOfDayISO = (value: Date) => {
  const nextValue = new Date(value)
  nextValue.setHours(23, 59, 59, 999)
  return nextValue.toISOString()
}

export const DeliveredRequestsPage = ({ roles, navs }: Props) => {
  useAuthGuard(roles)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [channelId, setChannelId] = useState<string | null>(null)

  const { searchDeliveredRequests, acceptDeliveredRequest, undoAcceptRequest } =
    useDeliveredRequests()
  const { searchLivestreamChannels } = useLivestreamChannels()

  const { data: channelsData } = useQuery({
    queryKey: ["livestreamChannels"],
    queryFn: async () => {
      const response = await searchLivestreamChannels({ page: 1, limit: 100 })
      return response.data.data
    }
  })

  const channelOptions = useMemo(() => {
    if (!channelsData) return []
    return channelsData.map((item) => ({ label: item.name, value: item._id }))
  }, [channelsData])

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      startDate: startDate ? startOfDayISO(startDate) : undefined,
      endDate: endDate ? endOfDayISO(endDate) : undefined,
      channelId: channelId || undefined
    }),
    [page, limit, startDate, endDate, channelId]
  )

  const {
    data: requestsData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["deliveredRequests", queryParams],
    queryFn: () => searchDeliveredRequests(queryParams),
    select: (res) => res.data
  })

  const requests: DeliveredRequestRow[] = requestsData?.requests ?? []
  const total = requestsData?.total ?? 0
  const totalPages = Math.ceil((total || 1) / limit)

  const { mutate: accept, isPending: isAccepting } = useMutation({
    mutationFn: acceptDeliveredRequest,
    onSuccess: () => {
      refetch()
      CToast.success({ title: "Yêu cầu xuất kho đã được chấp nhận" })
    },
    onError: (error: unknown) => {
      CToast.error({
        title: "Có lỗi xảy ra khi chấp nhận yêu cầu xuất kho",
        subtitle: error instanceof Error ? error.message : "Vui lòng thử lại sau"
      })
      refetch()
    }
  })

  const { mutate: undo, isPending: isUndoing } = useMutation({
    mutationFn: undoAcceptRequest,
    onSuccess: () => {
      refetch()
      CToast.success({ title: "Yêu cầu xuất kho đã được hoàn tác" })
    },
    onError: (error: unknown) => {
      CToast.error({
        title: "Có lỗi xảy ra khi hoàn tác yêu cầu xuất kho",
        subtitle: error instanceof Error ? error.message : "Vui lòng thử lại sau"
      })
      refetch()
    }
  })

  const handleAcceptRequest = useCallback((request: DeliveredRequestRow) => {
    modals.openConfirmModal({
      title: <b>Xác nhận chấp nhận yêu cầu</b>,
      size: "lg",
      centered: true,
      labels: { confirm: "Chấp nhận", cancel: "Hủy" },
      onConfirm: () =>
        accept({ requestId: request._id } as AcceptDeliveredRequestRequest),
      children: (
        <Text>
          Bạn chắc chắn muốn xác nhận yêu cầu xuất kho ngày{" "}
          <b>{format(new Date(request.date), "dd/MM/yyyy")}</b>?
        </Text>
      )
    })
  }, [accept])

  const handleUndoRequest = useCallback((request: DeliveredRequestRow) => {
    modals.openConfirmModal({
      title: <b>Xác nhận hoàn tác yêu cầu</b>,
      size: "lg",
      centered: true,
      labels: { confirm: "Hoàn tác", cancel: "Hủy" },
      onConfirm: () =>
        undo({ requestId: request._id } as UndoAcceptDeliveredRequestRequest),
      children: (
        <Text>
          Bạn chắc chắn muốn hoàn tác yêu cầu xuất kho ngày{" "}
          <b>{format(new Date(request.date), "dd/MM/yyyy")}</b>?
        </Text>
      )
    })
  }, [undo])

  const openDetail = useCallback(
    (request: DeliveredRequestRow) => {
      modals.open({
        title: (
          <Text fw={800} fz="md">
            Chi tiết yêu cầu xuất kho
          </Text>
        ),
        children: (
          <DeliveredRequestModal
            request={request}
            acceptRequest={() => handleAcceptRequest(request)}
          />
        ),
        size: "xl"
      })
    },
    [handleAcceptRequest]
  )

  const columns: ColumnDef<DeliveredRequestRow>[] = useMemo(
    () => [
      {
        id: "date",
        header: "Ngày xuất",
        cell: ({ row }) => (
          <Text fw={700} fz="sm">
            {format(new Date(row.original.date), "dd/MM/yyyy")}
          </Text>
        )
      },
      {
        id: "channel",
        header: "Kênh",
        cell: ({ row }) => {
          const channel = row.original.channel
          return channel ? (
            <Text fz="sm">{channel.name}</Text>
          ) : (
            <Text fz="sm" c="dimmed">
              -
            </Text>
          )
        }
      },
      {
        id: "itemsCount",
        header: "Mặt hàng",
        cell: ({ row }) => (
          <Text fz="sm" ta="left" fw={700}>
            {row.original.items?.length ?? 0}
          </Text>
        )
      },
      {
        id: "note",
        header: "Ghi chú",
        cell: ({ row }) =>
          row.original.note ? (
            <Text fz="sm" lineClamp={2}>
              {row.original.note}
            </Text>
          ) : (
            <Text fz="sm" c="dimmed">
              -
            </Text>
          )
      },
      {
        id: "accepted",
        header: "Trạng thái",
        cell: ({ row }) => {
          const isAccepted = !!row.original.accepted
          return isAccepted ? (
            <Badge variant="light" color="green">
              Đã duyệt
            </Badge>
          ) : (
            <Badge variant="light" color="yellow">
              Chờ duyệt
            </Badge>
          )
        }
      },
      {
        id: "updatedAt",
        header: "Cập nhật",
        cell: ({ row }) => {
          const updatedAt = row.original.updatedAt
          return updatedAt ? (
            <Text fz="sm" c="dimmed">
              {format(new Date(updatedAt), "dd/MM/yyyy")}
            </Text>
          ) : (
            <Text fz="sm" c="dimmed">
              -
            </Text>
          )
        }
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const request = row.original
          const isBusy = isAccepting || isUndoing

          return (
            <Group justify="flex-end" gap={8} wrap="nowrap">
              <Button
                size="xs"
                radius="xl"
                variant="light"
                leftSection={<IconEye size={16} />}
                onClick={() => openDetail(request)}
              >
                Xem
              </Button>

              <Can roles={["admin", "accounting-emp"]}>
                {!request.accepted ? (
                  <Button
                    size="xs"
                    radius="xl"
                    color="green"
                    variant="light"
                    leftSection={<IconCheck size={16} />}
                    loading={isAccepting}
                    disabled={isBusy}
                    onClick={() => handleAcceptRequest(request)}
                  >
                    Duyệt
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    radius="xl"
                    color="yellow"
                    variant="light"
                    leftSection={<IconArrowBackUp size={16} />}
                    loading={isUndoing}
                    disabled={isBusy}
                    onClick={() => handleUndoRequest(request)}
                  >
                    Hoàn tác
                  </Button>
                )}
              </Can>
            </Group>
          )
        }
      }
    ],
    [handleAcceptRequest, handleUndoRequest, openDetail, isAccepting, isUndoing]
  )

  const extraFilters = (
    <Group gap={12} align="flex-end" wrap="wrap">
      <DatePickerInput
        value={startDate}
        onChange={(value) => {
          setPage(1)
          setStartDate(value)
        }}
        placeholder="Từ ngày"
        valueFormat="DD/MM/YYYY"
        size="sm"
        radius="md"
        clearable
        w={160}
      />
      <DatePickerInput
        value={endDate}
        onChange={(value) => {
          setPage(1)
          setEndDate(value)
        }}
        placeholder="Đến ngày"
        valueFormat="DD/MM/YYYY"
        size="sm"
        radius="md"
        clearable
        w={160}
      />

      <Select
        placeholder="Kênh"
        value={channelId}
        onChange={(value) => {
          setPage(1)
          setChannelId(value)
        }}
        data={channelOptions}
        searchable
        clearable
        size="sm"
        radius="md"
        w={180}
      />

      <Button
        size="sm"
        radius="md"
        variant="subtle"
        leftSection={<IconX size={16} />}
        onClick={() => {
          setPage(1)
          setStartDate(null)
          setEndDate(null)
          setChannelId(null)
        }}
      >
        Xoá lọc
      </Button>
    </Group>
  )

  const extraActions = (
    <Text c="dimmed" fz="sm">
      Tổng: <b>{total}</b> yêu cầu
    </Text>
  )

  return (
    <AppLayout navs={navs}>
      <Helmet>
        <title>Kho - Yêu cầu xuất kho | MyCandy</title>
      </Helmet>

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
          justify="space-between"
          align="flex-end"
          pt={28}
          pb={14}
          px={{ base: 10, md: 28 }}
          gap={12}
          direction={{ base: "column", sm: "row" }}
        >
          <Box>
            <Text fw={800} fz="xl" mb={4}>
              Yêu cầu xuất kho
            </Text>
            <Text c="dimmed" fz="sm">
              Quản lý yêu cầu xuất kho, lọc theo ngày và duyệt nhanh.
            </Text>
          </Box>
        </Flex>

        <Divider my={0} />

        <Box px={{ base: 10, md: 28 }} py={16}>
          <CDataTable<DeliveredRequestRow, unknown>
            columns={columns}
            data={requests}
            isLoading={isLoading}
            loadingText="Đang tải yêu cầu xuất kho..."
            enableGlobalFilter={false}
            enableRowSelection={false}
            getRowId={(row) => row._id}
            extraFilters={extraFilters}
            extraActions={extraActions}
            onRowClick={(row) => openDetail(row.original)}
            className="min-w-[920px]"
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={(nextLimit) => {
              setLimit(nextLimit)
              setPage(1)
            }}
            initialPageSize={limit}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </Box>
      </Box>
    </AppLayout>
  )
}
