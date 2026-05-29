import { callApi } from "./axios"
import { HealthLiveResponse, HealthReadyResponse } from "./models"

export const HEALTH_LIVE_PATH = "/v1"
export const HEALTH_READY_PATH = "/v1/provinces"

const getBackendUrls = () =>
  (import.meta.env.VITE_BACKEND_URL as string | undefined)
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? []

export const useHealth = () => {
  const getHealthLive = async (customUrl?: string) => {
    const response = await callApi<never, string>({
      path: HEALTH_LIVE_PATH,
      method: "GET",
      customUrl
    })

    return {
      ...response,
      data: {
        message: response.data
      } satisfies HealthLiveResponse
    }
  }

  const getHealthReady = async (customUrl?: string) => {
    return callApi<never, HealthReadyResponse>({
      path: HEALTH_READY_PATH,
      method: "GET",
      customUrl
    })
  }

  return {
    getBackendUrls,
    getHealthLive,
    getHealthReady
  }
}
