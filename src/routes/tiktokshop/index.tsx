import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { TIKTOKSHOP_NAVS } from "../../constants/navs"

export const Route = createFileRoute("/tiktokshop/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate({ to: TIKTOKSHOP_NAVS[0].to })
  }, [navigate])

  return null
}
