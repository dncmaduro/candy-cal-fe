import { createFileRoute } from "@tanstack/react-router"
import {
  OldLogsPage,
  validateOldLogsSearch
} from "../../marketing-storage/old-logs"

export const Route = createFileRoute("/mkt-storage/old-logs/")({
  component: RouteComponent,
  validateSearch: validateOldLogsSearch
})

function RouteComponent() {
  const { tab } = Route.useSearch()

  return <OldLogsPage tab={tab} />
}
