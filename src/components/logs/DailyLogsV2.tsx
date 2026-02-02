import { useMemo, useState } from "react"
import { useDailyLogs } from "../../hooks/useDailyLogs"
import { useLivestreamChannels } from "../../hooks/useLivestreamChannels"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Select,
  rem,
  Text
} from "@mantine/core"
import { IconHistory, IconListDetails } from "@tabler/icons-react"
import { format } from "date-fns"
import { modals } from "@mantine/modals"
import { CalFileResultModal } from "../cal/CalFileResultModal"
import { Link } from "@tanstack/react-router"
import { NAVS_URL } from "../../constants/navs"
import type { ColumnDef } from "@tanstack/react-table"
import { CDataTable } from "../common/CDataTable"
import type { GetDailyLogsResponse } from "../../hooks/models"

type DailyLogRow = Omit<GetDailyLogsResponse["data"][number], "date"> & {
  date: string | Date
}

type DeliveredRequestChannel = {
  _id: string
  name: string
  username: string
  link: string
  platform: string
}

const getChannelsFromLog = (log: DailyLogRow): DeliveredRequestChannel[] => {
  const anyLog = log as any

  const fromOrders: DeliveredRequestChannel[] = Array.isArray(anyLog?.orders)
    ? anyLog.orders
        .map((o: any) => o?.channel)
        .filter(Boolean)
        .filter((c: any) => typeof c === "object")
    : []

  const fromLog: DeliveredRequestChannel[] =
    anyLog?.channel && typeof anyLog.channel === "object"
      ? [anyLog.channel]
      : []

  const all = [...fromOrders, ...fromLog].filter(
    (c): c is DeliveredRequestChannel => !!c?._id
  )

  const uniq = new Map<string, DeliveredRequestChannel>()
  for (const c of all) uniq.set(c._id, c)
  return Array.from(uniq.values())
}

export const DailyLogsV2 = () => {
  const [limit, setLimit] = useState(10)
  const [channelId, setChannelId] = useState<string | null>(null)

  const { getDailyLogs } = useDailyLogs()
  const { searchLivestreamChannels } = useLivestreamChannels()

  const newVersionDate = new Date(import.meta.env.VITE_NEW_ITEMS_DATE)

  const { data: dailyLogsData, isLoading } = useQuery({
    // Không dùng page nữa vì DataTable đang paginate client-side
    queryKey: ["dailyLogs", limit, channelId],
    queryFn: () =>
      getDailyLogs({
        page: 1,
        limit: Math.max(200, limit * 20),
        channelId: channelId || undefined
      }),
    select: (data) => {
      const newData = data.data.data.filter(
        (log) => new Date(log.date) >= newVersionDate
      )
      return { data: newData, total: newData.length }
    },
    refetchOnWindowFocus: true
  })

  const rows: DailyLogRow[] = useMemo(
    () => (dailyLogsData?.data ?? []) as DailyLogRow[],
    [dailyLogsData]
  )

  const { data: channelsData, isLoading: isLoadingChannels } = useQuery({
    queryKey: ["searchLivestreamChannels", "all"],
    queryFn: () => searchLivestreamChannels({ page: 1, limit: 200 }),
    select: (res) => res.data.data ?? [],
    refetchOnWindowFocus: false
  })

  const channelOptions = useMemo(() => {
    const list = channelsData ?? []
    return list
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => ({
        value: c._id,
        label: c.name
      }))
  }, [channelsData])

  const filteredRows = useMemo(() => {
    if (!channelId) return rows

    return rows.filter((r) => {
      const channels = getChannelsFromLog(r)
      if (channelId && !channels.some((c) => c._id === channelId)) return false
    })
  }, [rows, channelId])

  // todo: fix typing bug here
  const columns: ColumnDef<DailyLogRow>[] = useMemo(
    () => [
      {
        accessorKey: "date",
        header: () => (
          <Text fw={600} size="sm">
            Ngày
          </Text>
        ),
        cell: ({ row }) => (
          <Text size="sm" className="whitespace-nowrap">
            {format(new Date(row.original.date), "dd/MM/yyyy")}
          </Text>
        )
      },
      {
        id: "channelName",
        header: () => (
          <Text fw={600} size="sm">
            Kênh
          </Text>
        ),
        cell: ({ row }) => {
          const channels = getChannelsFromLog(row.original)
          if (!channels.length) return <Text size="sm">-</Text>
          return (
            <Text size="sm">
              {channels.length === 1
                ? channels[0].name
                : `${channels[0].name} (+${channels.length - 1})`}
            </Text>
          )
        }
      },
      {
        id: "itemsCount",
        header: () => (
          <Text fw={600} size="sm">
            Số mặt hàng
          </Text>
        ),
        cell: ({ row }) => (
          <Text size="sm">{row.original.items?.length || 0}</Text>
        )
      },
      {
        id: "ordersCount",
        header: () => (
          <Text fw={600} size="sm">
            Số đơn hàng
          </Text>
        ),
        cell: ({ row }) => (
          <Text size="sm">{row.original.orders?.length || 0}</Text>
        )
      },
      {
        accessorKey: "updatedAt",
        header: () => (
          <Text fw={600} size="sm">
            Cập nhật lúc
          </Text>
        ),
        cell: ({ row }) => (
          <Text size="sm" className="whitespace-nowrap">
            {format(new Date(row.original.updatedAt), "dd/MM/yyyy HH:mm:ss")}
          </Text>
        )
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const log = row.original
          return (
            <Group gap={8} wrap="nowrap">
              <Button
                variant="light"
                size="xs"
                radius={"xl"}
                leftSection={<IconListDetails size={14} />}
                onClick={() =>
                  modals.open({
                    title: (
                      <b>
                        Chi tiết log kho theo ngày{" "}
                        {format(new Date(log.date), "dd/MM/yyyy")}
                      </b>
                    ),
                    children: (
                      <CalFileResultModal
                        items={log.items}
                        orders={log.orders}
                        readOnly
                        date={new Date(log.date)}
                        platform={log.channel?.platform}
                        channelId={log.channel?._id}
                      />
                    ),
                    size: "80vw"
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

  const extraFilters = (
    <Group gap={8} wrap="wrap">
      <Select
        w={220}
        placeholder="Lọc theo kênh"
        data={channelOptions}
        value={channelId}
        onChange={(val) => setChannelId(val)}
        clearable
        searchable
        disabled={isLoading || isLoadingChannels}
        nothingFoundMessage="Không có kênh"
      />
    </Group>
  )

  return (
    <>
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
              Nhật ký kho theo ngày
            </Text>
            <Text c="dimmed" fz="sm">
              Quản lý các log nhập xuất kho, điều chỉnh số lượng theo ca
            </Text>
          </Box>
          <Button
            component={Link}
            to={`${NAVS_URL}/old-logs`}
            variant="outline"
            leftSection={<IconHistory size={16} />}
            size="md"
            radius={"xl"}
            color="orange"
          >
            Xem lại log cũ
          </Button>
        </Flex>
        <Divider my={0} />
        <Box px={{ base: 4, md: 28 }} py={20}>
          <CDataTable<DailyLogRow, unknown>
            columns={columns}
            data={filteredRows}
            isLoading={isLoading}
            loadingText="Đang tải danh sách log..."
            enableGlobalFilter={false}
            enableRowSelection={false}
            extraFilters={extraFilters}
            onPageSizeChange={(n) => {
              setLimit(n)
            }}
            initialPageSize={limit}
            pageSizeOptions={[10, 20, 50, 100]}
            getRowId={(row) => row._id}
          />
        </Box>
      </Box>
    </>
  )
}
