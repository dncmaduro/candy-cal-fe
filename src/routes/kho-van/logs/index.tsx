import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ScrollArea, Tabs } from "@mantine/core"
import { Helmet } from "react-helmet-async"
import { useEffect } from "react"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { WAREHOUSE_NAVS, WAREHOUSE_NAVS_URL } from "../../../constants/navs"
import { SessionLogsV2 } from "../../../components/logs/SessionLogsV2"
import { DailyLogsV2 } from "../../../components/logs/DailyLogsV2"

type LogsTab = {
  tab: string
}

export const Route = createFileRoute("/kho-van/logs/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): LogsTab => {
    return {
      tab: String(search.tab ?? "session-logs")
    }
  }
})

function RouteComponent() {
  useAuthGuard(["admin", "accounting-emp", "system-emp"])

  const { tab } = Route.useSearch()
  const navigate = useNavigate()

  const tabOptions = [
    {
      label: "Log theo ca",
      value: "session-logs"
    },
    {
      label: "Log hàng ngày",
      value: "daily-logs"
    }
  ]

  const handleChange = (value: string | null) => {
    navigate({ to: `${WAREHOUSE_NAVS_URL}/logs?tab=${value ?? "session-logs"}` })
  }

  useEffect(() => {
    if (!tab) {
      navigate({
        to: `${WAREHOUSE_NAVS_URL}/logs`,
        search: { tab: "session-logs" }
      })
    }
  }, [navigate, tab])

  return (
    <>
      <Helmet>
        <title>Lịch sử kho | MyCandy</title>
      </Helmet>
      <AppLayout navs={WAREHOUSE_NAVS}>
        <Tabs
          orientation="horizontal"
          defaultValue={tab}
          mt={16}
          onChange={handleChange}
          h={"90vh"}
        >
          <Tabs.List>
            {tabOptions.map((item) => (
              <Tabs.Tab value={item.value} key={item.value}>
                {item.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <ScrollArea.Autosize mah={"95%"}>
            <Tabs.Panel value="session-logs">
              <SessionLogsV2 oldLogsPath={`${WAREHOUSE_NAVS_URL}/old-logs`} />
            </Tabs.Panel>

            <Tabs.Panel value="daily-logs">
              <DailyLogsV2 oldLogsPath={`${WAREHOUSE_NAVS_URL}/old-logs`} />
            </Tabs.Panel>
          </ScrollArea.Autosize>
        </Tabs>
      </AppLayout>
    </>
  )
}
