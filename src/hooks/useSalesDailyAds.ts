import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  GetSalesDailyAdsByMonthRequest,
  GetSalesDailyAdsByMonthResponse,
  SalesDailyAdsItem,
  UpsertSalesDailyAdsRequest
} from "./models"

export const useSalesDailyAds = () => {
  const { accessToken } = useUserStore()

  const upsertSalesDailyAds = async (req: UpsertSalesDailyAdsRequest) => {
    return callApi<UpsertSalesDailyAdsRequest, SalesDailyAdsItem>({
      path: "/v1/salesdailyads",
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const getSalesDailyAdsByMonth = async (
    req: GetSalesDailyAdsByMonthRequest
  ) => {
    return callApi<never, GetSalesDailyAdsByMonthResponse>({
      path: `/v1/salesdailyads/by-month?${toQueryString(req)}`,
      method: "GET",
      token: accessToken
    })
  }

  return { upsertSalesDailyAds, getSalesDailyAdsByMonth }
}
