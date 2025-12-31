import { useMemo, useState } from "react"
import { useSessionLogs } from "../../hooks/useSessionLogs"
import { useQuery } from "@tanstack/react-query"
import { Box, Button, Divider, Flex, Group, rem, Text } from "@mantine/core"
import { IconHistory, IconListDetails } from "@tabler/icons-react"
import { format } from "date-fns"
import { modals } from "@mantine/modals"
import { CalFileResultModalV2 } from "../cal/CalFileResultModalV2"
import { Link } from "@tanstack/react-router"
import { NAVS_URL } from "../../constants/navs"
import type { ColumnDef } from "@tanstack/react-table"
import { CDataTable } from "../common/CDataTable"

type SessionLogRow = {
  _id: string
  time: string | Date
  items?: any[]
  orders?: any[]
}

export const SessionLogsV2 = () => {
  const [limit, setLimit] = useState(10)

  const { getSessionLogs } = useSessionLogs()
  const newVersionDate = new Date(import.meta.env.VITE_NEW_ITEMS_DATE)

  const { data: sessionLogsData, isLoading } = useQuery({
    // Không dùng page nữa vì DataTable đang paginate client-side
    queryKey: ["sessionLogs", limit],
    queryFn: () =>
      getSessionLogs({ page: 1, limit: Math.max(200, limit * 20) }),
    select: (data) => {
      const raw: SessionLogRow[] = data.data.data ?? []
      const filtered = raw.filter((log) => new Date(log.time) >= newVersionDate)
      return { data: filtered, total: filtered.length }
    },
    refetchOnWindowFocus: true
  })

  const rows = useMemo(() => sessionLogsData?.data ?? [], [sessionLogsData])

  const columns: ColumnDef<SessionLogRow>[] = useMemo(
    () => [
      {
        accessorKey: "time",
        header: "Thời gian",
        cell: ({ row }) =>
          format(new Date(row.original.time), "dd/MM/yyyy HH:mm:ss")
      },
      {
        id: "itemsCount",
        header: "Số mặt hàng",
        cell: ({ row }) => row.original.items?.length || 0,
        enableSorting: false
      },
      {
        id: "ordersCount",
        header: "Số đơn hàng",
        cell: ({ row }) => row.original.orders?.length || 0,
        enableSorting: false
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const log = row.original
          return (
            <Group gap={8} justify="flex-end" wrap="nowrap">
              <Button
                variant="light"
                size="xs"
                radius="xl"
                leftSection={<IconListDetails size={14} />}
                onClick={() =>
                  modals.open({
                    title: (
                      <b>
                        Chi tiết log kho theo ca{" "}
                        {format(new Date(log.time), "dd/MM/yyyy HH:mm:ss")}
                      </b>
                    ),
                    children: (
                      <CalFileResultModalV2
                        items={log.items ?? []}
                        orders={log.orders ?? []}
                        readOnly
                      />
                    ),
                    size: "960"
                  })
                }
              >
                Chi tiết
              </Button>
            </Group>
          )
        }
      }
    ],
    []
  )

  const extraActions = (
    <Button
      component={Link}
      to={`${NAVS_URL}/old-logs`}
      variant="outline"
      leftSection={<IconHistory size={16} />}
      size="sm"
      radius="xl"
      color="orange"
    >
      Xem lại log cũ
    </Button>
  )

  return (
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
            Nhật ký kho theo ca
          </Text>
          <Text c="dimmed" fz="sm">
            Quản lý các log nhập xuất kho, điều chỉnh số lượng theo ca
          </Text>
        </Box>
      </Flex>

      <Divider my={0} />

      <Box px={{ base: 8, md: 28 }} py={20}>
        <CDataTable<SessionLogRow, any>
          columns={columns}
          data={rows}
          isLoading={isLoading}
          loadingText="Đang tải log kho..."
          enableGlobalFilter={false}
          enableRowSelection={false}
          extraActions={extraActions}
          initialPageSize={limit}
          pageSizeOptions={[10, 20, 50, 100]}
          onPageSizeChange={setLimit}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  )
}
