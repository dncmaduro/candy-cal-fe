import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { WAREHOUSE_NAVS } from "../../constants/navs"

export const Route = createFileRoute("/kho-van/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate({ to: WAREHOUSE_NAVS[0].to })
  }, [navigate])

  return null
}
