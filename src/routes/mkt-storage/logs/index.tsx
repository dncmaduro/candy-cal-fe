import { createFileRoute } from "@tanstack/react-router"
import {
  StorageLogsPage,
  validateLogsSearch
} from "../../marketing-storage/logs"

export const Route = createFileRoute("/mkt-storage/logs/")({
  component: RouteComponent,
  validateSearch: validateLogsSearch
})

function RouteComponent() {
  const { tab } = Route.useSearch()

  return <StorageLogsPage tab={tab} />
}
