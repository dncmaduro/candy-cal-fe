import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"
import { CreateDailyAdsRequest } from "./models"

export const useDailyAds = () => {
  const { accessToken } = useUserStore()

  const createDailyAds = async (req: CreateDailyAdsRequest) => {
    return callApi<CreateDailyAdsRequest, never>({
      path: `/v1/dailyads`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  return { createDailyAds }
}
