import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { ScrollArea, Tabs } from "@mantine/core"
import { StorageLogs } from "../../../components/accounting-storage/StorageLogs"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { MonthlyExports } from "../../../components/accounting-storage/MonthlyExports"
import { StorageItems } from "../../../components/accounting-storage/StorageItems"
import { KHO_VAN_ROLES, NAVS, NAVS_URL } from "../../../constants/navs"

export type StorageTab = {
  tab: string
}

export const validateAccountingStorageSearch = (
  search: Record<string, unknown>
): StorageTab => {
  return {
    tab: String(search.tab ?? "items")
  }
}

export const Route = createFileRoute("/marketing-storage/accounting-storage/")({
  component: RouteComponent,
  validateSearch: validateAccountingStorageSearch
})

type AccountingStoragePageProps = {
  tab: string
  baseUrl?: string
  navs?: typeof NAVS
  allowedRoles?: string[]
}

export function AccountingStoragePage({
  tab,
  baseUrl = NAVS_URL,
  navs = NAVS,
  allowedRoles = KHO_VAN_ROLES
}: AccountingStoragePageProps) {
  useAuthGuard(allowedRoles)
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
      to: `${baseUrl}/accounting-storage?tab=${value ?? "items"}`
    })
  }

  useEffect(() => {
    if (!tab) {
      navigate({
        to: `${baseUrl}/accounting-storage`,
        search: { tab: "items" }
      })
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>{`Kho - ${tab === "storagelogs" ? "Lịch sử xuất/nhập" : tab === "monthly-exports" ? "Xuất hàng theo tháng" : "Mặt hàng"} | MyCandy`}</title>
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

function RouteComponent() {
  const { tab } = Route.useSearch()

  return <AccountingStoragePage tab={tab} />
}
