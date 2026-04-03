import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/marketing-storage/ai/")({
  beforeLoad: () => {
    throw redirect({
      to: "/mkt-storage"
    })
  },
  component: () => null
})
