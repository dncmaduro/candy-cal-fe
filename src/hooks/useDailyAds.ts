import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateDailyAdsRequest,
  GetPreviousDailyAdsBefore4pmRequest,
  GetPreviousDailyAdsBefore4pmResponse
} from "./models"

export const useDailyAds = () => {
  const { accessToken } = useUserStore()

  const createDailyAds = async (files: File[], req: CreateDailyAdsRequest) => {
    const formData = new FormData()
    formData.append("files", files[0])
    formData.append("files", files[1])
    formData.append("files", files[2])
    formData.append("files", files[3])
    formData.append("files", files[4])
    formData.append("files", files[5])

    Object.entries(req).forEach(([key, value]) => {
      if (typeof value !== "undefined" && value !== null)
        formData.append(key, value as string)
    })

    return callApi<FormData, never>({
      path: `/v1/dailyads`,
      data: formData,
      method: "POST",
      token: accessToken,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  }

  const createDailyAdsWithSavedAdsCost = async (
    files: File[],
    req: CreateDailyAdsRequest
  ) => {
    const formData = new FormData()
    formData.append("files", files[0])
    formData.append("files", files[1])
    formData.append("files", files[2])
    formData.append("files", files[3])

    Object.entries(req).forEach(([key, value]) => {
      if (typeof value !== "undefined" && value !== null)
        formData.append(key, value as string)
    })

    return callApi<FormData, never>({
      path: `/v1/dailyads/update-with-saved-before4pm`,
      data: formData,
      method: "POST",
      token: accessToken,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  }

  const getPreviousDailyAds = async (
    req: GetPreviousDailyAdsBefore4pmRequest
  ) => {
    const previousDate = new Date(req.date)
    previousDate.setDate(previousDate.getDate() - 1)
    req = { ...req, date: previousDate }
    const query = toQueryString(req)

    return callApi<never, GetPreviousDailyAdsBefore4pmResponse>({
      path: `/v1/dailyads/before4pm?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  return { createDailyAds, createDailyAdsWithSavedAdsCost, getPreviousDailyAds }
}
