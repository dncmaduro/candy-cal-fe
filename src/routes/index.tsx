import { AppShell, Box, Button } from "@mantine/core"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <AppShell>
      <AppShell.Main h={"100vh"} w={"100vw"}>
        <Box h="100%" className="relative flex items-center justify-center">
          <Box mx="auto" my="auto">
            <Button component={Link} to="/storage">
              Go to storage
            </Button>
          </Box>
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}
