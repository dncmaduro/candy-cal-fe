import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { MessagesLayout } from "../../../components/layouts/MessagesLayout"
import { ConversationsList } from "../../../components/messages/ConversationsList"
import { Box, Center, Text } from "@mantine/core"

export const Route = createFileRoute("/sales/messages/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()

  return (
    <MessagesLayout
      sidebar={
        <ConversationsList
          onSelect={(id) => navigate({ to: `/sales/messages/${id}` })}
        />
      }
      content={
        <Box
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "#f9fafc"
          }}
        >
          <Center>
            <Text c="dimmed" size="sm">
              💬 Chọn một cuộc trò chuyện ở bên trái để bắt đầu nhắn tin
            </Text>
          </Center>
        </Box>
      }
    ></MessagesLayout>
  )
}
