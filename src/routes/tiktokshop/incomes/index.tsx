import { createFileRoute } from "@tanstack/react-router"
import { IncomeModulePage } from "../../../components/incomes/IncomeModulePage"
import {
  TIKTOKSHOP_NAVS,
  TIKTOKSHOP_NAVS_URL
} from "../../../constants/navs"

type Subtab = {
  tab: string
  channel?: string
}

export const Route = createFileRoute("/tiktokshop/incomes/")({
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
      roles={["admin", "order-emp", "system-emp"]}
      navs={TIKTOKSHOP_NAVS}
      basePath={`${TIKTOKSHOP_NAVS_URL}/incomes`}
      tab={tab}
      channel={channel}
      incomeDetailRoute="/tiktokshop/incomes/$incomeId"
      scope="tiktokshop"
    />
  )
}
