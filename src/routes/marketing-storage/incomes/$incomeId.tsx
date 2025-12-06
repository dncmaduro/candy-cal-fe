import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/marketing-storage/incomes/$incomeId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/marketing-storage/incomes/$incomeId"!</div>
}
