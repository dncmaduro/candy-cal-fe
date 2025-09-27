import { Button, Text, Box } from "@mantine/core"
import {
  IconSettings,
  IconPlus,
  IconChartBar,
  IconUsers
} from "@tabler/icons-react"
import { CDashboardLayout } from "../common/CDashboardLayout"

// Example usage of CDashboardLayout component
export const ExamplePage = () => {
  return (
    <CDashboardLayout
      icon={<IconSettings size={28} color="#1971c2" />}
      title="Settings Manager"
      subheader="Configure your application settings and preferences"
      rightHeader={
        <>
          <Button
            color="indigo"
            variant="gradient"
            gradient={{ from: "indigo.5", to: "blue.5", deg: 45 }}
            size="md"
            radius="xl"
            leftSection={<IconPlus size={18} />}
            style={{
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
              transition: "all 0.2s ease"
            }}
          >
            Add Setting
          </Button>
        </>
      }
      content={
        <Box>
          <Text>Your page content goes here...</Text>
          <Text c="dimmed" mt="md">
            This demonstrates the simplified CDashboardLayout component:
          </Text>
          <Box component="ul" mt="sm">
            <li>Simple icon + title header (consistent gradient styling)</li>
            <li>Descriptive subheader</li>
            <li>Right-aligned action buttons</li>
            <li>Flexible content area</li>
          </Box>

          <Box mt="xl">
            <Text fw={600} mb="sm">
              More Examples:
            </Text>
          </Box>
        </Box>
      }
    />
  )
}

// More usage examples
export const DashboardExample = () => (
  <CDashboardLayout
    icon={<IconChartBar size={28} color="#1971c2" />}
    title="Analytics Dashboard"
    subheader="Monitor your business performance in real-time"
    rightHeader={<Button variant="light">Export Data</Button>}
    content={<Text>Dashboard content here...</Text>}
  />
)

export const UsersExample = () => (
  <CDashboardLayout
    icon={<IconUsers size={28} color="#1971c2" />}
    title="User Management"
    subheader="Manage users and permissions"
    rightHeader={<Button leftSection={<IconPlus size={16} />}>Add User</Button>}
    content={<Text>User list here...</Text>}
  />
)
