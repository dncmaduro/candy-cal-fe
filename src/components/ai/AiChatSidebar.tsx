import { useEffect, useMemo, useRef, useState } from "react"
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  LoadingOverlay,
  Menu,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  Title
} from "@mantine/core"
import {
  IconDots,
  IconEraser,
  IconMessagePlus,
  IconSend,
  IconSparkles,
  IconTrash
} from "@tabler/icons-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { modals } from "@mantine/modals"
import { useAi } from "../../hooks/useAi"
import { CToast } from "../common/CToast"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  at: string
}

export const AiChatSidebar = () => {
  const {
    ask,
    getUsage,
    listConversations,
    getConversationHistory,
    deleteConversation,
    clearConversationHistory
  } = useAi()
  const queryClient = useQueryClient()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [historyCursor, setHistoryCursor] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const initConversationRef = useRef(false)
  const isFetchingMoreRef = useRef(false)

  const { data: usage } = useQuery({
    queryKey: ["aiUsage"],
    queryFn: getUsage,
    select: (d) => d.data
  })

  const {
    data: conversationList,
    isLoading: isLoadingConversations,
    refetch: refetchConversations
  } = useQuery({
    queryKey: ["aiConversations"],
    queryFn: () => listConversations({ limit: 50 }),
    select: (d) => d.data.data
  })

  const conversations = conversationList ?? []

  const {
    data: conversationHistory,
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ["aiConversationHistory", activeConversationId],
    queryFn: () =>
      getConversationHistory({
        conversationId: activeConversationId ?? undefined,
        limit: 40
      }),
    enabled: !!activeConversationId,
    select: (d) => d.data
  })

  const { mutate: askAi, isPending } = useMutation({
    mutationKey: ["aiAsk"],
    mutationFn: ask,
    onSuccess: async (res) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: res.data.answer,
          at: new Date().toISOString()
        }
      ])
      queryClient.invalidateQueries({ queryKey: ["aiUsage"] })
      if (!activeConversationId && res.data.conversationId) {
        setActiveConversationId(res.data.conversationId)
      }
      refetchConversations()
    },
    onError: () => {
      CToast.error({
        title: "Không thể nhận câu trả lời từ AI"
      })
    }
  })

  const { mutate: removeConversation, isPending: isDeleting } = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      CToast.success({ title: "Đã xóa cuộc trò chuyện" })
      setActiveConversationId(null)
      setMessages([])
      refetchConversations()
    },
    onError: () => {
      CToast.error({ title: "Không thể xóa cuộc trò chuyện" })
    }
  })

  const { mutate: clearHistory, isPending: isClearing } = useMutation({
    mutationFn: clearConversationHistory,
    onSuccess: () => {
      CToast.success({ title: "Đã xóa lịch sử trò chuyện" })
      setMessages([])
      refetchHistory()
      refetchConversations()
    },
    onError: () => {
      CToast.error({ title: "Không thể xóa lịch sử" })
    }
  })

  const canSend = useMemo(() => input.trim().length > 0, [input])

  const handleSend = () => {
    const question = input.trim()
    if (!question || isPending) return

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: question,
        at: new Date().toISOString()
      }
    ])
    setInput("")
    askAi({ question, conversationId: activeConversationId ?? undefined })
  }

  const handleSelectConversation = (conversationId: string) => {
    if (conversationId === activeConversationId) return
    setMessages([])
    setActiveConversationId(conversationId)
  }

  const handleStartNew = () => {
    setActiveConversationId(null)
    setMessages([])
  }

  const handleDeleteConversation = () => {
    if (!activeConversationId) return
    modals.openConfirmModal({
      title: <b>Xóa cuộc trò chuyện</b>,
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa toàn bộ cuộc trò chuyện này?
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () =>
        removeConversation({ conversationId: activeConversationId })
    })
  }

  const handleClearHistory = () => {
    if (!activeConversationId) return
    modals.openConfirmModal({
      title: <b>Xóa lịch sử trò chuyện</b>,
      children: (
        <Text size="sm">
          Xóa toàn bộ tin nhắn trong cuộc trò chuyện hiện tại?
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => clearHistory({ conversationId: activeConversationId })
    })
  }

  useEffect(() => {
    if (!scrollRef.current) return
    if (isFetchingMoreRef.current) return
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    })
  }, [messages, isPending])

  useEffect(() => {
    if (!conversationHistory) return
    setMessages(
      conversationHistory.messages.map((m) => ({
        id: crypto.randomUUID(),
        role: m.role,
        content: m.content,
        at: m.createdAt
      }))
    )
    setHistoryCursor(conversationHistory.nextCursor)
  }, [conversationHistory])

  useEffect(() => {
    if (initConversationRef.current) return
    if (conversations.length > 0) {
      setActiveConversationId(conversations[0].conversationId)
      initConversationRef.current = true
    }
  }, [conversations])

  useEffect(() => {
    setHistoryCursor(null)
  }, [activeConversationId])

  const handleFetchOlder = async () => {
    if (!activeConversationId) return
    if (historyCursor === null) return
    if (isFetchingMoreRef.current) return
    const viewport = scrollRef.current
    if (!viewport) return

    isFetchingMoreRef.current = true
    const prevHeight = viewport.scrollHeight
    const prevTop = viewport.scrollTop

    try {
      const res = await getConversationHistory({
        conversationId: activeConversationId,
        limit: 40,
        cursor: historyCursor
      })
      const next = res.data
      if (next.messages.length > 0) {
        setMessages((prev) => [
          ...next.messages.map((m) => ({
            id: crypto.randomUUID(),
            role: m.role,
            content: m.content,
            at: m.createdAt
          })),
          ...prev
        ])
      }
      setHistoryCursor(next.nextCursor)
    } finally {
      requestAnimationFrame(() => {
        const newHeight = viewport.scrollHeight
        viewport.scrollTop = prevTop + (newHeight - prevHeight)
        isFetchingMoreRef.current = false
      })
    }
  }

  return (
    <>
      {isChatOpen && (
        <Box
          style={{
            position: "fixed",
            right: 88,
            top: 96,
            bottom: 24,
            width: "360px",
            zIndex: 220,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Paper
            radius={22}
            p={16}
            pos="relative"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
              boxShadow: "0 16px 36px rgba(30,60,120,0.18)"
            }}
          >
            <LoadingOverlay
              visible={isLoadingConversations}
              overlayProps={{ radius: 16, blur: 1 }}
            />
            <Group justify="space-between" align="center" mb={12}>
              <Title order={4}>Cuộc trò chuyện</Title>
              <Button
                size="xs"
                radius="xl"
                variant="light"
                leftSection={<IconMessagePlus size={14} />}
                onClick={handleStartNew}
              >
                Mới
              </Button>
            </Group>
            <ScrollArea
              h={160}
              scrollbarSize={6}
              mb={12}
              style={{ flexShrink: 0 }}
            >
              <Stack gap={10} p={4}>
                {conversations.length === 0 && !isLoadingConversations && (
                  <Box
                    p={12}
                    style={{
                      borderRadius: 12,
                      border: "1px dashed #cbd5f5",
                      background: "#ffffff"
                    }}
                  >
                    <Text fz={13} c="dimmed">
                      Chưa có cuộc trò chuyện. Bắt đầu bằng câu hỏi mới.
                    </Text>
                  </Box>
                )}
                {conversations.map((conv) => {
                  const isActive = conv.conversationId === activeConversationId
                  return (
                    <Box
                      key={conv.conversationId}
                      onClick={() =>
                        handleSelectConversation(conv.conversationId)
                      }
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        cursor: "pointer",
                        border: isActive
                          ? "1px solid rgba(79,70,229,0.45)"
                          : "1px solid transparent",
                        background: isActive ? "#e0e7ff" : "#ffffff",
                        boxShadow: isActive
                          ? "0 6px 14px rgba(99,102,241,0.18)"
                          : "0 3px 10px rgba(15,23,42,0.06)"
                      }}
                    >
                      <Text fw={600} fz={12} lineClamp={2}>
                        {conv.lastMessage || "Cuộc trò chuyện mới"}
                      </Text>
                      <Text fz={10} c="dimmed" mt={4}>
                        {new Date(conv.updatedAt).toLocaleString("vi-VN")}
                      </Text>
                    </Box>
                  )
                })}
              </Stack>
            </ScrollArea>

            <Group gap={8} mb={10}>
              <Badge size="sm" radius="xl" variant="light" color="indigo">
                Hôm nay: {usage?.count ?? 0}/{usage?.limit ?? 0}
              </Badge>
              <Badge size="sm" radius="xl" variant="light" color="teal">
                Còn lại: {usage?.remaining ?? 0}
              </Badge>
              <Menu shadow="md" width={210} position="bottom-end">
                <Menu.Target>
                  <ActionIcon
                    variant="light"
                    radius="xl"
                    size="md"
                    disabled={!activeConversationId || isDeleting || isClearing}
                  >
                    <IconDots size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconEraser size={16} />}
                    onClick={handleClearHistory}
                    disabled={!activeConversationId || isClearing}
                  >
                    Xóa lịch sử
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconTrash size={16} />}
                    color="red"
                    onClick={handleDeleteConversation}
                    disabled={!activeConversationId || isDeleting}
                  >
                    Xóa cuộc trò chuyện
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>

            <Divider my={8} />

            <Box
              pos="relative"
              style={{ flex: 1, minHeight: 0, overflow: "hidden" }}
            >
              <LoadingOverlay
                visible={isLoadingHistory}
                overlayProps={{ radius: 16, blur: 1 }}
              />
              <ScrollArea
                viewportRef={scrollRef}
                viewportProps={{ style: { height: "100%" } }}
                onScrollPositionChange={({ y }) => {
                  if (y <= 40) handleFetchOlder()
                }}
                style={{
                  flex: 1,
                  minHeight: 0,
                  borderRadius: 16,
                  background: "#f8fafc",
                  border: "1px solid #edf2f7"
                }}
                h="100%"
              >
                <Stack p={14} gap={10}>
                  {messages.length === 0 && !isPending && (
                    <Box
                      p={16}
                      style={{
                        borderRadius: 14,
                        border: "1px dashed #c7d2fe",
                        background: "#eef2ff"
                      }}
                    >
                      <Text fw={600} fz={13} mb={6}>
                        Gợi ý nhanh
                      </Text>
                      <Text c="dimmed" fz={12}>
                        Ví dụ: “Tóm tắt doanh thu hôm nay”, “Hướng dẫn tạo SKU
                        mới”, “Kiểm tra tồn kho cho mã SP123”.
                      </Text>
                    </Box>
                  )}

                  {messages.map((m) => (
                    <Box
                      key={m.id}
                      style={{
                        alignSelf:
                          m.role === "user" ? "flex-end" : "flex-start",
                        maxWidth: "78%"
                      }}
                    >
                      <Paper
                        p={12}
                        radius={14}
                        style={{
                          background:
                            m.role === "user"
                              ? "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(14,165,233,0.12))"
                              : "#ffffff",
                          border:
                            m.role === "user"
                              ? "1px solid rgba(99,102,241,0.25)"
                              : "1px solid #e5e7eb",
                          boxShadow:
                            m.role === "user"
                              ? "0 6px 14px rgba(99,102,241,0.15)"
                              : "0 6px 12px rgba(120,120,150,0.07)"
                        }}
                      >
                        <Text fz={13} style={{ whiteSpace: "pre-wrap" }}>
                          {m.content}
                        </Text>
                      </Paper>
                      <Text c="dimmed" fz={9} mt={4} ta="right">
                        {new Date(m.at).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </Text>
                    </Box>
                  ))}

                  {isPending && (
                    <Box style={{ alignSelf: "flex-start", maxWidth: "70%" }}>
                      <Paper
                        p={12}
                        radius={14}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 6px 12px rgba(120,120,150,0.07)"
                        }}
                      >
                        <Text fz={13} c="dimmed">
                          AI đang suy nghĩ...
                        </Text>
                      </Paper>
                    </Box>
                  )}
                </Stack>
              </ScrollArea>
            </Box>

            <Group
              mt={12}
              gap={10}
              align="flex-end"
              style={{
                background: "#ffffff",
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                padding: 10,
                flexShrink: 0
              }}
            >
              <Textarea
                placeholder="Nhập câu hỏi..."
                value={input}
                onChange={(e) => setInput(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                autosize
                minRows={2}
                maxRows={4}
                style={{ flex: 1 }}
                radius="md"
              />
              <Button
                leftSection={<IconSend size={14} />}
                radius="xl"
                size="sm"
                onClick={handleSend}
                disabled={!canSend || isPending}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,1), rgba(14,165,233,1))",
                  boxShadow: "0 10px 18px rgba(99,102,241,0.25)"
                }}
              >
                Gửi
              </Button>
            </Group>
          </Paper>
        </Box>
      )}

      <ActionIcon
        size={52}
        radius={999}
        variant="gradient"
        gradient={{ from: "indigo.6", to: "cyan.5", deg: 45 }}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 300,
          boxShadow: "0 14px 28px rgba(79,70,229,0.35)"
        }}
        onClick={() => setIsChatOpen((prev) => !prev)}
      >
        <IconSparkles size={22} />
      </ActionIcon>
    </>
  )
}
