import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AppLayout } from "../../components/layouts/AppLayout"
import { NAVS } from "../../constants/navs"
import { useEffect } from "react"

export const Route = createFileRoute("/marketing-storage/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate({ to: `/marketing-storage/${NAVS[0].to}` })
  }, [])

  return <AppLayout>Hello "/marketing-storage/"!</AppLayout>
}
