import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { SHOPEE_NAVS } from "../../constants/navs"

export const Route = createFileRoute("/shopee/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate({ to: SHOPEE_NAVS[0].to })
  }, [])

  return null
}
