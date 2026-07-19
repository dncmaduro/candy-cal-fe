import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Badge,
  Box,
  Button,
  Group,
  rem,
  Select,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput
} from "@mantine/core"
import { modals } from "@mantine/modals"
import {
  IconPhone,
  IconPlus,
  IconUserPlus,
  IconRepeat
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { CDataTable } from "../../../components/common/CDataTable"
import { CToast } from "../../../components/common/CToast"
import { TransferSalesLeadModal } from "../../../components/sales/TransferSalesLeadModal"
import {
  useSalesLeads,
  type AvailableCs,
  type CallCompliance
} from "../../../hooks/useSalesLeads"
import { useSalesChannels } from "../../../hooks/useSalesChannels"
import { useUsers } from "../../../hooks/useUsers"
import type { SearchSalesChannelResponse } from "../../../hooks/models"

type LeadView = "acquired" | "active" | "needs-call" | "availability" | "report"
type LeadStatusFilter =
  | "all"
  | "unassigned"
  | "assigned"
  | "pooled"
  | "retained"

type Person = { _id?: string; name?: string; username?: string }
type Funnel = { _id?: string; name?: string; phoneNumber?: string }
type LeadCaseRecord = {
  _id: string
  salesFunnelId?: Funnel
  hunterId?: Person
  currentAssignmentId?: { salesCsId?: Person; cycleKey?: string }
  total?: number
  called?: number
  missingCall?: number
  status?: string
}
type LeadAssignmentRecord = {
  _id: string
  leadCaseId?: { _id?: string; salesFunnelId?: Funnel }
  customerSnapshot?: { name?: string; phoneNumber?: string }
  salesCsId?: Person
  cycleKey?: string
  status?: string
}
type SalesChannel = SearchSalesChannelResponse["data"][0]

type LeadRow = {
  id: string
  name: string
  phoneNumber?: string
  hunterName?: string
  salesCsName?: string
  salesCsId?: string
  cycleKey?: string
  status?: string
  leadCaseId?: string
  total?: number
  called?: number
  missingCall?: number
}

const getUserName = (user?: Person) => user?.name || user?.username || "—"

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || !error) return fallback

  const message = (error as { response?: { data?: { message?: unknown } } })
    .response?.data?.message

  return typeof message === "string" ? message : fallback
}

const csOptions = (rows: AvailableCs[] | undefined) =>
  (rows || [])
    .filter((row) => row.salesCsId?._id)
    .map((row) => ({
      value: row.salesCsId._id,
      label: getUserName(row.salesCsId)
    }))

export const Route = createFileRoute("/sales/leads/")({
  validateSearch: (search: Record<string, unknown>) => {
    const view = search.view
    return {
      view:
        view === "acquired" ||
        view === "active" ||
        view === "needs-call" ||
        view === "availability" ||
        view === "report"
          ? view
          : undefined,
      status:
        search.status === "unassigned" ||
        search.status === "assigned" ||
        search.status === "pooled" ||
        search.status === "retained"
          ? search.status
          : undefined
    }
  },
  component: LeadsPage
})

