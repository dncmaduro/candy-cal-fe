import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import type {
  CreateShopeeMonthKpiRequest,
  CreateShopeeMonthKpiResponse,
  DeleteShopeeMonthKpiRequest,
  GetShopeeMonthKpiDetailRequest,
  GetShopeeMonthKpiDetailResponse,
  GetShopeeMonthKpisRequest,
  GetShopeeMonthKpisResponse,
  UpdateShopeeMonthKpiRequest,
  UpdateShopeeMonthKpiResponse
} from "./models"

export const useShopeeMonthKpis = () => {
  const { accessToken } = useUserStore()

  const createShopeeMonthKpi = async (req: CreateShopeeMonthKpiRequest) => {
    return callApi<CreateShopeeMonthKpiRequest, CreateShopeeMonthKpiResponse>({
      method: "POST",
      path: "/v1/shopeemonthkpis",
      data: req,
      token: accessToken
    })
  }

  const getShopeeMonthKpis = async (req: GetShopeeMonthKpisRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetShopeeMonthKpisResponse>({
      method: "GET",
      path: `/v1/shopeemonthkpis?${query}`,
      token: accessToken
    })
  }

  const getShopeeMonthKpiById = async (
    req: GetShopeeMonthKpiDetailRequest
  ) => {
    return callApi<never, GetShopeeMonthKpiDetailResponse>({
      method: "GET",
      path: `/v1/shopeemonthkpis/${req.id}`,
      token: accessToken
    })
  }

  const updateShopeeMonthKpi = async (
    id: string,
    req: UpdateShopeeMonthKpiRequest
  ) => {
    return callApi<UpdateShopeeMonthKpiRequest, UpdateShopeeMonthKpiResponse>({
      method: "PUT",
      path: `/v1/shopeemonthkpis/${id}`,
      data: req,
      token: accessToken
    })
  }

  const deleteShopeeMonthKpi = async (req: DeleteShopeeMonthKpiRequest) => {
    return callApi<never, never>({
      method: "DELETE",
      path: `/v1/shopeemonthkpis/${req.id}`,
      token: accessToken
    })
  }

  return {
    createShopeeMonthKpi,
    getShopeeMonthKpis,
    getShopeeMonthKpiById,
    updateShopeeMonthKpi,
    deleteShopeeMonthKpi
  }
}
