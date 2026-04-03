import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/marketing-storage/")({
  beforeLoad: () => {
    throw redirect({
      to: "/postauth"
    })
  },
  component: () => null
})
