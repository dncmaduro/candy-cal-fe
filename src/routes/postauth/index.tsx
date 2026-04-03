import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router"
import { useUsers } from "../../hooks/useUsers"
import { useQuery } from "@tanstack/react-query"
import { useUserStore } from "../../store/userStore"
import { useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { AppLayout } from "../../components/layouts/AppLayout"
import {
  NAVS_URL,
  TIKTOKSHOP_EMPLOYEE_ROLES,
  TIKTOKSHOP_NAVS_URL,
  SHOPEE_NAVS_URL
} from "../../constants/navs"

export const Route = createFileRoute("/postauth/")({
  component: RouteComponent
})

function RouteComponent() {
  const { getMe } = useUsers()
  const { accessToken, clearUser } = useUserStore()
  const navigate = useNavigate()

  const {
    data: meData,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["getMe"],
    queryFn: getMe,
    enabled: !!accessToken,
    select: (data) => data.data,
    retry: false
  })

  useEffect(() => {
    if (!accessToken || isError) {
      clearUser()
      navigate({ to: "/" })
    }
  }, [accessToken, isError, clearUser, navigate])

  if (!accessToken || isLoading || isError) return null

  const roles = meData?.roles ?? []

  if (
    roles.includes("admin") ||
    roles.includes("system-emp")
  ) {
    return <Navigate to={`${NAVS_URL}/logs`} />
  }
  if (roles.includes("accounting-emp")) {
    return <Navigate to={`${NAVS_URL}/accounting-storage`} />
  }
  if (roles.some((role) => TIKTOKSHOP_EMPLOYEE_ROLES.includes(role))) {
    return <Navigate to={`${TIKTOKSHOP_NAVS_URL}/sku`} />
  }
  if (roles.includes("shopee-emp")) {
    return <Navigate to={`${SHOPEE_NAVS_URL}/sku`} />
  }
  if (roles.includes("sales-emp") || roles.includes("sales-leader")) {
    return <Navigate to="/sales/funnel" />
  }
  if (roles.includes("sales-accounting")) {
    return <Navigate to="/sales/dashboard" />
  }
  if (
    roles.includes("livestream-emp") ||
    roles.includes("livestream-leader") ||
    roles.includes("livestream-ast") ||
    roles.includes("livestream-accounting")
  ) {
    return <Navigate to="/livestream/calendar" />
  }

  return (
    <>
      <Helmet>
        <title>Bảng điều khiển | MyCandy</title>
      </Helmet>
      <AppLayout>
        <div />
      </AppLayout>
    </>
  )
}
