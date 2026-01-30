import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateLogRequest,
  CreateLogSessionRequest,
  CreateLogSessionResponse,
  CreateStorageLogRequest,
  CreateStorageLogResponse,
  GetDeliveredSummaryRequest,
  GetDeliveredSummaryResponse,
  GetLogsRangeRequest,
  GetLogsRangeResponse,
  GetLogsRequest,
  GetLogsResponse,
  GetOrderLogsByRangeRequest,
  GetOrderLogsByRangeResponse,
  GetOrderLogsRequest,
  GetOrderLogsResponse,
  GetStorageLogsByMonthRequest,
  GetStorageLogsByMonthResponse,
  GetStorageLogsRequest,
  GetStorageLogsResponse,
  UpdateStorageLogRequest,
  UpdateStorageLogResponse
} from "./models"

export const useLogs = () => {
  const { accessToken } = useUserStore()

  const createLog = async (req: CreateLogRequest) => {
    return callApi<CreateLogRequest, any>({
      path: "/v1/logs",
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const getLogs = async (req: GetLogsRequest) => {
    return callApi<never, GetLogsResponse>({
      path: `/v1/logs?page=${req.page}&limit=${req.limit}`,
      method: "GET",
      token: accessToken
    })
  }

  const getLogsRange = async (req: GetLogsRangeRequest) => {
    return callApi<never, GetLogsRangeResponse>({
      path: `/v1/logs/range?startDate=${req.startDate}&endDate=${req.endDate}`,
      method: "GET",
      token: accessToken
    })
  }

  const getStorageLogs = async (req: GetStorageLogsRequest) => {
    const query = toQueryString({
      page: req.page,
      limit: req.limit,
      startDate: req.startDate,
      endDate: req.endDate,
      status: req.status,
      tag: req.tag,
      itemId: req.itemId
    })
    return callApi<never, GetStorageLogsResponse>({
      path: `/v1/storagelogs?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const createStorageLog = async (req: CreateStorageLogRequest) => {
    return callApi<CreateStorageLogRequest, CreateStorageLogResponse>({
      path: "/v1/storagelogs",
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const updateStorageLog = async (id: string, req: UpdateStorageLogRequest) => {
    return callApi<UpdateStorageLogRequest, UpdateStorageLogResponse>({
      path: `/v1/storagelogs/${id}`,
      method: "PUT",
      data: req,
      token: accessToken
    })
  }

  const deleteStorageLog = async (id: string) => {
    return callApi<never, never>({
      path: `/v1/storagelogs/${id}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const getStorageLogsByMonth = async (req: GetStorageLogsByMonthRequest) => {
    const query = toQueryString({
      year: req.year,
      month: req.month,
      tag: req.tag
    })
    return callApi<never, GetStorageLogsByMonthResponse>({
      path: `/v1/storagelogs/month?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  // new logs
  const getOrderLogs = async (req: GetOrderLogsRequest) => {
    const query = toQueryString({
      page: req.page,
      limit: req.limit
    })

    return callApi<never, GetOrderLogsResponse>({
      path: `/v1/orderlogs?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const createLogSession = async (req: CreateLogSessionRequest) => {
    return callApi<CreateLogSessionRequest, CreateLogSessionResponse>({
      path: `/v1/orderlogs`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const getOrderLogsByRange = async (req: GetOrderLogsByRangeRequest) => {
    const query = toQueryString({
      startDate: req.startDate,
      endDate: req.endDate,
      session: req.session
    })
    return callApi<never, GetOrderLogsByRangeResponse>({
      path: `/v1/orderlogs/range?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getDeliveredSummary = async (req: GetDeliveredSummaryRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetDeliveredSummaryResponse>({
      path: `/v1/storagelogs/delivered/summary?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  return {
    createLog,
    getLogs,
    getLogsRange,
    getStorageLogs,
    createStorageLog,
    updateStorageLog,
    deleteStorageLog,
    getStorageLogsByMonth,
    getOrderLogs,
    createLogSession,
    getOrderLogsByRange,
    getDeliveredSummary
  }
}
