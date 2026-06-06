import { useUserStore } from "../store/userStore"
import { format } from "date-fns"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  GetProvinceSalesStatsRequest,
  GetProvinceSalesStatsResponse,
  GetMonthlyMetricsRequest,
  GetMonthlyMetricsResponse,
  GetMonthlyTopCustomersRequest,
  GetMonthlyTopCustomersResponse,
  GetSalesRevenueRequest,
  GetSalesRevenueResponse
} from "./models"

export const useSalesDashboard = () => {
  const { accessToken } = useUserStore()

  const getProvinceSalesStats = async (req: GetProvinceSalesStatsRequest) => {
    const query = toQueryString({
      date: req.date ? format(req.date, "yyyy-MM-dd") : undefined,
      startDate: req.startDate ? format(req.startDate, "yyyy-MM-dd") : undefined,
      endDate: req.endDate ? format(req.endDate, "yyyy-MM-dd") : undefined,
      channel: req.channel
    })

    return callApi<never, GetProvinceSalesStatsResponse>({
      path: `/v1/salesdashboard/province-stats?${query}`,
      method: "GET",
      token: accessToken
    })
  }

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

  const getMonthlyTopCustomers = async (req: GetMonthlyTopCustomersRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetMonthlyTopCustomersResponse>({
      path: `/v1/salesdashboard/top-customers?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  return {
    getProvinceSalesStats,
    getSalesRevenue,
    getMonthlyMetrics,
    getMonthlyTopCustomers
  }
}
