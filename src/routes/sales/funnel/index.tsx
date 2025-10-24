import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  Badge,
  Button,
  Group,
  Box,
  rem,
  Text,
  Select,
  ActionIcon,
  Tooltip
} from "@mantine/core"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { modals } from "@mantine/modals"
import { format } from "date-fns"
import {
  IconPlus,
  IconEdit,
  IconArrowRight,
  IconProgress,
  IconMessage,
  IconCash
} from "@tabler/icons-react"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { Can } from "../../../components/common/Can"
import { CDataTable } from "../../../components/common/CDataTable"
import { useSalesFunnel } from "../../../hooks/useSalesFunnel"
import { useProvinces } from "../../../hooks/useProvinces"
import { useUsers } from "../../../hooks/useUsers"
import { useSalesChannels } from "../../../hooks/useSalesChannels"
import { CreateLeadModal } from "../../../components/sales/CreateLeadModal"
import { MoveToContactedModal } from "../../../components/sales/MoveToContactedModal"
import { UpdateStageModal } from "../../../components/sales/UpdateStageModal"
import { UpdateFunnelInfoModal } from "../../../components/sales/UpdateFunnelInfoModal"
import { UpdateFunnelCostModal } from "../../../components/sales/UpdateFunnelCostModal"
import { ColumnDef } from "@tanstack/react-table"
import { useMetaServices } from "../../../hooks/useMetaServices"

export const Route = createFileRoute("/sales/funnel/")({
  component: RouteComponent
})

type FunnelItem = {
  _id: string
  name: string
  facebook: string
  province?: string // Reference to Province schema
  phoneNumber?: string
  psid: string
  channel: {
    _id: string
    channelName: string
  }
  user: {
    _id: string
    name: string
  }
  hasBuyed: boolean
  cost?: number
  stage: "lead" | "contacted" | "customer" | "closed"
  createdAt: string
  updatedAt: string
}

type EnrichedFunnelItem = FunnelItem & {
  provinceName: string
  userName?: string
  channelName: string
}

const STAGE_BADGE_COLOR: Record<string, string> = {
  lead: "blue",
  contacted: "cyan",
  customer: "green",
  closed: "gray"
}

const STAGE_LABEL: Record<string, string> = {
  lead: "Lead",
  contacted: "Đã liên hệ",
  customer: "Khách hàng",
  closed: "Đã đóng"
}

