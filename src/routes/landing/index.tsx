import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { LANDING_NAVS } from "../../constants/navs"
import { useEffect } from "react"

export const Route = createFileRoute("/landing/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate({ to: `${LANDING_NAVS[0].to}` })
  }, [])

  return <div>Hello "/landing/"!</div>
}
