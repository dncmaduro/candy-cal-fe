import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { useEffect } from "react"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { Tabs, ScrollArea } from "@mantine/core"
import { NAVS_URL } from "../../../constants/navs"
import { Incomes } from "../../../components/incomes/Incomes"
import { Helmet } from "react-helmet-async"
import { MonthGoals } from "../../../components/incomes/MonthGoals"
import { PackingRules } from "../../../components/incomes/PackingRules"

type Subtab = {
  tab: string
}

export const Route = createFileRoute("/marketing-storage/incomes/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): Subtab => {
    return {
      tab: String(search.tab ?? "incomes")
    }
  }
})

function RouteComponent() {
  useAuthGuard(["admin", "accounting-emp", "order-emp"])
  const { tab } = Route.useSearch()
  const navigate = useNavigate()

  const tabOptions = [
    {
      label: "Báo cáo doanh số",
      value: "incomes"
    },
    {
      label: "KPI",
      value: "kpi"
    },
    {
      label: "Quy cách đóng hộp",
      value: "packing-rules"
    }
  ]

  const handleChange = (value: string | null) => {
    navigate({ to: `${NAVS_URL}/incomes?tab=${value ?? "incomes"}` })
  }

  useEffect(() => {
    if (!tab) {
      navigate({ to: `${NAVS_URL}/incomes`, search: { tab: "incomes" } })
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>Doanh thu - MyCandy</title>
      </Helmet>
      <AppLayout>
        <Tabs
          orientation="horizontal"
          defaultValue={tab}
          mt={16}
          onChange={(value) => handleChange(value)}
          h={"90vh"}
        >
          <Tabs.List>
            {tabOptions.map((tab) => (
              <Tabs.Tab value={tab.value} key={tab.value}>
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <ScrollArea.Autosize mah={"95%"} className="panels-scroll-area">
            <Tabs.Panel value="incomes">
              <Incomes />
            </Tabs.Panel>

            <Tabs.Panel value="kpi">
              <MonthGoals />
            </Tabs.Panel>

            <Tabs.Panel value="packing-rules">
              <PackingRules />
            </Tabs.Panel>
          </ScrollArea.Autosize>
        </Tabs>
      </AppLayout>
    </>
  )
}
