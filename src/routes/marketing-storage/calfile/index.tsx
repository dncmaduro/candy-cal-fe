import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/marketing-storage/calfile/")({
  beforeLoad: () => {
    // Redirect to storage page where calfile functionality is now integrated
    throw redirect({
      to: "/marketing-storage/storage"
    })
  },
  component: () => null
})
