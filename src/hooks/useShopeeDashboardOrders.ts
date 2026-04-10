import { endOfMonth, startOfMonth } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import type {
  SearchShopeeIncomeResponse,
  ShopeeDashboardOrderViewModel,
  ShopeeDashboardOrdersViewModel,
  ShopeeDashboardOverviewRequest
} from "./models"
import { useShopeeIncomes } from "./useShopeeIncomes"
import { useUserStore } from "../store/userStore"
import {
  SHOPEE_ALL_CHANNEL_ID,
  normalizeShopeeDashboardOverviewRequest
} from "./shopeeDashboardApi"

type UseShopeeDashboardOrdersArgs = Partial<ShopeeDashboardOverviewRequest> & {
  page?: number
  limit?: number
  enabled?: boolean
}

const normalizePage = (page?: number) => {
  if (typeof page !== "number" || Number.isNaN(page)) return 1
  return Math.max(1, Math.trunc(page))
}

const normalizeLimit = (limit?: number) => {
  if (typeof limit !== "number" || Number.isNaN(limit)) return 10
  return Math.min(100, Math.max(5, Math.trunc(limit)))
}

const buildProductSummary = (
  products: ShopeeDashboardOrderViewModel["products"]
) => {
  if (!products.length) return "Không có sản phẩm"

  const preview = products
    .slice(0, 2)
    .map((product) => `${product.code} x${product.quantity}`)
    .join(", ")

  if (products.length <= 2) return preview

  return `${preview} +${products.length - 2} sản phẩm`
}

const normalizeOrderDate = (value: Date | string) => {
  if (value instanceof Date) return value.toISOString()

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return new Date().toISOString()

  return parsedDate.toISOString()
}

const adaptShopeeDashboardOrders = (
  response: SearchShopeeIncomeResponse
): ShopeeDashboardOrdersViewModel => {
  return {
    total: response.total ?? 0,
    data: response.data.map((item) => {
      const products = item.products.map((product) => ({
        code: product.code,
        name: product.name,
        quantity: product.quantity,
        price: product.price
      }))

      return {
        _id: item._id,
        date: normalizeOrderDate(item.date),
        orderId: item.orderId,
        customer: item.customer,
        creator: item.creator,
        source: item.source,
        total: item.total,
        channelId: item.channel?._id ?? "",
        channelName: item.channel?.name ?? "Shop Shopee",
        products,
        totalProducts: products.length,
        totalQuantity: products.reduce(
          (sum, product) => sum + product.quantity,
          0
        ),
        productSummary: buildProductSummary(products)
      }
    })
  }
}

export const useShopeeDashboardOrders = ({
  page = 1,
  limit = 10,
  enabled = true,
  ...request
}: UseShopeeDashboardOrdersArgs = {}) => {
  const { accessToken } = useUserStore()
  const { searchShopeeIncome } = useShopeeIncomes()
  const normalizedRequest = normalizeShopeeDashboardOverviewRequest(request)
  const normalizedPage = normalizePage(page)
  const normalizedLimit = normalizeLimit(limit)
  const date = new Date(normalizedRequest.year, normalizedRequest.month - 1, 1)
  const startDate = startOfMonth(date)
  const endDate = endOfMonth(date)

  return useQuery({
    queryKey: [
      "searchShopeeIncome",
      "dashboard",
      normalizedRequest.month,
      normalizedRequest.year,
      normalizedRequest.channelId,
      normalizedPage,
      normalizedLimit
    ],
    queryFn: () =>
      searchShopeeIncome({
        page: normalizedPage,
        limit: normalizedLimit,
        startDate,
        endDate,
        channelId:
          normalizedRequest.channelId === SHOPEE_ALL_CHANNEL_ID
            ? undefined
            : normalizedRequest.channelId
      }),
    select: (response) => adaptShopeeDashboardOrders(response.data),
    enabled: enabled && Boolean(accessToken),
    placeholderData: (previousData) => previousData
  })
}
