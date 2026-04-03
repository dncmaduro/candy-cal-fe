import { createFileRoute } from "@tanstack/react-router"
import { Helmet } from "react-helmet-async"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { ShopeeProducts } from "../../../components/storage/ShopeeProducts"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { SHOPEE_NAVS } from "../../../constants/navs"

export const Route = createFileRoute("/shopee/sku/")({
  component: RouteComponent
})

function RouteComponent() {
  useAuthGuard(["admin", "shopee-emp", "system-emp"])

  return (
    <>
      <Helmet>
        <title>SKU Shopee | MyCandy</title>
      </Helmet>
      <AppLayout navs={SHOPEE_NAVS}>
        <ShopeeProducts />
      </AppLayout>
    </>
  )
}
