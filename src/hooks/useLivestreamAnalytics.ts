import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  GetAggregatedMetricsRequest,
  GetAggregatedMetricsResponse,
  GetAssistantRevenueRankingsByMonthRequest,
  GetAssistantRevenueRankingsByMonthResponse,
  GetAssistantRevenueRankingsRequest,
  GetAssistantRevenueRankingsResponse,
  GetHostRevenueRankingsByMonthRequest,
  GetHostRevenueRankingsByMonthResponse,
  GetHostRevenueRankingsRequest,
  GetHostRevenueRankingsResponse,
  GetLivestreamStatsRequest,
  GetLivestreamStatsResponse,
  GetMonthlyTotalsLivestreamRequest,
  GetMonthlyTotalsLivestreamResponse,
  GetMonthMetricsRequest,
  GetMonthMetricsResponse
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

  const getMonthMetrics = async (req: GetMonthMetricsRequest) => {
    const query = toQueryString(req)

    return callApi<GetMonthMetricsRequest, GetMonthMetricsResponse>({
      method: "GET",
      path: `/v1/livestreamanalytics/month-metrics?${query}`,
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

  const getHostRevenueRankingsByMonth = async (
    req: GetHostRevenueRankingsByMonthRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, GetHostRevenueRankingsByMonthResponse>({
      method: "GET",
      path: `/v1/livestreamanalytics/host-revenue-rankings-by-month?${query}`,
      token: accessToken
    })
  }

  const getAssistantRevenueRankings = async (
    req: GetAssistantRevenueRankingsRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, GetAssistantRevenueRankingsResponse>({
      method: "GET",
      path: `/v1/livestreamanalytics/assistant-revenue-rankings?${query}`,
      token: accessToken
    })
  }

  const getAssistantRevenueRankingsByMonth = async (
    req: GetAssistantRevenueRankingsByMonthRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, GetAssistantRevenueRankingsByMonthResponse>({
      method: "GET",
      path: `/v1/livestreamanalytics/assistant-revenue-rankings-by-month?${query}`,
      token: accessToken
    })
  }

  return {
    getMonthlyTotalsLivestreams,
    getLivestreamStats,
    getAggregatedMetrics,
    getMonthMetrics,
    getHostRevenueRankings,
    getHostRevenueRankingsByMonth,
    getAssistantRevenueRankings,
    getAssistantRevenueRankingsByMonth
  }
}
