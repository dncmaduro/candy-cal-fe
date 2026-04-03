import { createFileRoute, Navigate } from "@tanstack/react-router"

type LogsTab = {
  tab: string
}

export const Route = createFileRoute("/marketing-storage/logs/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): LogsTab => {
    return {
      tab: String(search.tab ?? "session-logs")
    }
  }
})

function RouteComponent() {
  const { tab } = Route.useSearch()
  return <Navigate to="/kho-van/logs" search={{ tab }} />
}
