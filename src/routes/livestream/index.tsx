import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { LIVESTREAM_NAVS } from "../../constants/navs"

export const Route = createFileRoute("/livestream/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate({ to: `${LIVESTREAM_NAVS[0].to}` })
  }, [])

  return <div>Hello "/livestream/"!</div>
}
