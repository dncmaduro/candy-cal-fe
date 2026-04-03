import { createFileRoute } from "@tanstack/react-router"
import {
  TIKTOKSHOP_NAVS,
  TIKTOKSHOP_NAVS_URL,
  TIKTOKSHOP_ROLES
} from "../../../constants/navs"
import { StorageIncomeDetailPage } from "../../marketing-storage/incomes/$incomeId"

export const Route = createFileRoute("/tiktokshop/incomes/$incomeId")({
  component: RouteComponent
})

function RouteComponent() {
  const { incomeId } = Route.useParams()

  return (
    <StorageIncomeDetailPage
      incomeId={incomeId}
      baseUrl={TIKTOKSHOP_NAVS_URL}
      navs={TIKTOKSHOP_NAVS}
      allowedRoles={TIKTOKSHOP_ROLES}
    />
  )
}
