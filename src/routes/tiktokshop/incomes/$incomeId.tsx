import { createFileRoute } from "@tanstack/react-router"
import { IncomeDetailPage } from "../../../components/incomes/IncomeDetailPage"
import { TIKTOKSHOP_NAVS } from "../../../constants/navs"

export const Route = createFileRoute("/tiktokshop/incomes/$incomeId")({
  component: RouteComponent
})

function RouteComponent() {
  const { incomeId } = Route.useParams()

  return (
    <IncomeDetailPage
      roles={["admin", "order-emp", "system-emp"]}
      navs={TIKTOKSHOP_NAVS}
      incomeId={incomeId}
      backPath="/tiktokshop/incomes"
    />
  )
}
