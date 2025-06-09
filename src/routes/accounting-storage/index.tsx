import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { AppLayout } from "../../components/layouts/AppLayout"
import { ScrollArea, Tabs } from "@mantine/core"
import { Items } from "../../components/accounting-storage/Items"
import { StorageLogs } from "../../components/accounting-storage/StorageLogs"
import { useAuthGuard } from "../../hooks/useAuthGuard"

type StorageTab = {
  tab: string
}

export const Route = createFileRoute("/accounting-storage/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): StorageTab => {
    return {
      tab: String(search.tag ?? "items")
    }
  }
})

function RouteComponent() {
  useAuthGuard(["admin", "accounting-emp"])
  const { tab } = Route.useSearch()
  const navigate = useNavigate()

  const tabOptions = [
    {
      label: "Mặt hàng",
      value: "items"
    },
    {
      label: "Lịch sử xuất/nhập kho",
      value: "storagelogs"
    }
  ]

  const handleChange = (value: string | null) => {
    navigate({ to: `/accounting-storage?tab=${value ?? "items"}` })
  }

  useEffect(() => {
    if (!tab) {
      navigate({ to: `/accounting-storage`, search: { tab: "items" } })
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>MyCandy x Chíp</title>
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

          <ScrollArea.Autosize mah={"95%"}>
            <Tabs.Panel value="items">
              <Items />
            </Tabs.Panel>

            <Tabs.Panel value="storagelogs">
              {/* Placeholder for future storage logs component */}
              <StorageLogs />
            </Tabs.Panel>
          </ScrollArea.Autosize>
        </Tabs>
      </AppLayout>
    </>
  )
}
