import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/marketing-storage/orders-logs/")({
  beforeLoad: () => {
    throw redirect({
      to: "/tiktokshop/sku"
    })
  },
  component: () => null
})
