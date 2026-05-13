import { useQuery } from "@tanstack/react-query"
import { useSalesOrders } from "./useSalesOrders"

export const useSalesOrderDetail = (orderId?: string) => {
  const { getSalesOrderById } = useSalesOrders()

  return useQuery({
    queryKey: ["salesOrder", orderId],
    queryFn: () => getSalesOrderById(orderId as string),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })
}
