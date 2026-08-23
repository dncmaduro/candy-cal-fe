import { useEffect } from "react"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { canAccessSalesRoute } from "../constants/navs"

export const useSalesRouteAccess = (permissions: string[] | undefined) => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!permissions || canAccessSalesRoute(permissions, location.pathname)) return

    navigate({ to: "/access-denied", replace: true })
  }, [location.pathname, navigate, permissions])
}
