import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { useSalesOrders } from "./useSalesOrders"

type UseSalesOrdersListParams = {
  page: number
  limit: number
  searchText?: string
  returningFilter?: string
  funnelFilter?: string
  shippingTypeFilter?: string
  statusFilter?: string
  startDate?: Date | null
  endDate?: Date | null
  userIdFilter?: string
  channelIdFilter?: string
  refetchKey?: string
  enabled?: boolean
}

export const useSalesOrdersList = ({
  page,
  limit,
  searchText,
  returningFilter,
  funnelFilter,
  shippingTypeFilter,
  statusFilter,
  startDate,
  endDate,
  userIdFilter,
  channelIdFilter,
  refetchKey,
  enabled = true
}: UseSalesOrdersListParams) => {
  const { searchSalesOrders } = useSalesOrders()

  const startDateValue = startDate ? format(startDate, "yyyy-MM-dd") : undefined
  const endDateValue = endDate ? format(endDate, "yyyy-MM-dd") : undefined

  return useQuery({
    queryKey: [
      "salesOrders",
      page,
      limit,
      searchText,
      returningFilter,
      funnelFilter,
      shippingTypeFilter,
      statusFilter,
      startDateValue,
      endDateValue,
      userIdFilter,
      channelIdFilter,
      refetchKey
    ],
    queryFn: () =>
      searchSalesOrders({
        page,
        limit,
        searchText: searchText || undefined,
        returning:
          returningFilter === "" ? undefined : returningFilter === "true",
        salesFunnelId: funnelFilter || undefined,
        shippingType:
          shippingTypeFilter === ""
            ? undefined
            : (shippingTypeFilter as "shipping_vtp" | "shipping_cargo"),
        status:
          statusFilter === ""
            ? undefined
            : (statusFilter as "draft" | "confirmed" | "official"),
        startDate: startDateValue,
        endDate: endDateValue,
        userId: userIdFilter || undefined,
        channelId: channelIdFilter || undefined
      }),
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
}
