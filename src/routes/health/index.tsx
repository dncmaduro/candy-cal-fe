import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Select,
  SimpleGrid,
  Stack,
  Text
} from "@mantine/core"
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react"
import { Helmet } from "react-helmet-async"
import { useMemo, useState } from "react"
import { CToast } from "../../components/common/CToast"
import {
  HEALTH_LIVE_PATH,
  HEALTH_READY_PATH,
  useHealth
} from "../../hooks/useHealth"

export const Route = createFileRoute("/health/")({
  component: RouteComponent
})

const formatTimestamp = (value?: number) => {
  if (!value) return "-"

  return new Date(value).toLocaleString("vi-VN")
}

const getStatusBadge = (status: "up" | "down" | "unknown") => {
  if (status === "up") {
    return { label: "UP", color: "green" }
  }

  if (status === "down") {
    return { label: "DOWN", color: "red" }
  }

  return { label: "UNKNOWN", color: "gray" }
}

const getErrorMessage = (error: unknown) => {
  const responseData = (error as any)?.response?.data
  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message
  }

  const message = (error as any)?.message
  if (typeof message === "string" && message.trim()) {
    return message
  }

  return "Không thể kết nối tới backend đã chọn."
}

const getStatusCode = (value: unknown) => {
  const status = (value as any)?.status
  return typeof status === "number" ? status : null
}

