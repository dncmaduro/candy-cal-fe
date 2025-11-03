import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { SALES_NAVS } from "../../constants/navs"

export const Route = createFileRoute("/sales/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate({ to: `${SALES_NAVS[0].to}` })
  }, [])

  return <div>Hello "/livestream/"!</div>
}
