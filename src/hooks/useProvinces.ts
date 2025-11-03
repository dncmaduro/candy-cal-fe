import { callApi } from "./axios"
import { GetProvincesResponse } from "./models"

export const useProvinces = () => {
  const getProvinces = async () => {
    return callApi<never, GetProvincesResponse>({
      path: `/v1/provinces`,
      method: "GET"
    })
  }

  return { getProvinces }
}
