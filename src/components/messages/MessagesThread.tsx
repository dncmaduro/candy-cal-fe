import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Group,
  ScrollArea,
  Text,
  Textarea,
  Tooltip
} from "@mantine/core"
import { IconTablePlus, IconUserEdit } from "@tabler/icons-react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useMetaServices } from "../../hooks/useMetaServices"
import { CToast } from "../common/CToast"
import { useMetaSocket } from "../../hooks/useMetaSocket"
import { useSalesFunnel } from "../../hooks/useSalesFunnel"
import { modals } from "@mantine/modals"
import { UpdateFunnelInfoModal } from "../sales/UpdateFunnelInfoModal"
import { CreateSalesOrderModal } from "../sales/CreateSalesOrderModal"

interface Props {
  psid: string
  conversationId: string
}

export function MessagesThread({ psid, conversationId }: Props) {
  const { getFunnelByPsid } = useSalesFunnel()
  const { listConversationMessages, getProfileByPsid } = useMetaServices()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [prevCursor] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)
  const [pendingMessages, setPendingMessages] = useState<any[]>([])
  const [usedCursors, setUsedCursors] = useState<Set<string>>(new Set())
  const { data, refetch } = useQuery({
    queryKey: ["conversationMessages", conversationId],
    queryFn: () => {
      return listConversationMessages(conversationId, {
        after: nextCursor,
        before: prevCursor
      })
    }
  })
  const { data: funnelData } = useQuery({
    queryKey: ["getFunnelByPsid", psid],
    queryFn: () => getFunnelByPsid({ psid }),
    select: (data) => data.data,
    enabled: !!psid
  })

  const { data: metaProfileData } = useQuery({
    queryKey: ["getProfileByPsid", psid],
    queryFn: () => getProfileByPsid({ psid }),
    select: (data) => data.data,
    enabled: !!psid
  })
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const loadOlder = useCallback(async () => {
    if (isLoadingOlder || nextCursor == null) return
    const viewport = viewportRef.current
    if (!viewport) return

    setIsLoadingOlder(true)
    const prevScrollHeight = viewport.scrollHeight
    const prevScrollTop = viewport.scrollTop

    try {
      refetch()

      // Khôi phục vị trí cuộn (để màn hình đứng yên)
      requestAnimationFrame(() => {
        const newScrollHeight = viewport.scrollHeight
        viewport.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop
      })
    } finally {
      setIsLoadingOlder(false)
    }
  }, [conversationId, isLoadingOlder, listConversationMessages])
  useEffect(() => {
    if (!data) return

    const cursorKey = nextCursor || "initial"

    // Chỉ xử lý nếu cursor này chưa được sử dụng
    if (usedCursors.has(cursorKey)) return

    setMessages((prev) => [
      ...(data.data.items ?? []).slice().reverse(),
      ...prev
    ])

    setHasFetched(true)
    setNextCursor(data.data.nextCursor)
    setUsedCursors((prev) => new Set(prev).add(cursorKey))
    // console.log("Loaded cursor:", cursorKey, "Next:", data.data.nextCursor)
  }, [data])
  const allMessages = useMemo(() => {
    return [...messages, ...pendingMessages]
  }, [messages, pendingMessages])

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  useEffect(() => {
    // Auto-scroll to bottom when messages are first loaded or when new messages arrive
    if (shouldAutoScroll && allMessages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
      // After first scroll, disable auto-scroll to let user manually navigate
      if (hasFetched) {
        setShouldAutoScroll(false)
      }
    }
  }, [allMessages, hasFetched, shouldAutoScroll])

  const { sendMessage } = useMetaServices()

  const [text, setText] = useState("")
  const { mutate: handleSendMessage, isPending: isSending } = useMutation({
    mutationFn: async () => {
      const tempId = `temp-${Date.now()}`
      const newMsg = {
        id: tempId,
        text,
        created_time: new Date().toISOString(),
        from: { id: "page", isPage: true },
        status: "sending"
      }
      setPendingMessages((prev) => [...prev, newMsg])
      setText("")
      // Enable auto-scroll when sending a message
      setShouldAutoScroll(true)
      await sendMessage(psid, { text })
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    },
    onError: () => {
      setPendingMessages((prev) => prev.filter((m) => m.status !== "sending"))
      CToast.error({ title: "Có lỗi xảy ra khi gửi tin nhắn" })
    }
  })

  const onSocketMessage = useCallback(
    (payload: any) => {
      if (payload?.psid !== psid) return

      // Enable auto-scroll for new incoming messages
      setShouldAutoScroll(true)

      // Nếu page gửi → bỏ pending đầu tiên
      if (payload.from.isPage) {
        if (pendingMessages.length > 0) {
          setMessages((prev) => [
            ...prev,
            { ...payload, text: pendingMessages[0].text }
          ])
        }
        setPendingMessages((prev) => prev.slice(1))
      } else {
        setMessages((prev) => [...prev, payload])
      }
    },
    [psid, pendingMessages]
  )

  useMetaSocket(onSocketMessage, conversationId)

  return (
    <Box h={"100%"} p={16}>
      <Box
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
        className="rounded-lg border border-gray-300 shadow-md"
      >
        {/* Header */}
        <Group
          justify="space-between"
          p="md"
          style={{
            borderBottom: "1px solid #eee"
          }}
        >
          <Group>
            <Avatar radius="xl" size="md" src={metaProfileData?.profile_pic} />
            <Box>
              <Text fw={600}>
                {metaProfileData?.last_name +
                  " " +
                  metaProfileData?.first_name || "Khách hàng"}
              </Text>
            </Box>
          </Group>
          <Group>
            <Tooltip label="Cập nhật thông tin khách hàng" position="bottom">
              <ActionIcon
                variant="subtle"
                onClick={() => {
                  if (funnelData) {
                    modals.open({
                      title: <b>Cập nhật thông tin khách hàng</b>,
                      children: (
                        <UpdateFunnelInfoModal
                          funnelId={funnelData._id}
                          currentData={{
                            name: funnelData.name,
                            province: funnelData.province,
                            phoneNumber: funnelData.phoneNumber,
                            channel: funnelData.channel._id,
                            hasBuyed: funnelData.hasBuyed
                          }}
                        />
                      ),
                      size: "xl"
                    })
                  }
                }}
              >
                <IconUserEdit size={20} />
              </ActionIcon>
            </Tooltip>

            <Tooltip position="bottom" label="Lên đơn mới cho khách hàng">
              <ActionIcon
                variant="subtle"
                onClick={() => {
                  modals.open({
                    title: <b>Lên đơn mới cho khách hàng</b>,
                    children: (
                      <CreateSalesOrderModal
                        onSuccess={refetch}
                        salesFunnelId={funnelData?._id}
                      />
                    ),
                    size: "xl"
                  })
                }}
              >
                <IconTablePlus size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {/* Messages */}
        <ScrollArea
          style={{ flex: 1, padding: "16px 20px", background: "#d9e2efff" }}
          mah={"calc(100vh - 174px)"}
          scrollbarSize={6}
          viewportRef={messages.length ? viewportRef : null}
          onScrollPositionChange={({ y }) => {
            if (y <= 10 && hasFetched) loadOlder()
          }}
        >
          {!!nextCursor && (
            <Text
              ta="center"
              c="dimmed"
              py={8}
              style={{ cursor: "pointer", fontSize: 13 }}
            >
              Tải tin nhắn cũ hơn...
            </Text>
          )}
          {allMessages.map((m) => {
            const isPage = m.from?.isPage ?? false
            const isPending = m.status === "sending"
            const isError = m.status === "error"
            return (
              <Box
                key={m.created_time}
                style={{
                  display: "flex",
                  justifyContent: isPage ? "flex-end" : "flex-start",
                  marginBottom: 10,
                  opacity: isPending ? 0.5 : 1 // mờ nếu đang gửi
                }}
              >
                <Box
                  style={{
                    maxWidth: "70%",
                    padding: "10px 14px",
                    borderRadius: 16,
                    background: isPage ? "#5577efff" : "#fff",
                    color: isPage ? "#fff" : "#111",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                  }}
                >
                  <Text size="sm">{m.text || ""}</Text>
                  <Text
                    size="xs"
                    c={isPage ? "gray.3" : "dimmed"}
                    mt={4}
                    style={{
                      opacity: 0.7,
                      textAlign: isPage ? "right" : "left"
                    }}
                  >
                    {isPending
                      ? "Đang gửi..."
                      : isError
                        ? "Lỗi gửi"
                        : new Date(m.created_time).toLocaleTimeString()}
                  </Text>
                </Box>
              </Box>
            )
          })}
          <div ref={bottomRef} />
        </ScrollArea>

        {/* Input */}
        <Box
          p="md"
          style={{
            borderTop: "1px solid #eee",
            background: "#e1eaf0ff"
          }}
        >
          <Group align="flex-end">
            <Textarea
              value={text}
              onChange={(e) => setText(e.currentTarget.value)}
              autosize
              minRows={1}
              maxRows={4}
              placeholder="Nhập tin nhắn..."
              style={{ flex: 1 }}
              radius="md"
              disabled={isSending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <Button
              color="indigo"
              radius="md"
              onClick={() => handleSendMessage()}
              disabled={isSending}
            >
              Gửi
            </Button>
          </Group>
        </Box>
      </Box>
    </Box>
  )
}
