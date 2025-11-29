import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { Tabs } from "@mantine/core"
import { Helmet } from "react-helmet-async"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { useEffect } from "react"
import { SALES_NAVS_URL } from "../../../constants/navs"
import { SalesDailyReports } from "../../../components/sales/dashboard/SalesDailyReports"
import { SalesKPI } from "../../../components/sales/dashboard/SalesKPI"

type Subtab = {
  tab: string
}

export const Route = createFileRoute("/sales/daily-reports/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): Subtab => {
    return {
      tab: String(search.tab ?? "reports")
    }
  }
})

function RouteComponent() {
  useAuthGuard(["admin", "sales-leader", "sales-emp", "system-emp"])
  const { tab } = Route.useSearch()
  const navigate = useNavigate()

  const tabOptions = [
    {
      label: "Báo cáo hàng ngày",
      value: "reports"
    },
    {
      label: "KPI tháng",
      value: "kpi"
    }
  ]

  const handleChange = (value: string | null) => {
    navigate({
      to: `${SALES_NAVS_URL}/daily-reports?tab=${value ?? "reports"}`
    })
  }

  useEffect(() => {
    if (!tab) {
      navigate({
        to: `${SALES_NAVS_URL}/daily-reports`,
        search: { tab: "reports" }
      })
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>Báo cáo hàng ngày | MyCandy</title>
      </Helmet>
      <SalesLayout>
        <Tabs
          orientation="horizontal"
          defaultValue={tab}
          mt={16}
          h={"90vh"}
          onChange={(value) => handleChange(value)}
        >
          <Tabs.List>
            {tabOptions.map((tab) => (
              <Tabs.Tab value={tab.value} key={tab.value}>
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <Tabs.Panel value="reports">
            <SalesDailyReports />
          </Tabs.Panel>

          <Tabs.Panel value="kpi">
            <SalesKPI />
          </Tabs.Panel>
        </Tabs>
      </SalesLayout>
    </>
  )
}