function RouteComponent() {
  const { getBackendUrls, getHealthLive, getHealthReady } = useHealth()

  const backendUrls = getBackendUrls()
  const backendOptions = backendUrls.map((url) => ({
    value: url,
    label: url
  }))

  const [selectedUrl, setSelectedUrl] = useState<string | null>(
    backendUrls[0] ?? null
  )

  const liveQuery = useQuery({
    queryKey: ["health", "live", selectedUrl],
    enabled: !!selectedUrl,
    queryFn: () => getHealthLive(selectedUrl ?? undefined),
    refetchInterval: 30000,
    retry: false
  })

  const readyQuery = useQuery({
    queryKey: ["health", "ready", selectedUrl],
    enabled: !!selectedUrl,
    queryFn: () => getHealthReady(selectedUrl ?? undefined),
    refetchInterval: 30000,
    retry: false
  })

  const liveStatus = liveQuery.isSuccess
    ? getStatusBadge("up")
    : liveQuery.isError
      ? getStatusBadge("down")
      : getStatusBadge("unknown")

  const readyStatus = readyQuery.isSuccess
    ? getStatusBadge("up")
    : readyQuery.isError
      ? getStatusBadge("down")
      : getStatusBadge("unknown")

  const responseState = liveQuery.isPending || readyQuery.isPending
    ? { label: "Loading", color: "yellow" }
    : liveQuery.isError || readyQuery.isError
      ? { label: "Error", color: "red" }
      : liveQuery.isFetching || readyQuery.isFetching
        ? { label: "Loading", color: "yellow" }
        : { label: "Success", color: "green" }

  const lastCheckedAt = Math.max(
    liveQuery.dataUpdatedAt || 0,
    readyQuery.dataUpdatedAt || 0
  )

  const selectedHost = useMemo(() => {
    if (!selectedUrl) return "-"

    try {
      return new URL(selectedUrl).host
    } catch {
      return selectedUrl
    }
  }, [selectedUrl])

  const overallStatus =
    liveQuery.isSuccess && readyQuery.isSuccess
      ? { label: "UP", color: "green" }
      : liveQuery.isSuccess && readyQuery.isError
        ? { label: "ALIVE / DB CHECK FAILED", color: "orange" }
        : liveQuery.isError
          ? { label: "DOWN", color: "red" }
          : { label: "CHECKING", color: "gray" }

  const provincesCount = readyQuery.data?.data?.provinces?.length ?? 0
  const liveStatusCode =
    liveQuery.data?.status ?? getStatusCode((liveQuery.error as any)?.response)
  const readyStatusCode =
    readyQuery.data?.status ??
    getStatusCode((readyQuery.error as any)?.response)

  const handleRefresh = async () => {
    const [liveResult, readyResult] = await Promise.allSettled([
      liveQuery.refetch(),
      readyQuery.refetch()
    ])

    const hasError =
      liveResult.status === "rejected" ||
      readyResult.status === "rejected" ||
      (liveResult.status === "fulfilled" && !!liveResult.value.error) ||
      (readyResult.status === "fulfilled" && !!readyResult.value.error)

    if (hasError) {
      CToast.error({
        title: "Làm mới trạng thái thất bại"
      })
    }
  }

  return (
    <>
      <Helmet>
        <title>Kiểm tra backend | MyCandy</title>
      </Helmet>

      <Box bg="#f8fafc" mih="100vh" py={40}>
        <Container size="lg">
          <Stack gap="lg">
            <Card
              withBorder
              radius="xl"
              padding="lg"
              style={{
                borderColor: "#e5e7eb",
                background: "#fff",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)"
              }}
            >
              <Stack gap="lg">
                <Group justify="space-between" align="flex-start" gap="md">
                  <Box>
                    <Text fw={700} fz="xl" mb={4}>
                      Kiểm tra backend
                    </Text>
                    <Text c="dimmed" fz="sm">
                      Trang này không cần đăng nhập. Nó đang probe đúng các API
                      hiện có của `candy-cal-be`.
                    </Text>
                  </Box>

                  <Group gap="sm">
                    {(liveQuery.isFetching || readyQuery.isFetching) && (
                      <Loader size="sm" />
                    )}
                    <Button
                      variant="light"
                      color="gray"
                      leftSection={<IconRefresh size={16} />}
                      onClick={() => void handleRefresh()}
                      loading={liveQuery.isFetching || readyQuery.isFetching}
                    >
                      Làm mới
                    </Button>
                  </Group>
                </Group>

                <Select
                  label="Backend URL"
                  placeholder="Chọn backend URL"
                  data={backendOptions}
                  value={selectedUrl}
                  onChange={setSelectedUrl}
                  searchable
                  allowDeselect={false}
                  nothingFoundMessage="Không có URL backend trong env"
                />

                <Alert
                  color="blue"
                  variant="light"
                  radius="md"
                  icon={<IconAlertCircle size={18} />}
                >
                  <Stack gap={4}>
                    <Text fw={700}>API thực tế trong `candy-cal-be`</Text>
                    <Text size="sm">
                      Backend hiện dùng global prefix `api/v1`, có `GET /api/v1`
                      và `GET /api/v1/provinces`, nhưng chưa có
                      `GET /api/v1/health/live` hay `GET /api/v1/health/ready`.
                    </Text>
                  </Stack>
                </Alert>

                {liveQuery.isError && (
                  <Alert
                    color="red"
                    variant="light"
                    radius="md"
                    icon={<IconAlertCircle size={18} />}
                  >
                    <Stack gap={4}>
                      <Text fw={700}>App probe thất bại</Text>
                      <Text size="sm">{getErrorMessage(liveQuery.error)}</Text>
                    </Stack>
                  </Alert>
                )}

                {readyQuery.isError && (
                  <Alert
                    color="red"
                    variant="light"
                    radius="md"
                    icon={<IconAlertCircle size={18} />}
                  >
                    <Stack gap={4}>
                      <Text fw={700}>MongoDB readiness proxy thất bại</Text>
                      <Text size="sm">{getErrorMessage(readyQuery.error)}</Text>
                    </Stack>
                  </Alert>
                )}

                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                  <Card withBorder radius="lg" padding="md">
                    <Stack gap={4}>
                      <Text size="sm" c="dimmed">
                        Tổng trạng thái
                      </Text>
                      <Badge
                        color={overallStatus.color}
                        variant="light"
                        radius="xl"
                        w="fit-content"
                      >
                        {overallStatus.label}
                      </Badge>
                    </Stack>
                  </Card>

                  <Card withBorder radius="lg" padding="md">
                    <Stack gap={4}>
                      <Text size="sm" c="dimmed">
                        App liveness
                      </Text>
                      <Badge
                        color={liveStatus.color}
                        variant="light"
                        radius="xl"
                        w="fit-content"
                      >
                        {liveStatus.label}
                      </Badge>
                    </Stack>
                  </Card>

                  <Card withBorder radius="lg" padding="md">
                    <Stack gap={4}>
                      <Text size="sm" c="dimmed">
                        MongoDB readiness proxy
                      </Text>
                      <Badge
                        color={readyStatus.color}
                        variant="light"
                        radius="xl"
                        w="fit-content"
                      >
                        {readyStatus.label}
                      </Badge>
                    </Stack>
                  </Card>

                  <Card withBorder radius="lg" padding="md">
                    <Stack gap={4}>
                      <Text size="sm" c="dimmed">
                        Response state
                      </Text>
                      <Badge
                        color={responseState.color}
                        variant="outline"
                        radius="xl"
                        w="fit-content"
                      >
                        {responseState.label}
                      </Badge>
                    </Stack>
                  </Card>
                </SimpleGrid>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <Card withBorder radius="lg" padding="md">
                    <Stack gap={4}>
                      <Text size="sm" c="dimmed">
                        Backend host
                      </Text>
                      <Text fw={700}>{selectedHost}</Text>
                    </Stack>
                  </Card>

                  <Card withBorder radius="lg" padding="md">
                    <Stack gap={4}>
                      <Text size="sm" c="dimmed">
                        Lần kiểm tra gần nhất
                      </Text>
                      <Text fw={700}>{formatTimestamp(lastCheckedAt)}</Text>
                    </Stack>
                  </Card>
                </SimpleGrid>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <Card withBorder radius="lg" padding="md">
                    <Stack gap={4}>
                      <Text size="sm" c="dimmed">
                        App probe endpoint
                      </Text>
                      <Text fw={700}>
                        {selectedUrl ? `${selectedUrl}${HEALTH_LIVE_PATH}` : "-"}
                      </Text>
                      <Text size="sm" c="dimmed">
                        HTTP status: {liveStatusCode ?? "-"}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Response: {liveQuery.data?.data.message ?? "-"}
                      </Text>
                    </Stack>
                  </Card>

                  <Card withBorder radius="lg" padding="md">
                    <Stack gap={4}>
                      <Text size="sm" c="dimmed">
                        DB readiness probe endpoint
                      </Text>
                      <Text fw={700}>
                        {selectedUrl ? `${selectedUrl}${HEALTH_READY_PATH}` : "-"}
                      </Text>
                      <Text size="sm" c="dimmed">
                        HTTP status: {readyStatusCode ?? "-"}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Provinces loaded: {provincesCount.toLocaleString("vi-VN")}
                      </Text>
                    </Stack>
                  </Card>
                </SimpleGrid>

                <Card withBorder radius="lg" padding="md">
                  <Stack gap={4}>
                    <Text size="sm" c="dimmed">
                      Uptime
                    </Text>
                    <Text fw={700}>
                      Backend hiện tại chưa expose uptime qua public API
                    </Text>
                  </Stack>
                </Card>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  )
}
