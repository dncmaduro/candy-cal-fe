import { callApi } from "./axios"
import { GetProvincesResponse } from "./models"
import { useUserStore } from "../store/userStore"

export const useProvinces = () => {
  const { accessToken } = useUserStore()

  const getProvinces = async () => {
    return callApi<never, GetProvincesResponse>({
      path: `/v1/provinces`,
      method: "GET",
      token: accessToken
    })
  }

  return { getProvinces }
}
