import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  GetMonthlyMetricsRequest,
  GetMonthlyMetricsResponse,
  GetSalesRevenueRequest,
  GetSalesRevenueResponse
} from "./models"

export const useSalesDashboard = () => {
  const { accessToken } = useUserStore()

  const getSalesRevenue = async (req: GetSalesRevenueRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetSalesRevenueResponse>({
      path: `/v1/salesdashboard/revenue-stats?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getMonthlyMetrics = async (req: GetMonthlyMetricsRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetMonthlyMetricsResponse>({
      path: `/v1/salesdashboard/monthly-metrics?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  return {
    getSalesRevenue,
    getMonthlyMetrics
  }
}
