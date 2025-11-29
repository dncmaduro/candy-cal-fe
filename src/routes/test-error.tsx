import { createFileRoute } from "@tanstack/react-router"
import {
  Button,
  Container,
  Stack,
  Title,
  Text,
  Paper,
  Box
} from "@mantine/core"
import { useState } from "react"

export const Route = createFileRoute("/test-error")({
  component: RouteComponent
})

function RouteComponent() {
  const [shouldThrow, setShouldThrow] = useState(false)

  if (shouldThrow) {
    // This will trigger the Error Boundary
    throw new Error("This is a test error from the frontend!")
  }

  return (
    <Box p="xl">
      <Container size="sm" mt={100}>
        <Paper p="xl" shadow="sm" withBorder>
          <Stack gap="lg">
            <Title order={2}>Test Error Boundary</Title>
            <Text c="dimmed">
              Click nút bên dưới để test Error Boundary. Trang sẽ chuyển sang
              trang bảo trì.
            </Text>
            <Button color="red" onClick={() => setShouldThrow(true)} size="lg">
              Trigger Error
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
