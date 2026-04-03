import { createFileRoute } from "@tanstack/react-router"
import {
  AccountingStoragePage,
  validateAccountingStorageSearch
} from "../../marketing-storage/accounting-storage"

export const Route = createFileRoute("/mkt-storage/accounting-storage/")({
  component: RouteComponent,
  validateSearch: validateAccountingStorageSearch
})

function RouteComponent() {
  const { tab } = Route.useSearch()

  return <AccountingStoragePage tab={tab} />
}
