import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"
import {
  CreateLogRequest,
  GetLogsRangeRequest,
  GetLogsRangeResponse,
  GetLogsRequest,
  GetLogsResponse
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

  return { createLog, getLogs, getLogsRange }
}
