import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router"
import { useUsers } from "../../hooks/useUsers"
import { useQuery } from "@tanstack/react-query"
import { useUserStore } from "../../store/userStore"
import { useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { AppLayout } from "../../components/layouts/AppLayout"
import {
  ADMIN_NAVS,
  LIVESTREAM_NAVS,
  NAVS,
  SALES_NAVS,
  SHOPEE_NAVS,
  TIKTOKSHOP_NAVS,
  getFirstAccessibleNavigationPath
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

  const permissions = meData?.permissions ?? []
  const destination = [
    NAVS,
    TIKTOKSHOP_NAVS,
    SHOPEE_NAVS,
    SALES_NAVS,
    LIVESTREAM_NAVS,
    ADMIN_NAVS
  ]
    .map((navs) => getFirstAccessibleNavigationPath(navs, permissions))
    .find(Boolean)

  if (destination) return <Navigate to={destination} />

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
