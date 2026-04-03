import { createFileRoute } from "@tanstack/react-router"
import { Helmet } from "react-helmet-async"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { ProductsV2 } from "../../../components/storage/ProductsV2"
import { useAuthGuard } from "../../../hooks/useAuthGuard"
import { TIKTOKSHOP_NAVS, TIKTOKSHOP_ROLES } from "../../../constants/navs"

export const Route = createFileRoute("/tiktokshop/sku/")({
  component: RouteComponent
})

function RouteComponent() {
  useAuthGuard(TIKTOKSHOP_ROLES)

  return (
    <>
      <Helmet>
        <title>SKU (TikTok Shop) | MyCandy</title>
      </Helmet>
      <AppLayout navs={TIKTOKSHOP_NAVS}>
        <ProductsV2 />
      </AppLayout>
    </>
  )
}
