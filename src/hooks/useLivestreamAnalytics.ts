import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  GetAggregatedMetricsRequest,
  GetAggregatedMetricsResponse,
  GetHostRevenueRankingsRequest,
  GetHostRevenueRankingsResponse,
  GetLivestreamStatsRequest,
  GetLivestreamStatsResponse,
  GetMonthlyTotalsLivestreamRequest,
  GetMonthlyTotalsLivestreamResponse
} from "./models"

/**
 * Hook for livestream analytics operations
 * Endpoints: /v1/livestreamanalytics/*
 */
export const useLivestreamAnalytics = () => {
  const { accessToken } = useUserStore()

  const getMonthlyTotalsLivestreams = async (
    req: GetMonthlyTotalsLivestreamRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, Record<string, GetMonthlyTotalsLivestreamResponse>>({
      method: "GET",
      path: `/v1/livestreamanalytics/monthly-totals?${query}`,
      token: accessToken
    })
  }

  const getLivestreamStats = async (req: GetLivestreamStatsRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetLivestreamStatsResponse>({
      method: "GET",
      path: `/v1/livestreamanalytics/stats?${query}`,
      token: accessToken
    })
  }

  const getAggregatedMetrics = async (req: GetAggregatedMetricsRequest) => {
    const query = toQueryString(req)

    return callApi<GetAggregatedMetricsRequest, GetAggregatedMetricsResponse>({
      method: "GET",
      path: `/v1/livestreamanalytics/aggregated-metrics?${query}`,
      token: accessToken
    })
  }

  const getHostRevenueRankings = async (req: GetHostRevenueRankingsRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetHostRevenueRankingsResponse>({
      method: "GET",
      path: `/v1/livestreamanalytics/host-revenue-rankings?${query}`,
      token: accessToken
    })
  }

  return {
    getMonthlyTotalsLivestreams,
    getLivestreamStats,
    getAggregatedMetrics,
    getHostRevenueRankings
  }
}
