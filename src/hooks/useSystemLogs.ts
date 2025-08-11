import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import { GetSystemLogsRequest, GetSystemLogsResponse } from "./models"

export const useSystemLogs = () => {
  const { accessToken } = useUserStore()

  const getSystemLogs = async (req: GetSystemLogsRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetSystemLogsResponse>({
      path: `/v1/systemlogs${query ? `?${query}` : ""}`,
      method: "GET",
      token: accessToken
    })
  }

  // Create a system log
  const createSystemLog = async (req: any) => {
    return callApi<any, any>({
      path: `/v1/systemlogs`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  // Options helpers
  const listUsersOptions = async () => {
    return callApi<never, any>({
      path: `/v1/systemlogs/options/users`,
      method: "GET",
      token: accessToken
    })
  }

  const listTypesOptions = async () => {
    return callApi<never, any>({
      path: `/v1/systemlogs/options/types`,
      method: "GET",
      token: accessToken
    })
  }

  const listActionsOptions = async () => {
    return callApi<never, any>({
      path: `/v1/systemlogs/options/actions`,
      method: "GET",
      token: accessToken
    })
  }

  const listEntitiesOptions = async () => {
    return callApi<never, any>({
      path: `/v1/systemlogs/options/entities`,
      method: "GET",
      token: accessToken
    })
  }

  const listEntityIdsOptions = async (entity: string) => {
    const query = toQueryString({ entity })
    return callApi<never, any>({
      path: `/v1/systemlogs/options/entity-ids${query ? `?${query}` : ""}`,
      method: "GET",
      token: accessToken
    })
  }

  // Cleanup old logs
  const cleanup = async (days = 90) => {
    const query = toQueryString({ days })
    return callApi<never, any>({
      path: `/v1/systemlogs/cleanup${query ? `?${query}` : ""}`,
      method: "DELETE",
      token: accessToken
    })
  }

  return {
    getSystemLogs,
    createSystemLog,
    listUsersOptions,
    listTypesOptions,
    listActionsOptions,
    listEntitiesOptions,
    listEntityIdsOptions,
    cleanup
  }
}
