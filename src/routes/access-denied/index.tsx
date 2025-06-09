import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Box, Button, Center, Stack, Text } from "@mantine/core"
import { IconLock } from "@tabler/icons-react"

export const Route = createFileRoute("/access-denied/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  return (
    <Center h="80vh">
      <Stack align="center" gap={24}>
        <Box
          bg="indigo.0"
          p={24}
          style={{
            borderRadius: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8
          }}
        >
          <IconLock size={48} color="#6366f1" />
        </Box>
        <Text fw={700} fz={32} ta="center">
          Không có quyền truy cập
        </Text>
        <Text c="dimmed" fz="md" ta="center" mb={8} w={340}>
          Bạn không có quyền truy cập vào trang này. Nếu cần quyền, vui lòng
          liên hệ quản trị viên.
        </Text>
        <Button
          variant="outline"
          color="indigo"
          size="md"
          radius="xl"
          onClick={() => navigate({ to: "/" })}
        >
          Quay lại trang chủ
        </Button>
      </Stack>
    </Center>
  )
}
