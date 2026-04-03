import { createFileRoute } from "@tanstack/react-router"
import { IncomeModulePage } from "../../../components/incomes/IncomeModulePage"
import { WAREHOUSE_NAVS, WAREHOUSE_NAVS_URL } from "../../../constants/navs"

type Subtab = {
  tab: string
  channel?: string
}

export const Route = createFileRoute("/kho-van/incomes/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): Subtab => {
    return {
      tab: String(search.tab ?? "dashboard"),
      channel: search.channel ? String(search.channel) : undefined
    }
  }
})

function RouteComponent() {
  const { tab, channel } = Route.useSearch()

  return (
    <IncomeModulePage
      roles={["admin", "accounting-emp", "system-emp"]}
      navs={WAREHOUSE_NAVS}
      basePath={`${WAREHOUSE_NAVS_URL}/incomes`}
      tab={tab}
      channel={channel}
      incomeDetailRoute="/kho-van/incomes/$incomeId"
      scope="all"
    />
  )
}
