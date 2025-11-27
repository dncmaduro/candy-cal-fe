import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateSalesDailyReportRequest,
  CreateSalesDailyReportResponse,
  DeleteSalesDailyReportRequest,
  GetAccumulatedRevenueForMonthRequest,
  GetAccumulatedRevenueForMonthResponse,
  GetRevenueForDateRequest,
  GetRevenueForDateResponse,
  GetSalesDailyReportsByMonthRequest,
  GetSalesDailyReportsByMonthResponse,
  GetSalesDailyReportDetailRequest,
  GetSalesDailyReportDetailResponse,
  GetSalesMonthKpiRequest,
  GetSalesMonthKpiResponse
} from "./models"

export const useSalesDailyReports = () => {
  const { accessToken } = useUserStore()

  const getRevenueForDate = async (req: GetRevenueForDateRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetRevenueForDateResponse>({
      path: `/v1/salesdailyreports/revenue-for-date?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const createSalesDailyReport = async (req: CreateSalesDailyReportRequest) => {
    return callApi<
      CreateSalesDailyReportRequest,
      CreateSalesDailyReportResponse
    >({
      path: `/v1/salesdailyreports`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const deleteSalesDailyReport = async (req: DeleteSalesDailyReportRequest) => {
    return callApi<never, never>({
      path: `/v1/salesdailyreports/${req.id}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const getSalesDailyReportsByMonth = async (
    req: GetSalesDailyReportsByMonthRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, GetSalesDailyReportsByMonthResponse>({
      path: `/v1/salesdailyreports/by-month?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getSalesDailyReportDetail = async (
    req: GetSalesDailyReportDetailRequest
  ) => {
    return callApi<never, GetSalesDailyReportDetailResponse>({
      path: `/v1/salesdailyreports/${req.id}`,
      method: "GET",
      token: accessToken
    })
  }

  const getSalesMonthKpi = async (req: GetSalesMonthKpiRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetSalesMonthKpiResponse>({
      path: `/v1/salesdailyreports/month-kpi/by-date?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getAccumulatedRevenueForMonth = async (
    req: GetAccumulatedRevenueForMonthRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, GetAccumulatedRevenueForMonthResponse>({
      path: `/v1/salesdailyreports/accumulated-revenue/by-month?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  return {
    getRevenueForDate,
    createSalesDailyReport,
    deleteSalesDailyReport,
    getSalesDailyReportsByMonth,
    getSalesDailyReportDetail,
    getSalesMonthKpi,
    getAccumulatedRevenueForMonth
  }
}
