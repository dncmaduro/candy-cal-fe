import {
  Avatar,
  Box,
  Group,
  ScrollArea,
  Stack,
  Text,
  TextInput
} from "@mantine/core"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMetaServices } from "../../hooks/useMetaServices"

export const ConversationsList = ({
  onSelect
}: {
  onSelect?: (id: string) => void
}) => {
  const { listConversations } = useMetaServices()
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["metaConversations"],
    queryFn: ({ pageParam = 1 }) =>
      listConversations({ page: pageParam as number, limit: 20 }),
    getNextPageParam: (lastPage) =>
      lastPage.data.nextPage ? lastPage.data.nextPage : undefined,
    initialPageParam: 1
  })
  const activeConversationid =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").pop()
      : ""

  const conversations = data?.pages.flatMap((p) => p.data.items) ?? []

  return (
    <Box h={"100%"} p={16}>
      <ScrollArea
        style={{ height: "100%" }}
        scrollbarSize={6}
        className="rounded-lg border border-gray-300 shadow-md"
      >
        <Stack gap={0}>
          <Box my={16}>
            <Text className="text-md text-center" fw={900}>
              Tin nhắn với khách
            </Text>
          </Box>
          <Box my={8}>
            <TextInput
              placeholder="Tìm tin nhắn với khách..."
              className="mx-auto w-[95%]"
              color="gray"
              radius={"xl"}
              styles={{
                input: {
                  background: "#eeeeeecc"
                }
              }}
            />
          </Box>
          {conversations.map((conv) => (
            <Box
              key={conv.conversationId}
              onClick={() => onSelect?.(conv.conversationId)}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                transition: "background 0.15s",
                backgroundColor:
                  activeConversationid === conv.conversationId
                    ? "#005fee17"
                    : "transparent",
                "&:hover": {
                  backgroundColor: "#f2f4f7"
                }
              }}
            >
              <Group align="center" gap={12}>
                <Avatar
                  src={conv.user.profile_pic || undefined}
                  alt={conv.user.name || conv.user.psid}
                  radius="xl"
                  size={42}
                />
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={600} size="sm" truncate>
                    {conv.user.name || conv.user.psid}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {new Date(conv.updated_time).toLocaleString()}
                  </Text>
                </Box>
              </Group>
            </Box>
          ))}
          {hasNextPage && (
            <Text
              ta="center"
              c="dimmed"
              py={8}
              onClick={() => fetchNextPage()}
              style={{ cursor: "pointer", fontSize: 13 }}
            >
              Tải thêm...
            </Text>
          )}
        </Stack>
      </ScrollArea>
    </Box>
  )
}
