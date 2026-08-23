import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { SALES_ACCESS_PERMISSIONS, getVisibleSalesNavs } from "../../constants/navs"
import { useAuthGuard } from "../../hooks/useAuthGuard"

export const Route = createFileRoute("/sales/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate({ from: "/sales/" })
  const { meData } = useAuthGuard(SALES_ACCESS_PERMISSIONS)

  useEffect(() => {
    if (!meData) return

    const firstAccessibleNav = getVisibleSalesNavs(meData.permissions)[0]

    navigate({
      to: firstAccessibleNav ? `${firstAccessibleNav.to}` : "/access-denied",
      replace: true
    })
  }, [meData, navigate])

  return null
}
