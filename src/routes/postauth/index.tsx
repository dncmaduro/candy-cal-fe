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

  if (meData?.role === "admin" || meData?.role === "order-emp") {
    return <Navigate to="/marketing-storage/storage" />
  }
  if (meData?.role === "accounting-emp") {
    return <Navigate to="/marketing-storage/accounting-storage" />
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
