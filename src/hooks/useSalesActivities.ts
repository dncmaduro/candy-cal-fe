import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateSalesActivityRequest,
  CreateSalesActivityResponse,
  GetSalesActivityRequest,
  GetSalesActivityResponse,
  GetSalesActivitiesRequest,
  GetSalesActivitiesResponse,
  GetLatestActivityBySalesFunnelIdRequest,
  GetLatestActivityBySalesFunnelIdResponse,
  UpdateSalesActivityRequest,
  UpdateSalesActivityResponse
} from "./models"

export const useSalesActivities = () => {
  const { accessToken } = useUserStore()

  const createSalesActivity = async (req: CreateSalesActivityRequest) => {
    return callApi<CreateSalesActivityRequest, CreateSalesActivityResponse>({
      path: `/v1/salesactivities`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const updateSalesActivity = async (
    id: string,
    req: UpdateSalesActivityRequest
  ) => {
    return callApi<UpdateSalesActivityRequest, UpdateSalesActivityResponse>({
      path: `/v1/salesactivities/${id}`,
      method: "PUT",
      data: req,
      token: accessToken
    })
  }

  const deleteSalesActivity = async (id: string) => {
    return callApi<never, never>({
      path: `/v1/salesactivities/${id}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const getSalesActivity = async (req: GetSalesActivityRequest) => {
    return callApi<never, GetSalesActivityResponse>({
      path: `/v1/salesactivities/${req.id}`,
      method: "GET",
      token: accessToken
    })
  }

  const getSalesActivities = async (req: GetSalesActivitiesRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetSalesActivitiesResponse>({
      path: `/v1/salesactivities?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getLatestActivityBySalesFunnelId = async (
    req: GetLatestActivityBySalesFunnelIdRequest
  ) => {
    return callApi<never, GetLatestActivityBySalesFunnelIdResponse>({
      path: `/v1/salesactivities/latest/${req.salesFunnelId}`,
      method: "GET",
      token: accessToken
    })
  }

  return {
    createSalesActivity,
    updateSalesActivity,
    deleteSalesActivity,
    getSalesActivity,
    getSalesActivities,
    getLatestActivityBySalesFunnelId
  }
}
