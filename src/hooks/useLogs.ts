import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateLogRequest,
  CreateStorageLogRequest,
  CreateStorageLogResponse,
  GetLogsRangeRequest,
  GetLogsRangeResponse,
  GetLogsRequest,
  GetLogsResponse,
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
    return callApi<never, GetStorageLogsByMonthResponse>({
      path: `/v1/storagelogs/month?year=${req.year}&month=${req.month}`,
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
    getStorageLogsByMonth
  }
}
