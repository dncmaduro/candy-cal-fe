import { createFileRoute, Navigate } from "@tanstack/react-router"

type StorageTab = {
  tab: string
}

export const Route = createFileRoute("/marketing-storage/accounting-storage/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): StorageTab => {
    return {
      tab: String(search.tab ?? "items")
    }
  }
})

function RouteComponent() {
  const { tab } = Route.useSearch()
  return <Navigate to="/kho-van/accounting-storage" search={{ tab }} />
}
