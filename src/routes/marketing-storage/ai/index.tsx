import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { Box, Paper, Text, ThemeIcon, Title } from "@mantine/core"
import { IconSparkles } from "@tabler/icons-react"
import { Helmet } from "react-helmet-async"

export const Route = createFileRoute("/marketing-storage/ai/")({
  component: RouteComponent
})

function RouteComponent() {
  useAuthGuard([
    "admin",
    "order-emp",
    "accounting-emp",
    "system-emp",
    "sales-emp",
    "sales-leader",
    "sales-accounting",
    "livestream-emp",
    "livestream-ast",
    "livestream-leader",
    "livestream-accounting"
  ])

  return (
    <>
      <Helmet>
        <title>Trợ lý AI | MyCandy</title>
      </Helmet>
      <AppLayout>
        <Paper
          mt={28}
          radius={24}
          p={{ base: 18, md: 28 }}
          style={{
            background:
              "radial-gradient(600px 320px at 12% -10%, rgba(99,102,241,0.16) 0%, rgba(255,255,255,0) 60%), radial-gradient(520px 280px at 90% 0%, rgba(14,165,233,0.12) 0%, rgba(255,255,255,0) 65%), #ffffff",
            border: "1px solid #ececec",
            boxShadow: "0 10px 36px rgba(60,80,180,0.08)"
          }}
        >
          <Box mb={16}>
            <ThemeIcon
              size={54}
              radius={18}
              variant="gradient"
              gradient={{ from: "indigo.6", to: "cyan.5", deg: 45 }}
              style={{ boxShadow: "0 8px 20px rgba(99,102,241,0.25)" }}
            >
              <IconSparkles size={28} />
            </ThemeIcon>
          </Box>
          <Title order={2} mb={8}>
            Trợ lý AI
          </Title>
          <Text c="dimmed" fz={14}>
            Sidebar chat AI đã được bật cho toàn bộ hệ thống. Bạn có thể mở/tắt
            ở góc dưới bên phải màn hình.
          </Text>
        </Paper>
      </AppLayout>
    </>
  )
}
