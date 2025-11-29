import { ErrorInfo } from "react"
import {
  Box,
  Button,
  Container,
  Text,
  Title,
  Stack,
  Group,
  Paper,
  Code,
  Collapse,
  rem
} from "@mantine/core"
import {
  IconAlertTriangle,
  IconRefresh,
  IconHome,
  IconChevronDown,
  IconChevronUp
} from "@tabler/icons-react"
import { useState } from "react"

interface MaintenancePageProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  onReset: () => void
}

export const MaintenancePage = ({
  error,
  errorInfo,
  onReset
}: MaintenancePageProps) => {
  const [showDetails, setShowDetails] = useState(false)
  const isDev = import.meta.env.DEV

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <Container size="md">
        <Paper
          shadow="xl"
          p={{ base: "xl", md: 60 }}
          radius="lg"
          style={{
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)"
          }}
        >
          <Stack align="center" gap="xl">
            {/* Icon */}
            <Box
              style={{
                background: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)",
                borderRadius: "50%",
                padding: rem(30),
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
              }}
            >
              <IconAlertTriangle size={80} color="white" strokeWidth={1.5} />
            </Box>

            {/* Title */}
            <Stack align="center" gap="sm">
              <Title
                order={1}
                style={{
                  fontSize: rem(42),
                  fontWeight: 800,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                Oops!
              </Title>
              <Title order={2} size="h3" c="gray.8" ta="center">
                Hệ thống đang được bảo trì
              </Title>
              <Text size="lg" c="dimmed" ta="center" maw={500}>
                Chúng tôi đang gặp một số sự cố kỹ thuật. Vui lòng thử lại sau
                ít phút hoặc liên hệ quản trị viên nếu vấn đề vẫn tiếp diễn.
              </Text>
            </Stack>

            {/* Action Buttons */}
            <Group gap="md" mt="md">
              <Button
                size="lg"
                radius="xl"
                leftSection={<IconRefresh size={20} />}
                onClick={onReset}
                variant="gradient"
                gradient={{ from: "indigo", to: "cyan", deg: 45 }}
                style={{
                  boxShadow: "0 4px 16px rgba(102, 126, 234, 0.4)"
                }}
              >
                Thử lại
              </Button>
              <Button
                size="lg"
                radius="xl"
                leftSection={<IconHome size={20} />}
                onClick={() => (window.location.href = "/")}
                variant="light"
                color="indigo"
              >
                Về trang chủ
              </Button>
            </Group>

            {/* Error Details (Development Only) */}
            {isDev && error && (
              <Box w="100%" mt="xl">
                <Button
                  variant="subtle"
                  color="gray"
                  fullWidth
                  onClick={() => setShowDetails(!showDetails)}
                  rightSection={
                    showDetails ? (
                      <IconChevronUp size={16} />
                    ) : (
                      <IconChevronDown size={16} />
                    )
                  }
                >
                  {showDetails ? "Ẩn" : "Xem"} chi tiết lỗi (Dev Mode)
                </Button>
                <Collapse in={showDetails}>
                  <Paper p="md" mt="sm" withBorder bg="gray.0">
                    <Stack gap="sm">
                      <div>
                        <Text size="sm" fw={600} mb={4}>
                          Error Message:
                        </Text>
                        <Code block color="red">
                          {error.message}
                        </Code>
                      </div>

                      {error.stack && (
                        <div>
                          <Text size="sm" fw={600} mb={4}>
                            Stack Trace:
                          </Text>
                          <Code
                            block
                            style={{
                              maxHeight: 300,
                              overflow: "auto",
                              fontSize: rem(11)
                            }}
                          >
                            {error.stack}
                          </Code>
                        </div>
                      )}

                      {errorInfo && errorInfo.componentStack && (
                        <div>
                          <Text size="sm" fw={600} mb={4}>
                            Component Stack:
                          </Text>
                          <Code
                            block
                            style={{
                              maxHeight: 200,
                              overflow: "auto",
                              fontSize: rem(11)
                            }}
                          >
                            {errorInfo.componentStack}
                          </Code>
                        </div>
                      )}
                    </Stack>
                  </Paper>
                </Collapse>
              </Box>
            )}

            {/* Footer */}
            <Text size="sm" c="dimmed" mt="xl" ta="center">
              Nếu cần hỗ trợ, vui lòng liên hệ{" "}
              <Text component="span" fw={600} c="indigo">
                support@mycandy.vn
              </Text>
            </Text>
          </Stack>
        </Paper>

        {/* Decorative Elements */}
        <Box
          style={{
            position: "absolute",
            top: "10%",
            left: "5%",
            width: 100,
            height: 100,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
            filter: "blur(40px)",
            zIndex: 0
          }}
        />
        <Box
          style={{
            position: "absolute",
            bottom: "10%",
            right: "5%",
            width: 150,
            height: 150,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(118, 75, 162, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)",
            filter: "blur(50px)",
            zIndex: 0
          }}
        />
      </Container>
    </Box>
  )
}
