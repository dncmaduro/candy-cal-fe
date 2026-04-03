import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { ScrollArea, Tabs } from "@mantine/core"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { StorageLogs } from "../../../components/accounting-storage/StorageLogs"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { MonthlyExports } from "../../../components/accounting-storage/MonthlyExports"
import { StorageItems } from "../../../components/accounting-storage/StorageItems"
import {
  WAREHOUSE_NAVS,
  WAREHOUSE_NAVS_URL
} from "../../../constants/navs"

type StorageTab = {
  tab: string
}

export const Route = createFileRoute("/kho-van/accounting-storage/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): StorageTab => {
    return {
      tab: String(search.tab ?? "items")
    }
  }
})

function RouteComponent() {
  useAuthGuard(["admin", "accounting-emp", "system-emp"])
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
    },
    {
      label: "Xuất hàng theo tháng",
      value: "monthly-exports"
    }
  ]

  const handleChange = (value: string | null) => {
    navigate({
      to: `${WAREHOUSE_NAVS_URL}/accounting-storage?tab=${value ?? "items"}`
    })
  }

  useEffect(() => {
    if (!tab) {
      navigate({
        to: `${WAREHOUSE_NAVS_URL}/accounting-storage`,
        search: { tab: "items" }
      })
    }
  }, [navigate, tab])

  return (
    <>
      <Helmet>
        <title>{`Kho - ${tab === "storagelogs" ? "Lịch sử xuất/nhập" : tab === "monthly-exports" ? "Xuất hàng theo tháng" : "Mặt hàng"} | MyCandy`}</title>
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

          <ScrollArea.Autosize
            mah={"95%"}
            maw={"100%"}
            className="panels-scroll-area"
          >
            <Tabs.Panel value="items">
              <StorageItems activeTab={tab} />
            </Tabs.Panel>

            <Tabs.Panel value="storagelogs">
              <StorageLogs activeTab={tab} />
            </Tabs.Panel>

            <Tabs.Panel value="monthly-exports">
              <MonthlyExports activeTab={tab} />
            </Tabs.Panel>
          </ScrollArea.Autosize>
        </Tabs>
      </AppLayout>
    </>
  )
}
