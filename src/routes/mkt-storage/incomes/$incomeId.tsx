import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/mkt-storage/incomes/$incomeId")({
  beforeLoad: () => {
    throw redirect({
      to: "/mkt-storage"
    })
  },
  component: () => null
})
