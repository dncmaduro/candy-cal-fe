import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router"
import { useUsers } from "../../hooks/useUsers"
import { useQuery } from "@tanstack/react-query"
import { useUserStore } from "../../store/userStore"
import { useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { AppLayout } from "../../components/layouts/AppLayout"

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

  if (
    meData?.roles[0] === "admin" ||
    meData?.roles[0] === "order-emp" ||
    meData?.roles[0] === "system-emp"
  ) {
    return <Navigate to="/marketing-storage/storage" />
  }
  if (meData?.roles[0] === "sales-emp" || meData?.roles[0] === "sales-leader") {
    return <Navigate to="/sales/funnel" />
  }
  if (meData?.roles[0] === "sales-accounting") {
    return <Navigate to="/sales/dashboard" />
  }
  if (meData?.roles[0] === "accounting-emp") {
    return <Navigate to="/marketing-storage/accounting-storage" />
  }
  if (
    meData?.roles[0] === "livestream-emp" ||
    meData?.roles[0] === "livestream-leader" ||
    meData?.roles[0] === "livestream-ast" ||
    meData?.roles[0] === "livestream-accounting"
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
