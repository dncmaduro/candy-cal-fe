import { useEffect } from "react"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { canAccessSalesRoute } from "../constants/navs"

export const useSalesRouteAccess = (roles: string[] | undefined) => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (
      roles?.includes("sales-cs") &&
      !roles.includes("admin") &&
      !roles.includes("sales-leader") &&
      location.pathname.startsWith("/sales/leads")
    ) {
      navigate({ to: "/sales/funnel", replace: true })
      return
    }

    if (!roles || canAccessSalesRoute(roles, location.pathname)) return

    navigate({ to: "/access-denied", replace: true })
  }, [location.pathname, navigate, roles])
}
