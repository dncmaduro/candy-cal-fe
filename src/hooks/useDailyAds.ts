import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"
import { CreateDailyAdsRequest } from "./models"

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

  return { createDailyAds }
}
