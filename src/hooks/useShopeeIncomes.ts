import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  InsertIncomeShopeeRequest,
  SearchShopeeIncomeRequest,
  SearchShopeeIncomeResponse
} from "./models"

export const useShopeeIncomes = () => {
  const { accessToken } = useUserStore()

  const insertIncomeShopee = async (
    files: File[],
    req: InsertIncomeShopeeRequest
  ) => {
    const formData = new FormData()
    formData.append("file", files[0])

    Object.entries(req).forEach(([key, value]) => {
      if (typeof value !== "undefined" && value !== null)
        formData.append(key, value as string)
    })

    return callApi<FormData, never>({
      path: `/v1/shopeeincomes/upload`,
      data: formData,
      method: "POST",
      token: accessToken,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  }

  const searchShopeeIncome = async (req: SearchShopeeIncomeRequest) => {
    const query = toQueryString(req)

    return callApi<never, SearchShopeeIncomeResponse>({
      path: `/v1/shopeeincomes/search?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  return {
    insertIncomeShopee,
    searchShopeeIncome
  }
}
