import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { MessagesLayout } from "../../../components/layouts/MessagesLayout"
import { ConversationsList } from "../../../components/messages/ConversationsList"
import { MessagesThread } from "../../../components/messages/MessagesThread"
import { useMetaServices } from "../../../hooks/useMetaServices"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"

export const Route = createFileRoute("/sales/messages/$conversationId")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  const { conversationId } = Route.useParams() // ✅ Cách chuẩn của TanStack
  const { getPsidByConversationId } = useMetaServices()

  const { data: psidData } = useQuery({
    queryKey: ["getPsidByConversationId", conversationId],
    queryFn: () => getPsidByConversationId(conversationId),
    select: (data) => data.data.psid,
    enabled: !!conversationId
  })

  useEffect(() => {
    if (!conversationId) navigate({ to: "/sales/messages" })
  }, [conversationId, navigate])

  return (
    <MessagesLayout
      sidebar={
        <ConversationsList
          onSelect={(id) => navigate({ to: `/sales/messages/${id}` })}
        />
      }
      content={
        <MessagesThread
          key={conversationId}
          conversationId={conversationId}
          psid={psidData ?? ""}
        />
      }
    />
  )
}
