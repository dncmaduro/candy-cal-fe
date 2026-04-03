import { createFileRoute } from "@tanstack/react-router"
import {
  StorageIncomesPage,
  validateIncomesSearch
} from "../../marketing-storage/incomes"

export const Route = createFileRoute("/mkt-storage/incomes/")({
  component: RouteComponent,
  validateSearch: validateIncomesSearch
})

function RouteComponent() {
  const search = Route.useSearch()

  return <StorageIncomesPage search={search} />
}
