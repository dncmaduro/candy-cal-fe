import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/marketing-storage/calfile/")({
  beforeLoad: () => {
    throw redirect({
      to: "/tiktokshop/sku"
    })
  },
  component: () => null
})
