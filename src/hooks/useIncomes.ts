import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  DeleteIncomeByDateRequest,
  GetIncomesByDateRangeRequest,
  GetIncomesByDateRangeResponse,
  InsertIncomeRequest,
  InsertIncomeResponse,
  GetTotalIncomesByMonthRequest,
  GetTotalIncomesByMonthResponse,
  UpdateAffiliateTypeResponse,
  UpdateIncomesBoxRequest,
  GetTotalQuantityByMonthResponse,
  GetKPIPercentageByMonthRequest,
  GetKPIPercentageByMonthResponse,
  ExportXlsxIncomesRequest,
  GetRangeStatsRequest,
  GetRangeStatsResponse,
  GetTopCreatorsRequest,
  GetTopCreatorsResponse,
  GetAdsCostSplitByMonthRequest,
  GetTotalLiveAndVideoIncomeByMonthRequest,
  GetTotalLiveAndVideoIncomeByMonthResponse,
  GetAdsCostSplitByMonthResponse
} from "./models"

export const useIncomes = () => {
  const { accessToken } = useUserStore()

  const insertIncome = async (file: File, req: InsertIncomeRequest) => {
    const formData = new FormData()
    formData.append("file", file)

    Object.entries(req).forEach(([key, value]) => {
      if (typeof value !== "undefined" && value !== null)
        formData.append(key, value as string)
    })

    return callApi<FormData, InsertIncomeResponse>({
      path: `/v1/incomes`,
      data: formData,
      method: "POST",
      token: accessToken,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  }

  const deleteIncomeByDate = async (req: DeleteIncomeByDateRequest) => {
    const query = toQueryString(req)

    return callApi<never, never>({
      path: `/v1/incomes?${query}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const updateAffiliateType = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    return callApi<FormData, UpdateAffiliateTypeResponse>({
      path: `/v1/incomes/update-affiliate`,
      data: formData,
      method: "POST",
      token: accessToken,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  }

  const getIncomesByDateRange = async (req: GetIncomesByDateRangeRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetIncomesByDateRangeResponse>({
      path: `/v1/incomes?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const updateIncomesBox = async (req: UpdateIncomesBoxRequest) => {
    const query = toQueryString(req)

    return callApi<UpdateIncomesBoxRequest, never>({
      path: `/v1/incomes/update-box?${query}`,
      method: "PATCH",
      token: accessToken
    })
  }

  const getTotalIncomesByMonth = async (req: GetTotalIncomesByMonthRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetTotalIncomesByMonthResponse>({
      path: `/v1/incomes/income-split-by-month?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getTotalQuantityByMonth = async (
    req: GetTotalIncomesByMonthRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, GetTotalQuantityByMonthResponse>({
      path: `/v1/incomes/quantity-split-by-month?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getKPIPercentageByMonth = async (
    req: GetKPIPercentageByMonthRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, GetKPIPercentageByMonthResponse>({
      path: `/v1/incomes/kpi-percentage-split-by-month?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getRangeStats = async (req: GetRangeStatsRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetRangeStatsResponse>({
      path: `/v1/incomes/range-stats?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getTopCreators = async (req: GetTopCreatorsRequest) => {
    const query = toQueryString(req)
    return callApi<never, GetTopCreatorsResponse>({
      path: `/v1/incomes/top-creators?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const exportXlsxIncomes = async (req: ExportXlsxIncomesRequest) => {
    const query = toQueryString(req)

    return callApi<never, Blob>({
      path: `/v1/incomes/export-xlsx?${query}`,
      method: "GET",
      token: accessToken,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }
    })
  }

  const getLiveVideoIncomeByMonth = async (
    req: GetTotalLiveAndVideoIncomeByMonthRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, GetTotalLiveAndVideoIncomeByMonthResponse>({
      path: `/v1/incomes/monthly-live-video-income?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getAdsCostSplitByMonth = async (req: GetAdsCostSplitByMonthRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetAdsCostSplitByMonthResponse>({
      path: `/v1/incomes/monthly-ads-cost-split?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  return {
    insertIncome,
    deleteIncomeByDate,
    updateAffiliateType,
    getIncomesByDateRange,
    updateIncomesBox,
    getTotalIncomesByMonth,
    getTotalQuantityByMonth,
    getKPIPercentageByMonth,
    getRangeStats,
    getTopCreators,
    exportXlsxIncomes,
    getLiveVideoIncomeByMonth,
    getAdsCostSplitByMonth
  }
}
