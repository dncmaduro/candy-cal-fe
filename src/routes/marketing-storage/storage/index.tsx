import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { ScrollArea, Tabs } from "@mantine/core"
import { useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { ReadyCombos } from "../../../components/storage/ReadyCombos"
import { NAVS_URL } from "../../../constants/navs"
import { ShopeeProducts } from "../../../components/storage/ShopeeProducts"
import { ProductsV2 } from "../../../components/storage/ProductsV2"

type StorageTab = {
  tab: string
}

export const Route = createFileRoute("/marketing-storage/storage/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): StorageTab => {
    return {
      tab: String(search.tab ?? "tiktok-products")
    }
  }
})

function RouteComponent() {
  useAuthGuard(["admin", "order-emp", "system-emp"])
  const { tab } = Route.useSearch()
  const navigate = useNavigate()

  const tabOptions = [
    {
      label: "SKU (Tiktok Shop)",
      value: "tiktok-products"
    },
    {
      label: "SKU (Shopee)",
      value: "shopee-products"
    }
    // {
    //   label: "Các combo đóng sẵn",
    //   value: "ready-combos"
    // }
  ]

  const handleChange = (value: string | null) => {
    navigate({ to: `${NAVS_URL}/storage?tab=${value ?? "tiktok-products"}` })
  }

  useEffect(() => {
    if (!tab) {
      navigate({
        to: `${NAVS_URL}/storage`,
        search: { tab: "tiktok-products" }
      })
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>{`Kho & SKU - ${tab === "tiktok-products" ? "SKU (Tiktok Shop)" : tab === "ready-combos" ? "Combo đóng sẵn" : "SKU (Shopee)"} | MyCandy`}</title>
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
            <Tabs.Panel value="tiktok-products">
              <ProductsV2 />
            </Tabs.Panel>

            <Tabs.Panel value="shopee-products">
              <ShopeeProducts />
            </Tabs.Panel>

            <Tabs.Panel value="ready-combos">
              <ReadyCombos />
            </Tabs.Panel>
          </ScrollArea.Autosize>
        </Tabs>
      </AppLayout>
    </>
  )
}
