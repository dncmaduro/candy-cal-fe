import { createFileRoute } from "@tanstack/react-router"
import { IncomeModulePage } from "../../../components/incomes/IncomeModulePage"
import { SHOPEE_NAVS, SHOPEE_NAVS_URL } from "../../../constants/navs"

type Subtab = {
  tab: string
  channel?: string
}

export const Route = createFileRoute("/shopee/incomes/")({
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
      roles={["admin", "shopee-emp", "system-emp"]}
      navs={SHOPEE_NAVS}
      basePath={`${SHOPEE_NAVS_URL}/incomes`}
      tab={tab}
      channel={channel}
      scope="shopee"
    />
  )
}
