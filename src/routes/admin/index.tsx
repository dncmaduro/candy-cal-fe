import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { ADMIN_NAVS } from "../../constants/navs"

export const Route = createFileRoute("/admin/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate({ to: `${ADMIN_NAVS[0].to}` })
  }, [])

  return <div>Hello "/admin/"!</div>
}
