import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { ScrollArea, Tabs } from "@mantine/core"
import { Helmet } from "react-helmet-async"
import { KHO_VAN_ROLES, NAVS, NAVS_URL } from "../../../constants/navs"
import { SessionLogsV2 } from "../../../components/logs/SessionLogsV2"
import { useEffect } from "react"
import { DailyLogsV2 } from "../../../components/logs/DailyLogsV2"

export type LogsTab = {
  tab: string
}

export const validateLogsSearch = (
  search: Record<string, unknown>
): LogsTab => {
  return {
    tab: String(search.tab ?? "session-logs")
  }
}

export const Route = createFileRoute("/marketing-storage/logs/")({
  component: RouteComponent,
  validateSearch: validateLogsSearch
})

type StorageLogsPageProps = {
  tab: string
  baseUrl?: string
  navs?: typeof NAVS
  allowedRoles?: string[]
}

export function StorageLogsPage({
  tab,
  baseUrl = NAVS_URL,
  navs = NAVS,
  allowedRoles = KHO_VAN_ROLES
}: StorageLogsPageProps) {
  useAuthGuard(allowedRoles)
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
    navigate({ to: `${baseUrl}/logs?tab=${value ?? "session-logs"}` })
  }

  useEffect(() => {
    if (!tab) {
      navigate({ to: `${baseUrl}/logs`, search: { tab: "session-logs" } })
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>Lịch sử kho | MyCandy</title>
      </Helmet>
      <AppLayout navs={navs}>
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

          <ScrollArea.Autosize mah={"95%"}>
            <Tabs.Panel value="session-logs">
              <SessionLogsV2 />
            </Tabs.Panel>

            <Tabs.Panel value="daily-logs">
              <DailyLogsV2 />
            </Tabs.Panel>
          </ScrollArea.Autosize>
        </Tabs>
      </AppLayout>
    </>
  )
}

function RouteComponent() {
  const { tab } = Route.useSearch()

  return <StorageLogsPage tab={tab} />
}
