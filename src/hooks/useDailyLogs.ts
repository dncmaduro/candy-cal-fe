import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateDailyLogRequest,
  GetDailyLogByDateRequest,
  GetDailyLogByDateResponse,
  GetDailyLogsRequest,
  GetDailyLogsResponse
} from "./models"

export const useDailyLogs = () => {
  const { accessToken } = useUserStore()

  const createDailyLog = async (req: CreateDailyLogRequest) => {
    return callApi<CreateDailyLogRequest, never>({
      path: `/v1/dailylogs`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const getDailyLogs = async (req: GetDailyLogsRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetDailyLogsResponse>({
      path: `/v1/dailylogs?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getDailyLogByDate = async (req: GetDailyLogByDateRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetDailyLogByDateResponse>({
      path: `/v1/dailylogs/date?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  return {
    createDailyLog,
    getDailyLogs,
    getDailyLogByDate
  }
}
