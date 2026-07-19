import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  Title
} from "@mantine/core"
import { IconArrowLeft, IconPhone, IconRepeat } from "@tabler/icons-react"
import { useState } from "react"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { CToast } from "../../../components/common/CToast"
import { useSalesLeads, type AvailableCs } from "../../../hooks/useSalesLeads"
import { useUsers } from "../../../hooks/useUsers"

type Person = { _id?: string; name?: string; username?: string }
type Assignment = {
  _id: string
  salesCsId?: Person
  status?: string
  kind?: string
  cycleKey?: string
  startedAt?: string
  endedAt?: string
  customerSnapshot?: { name?: string; phoneNumber?: string }
}
type Call = {
  _id: string
  assignmentId?: string
  outcome?: string
  note?: string
  calledAt?: string
}
type LeadDetail = {
  _id: string
  status?: string
  funnel?: { name?: string; phoneNumber?: string; address?: string }
  assignment?: Assignment
  assignments?: Assignment[]
  calls?: Call[]
}

const outcomes = [
  { value: "no_answer", label: "Không nghe máy" },
  { value: "not_interested", label: "Không quan tâm" },
  { value: "call_back", label: "Hẹn gọi lại" },
  { value: "considering", label: "Đang cân nhắc" },
  { value: "closed", label: "Đã chốt" },
  { value: "wrong_number", label: "Sai số" },
  { value: "other", label: "Khác" }
]

const nameOf = (user?: Person) => user?.name || user?.username || "—"
const dateOf = (value?: string) =>
  value ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "—"

export const Route = createFileRoute("/sales/leads/$leadId")({
  component: LeadDetailPage
})

function LeadDetailPage() {
  const { leadId } = Route.useParams()
  const navigate = useNavigate({ from: "/sales/leads/$leadId" })
  const api = useSalesLeads()
  const { getMe } = useUsers()
  const queryClient = useQueryClient()
  const [outcome, setOutcome] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [salesCsId, setSalesCsId] = useState<string | null>(null)

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    select: (response) => response.data
  })
  const roles = meQuery.data?.roles || []
  const canCare = roles.includes("sales-cs") || roles.includes("admin") || roles.includes("sales-leader")
  const detailQuery = useQuery({
    queryKey: ["salesLeads", "detail", leadId],
    queryFn: () => api.detail(leadId),
    select: (response) => response.data as LeadDetail
  })
  const availableCsQuery = useQuery({
    queryKey: ["salesLeads", "availableCs"],
    queryFn: api.availableCs,
    select: (response) => response.data as AvailableCs[],
    enabled: canCare
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["salesLeads"] })
  const addCall = useMutation({
    mutationFn: () => api.addCall(leadId, { outcome, note: note.trim() }),
    onSuccess: () => {
      CToast.success({ title: "Đã lưu kết quả gọi" })
      setOutcome(null)
      setNote("")
      refresh()
    },
    onError: () => CToast.error({ title: "Không thể lưu kết quả gọi" })
  })
  const transfer = useMutation({
    mutationFn: () => {
      if (!salesCsId) throw new Error("Chưa chọn nhân viên CSKH")
      return api.transfer(leadId, salesCsId)
    },
    onSuccess: () => {
      CToast.success({ title: "Đã chuyển khách hàng" })
      setSalesCsId(null)
      refresh()
    },
    onError: () => CToast.error({ title: "Không thể chuyển khách hàng" })
  })

  const detail = detailQuery.data
  const assignments = detail?.assignments || (detail?.assignment ? [detail.assignment] : [])
  const calls = detail?.calls || []
  const salesCsOptions = (availableCsQuery.data || []).map((row) => ({
    value: row.salesCsId._id,
    label: nameOf(row.salesCsId)
  }))

  return (
    <SalesLayout>
      <Stack my={32} gap="lg">
        <Group justify="space-between">
          <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate({ to: "/sales/leads" })}>
            Quay lại
          </Button>
          {detail?.status && <Badge>{detail.status}</Badge>}
        </Group>

        {detailQuery.isLoading ? <Text>Đang tải khách hàng...</Text> : detail && (
          <>
            <Box p="lg" bg="white" style={{ borderRadius: 12 }}>
              <Title order={3}>{detail.funnel?.name || "Khách hàng"}</Title>
              <Text mt="xs">SĐT: {detail.funnel?.phoneNumber || "—"}</Text>
              {detail.funnel?.address && <Text>Địa chỉ: {detail.funnel.address}</Text>}
            </Box>

            {canCare && (
              <Box p="lg" bg="white" style={{ borderRadius: 12 }}>
                <Title order={4}>Chăm sóc khách hàng</Title>
                <Stack mt="md">
                  <Select placeholder="Chọn kết quả gọi" data={outcomes} value={outcome} onChange={setOutcome} />
                  <Textarea placeholder="Ghi chú cuộc gọi" value={note} onChange={(event) => setNote(event.currentTarget.value)} />
                  <Button leftSection={<IconPhone size={16} />} disabled={!outcome || !note.trim()} loading={addCall.isPending} onClick={() => addCall.mutate()}>
                    Lưu cuộc gọi
                  </Button>
                  <Divider />
                  <Select placeholder="Chuyển cho Sales" data={salesCsOptions} value={salesCsId} onChange={setSalesCsId} searchable clearable />
                  <Button color="orange" variant="light" leftSection={<IconRepeat size={16} />} disabled={!salesCsId} loading={transfer.isPending} onClick={() => transfer.mutate()}>
                    Chuyển khách hàng
                  </Button>
                </Stack>
              </Box>
            )}

            <Box p="lg" bg="white" style={{ borderRadius: 12 }}>
              <Title order={4}>Lịch sử phân công</Title>
              <Stack mt="md" gap="sm">
                {assignments.map((assignment) => (
                  <Box key={assignment._id} p="sm" style={{ borderLeft: "3px solid #228be6" }}>
                    <Group justify="space-between">
                      <Text fw={600}>{nameOf(assignment.salesCsId)}</Text>
                      <Badge variant="light">{assignment.status || "—"}</Badge>
                    </Group>
                    <Text size="sm">{assignment.kind || "initial"} · {assignment.cycleKey || "Khách giữ lâu dài"}</Text>
                    <Text size="xs" c="dimmed">{dateOf(assignment.startedAt)} — {dateOf(assignment.endedAt)}</Text>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box p="lg" bg="white" style={{ borderRadius: 12 }}>
              <Title order={4}>Lịch sử gọi</Title>
              <Stack mt="md" gap="sm">
                {calls.length === 0 ? <Text c="dimmed">Chưa có cuộc gọi nào.</Text> : calls.map((call) => (
                  <Box key={call._id} p="sm" style={{ borderLeft: "3px solid #40c057" }}>
                    <Group justify="space-between"><Badge variant="light">{call.outcome}</Badge><Text size="xs" c="dimmed">{dateOf(call.calledAt)}</Text></Group>
                    <Text mt={4}>{call.note}</Text>
                  </Box>
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Stack>
    </SalesLayout>
  )
}
