import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { useMemo, useState, useCallback } from "react"
import { useDeliveredRequests } from "../../../hooks/useDeliveredRequests"
import { useMutation, useQuery } from "@tanstack/react-query"

import {
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Text,
  rem,
  Badge
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { format } from "date-fns"
import { IconArrowBackUp, IconCheck, IconEye, IconX } from "@tabler/icons-react"

import { CToast } from "../../../components/common/CToast"
import { modals } from "@mantine/modals"
import { DeliveredRequestModal } from "../../../components/delivered-requests/DeliveredRequestModal"
import { Helmet } from "react-helmet-async"
import { Can } from "../../../components/common/Can"
import { CDataTable } from "../../../components/common/CDataTable"

import type { ColumnDef } from "@tanstack/react-table"

export const Route = createFileRoute("/marketing-storage/delivered-requests/")({
  component: RouteComponent
})

type DeliveredRequestRow = {
  _id: string
  date: string | Date
  note?: string
  accepted?: boolean
  updatedAt?: string | Date | null
  items: any[]
}

const startOfDayISO = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.toISOString()
}

const endOfDayISO = (d: Date) => {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x.toISOString()
}

function RouteComponent() {
  useAuthGuard(["admin", "accounting-emp", "order-emp", "system-emp"])

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const { searchDeliveredRequests, acceptDeliveredRequest, undoAcceptRequest } =
    useDeliveredRequests()

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      startDate: startDate ? startOfDayISO(startDate) : undefined,
      endDate: endDate ? endOfDayISO(endDate) : undefined
    }),
    [page, limit, startDate, endDate]
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
    onError: (error: any) => {
      CToast.error({
        title: "Có lỗi xảy ra khi chấp nhận yêu cầu xuất kho",
        subtitle: error?.message || "Vui lòng thử lại sau"
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
    onError: (error: any) => {
      CToast.error({
        title: "Có lỗi xảy ra khi hoàn tác yêu cầu xuất kho",
        subtitle: error?.message || "Vui lòng thử lại sau"
      })
      refetch()
    }
  })

  const openDetail = useCallback(
    (req: DeliveredRequestRow) => {
      modals.open({
        title: (
          <Text fw={800} fz="md">
            Chi tiết yêu cầu xuất kho
          </Text>
        ),
        children: (
          <DeliveredRequestModal
            request={req as any}
            acceptRequest={() => handleAcceptRequest(req)}
          />
        ),
        size: "xl"
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const handleAcceptRequest = (req: DeliveredRequestRow) => {
    modals.openConfirmModal({
      title: <b>Xác nhận chấp nhận yêu cầu</b>,
      size: "lg",
      centered: true,
      labels: { confirm: "Chấp nhận", cancel: "Hủy" },
      onConfirm: () => accept({ requestId: req._id } as any),
      children: (
        <Text>
          Bạn chắc chắn muốn xác nhận yêu cầu xuất kho ngày{" "}
          <b>{format(new Date(req.date), "dd/MM/yyyy")}</b>?
        </Text>
      )
    })
  }

  const handleUndoRequest = (req: DeliveredRequestRow) => {
    modals.openConfirmModal({
      title: <b>Xác nhận hoàn tác yêu cầu</b>,
      size: "lg",
      centered: true,
      labels: { confirm: "Hoàn tác", cancel: "Hủy" },
      onConfirm: () => undo({ requestId: req._id } as any),
      children: (
        <Text>
          Bạn chắc chắn muốn hoàn tác yêu cầu xuất kho ngày{" "}
          <b>{format(new Date(req.date), "dd/MM/yyyy")}</b>?
        </Text>
      )
    })
  }

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
        id: "itemsCount",
        header: "Mặt hàng",
        cell: ({ row }) => (
          <Text fz="sm" ta="right" fw={700}>
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
          const ok = !!row.original.accepted
          return ok ? (
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
          const d = row.original.updatedAt
          return d ? (
            <Text fz="sm" c="dimmed">
              {format(new Date(d), "dd/MM/yyyy")}
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
          const req = row.original
          const busy = isAccepting || isUndoing

          return (
            <Group justify="flex-end" gap={8} wrap="nowrap">
              <Button
                size="xs"
                radius="xl"
                variant="light"
                leftSection={<IconEye size={16} />}
                onClick={() => openDetail(req)}
              >
                Xem
              </Button>

              <Can roles={["admin", "accounting-emp"]}>
                {!req.accepted ? (
                  <Button
                    size="xs"
                    radius="xl"
                    color="green"
                    variant="light"
                    leftSection={<IconCheck size={16} />}
                    loading={isAccepting}
                    disabled={busy}
                    onClick={() => handleAcceptRequest(req)}
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
                    disabled={busy}
                    onClick={() => handleUndoRequest(req)}
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
    [openDetail, isAccepting, isUndoing]
  )

  const extraFilters = (
    <Group gap={12} align="flex-end" wrap="wrap">
      <DatePickerInput
        value={startDate}
        onChange={(v) => {
          setPage(1)
          setStartDate(v)
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
        onChange={(v) => {
          setPage(1)
          setEndDate(v)
        }}
        placeholder="Đến ngày"
        valueFormat="DD/MM/YYYY"
        size="sm"
        radius="md"
        clearable
        w={160}
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
    <AppLayout>
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
        {/* Header */}
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
          <CDataTable<DeliveredRequestRow, any>
            columns={columns}
            data={requests}
            isLoading={isLoading}
            loadingText="Đang tải yêu cầu xuất kho..."
            enableGlobalFilter={false}
            enableRowSelection={false}
            getRowId={(r) => r._id}
            extraFilters={extraFilters}
            extraActions={extraActions}
            onRowClick={(row) => openDetail(row.original)}
            className="min-w-[920px]"
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={(newLimit) => {
              setLimit(newLimit)
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
