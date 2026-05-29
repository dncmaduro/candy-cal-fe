import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

export const Route = createFileRoute("/admin/health/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate({ to: "/health" })
  }, [navigate])

  return null
}
