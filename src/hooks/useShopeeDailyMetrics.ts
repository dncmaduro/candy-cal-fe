import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import type {
  CreateShopeeDailyAdsRequest,
  CreateShopeeDailyLiveRevenueRequest,
  DeleteShopeeDailyAdsRequest,
  DeleteShopeeDailyAdsResponse,
  DeleteShopeeDailyLiveRevenueRequest,
  DeleteShopeeDailyLiveRevenueResponse,
  SearchShopeeDailyAdsRequest,
  SearchShopeeDailyAdsResponse,
  SearchShopeeDailyLiveRevenuesRequest,
  SearchShopeeDailyLiveRevenuesResponse,
  ShopeeDailyAdsRecord,
  ShopeeDailyLiveRevenueRecord,
  UpdateShopeeDailyAdsRequest,
  UpdateShopeeDailyLiveRevenueRequest
} from "./models"

export const useShopeeDailyMetrics = () => {
  const { accessToken } = useUserStore()

  const getShopeeDailyAds = async (req: SearchShopeeDailyAdsRequest) => {
    const query = toQueryString(req)

    return callApi<never, SearchShopeeDailyAdsResponse>({
      path: `/v1/shopeedailyads?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const createShopeeDailyAds = async (req: CreateShopeeDailyAdsRequest) => {
    return callApi<CreateShopeeDailyAdsRequest, ShopeeDailyAdsRecord>({
      path: `/v1/shopeedailyads`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const updateShopeeDailyAds = async (
    id: string,
    req: UpdateShopeeDailyAdsRequest
  ) => {
    return callApi<UpdateShopeeDailyAdsRequest, ShopeeDailyAdsRecord>({
      path: `/v1/shopeedailyads/${id}`,
      method: "PUT",
      data: req,
      token: accessToken
    })
  }

  const deleteShopeeDailyAds = async (req: DeleteShopeeDailyAdsRequest) => {
    const query = toQueryString(req)

    return callApi<never, DeleteShopeeDailyAdsResponse>({
      path: `/v1/shopeedailyads?${query}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const getShopeeDailyLiveRevenues = async (
    req: SearchShopeeDailyLiveRevenuesRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, SearchShopeeDailyLiveRevenuesResponse>({
      path: `/v1/shopeedailyliverevenues?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const createShopeeDailyLiveRevenue = async (
    req: CreateShopeeDailyLiveRevenueRequest
  ) => {
    return callApi<
      CreateShopeeDailyLiveRevenueRequest,
      ShopeeDailyLiveRevenueRecord
    >({
      path: `/v1/shopeedailyliverevenues`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const updateShopeeDailyLiveRevenue = async (
    id: string,
    req: UpdateShopeeDailyLiveRevenueRequest
  ) => {
    return callApi<
      UpdateShopeeDailyLiveRevenueRequest,
      ShopeeDailyLiveRevenueRecord
    >({
      path: `/v1/shopeedailyliverevenues/${id}`,
      method: "PUT",
      data: req,
      token: accessToken
    })
  }

  const deleteShopeeDailyLiveRevenue = async (
    req: DeleteShopeeDailyLiveRevenueRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, DeleteShopeeDailyLiveRevenueResponse>({
      path: `/v1/shopeedailyliverevenues?${query}`,
      method: "DELETE",
      token: accessToken
    })
  }

  return {
    getShopeeDailyAds,
    createShopeeDailyAds,
    updateShopeeDailyAds,
    deleteShopeeDailyAds,
    getShopeeDailyLiveRevenues,
    createShopeeDailyLiveRevenue,
    updateShopeeDailyLiveRevenue,
    deleteShopeeDailyLiveRevenue
  }
}
