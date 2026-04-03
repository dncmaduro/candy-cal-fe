import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { NAVS } from "../../constants/navs"

export const Route = createFileRoute("/mkt-storage/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate({ to: NAVS[0].to })
  }, [])

  return null
}
