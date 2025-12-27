import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CalculateDailyPerformanceRequest,
  CalculateDailyPerformanceResponse,
  CalculateLivestreamMonthSalaryRequest,
  CalculateLivestreamMonthSalaryResponse,
  CreateLivestreamPerformanceRequest,
  CreateLivestreamPerformanceResponse,
  DeleteLivestreamPerformanceRequest,
  SearchLivestreamPerformanceRequest,
  SearchLivestreamPerformanceResponse,
  UpdateLivestreamPerformanceRequest,
  UpdateLivestreamPerformanceResponse
} from "./models"

export const useLivestreamPerformance = () => {
  const { accessToken } = useUserStore()

  const createLivestreamPerformance = async (
    req: CreateLivestreamPerformanceRequest
  ) => {
    return callApi<
      CreateLivestreamPerformanceRequest,
      CreateLivestreamPerformanceResponse
    >({
      method: "POST",
      path: `/v1/livestreamperformance`,
      data: req,
      token: accessToken
    })
  }

  const updateLivestreamPerformance = async (
    id: string,
    req: UpdateLivestreamPerformanceRequest
  ) => {
    return callApi<
      UpdateLivestreamPerformanceRequest,
      UpdateLivestreamPerformanceResponse
    >({
      method: "PUT",
      path: `/v1/livestreamperformance/${id}`,
      data: req,
      token: accessToken
    })
  }

  const deleteLivestreamPerformance = async (
    req: DeleteLivestreamPerformanceRequest
  ) => {
    return callApi<never, never>({
      method: "DELETE",
      path: `/v1/livestreamperformance/${req.id}`,
      token: accessToken
    })
  }

  const searchLivestreamPerformance = async (
    req: SearchLivestreamPerformanceRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, SearchLivestreamPerformanceResponse>({
      method: "GET",
      path: `/v1/livestreamperformance/search?${query}`,
      token: accessToken
    })
  }

  const calculateDailyPerformance = async (
    req: CalculateDailyPerformanceRequest
  ) => {
    return callApi<
      CalculateDailyPerformanceRequest,
      CalculateDailyPerformanceResponse
    >({
      method: "POST",
      path: `/v1/livestreamperformance/calculate-daily`,
      data: req,
      token: accessToken
    })
  }

  const calculateLivestreamMonthSalary = async (
    req: CalculateLivestreamMonthSalaryRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, CalculateLivestreamMonthSalaryResponse>({
      method: "GET",
      path: `/v1/livestreamperformance/monthly-salary?${query}`,
      token: accessToken
    })
  }

  return {
    createLivestreamPerformance,
    updateLivestreamPerformance,
    deleteLivestreamPerformance,
    searchLivestreamPerformance,
    calculateDailyPerformance,
    calculateLivestreamMonthSalary
  }
}
