import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { ScrollArea, Tabs } from "@mantine/core"
import { Helmet } from "react-helmet-async"
import { KHO_VAN_ROLES, NAVS, NAVS_URL } from "../../../constants/navs"
import { SessionLogs } from "../../../components/logs/SessionLogs"
import { useEffect } from "react"
import { DailyLogs } from "../../../components/logs/DailyLogs"

export type OldLogsTab = {
  tab: string
}

export const validateOldLogsSearch = (
  search: Record<string, unknown>
): OldLogsTab => {
  return {
    tab: String(search.tab ?? "session-logs")
  }
}

export const Route = createFileRoute("/marketing-storage/old-logs/")({
  component: RouteComponent,
  validateSearch: validateOldLogsSearch
})

type OldLogsPageProps = {
  tab: string
  baseUrl?: string
  navs?: typeof NAVS
  allowedRoles?: string[]
}

export function OldLogsPage({
  tab,
  baseUrl = NAVS_URL,
  navs = NAVS,
  allowedRoles = KHO_VAN_ROLES
}: OldLogsPageProps) {
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
    navigate({ to: `${baseUrl}/old-logs?tab=${value ?? "session-logs"}` })
  }

  useEffect(() => {
    if (!tab) {
      navigate({ to: `${baseUrl}/old-logs`, search: { tab: "session-logs" } })
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>Lịch sử kho (bản cũ) | MyCandy</title>
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
              <SessionLogs />
            </Tabs.Panel>

            <Tabs.Panel value="daily-logs">
              <DailyLogs />
            </Tabs.Panel>
          </ScrollArea.Autosize>
        </Tabs>
      </AppLayout>
    </>
  )
}

function RouteComponent() {
  const { tab } = Route.useSearch()

  return <OldLogsPage tab={tab} />
}
