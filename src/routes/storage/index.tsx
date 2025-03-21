import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../components/layouts/AppLayout"
import { Tabs } from "@mantine/core"
import { Items } from "../../components/storage/Items"
import { Products } from "../../components/storage/Products"

export const Route = createFileRoute("/storage/")({
  component: RouteComponent
})

function RouteComponent() {
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

  return (
    <AppLayout>
      <Tabs orientation="horizontal" defaultValue={"items"} mt={16}>
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
  )
}