function LeadsPage() {
  const navigate = useNavigate({ from: "/sales/leads/" })
  const search = Route.useSearch()
  const api = useSalesLeads()
  const { getMe } = useUsers()
  const { searchSalesChannels } = useSalesChannels()
  const queryClient = useQueryClient()

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    select: (response) => response.data
  })

  const roles = me?.roles || []
  const isHunter = roles.includes("sales-hunter")
  const isCs = roles.includes("sales-cs")
  const isManager =
    roles.includes("admin") ||
    roles.includes("sales-hunter") ||
    roles.includes("sales-leader")
  const canCreateLead =
    isHunter || roles.includes("admin") || roles.includes("sales-leader")
  const canCareLead =
    isCs || roles.includes("admin") || roles.includes("sales-leader")

  const viewOptions = useMemo(() => {
    if (isCs) {
      return [{ value: "active" as const, label: "Khách hàng của tôi" }]
    }
    return [
      ...(isManager
        ? [
            { value: "acquired" as const, label: "Lead đã tạo" },
            { value: "availability" as const, label: "Trạng thái nhận khách" },
            { value: "report" as const, label: "Tuân thủ gọi" }
          ]
        : [])
    ]
  }, [isCs, isManager])

  const defaultView: LeadView = isCs ? "active" : "acquired"
  const currentView = viewOptions.some((option) => option.value === search.view)
    ? (search.view as LeadView)
    : defaultView
  const statusFilter = (search.status || "all") as LeadStatusFilter

  useEffect(() => {
    if (!isManager || search.view) return
    navigate({
      to: "/sales/leads",
      search: { view: "acquired", status: search.status },
      replace: true
    })
  }, [isManager, navigate, search.status, search.view])

  const { data: availableCs } = useQuery({
    queryKey: ["salesLeads", "availableCs"],
    queryFn: api.availableCs,
    select: (response) => response.data as AvailableCs[],
    enabled: isManager || canCareLead
  })
  const { data: channels } = useQuery({
    queryKey: ["salesLeads", "channels"],
    queryFn: () => searchSalesChannels({ page: 1, limit: 999 }),
    select: (response) => response.data.data as SalesChannel[],
    enabled: canCreateLead
  })
  const acquiredQuery = useQuery({
    queryKey: ["salesLeads", "acquired"],
    queryFn: api.acquired,
    select: (response) => response.data as LeadCaseRecord[],
    enabled: isManager
  })
  const activeQuery = useQuery({
    queryKey: ["salesLeads", "active"],
    queryFn: () => api.active(false),
    select: (response) => response.data as LeadAssignmentRecord[],
    enabled: canCareLead
  })
  const needsCallQuery = useQuery({
    queryKey: ["salesLeads", "needsCall"],
    queryFn: () => api.active(true),
    select: (response) => response.data as LeadAssignmentRecord[],
    enabled: canCareLead
  })
  const availabilityQuery = useQuery({
    queryKey: ["salesLeads", "availability"],
    queryFn: api.availability,
    select: (response) => response.data as AvailableCs[],
    enabled: isManager
  })
  const complianceQuery = useQuery({
    queryKey: ["salesLeads", "callCompliance"],
    queryFn: () => api.callCompliance(),
    select: (response) => response.data as CallCompliance,
    enabled: isManager
  })

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["salesLeads"] })

  const createLead = useMutation({
    mutationFn: api.createLead,
    onSuccess: () => {
      CToast.success({ title: "Đã phân lead mới" })
      refresh()
      modals.closeAll()
    },
    onError: (error: unknown) =>
      CToast.error({
        title: getErrorMessage(error, "Không tạo được lead")
      })
  })
  const assignLead = useMutation({
    mutationFn: ({ id, salesCsId }: { id: string; salesCsId: string }) =>
      api.assign(id, salesCsId),
    onSuccess: () => {
      CToast.success({ title: "Đã phân lại lead" })
      refresh()
      modals.closeAll()
    },
    onError: () =>
      CToast.error({ title: "Lead đã được phân hoặc CS không nhận khách" })
  })
  const updateAvailability = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      api.setAvailability(id, value),
    onSuccess: refresh,
    onError: () =>
      CToast.error({ title: "Không thể cập nhật trạng thái nhận lead" })
  })

  const rows = useMemo<LeadRow[]>(() => {
    if (currentView === "availability") {
      return (availabilityQuery.data || []).map((item) => ({
        id: item.salesCsId?._id || item._id,
        name: getUserName(item.salesCsId),
        status: item.isReceivingLeads ? "receiving" : "paused"
      }))
    }
    if (currentView === "report") {
      return (complianceQuery.data?.bySalesCs || []).map((item) => ({
        id: item.salesCs._id,
        name: getUserName(item.salesCs),
        total: item.total,
        called: item.called,
        missingCall: item.missingCall
      }))
    }

    if (currentView === "acquired") {
      const acquiredRows = (acquiredQuery.data || []).map(
        (item: LeadCaseRecord) => ({
          id: item._id,
          name: item.salesFunnelId?.name || "—",
          phoneNumber: item.salesFunnelId?.phoneNumber,
          salesCsName: getUserName(item.currentAssignmentId?.salesCsId),
          salesCsId: item.currentAssignmentId?.salesCsId?._id,
          cycleKey: item.currentAssignmentId?.cycleKey,
          status: item.status
        })
      )

      return statusFilter === "all"
        ? acquiredRows
        : acquiredRows.filter((item) => item.status === statusFilter)
    }

    const assignments =
      currentView === "needs-call" ? needsCallQuery.data : activeQuery.data

    return (assignments || []).map((item: LeadAssignmentRecord) => ({
      id: item._id,
      name:
        item.leadCaseId?.salesFunnelId?.name ||
        item.customerSnapshot?.name ||
        "—",
      phoneNumber:
        item.leadCaseId?.salesFunnelId?.phoneNumber ||
        item.customerSnapshot?.phoneNumber,
      salesCsName: getUserName(item.salesCsId),
      salesCsId: item.salesCsId?._id,
      cycleKey: item.cycleKey,
      status: item.status,
      leadCaseId: item.leadCaseId?._id
    }))
  }, [
    acquiredQuery.data,
    activeQuery.data,
    availabilityQuery.data,
    complianceQuery.data,
    currentView,
    needsCallQuery.data,
    statusFilter
  ])

  const isLoading =
    currentView === "acquired"
      ? acquiredQuery.isLoading
      : currentView === "active"
        ? activeQuery.isLoading
        : currentView === "needs-call"
          ? needsCallQuery.isLoading
          : currentView === "report"
            ? complianceQuery.isLoading
            : availabilityQuery.isLoading

  const openCreateModal = () => {
    modals.open({
      title: <b>Thêm lead mới</b>,
      size: "lg",
      children: (
        <CreateSalesLeadModal
          channels={channels || []}
          salesCsOptions={csOptions(availableCs)}
          loading={createLead.isPending}
          onSubmit={(data) => createLead.mutate(data)}
        />
      )
    })
  }

  const openAssignModal = (lead: LeadRow) => {
    modals.open({
      title: <b>Phân lại lead</b>,
      children: (
        <AssignLeadModal
          name={lead.name}
          options={csOptions(availableCs)}
          loading={assignLead.isPending}
          onSubmit={(salesCsId) =>
            assignLead.mutate({ id: lead.id, salesCsId })
          }
        />
      )
    })
  }

  const openTransferModal = (lead: LeadRow) => {
    modals.open({
      title: <b>Chuyển khách hàng</b>,
      centered: true,
      children: (
        <TransferSalesLeadModal
          leadCaseId={lead.id}
          currentSalesCsId={lead.salesCsId}
          onSuccess={() => void refresh()}
        />
      )
    })
  }

  const columns: ColumnDef<LeadRow>[] = (() => {
    if (currentView === "availability") {
      return [
        {
          accessorKey: "name",
          header: "Sales",
          cell: ({ row }) => (
            <Text fw={600} size="sm">
              {row.original.name}
            </Text>
          )
        },
        {
          accessorKey: "status",
          header: "Trạng thái",
          cell: ({ row }) => (
            <Badge
              color={row.original.status === "receiving" ? "green" : "gray"}
            >
              {row.original.status === "receiving"
                ? "Đang nhận lead"
                : "Tạm dừng"}
            </Badge>
          )
        },
        {
          id: "actions",
          header: "Thao tác",
          cell: ({ row }) => (
            <Switch
              label="Nhận lead"
              checked={row.original.status === "receiving"}
              disabled={updateAvailability.isPending}
              onChange={(event) =>
                updateAvailability.mutate({
                  id: row.original.id,
                  value: event.currentTarget.checked
                })
              }
            />
          ),
          enableSorting: false
        }
      ]
    }
    if (currentView === "report") {
      return [
        {
          accessorKey: "name",
          header: "Sales",
          cell: ({ row }) => (
            <Text fw={600} size="sm">
              {row.original.name}
            </Text>
          )
        },
        { accessorKey: "total", header: "Tổng lead" },
        { accessorKey: "called", header: "Đã gọi" },
        {
          accessorKey: "missingCall",
          header: "Chưa gọi",
          cell: ({ row }) => (
            <Badge color={row.original.missingCall ? "orange" : "green"}>
              {row.original.missingCall || 0}
            </Badge>
          )
        }
      ]
    }

    const result: ColumnDef<LeadRow>[] = [
      {
        accessorKey: "name",
        header: "Khách hàng",
        cell: ({ row }) => (
          <Text fw={600} size="sm">
            {row.original.name}
          </Text>
        )
      },
      {
        accessorKey: "phoneNumber",
        header: "Số điện thoại",
        cell: ({ row }) => (
          <Text size="sm">{row.original.phoneNumber || "—"}</Text>
        )
      }
    ]

    result.push({
      accessorKey: "salesCsName",
      header: "Sales",
      cell: ({ row }) => (
        <Text size="sm">{row.original.salesCsName || "—"}</Text>
      )
    })

    result.push({
      accessorKey: "cycleKey",
      header: "Kỳ chăm sóc",
      cell: ({ row }) => (
        <Text size="sm">
          {row.original.cycleKey ||
            (["unassigned", "pooled"].includes(row.original.status || "")
              ? "Chưa phân công"
              : "Khách hàng")}
        </Text>
      )
    })

    result.push({
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => <LeadStatusBadge status={row.original.status} />
    })

    result.push({
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const isUnassigned = ["unassigned", "pooled"].includes(
          row.original.status || ""
        )
        if (currentView === "acquired" && isUnassigned) {
          return (
            <Button
              size="xs"
              variant="light"
              leftSection={<IconUserPlus size={15} />}
              onClick={() => openAssignModal(row.original)}
            >
              Phân lead
            </Button>
          )
        }
        if (currentView === "acquired" && row.original.salesCsId) {
          return (
            <Group gap="xs" wrap="nowrap">
              <Button
                size="xs"
                variant="light"
                color="orange"
                leftSection={<IconRepeat size={15} />}
                onClick={() => openTransferModal(row.original)}
              >
                Chuyển nhân viên CSKH
              </Button>
              <Button
                size="xs"
                variant="subtle"
                onClick={() =>
                  navigate({
                    to: "/sales/leads/$leadId",
                    params: { leadId: row.original.id }
                  })
                }
              >
                Chi tiết
              </Button>
            </Group>
          )
        }
        return (
          <Button
            size="xs"
            variant="light"
            leftSection={<IconPhone size={15} />}
            onClick={() =>
              navigate({
                to: "/sales/leads/$leadId",
                params: { leadId: row.original.leadCaseId || row.original.id }
              })
            }
          >
            Xem chi tiết
          </Button>
        )
      },
      enableSorting: false
    })

    return result
  })()

  const pageTitle =
    viewOptions.find((option) => option.value === currentView)?.label || "Lead"

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
        <Box pt={32} pb={16} px={{ base: 8, md: 28 }}>
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text fw={700} fz="xl" mb={2}>
                Quản lý lead
              </Text>
              <Text c="dimmed" fz="sm">
                Lead đang chờ bao gồm lead mới và lead cũ do Sales phụ trách
              </Text>
            </Box>
            {canCareLead && (
              <Badge color="orange" variant="light">
                {needsCallQuery.data?.length || 0} lead cần gọi
              </Badge>
            )}
          </Group>
        </Box>

        <Box px={{ base: 4, md: 28 }} pb={20}>
          <Tabs
            value={currentView}
            onChange={(value) =>
              navigate({
                to: "/sales/leads",
                search: { view: (value || undefined) as LeadView | undefined }
              })
            }
            variant="outline"
            radius="md"
          >
            <Tabs.List>
              {viewOptions.map((option) => (
                <Tabs.Tab key={option.value} value={option.value}>
                  {option.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>

            <Tabs.Panel value={currentView} pt="md">
              <CDataTable
                columns={columns}
                data={rows}
                isLoading={isLoading}
                loadingText={`Đang tải ${pageTitle.toLowerCase()}...`}
                enableGlobalFilter
                globalFilterDebounceMs={300}
                initialPageSize={10}
                pageSizeOptions={[10, 20, 50, 100]}
                extraActions={
                  canCreateLead ? (
                    <Button
                      onClick={openCreateModal}
                      leftSection={<IconPlus size={16} />}
                      size="sm"
                      radius="md"
                    >
                      Thêm lead
                    </Button>
                  ) : undefined
                }
                extraFilters={
                  currentView === "acquired" ? (
                    <Select
                      aria-label="Lọc trạng thái lead"
                      data={[
                        { value: "all", label: "Tất cả trạng thái" },
                        { value: "unassigned", label: "Chưa phân" },
                        { value: "assigned", label: "Đã phân" },
                        { value: "pooled", label: "Chờ phân lại" },
                        { value: "retained", label: "Khách hàng" }
                      ]}
                      value={statusFilter}
                      onChange={(value) =>
                        navigate({
                          to: "/sales/leads",
                          search: {
                            view: "acquired",
                            status:
                              value && value !== "all"
                                ? (value as Exclude<LeadStatusFilter, "all">)
                                : undefined
                          }
                        })
                      }
                      w={210}
                      allowDeselect={false}
                    />
                  ) : undefined
                }
              />
            </Tabs.Panel>
          </Tabs>
        </Box>
      </Box>
    </SalesLayout>
  )
}

function LeadStatusBadge({ status }: { status?: string }) {
  const labels: Record<string, string> = {
    active: "Đang chăm sóc",
    retained: "Khách hàng",
    unassigned: "Chưa phân cho ai",
    assigned: "Đã phân",
    pooled: "Chờ phân lại"
  }
  const colors: Record<string, string> = {
    active: "blue",
    retained: "green",
    unassigned: "gray",
    assigned: "cyan",
    pooled: "orange"
  }

  return (
    <Badge color={colors[status || ""] || "gray"}>
      {labels[status || ""] || status || "—"}
    </Badge>
  )
}

function CreateSalesLeadModal({
  channels,
  salesCsOptions,
  loading,
  onSubmit
}: {
  channels: SalesChannel[]
  salesCsOptions: { value: string; label: string }[]
  loading: boolean
  onSubmit: (data: {
    name: string
    phoneNumber?: string
    channel?: string
    salesCsId?: string
  }) => void
}) {
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [channel, setChannel] = useState<string | null>(null)
  const [salesCsId, setSalesCsId] = useState<string | null>(null)
  const selectedChannel = channels.find((item) => item._id === channel)
  const channelSalesCsIds = new Set(
    [
      selectedChannel?.assignedTo?._id,
      ...(selectedChannel?.assignedTos || []).map((user) => user._id)
    ].filter((id): id is string => Boolean(id))
  )
  const filteredSalesCsOptions = channel
    ? salesCsOptions.filter((option) => channelSalesCsIds.has(option.value))
    : salesCsOptions

  return (
    <Stack gap="md">
      <TextInput
        label="Tên khách"
        placeholder="Nhập tên khách"
        required
        value={name}
        onChange={(event) => setName(event.currentTarget.value)}
      />
      <TextInput
        label="Số điện thoại"
        placeholder="Nhập số điện thoại"
        value={phoneNumber}
        onChange={(event) => setPhoneNumber(event.currentTarget.value)}
      />
      <Select
        label="Kênh"
        placeholder="Chọn kênh"
        data={channels.map((item) => ({
          value: item._id,
          label: item.channelName
        }))}
        value={channel}
        onChange={(value) => {
          setChannel(value)
          setSalesCsId(null)
        }}
        searchable
        clearable
      />
      <Select
        label="Sales nhận khách"
        placeholder="Chọn Sales"
        data={filteredSalesCsOptions}
        value={salesCsId}
        onChange={setSalesCsId}
        searchable
        clearable
        disabled={!channel}
        description={
          channel && filteredSalesCsOptions.length === 0
            ? "Kênh này chưa có Sales đang bật nhận lead"
            : undefined
        }
        nothingFoundMessage="Không có Sales phù hợp"
      />
      <Group justify="flex-end" mt="md">
        <Button
          variant="default"
          onClick={() => modals.closeAll()}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          loading={loading}
          disabled={!name.trim()}
          onClick={() =>
            onSubmit({
              name: name.trim(),
              phoneNumber: phoneNumber.trim() || undefined,
              channel: channel || undefined,
              salesCsId: salesCsId || undefined
            })
          }
        >
          Tạo lead
        </Button>
      </Group>
    </Stack>
  )
}

function AssignLeadModal({
  name,
  options,
  loading,
  onSubmit
}: {
  name: string
  options: { value: string; label: string }[]
  loading: boolean
  onSubmit: (salesCsId: string) => void
}) {
  const [salesCsId, setSalesCsId] = useState<string | null>(null)

  return (
    <Stack gap="md">
      <Text size="sm">
        Chọn Sales nhận lead <b>{name}</b>.
      </Text>
      <Select
        label="Sales nhận khách"
        placeholder="Chọn Sales"
        data={options}
        value={salesCsId}
        onChange={setSalesCsId}
        searchable
      />
      <Group justify="flex-end">
        <Button
          variant="default"
          onClick={() => modals.closeAll()}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          loading={loading}
          disabled={!salesCsId}
          onClick={() => salesCsId && onSubmit(salesCsId)}
        >
          Phân lead
        </Button>
      </Group>
    </Stack>
  )
}
