import { createFileRoute } from "@tanstack/react-router"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { useSalesCustomerRanks } from "../../../hooks/useSalesCustomerRanks"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Box, Button, rem, Text, ActionIcon, Badge, Group } from "@mantine/core"
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { Can } from "../../../components/common/Can"
import { CToast } from "../../../components/common/CToast"
import type { GetSalesCustomerRanksResponse } from "../../../hooks/models"
import { CDataTable } from "../../../components/common/CDataTable"
import { ColumnDef } from "@tanstack/react-table"
import { SalesCustomerRankModal } from "../../../components/sales/SalesCustomerRankModal"

type SalesCustomerRank = GetSalesCustomerRanksResponse

export const Route = createFileRoute("/sales/customer-ranks/")({
  component: RouteComponent
})

const RANK_LABELS: Record<string, string> = {
  gold: "Vàng",
  silver: "Bạc",
  bronze: "Đồng"
}

const RANK_COLORS: Record<string, string> = {
  gold: "yellow",
  silver: "gray",
  bronze: "orange"
}

function RouteComponent() {
  const { getSalesCustomerRanks, deleteSalesCustomerRank } =
    useSalesCustomerRanks()

  const { data: ranksData, refetch } = useQuery({
    queryKey: ["salesCustomerRanks"],
    queryFn: () =>
      getSalesCustomerRanks({
        page: 1,
        limit: 100
      }),
    select: (data) => data.data
  })

  const { mutate: deleteRank } = useMutation({
    mutationFn: deleteSalesCustomerRank,
    onSuccess: () => {
      CToast.success({ title: "Xóa hạng khách hàng thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi xóa hạng khách hàng" })
    }
  })

  const openRankModal = (rank?: SalesCustomerRank) => {
    modals.open({
      title: (
        <b>{rank ? "Chỉnh sửa hạng khách hàng" : "Tạo hạng khách hàng mới"}</b>
      ),
      children: <SalesCustomerRankModal rank={rank} refetch={refetch} />,
      size: "md"
    })
  }

  const confirmDelete = (rank: SalesCustomerRank) => {
    modals.openConfirmModal({
      title: "Xác nhận xóa",
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa hạng{" "}
          <strong>{RANK_LABELS[rank.rank]}</strong>?
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteRank(rank._id)
    })
  }

  const ranks = ranksData || []

  const columns: ColumnDef<SalesCustomerRank>[] = [
    {
      accessorKey: "rank",
      header: "Hạng",
      cell: ({ row }) => (
        <Badge variant="light" color={RANK_COLORS[row.original.rank]} size="lg">
          {RANK_LABELS[row.original.rank]}
        </Badge>
      )
    },
    {
      accessorKey: "minIncome",
      header: "Doanh thu tối thiểu",
      cell: ({ row }) => (
        <Text fw={600} size="sm" c="blue">
          {row.original.minIncome.toLocaleString("vi-VN")}đ
        </Text>
      )
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <Can roles={["admin", "sales-leader"]}>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="indigo"
              size="sm"
              onClick={() => openRankModal(row.original)}
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
          </Group>
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
        <Box pt={32} pb={8} px={{ base: 8, md: 28 }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Hạng khách hàng
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Quản lý các hạng khách hàng theo doanh thu
              </p>
            </div>
            <Can roles={["admin", "sales-leader"]}>
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={() => openRankModal()}
              >
                Thêm hạng mới
              </Button>
            </Can>
          </div>
        </Box>

        <Box px={{ base: 8, md: 28 }} pb={32}>
          <CDataTable
            columns={columns}
            data={ranks}
            enableGlobalFilter={false}
            pageSizeOptions={[10, 20, 50]}
            initialPageSize={10}
          />
        </Box>
      </Box>
    </SalesLayout>
  )
}
