import { createFileRoute } from "@tanstack/react-router"
import { IncomeDetailPage } from "../../../components/incomes/IncomeDetailPage"
import { WAREHOUSE_NAVS } from "../../../constants/navs"

export const Route = createFileRoute("/kho-van/incomes/$incomeId")({
  component: RouteComponent
})

function RouteComponent() {
  const { incomeId } = Route.useParams()

  return (
    <IncomeDetailPage
      roles={["admin", "accounting-emp", "system-emp"]}
      navs={WAREHOUSE_NAVS}
      incomeId={incomeId}
      backPath="/kho-van/incomes"
    />
  )
}
