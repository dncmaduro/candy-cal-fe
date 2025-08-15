import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"
import { GetAllAPIEndpointsResponse } from "./models"

export const useEndpoints = () => {
  const { accessToken } = useUserStore()

  const getAllAPIEndpoints = async () => {
    return callApi<never, GetAllAPIEndpointsResponse>({
      path: `/v1/api-endpoints`,
      method: "GET",
      token: accessToken
    })
  }

  return { getAllAPIEndpoints }
}
