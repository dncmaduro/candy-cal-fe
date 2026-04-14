import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/mkt-storage/incomes/")({
  beforeLoad: () => {
    throw redirect({
      to: "/mkt-storage"
    })
  },
  component: () => null
})
