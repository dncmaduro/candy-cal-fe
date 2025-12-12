import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { AdminLayout } from "../../../components/layouts/AdminLayout"
import { ScrollArea, Tabs } from "@mantine/core"
import { Tasks } from "../../../components/tasks/Tasks"
import { UsersTasks } from "../../../components/tasks/UsersTasks"

type StorageTab = {
  tab: string
}

export const Route = createFileRoute("/admin/tasks/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): StorageTab => {
    return {
      tab: String(search.tab ?? "tasks")
    }
  }
})

function RouteComponent() {
  useAuthGuard(["admin"])
  const { tab } = Route.useSearch()
  const navigate = useNavigate()

  const tabOptions = [
    {
      label: "Các task",
      value: "tasks"
    },
    {
      label: "Theo người dùng",
      value: "users"
    }
  ]

  const handleChange = (value: string | null) => {
    navigate({ to: `/admin/tasks?tab=${value ?? "tasks"}` })
  }

  useEffect(() => {
    if (!tab) {
      navigate({ to: `/admin/tasks`, search: { tab: "tasks" } })
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>Công việc hàng ngày | MyCandy</title>
      </Helmet>
      <AdminLayout>
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
            <Tabs.Panel value="tasks" pt="xs">
              <Tasks />
            </Tabs.Panel>
            <Tabs.Panel value="users" pt="xs">
              <UsersTasks />
            </Tabs.Panel>
          </ScrollArea.Autosize>
        </Tabs>
      </AdminLayout>
    </>
  )
}
