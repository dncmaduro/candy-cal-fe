import { createFileRoute } from "@tanstack/react-router"
import { Helmet } from "react-helmet-async"

import { KHO_VAN_ROLES, NAVS } from "../../../constants/navs"
import { StorageXlsxCalculatorsPage } from "../../../components/storage/StorageXlsxCalculatorsPage"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { useAuthGuard } from "../../../hooks/useAuthGuard"

export const Route = createFileRoute("/mkt-storage/xlsx-calculators/")({
  component: RouteComponent
})

function RouteComponent() {
  useAuthGuard(KHO_VAN_ROLES)

  return (
    <>
      <Helmet>
        <title>Tính file XLSX | MyCandy</title>
      </Helmet>
      <AppLayout navs={NAVS}>
        <StorageXlsxCalculatorsPage />
      </AppLayout>
    </>
  )
}
