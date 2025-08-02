import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateSessionLogRequest,
  GetSessionLogByIdRequest,
  GetSessionLogsRequest,
  GetSessionLogsResponse
} from "./models"

export const useSessionLogs = () => {
  const { accessToken } = useUserStore()

  const createSessionLog = async (req: CreateSessionLogRequest) => {
    return callApi<CreateSessionLogRequest, any>({
      path: `/v1/sessionlogs`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const deleteSessionLog = async (id: string) => {
    return callApi<never, any>({
      path: `/v1/sessionlogs/${id}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const getSessionLogs = async (req: GetSessionLogsRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetSessionLogsResponse>({
      path: `/v1/sessionlogs?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getSessionLogById = async (req: GetSessionLogByIdRequest) => {
    return callApi<never, any>({
      path: `/v1/sessionlogs/${req.id}`,
      method: "GET",
      token: accessToken
    })
  }

  return {
    createSessionLog,
    deleteSessionLog,
    getSessionLogs,
    getSessionLogById
  }
}
