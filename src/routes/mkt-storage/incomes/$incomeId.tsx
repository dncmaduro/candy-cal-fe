import { createFileRoute } from "@tanstack/react-router"
import { StorageIncomeDetailPage } from "../../marketing-storage/incomes/$incomeId"

export const Route = createFileRoute("/mkt-storage/incomes/$incomeId")({
  component: RouteComponent
})

function RouteComponent() {
  const { incomeId } = Route.useParams()

  return <StorageIncomeDetailPage incomeId={incomeId} />
}
