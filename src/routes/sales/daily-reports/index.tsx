import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { SalesLayout } from "../../../components/layouts/SalesLayout"
import { Tabs } from "@mantine/core"
import { Helmet } from "react-helmet-async"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { SALES_NAVS_URL } from "../../../constants/navs"
import { SalesDailyReports } from "../../../components/sales/dashboard/SalesDailyReports"
import { SalesKPI } from "../../../components/sales/dashboard/SalesKPI"

type SearchParams = {
  tab: "reports" | "kpi"
  reportsMonth: string
  reportsYear: string
  reportsChannelId?: string
  reportsPage: number
  reportsLimit: number
  kpiMonth?: string
  kpiYear?: string
  kpiChannelId?: string
  kpiPage: number
  kpiLimit: number
}

export const Route = createFileRoute("/sales/daily-reports/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const currentDate = new Date()
    const defaultMonth = String(currentDate.getMonth() + 1)
    const defaultYear = String(currentDate.getFullYear())
    const parsePositiveInt = (value: unknown, fallback: number) => {
      const parsed = Number(value)
      return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
    }
    const parseString = (value: unknown) => {
      if (typeof value !== "string") return undefined
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : undefined
    }

    return {
      tab: search.tab === "kpi" ? "kpi" : "reports",
      reportsMonth: parseString(search.reportsMonth) ?? defaultMonth,
      reportsYear: parseString(search.reportsYear) ?? defaultYear,
      reportsChannelId: parseString(search.reportsChannelId),
      reportsPage: parsePositiveInt(search.reportsPage, 1),
      reportsLimit: parsePositiveInt(search.reportsLimit, 10),
      kpiMonth: parseString(search.kpiMonth),
      kpiYear: parseString(search.kpiYear),
      kpiChannelId: parseString(search.kpiChannelId),
      kpiPage: parsePositiveInt(search.kpiPage, 1),
      kpiLimit: parsePositiveInt(search.kpiLimit, 10)
    }
  }
})

function RouteComponent() {
  useAuthGuard(["admin", "sales-leader", "sales-emp", "system-emp"])
  const search = Route.useSearch()
  const { tab } = search
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
      to: `${SALES_NAVS_URL}/daily-reports`,
      search: {
        ...search,
        tab: value === "kpi" ? "kpi" : "reports"
      }
    })
  }

  return (
    <>
      <Helmet>
        <title>Báo cáo hàng ngày | MyCandy</title>
      </Helmet>
      <SalesLayout>
        <Tabs
          orientation="horizontal"
          value={tab}
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
