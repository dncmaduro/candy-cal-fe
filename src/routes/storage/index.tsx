import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AppLayout } from "../../components/layouts/AppLayout"
import { Tabs } from "@mantine/core"
import { Items } from "../../components/storage/Items"
import { Products } from "../../components/storage/Products"
import { useEffect } from "react"
import { Helmet } from "react-helmet-async"

type StorageTab = {
  tab: string
}

export const Route = createFileRoute("/storage/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): StorageTab => {
    return {
      tab: String(search.tag ?? "items")
    }
  }
})

function RouteComponent() {
  const { tab } = Route.useSearch()
  const navigate = useNavigate()

  const tabOptions = [
    {
      label: "Mặt hàng",
      value: "items"
    },
    {
      label: "Sản phẩm",
      value: "products"
    }
  ]

  const handleChange = (value: string | null) => {
    navigate({ to: `/storage?tab=${value ?? "items"}` })
  }

  useEffect(() => {
    if (!tab) {
      navigate({ to: `/storage`, search: { tab: "items" } })
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
        >
          <Tabs.List>
            {tabOptions.map((tab) => (
              <Tabs.Tab value={tab.value} key={tab.value}>
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <Tabs.Panel value="items">
            <Items />
          </Tabs.Panel>

          <Tabs.Panel value="products">
            <Products />
          </Tabs.Panel>
        </Tabs>
      </AppLayout>
    </>
  )
}
