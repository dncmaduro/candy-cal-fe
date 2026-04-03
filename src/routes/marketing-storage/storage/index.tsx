import { createFileRoute, redirect } from "@tanstack/react-router"

type StorageTab = {
  tab: string
}

export const Route = createFileRoute("/marketing-storage/storage/")({
  validateSearch: (search: Record<string, unknown>): StorageTab => {
    return {
      tab: String(search.tab ?? "tiktok-products")
    }
  },
  beforeLoad: ({ search }) => {
    throw redirect({
      to: search.tab === "shopee-products" ? "/shopee/sku" : "/tiktokshop/sku"
    })
  },
  component: () => null
})