function RouteComponent() {
  const { searchFunnel } = useSalesFunnel()
  const { getProvinces } = useProvinces()
  const { publicSearchUser } = useUsers()
  const { searchSalesChannels } = useSalesChannels()
  const { getConversationIdByPsid } = useMetaServices()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchText, setSearchText] = useState("")
  const [stageFilter, setStageFilter] = useState<string>("")
  const [provinceFilter, setProvinceFilter] = useState<string>("")
  const [channelFilter, setChannelFilter] = useState<string>("")
  const [userFilter, setUserFilter] = useState<string>("")

  const { mutate: goToMessage } = useMutation({
    mutationFn: async (psid: string) => {
      const {
        data: { conversationId }
      } = await getConversationIdByPsid(psid)

      navigate({ to: `/sales/messages/${conversationId}` })
    }
  })

  // Load reference data
  const { data: provincesData } = useQuery({
    queryKey: ["provinces"],
    queryFn: getProvinces
  })

  const { data: channelsData } = useQuery({
    queryKey: ["salesChannels", "all"],
    queryFn: () => searchSalesChannels({ page: 1, limit: 999 })
  })

  const { data: usersData } = useQuery({
    queryKey: ["users", "public", "all"],
    queryFn: () => publicSearchUser({ page: 1, limit: 999 })
  })

  // Load funnel data with filters
  const { data, refetch } = useQuery({
    queryKey: [
      "salesFunnel",
      page,
      limit,
      searchText,
      stageFilter,
      provinceFilter,
      channelFilter,
      userFilter
    ],
    queryFn: () =>
      searchFunnel({
        page,
        limit,
        searchText: searchText || undefined,
        stage: stageFilter
          ? (stageFilter as "lead" | "contacted" | "customer" | "closed")
          : undefined,
        province: provinceFilter || undefined,
        channel: channelFilter || undefined,
        user: userFilter || undefined
      })
  })

  // Enrich data with reference data
  const enrichedData = useMemo(() => {
    if (!data?.data.data) return []

    const provinces = provincesData?.data.provinces || []

    return data.data.data.map((item) => {
      return {
        ...item,
        provinceName:
          provinces.find((p) => p._id === item.province)?.name || "N/A",
        channelName: item.channel.channelName,
        userName: item.user ? item.user.name : "N/A"
      }
    })
  }, [data, provincesData])

  const provinceOptions =
    provincesData?.data.provinces.map((province) => ({
      value: province._id,
      label: province.name
    })) || []

  const channelOptions =
    channelsData?.data.data.map((channel) => ({
      value: channel._id,
      label: channel.channelName
    })) || []

  const userOptions =
    usersData?.data.data.map((user) => ({
      value: user._id,
      label: user.name
    })) || []

  const handleCreateLead = () => {
    modals.open({
      title: <b>Tạo Lead mới</b>,
      children: (
        <CreateLeadModal
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "lg"
    })
  }

  const handleMoveToContacted = (funnelId: string) => {
    modals.open({
      title: <b>Chuyển sang Đã liên hệ</b>,
      children: (
        <MoveToContactedModal
          funnelId={funnelId}
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "lg"
    })
  }

  const handleUpdateStage = (
    funnelId: string,
    currentStage: "lead" | "contacted" | "customer" | "closed"
  ) => {
    modals.open({
      title: <b>Cập nhật giai đoạn</b>,
      children: (
        <UpdateStageModal
          funnelId={funnelId}
          currentStage={currentStage}
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "lg"
    })
  }

  const handleUpdateInfo = (item: EnrichedFunnelItem) => {
    modals.open({
      title: <b>Cập nhật thông tin</b>,
      children: (
        <UpdateFunnelInfoModal
          funnelId={item._id}
          currentData={{
            name: item.name,
            facebook: item.facebook,
            province: item.province,
            phoneNumber: item.phoneNumber,
            channel: item.channel._id,
            hasBuyed: item.hasBuyed
          }}
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "lg"
    })
  }

  const handleUpdateCost = (funnelId: string, currentCost?: number) => {
    modals.open({
      title: <b>Cập nhật chi phí marketing</b>,
      children: (
        <UpdateFunnelCostModal
          funnelId={funnelId}
          currentCost={currentCost}
          onSuccess={() => {
            refetch()
            modals.closeAll()
          }}
        />
      ),
      size: "md"
    })
  }

  const handleSendMessage = (item: EnrichedFunnelItem) => {
    goToMessage(item.psid)
  }

  const columns: ColumnDef<EnrichedFunnelItem>[] = [
    {
      accessorKey: "name",
      header: "Tên",
      cell: ({ row }) => (
        <Text fw={500} size="sm">
          {row.original.name}
        </Text>
      )
    },
    {
      accessorKey: "facebook",
      header: "Facebook",
      cell: ({ row }) => (
        <Text size="sm" c="dimmed">
          {row.original.facebook}
        </Text>
      )
    },
    {
      accessorKey: "phoneNumber",
      header: "SĐT",
      cell: ({ row }) => (
        <Text size="sm">{row.original.phoneNumber || "N/A"}</Text>
      )
    },
    {
      accessorKey: "provinceName",
      header: "Tỉnh/TP",
      cell: ({ row }) => <Text size="sm">{row.original.provinceName}</Text>
    },
    {
      accessorKey: "channelName",
      header: "Kênh",
      cell: ({ row }) => <Text size="sm">{row.original.channelName}</Text>
    },
    {
      accessorKey: "userName",
      header: "Nhân viên",
      cell: ({ row }) => <Text size="sm">{row.original.userName}</Text>
    },
    {
      accessorKey: "stage",
      header: "Giai đoạn",
      cell: ({ row }) => (
        <Badge color={STAGE_BADGE_COLOR[row.original.stage]}>
          {STAGE_LABEL[row.original.stage]}
        </Badge>
      )
    },
    {
      accessorKey: "hasBuyed",
      header: "Đã mua",
      cell: ({ row }) => (
        <Badge color={row.original.hasBuyed ? "green" : "gray"}>
          {row.original.hasBuyed ? "Có" : "Chưa"}
        </Badge>
      )
    },
    {
      accessorKey: "cost",
      header: "Chi phí MKT",
      cell: ({ row }) => (
        <Text fw={500} size="sm">
          {row.original.cost
            ? `${row.original.cost.toLocaleString("vi-VN")}đ`
            : "N/A"}
        </Text>
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
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const item = row.original
        return (
          <Can roles={["admin", "sale-leader"]}>
            <Group gap="xs">
              {item.stage === "lead" && (
                <Tooltip label="Chuyển sang Đã liên hệ" withArrow>
                  <ActionIcon
                    variant="light"
                    color="cyan"
                    size="sm"
                    onClick={() => handleMoveToContacted(item._id)}
                  >
                    <IconArrowRight size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
              <Tooltip label="Cập nhật thông tin" withArrow>
                <ActionIcon
                  variant="light"
                  color="indigo"
                  size="sm"
                  onClick={() => handleUpdateInfo(item)}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Cập nhật giai đoạn" withArrow>
                <ActionIcon
                  variant="light"
                  color="violet"
                  size="sm"
                  onClick={() => handleUpdateStage(item._id, item.stage)}
                >
                  <IconProgress size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Cập nhật chi phí marketing" withArrow>
                <ActionIcon
                  variant="light"
                  color="yellow"
                  size="sm"
                  onClick={() => handleUpdateCost(item._id, item.cost)}
                >
                  <IconCash size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Nhắn tin" withArrow>
                <ActionIcon
                  variant="light"
                  color="teal"
                  size="sm"
                  onClick={() => handleSendMessage(item)}
                >
                  <IconMessage size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Can>
        )
      },
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
            Quản lý Sales Funnel
          </Text>
          <Text c="dimmed" fz="sm">
            Quản lý quy trình chuyển đổi khách hàng từ lead đến customer
          </Text>
        </Box>

        {/* Content */}
        <Box px={{ base: 4, md: 28 }} pb={20}>
          <CDataTable
            columns={columns}
            data={enrichedData}
            enableGlobalFilter={true}
            globalFilterValue={searchText}
            onGlobalFilterChange={setSearchText}
            page={page}
            totalPages={Math.ceil((data?.data.total || 0) / limit)}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            initialPageSize={limit}
            pageSizeOptions={[10, 20, 50, 100]}
            extraFilters={
              <>
                <Select
                  placeholder="Tất cả giai đoạn"
                  data={[
                    { value: "", label: "Tất cả giai đoạn" },
                    { value: "lead", label: "Lead" },
                    { value: "contacted", label: "Đã liên hệ" },
                    { value: "customer", label: "Khách hàng" },
                    { value: "closed", label: "Đã đóng" }
                  ]}
                  value={stageFilter}
                  onChange={(value) => setStageFilter(value || "")}
                  clearable
                  style={{ width: 200 }}
                />

                <Select
                  placeholder="Tất cả tỉnh/TP"
                  data={[
                    { value: "", label: "Tất cả tỉnh/TP" },
                    ...provinceOptions
                  ]}
                  value={provinceFilter}
                  onChange={(value) => setProvinceFilter(value || "")}
                  searchable
                  clearable
                  style={{ width: 200 }}
                />

                <Select
                  placeholder="Tất cả kênh"
                  data={[
                    { value: "", label: "Tất cả kênh" },
                    ...channelOptions
                  ]}
                  value={channelFilter}
                  onChange={(value) => setChannelFilter(value || "")}
                  searchable
                  clearable
                  style={{ width: 200 }}
                />

                <Select
                  placeholder="Tất cả nhân viên"
                  data={[
                    { value: "", label: "Tất cả nhân viên" },
                    ...userOptions
                  ]}
                  value={userFilter}
                  onChange={(value) => setUserFilter(value || "")}
                  searchable
                  clearable
                  style={{ width: 200 }}
                />
              </>
            }
            extraActions={
              <Can roles={["admin", "sale-leader"]}>
                <Button
                  onClick={handleCreateLead}
                  leftSection={<IconPlus size={16} />}
                  size="sm"
                  radius="md"
                >
                  Tạo Lead
                </Button>
              </Can>
            }
          />
        </Box>
      </Box>
    </SalesLayout>
  )
}
